"""
RQ2 Controller — Pass Preservation Rate (PPR) analysis.

Do LLM-generated refactorings preserve the functional behavior of the test suite?

Behavioral definition (Option B — count-based, stricter than runner heuristic):
  behavior_preserved = 1  iff  ALL of:
    (a) after_tests_failed  <= before_tests_failed   (no new individual test failures)
    (b) after_suites_failed <= before_suites_failed  (no new failing suites)
    (c) tests_failed_type NOT IN error_types         (runner actually executed)
  This catches intra-suite regressions invisible to the runner's suite-only heuristic.

Failure taxonomy:
  tests_failed_type values:
    NULL                    → preserved (not a failure)
    'suites_failed_increase'→ behavioral regression (runner executed, more suites failed)
    'syntax_error'          → error class: code could not be parsed
    'module_resolution_error'→ error class: import / path not found
    'runtime_error'         → error class: exception during execution
    'timeout'               → error class: runner timed out
    'unknown'               → error class: unclassifiable

Test counts:
  - For error-class failures: tests_executed / tests_passed_count / tests_failed_count = 0
    (runner never produced a parseable summary)
  - For behavioral regression and preserved: use test_results(phase='after') counts

Endpoints:
  GET /api/rq2/summary  – all aggregated data for the dashboard
  GET /api/rq2/export   – CSV download, table= param selects which dataset
"""

from typing import Optional
from pathlib import Path
import sys
import csv
import io
import math
from datetime import datetime

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "llm-refactor-pipeline" / "src"))
from llm_refactor.modules.database.connection import ResearchDB

router = APIRouter(prefix="/api/rq2", tags=["RQ2"])

_db = ResearchDB()
_db.init_database()


def _session():
    return _db.get_session()


# ---------------------------------------------------------------------------
# Shared SQL fragments (mirrors rq1_controller.py)
# ---------------------------------------------------------------------------

SMELL_JOIN = """
    FROM experiments e
    JOIN files f ON e.file_id = f.id
    JOIN repositories r ON f.repository_id = r.id
    LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
    LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
    LEFT JOIN test_results tr_b ON tr_b.experiment_id = e.id AND tr_b.phase = 'before'
    LEFT JOIN test_results tr_a ON tr_a.experiment_id = e.id AND tr_a.phase = 'after'
"""

SMELL_TYPE_COL = "COALESCE(ss.smell_type, bsd.smell_type)"

# An experiment is included in RQ2 iff it has an after-phase test_results row
INCLUSION_CLAUSE = "tr_a.id IS NOT NULL"

# Error-class failure types: runner never produced a parseable summary.
# Defined early so it can be reused in PRESERVED_EXPR and TESTS_* expressions.
_ERROR_TYPES = "'syntax_error', 'runtime_error', 'module_resolution_error', 'timeout', 'unknown'"

# Option B — behavior_preserved rule (derived purely from test_results counts):
#   1. No increase in individual test failures  (after_tests_failed  <= before)
#   2. No increase in failing suites            (after_suites_failed <= before)
#   3. Not an error-class failure (runner could not run at all)
# This is stricter than the runner's suite-only heuristic and correctly captures
# intra-suite regressions where the suite count stays the same but more tests fail.
PRESERVED_EXPR = f"""
    CASE WHEN
        COALESCE(tr_a.tests_failed,        0) <= COALESCE(tr_b.tests_failed,        0)
        AND COALESCE(tr_a.test_suites_failed, 0) <= COALESCE(tr_b.test_suites_failed, 0)
        AND (e.tests_failed_type IS NULL
             OR e.tests_failed_type NOT IN ({_ERROR_TYPES}))
    THEN 1 ELSE 0 END
"""

# is_error_class: the runner could not execute tests at all
ERROR_CLASS_EXPR = f"""
    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES}) THEN 1 ELSE 0 END
"""

# Friendly label for tests_failed_type
FAILURE_LABEL_EXPR = """
    CASE e.tests_failed_type
        WHEN 'suites_failed_increase'     THEN 'Behavioral regression'
        WHEN 'syntax_error'               THEN 'Error: syntax'
        WHEN 'module_resolution_error'    THEN 'Error: module resolution'
        WHEN 'runtime_error'              THEN 'Error: runtime'
        WHEN 'timeout'                    THEN 'Error: timeout'
        WHEN 'unknown'                    THEN 'Error: unknown'
        ELSE NULL
    END
"""

# For error-class rows, all counts are reported as 0 (runner produced no summary)
TESTS_EXECUTED_EXPR = f"""
    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES})
         THEN 0 ELSE COALESCE(tr_a.tests_total, 0) END
"""
TESTS_PASSED_EXPR = f"""
    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES})
         THEN 0 ELSE COALESCE(tr_a.tests_passed, 0) END
"""
TESTS_FAILED_COUNT_EXPR = f"""
    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES})
         THEN 0 ELSE COALESCE(tr_a.tests_failed, 0) END
"""
TESTS_SKIPPED_EXPR = f"""
    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES})
         THEN 0 ELSE COALESCE(tr_a.tests_skipped, 0) END
"""
# test_todo: tests that exist in total but are not accounted for as
# passed / failed / skipped — indicates pending/todo tests in the runner.
# Clamped to 0 to handle any rounding edge-cases in the parser.
TESTS_TODO_EXPR = f"""
    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES}) THEN 0
         ELSE MAX(0,
             COALESCE(tr_a.tests_total,   0)
           - COALESCE(tr_a.tests_passed,  0)
           - COALESCE(tr_a.tests_failed,  0)
           - COALESCE(tr_a.tests_skipped, 0))
    END
"""


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _build_where(smell_type, ai_model_version, prompting_approach):
    """Build WHERE clause + params dict for optional filter dimensions."""
    clauses = [INCLUSION_CLAUSE]
    params = {}
    if smell_type:
        clauses.append(f"{SMELL_TYPE_COL} = :smell_type")
        params["smell_type"] = smell_type
    if ai_model_version:
        clauses.append("e.ai_model_version = :ai_model_version")
        params["ai_model_version"] = ai_model_version
    if prompting_approach:
        clauses.append("e.prompting_approach = :prompting_approach")
        params["prompting_approach"] = prompting_approach
    return "WHERE " + " AND ".join(clauses), params


def _ppr(preserved, total):
    if not total:
        return None
    return round(preserved / total * 100, 1)


def _ci95(preserved, total):
    """Wilson 95% CI for a proportion, returns (lower%, upper%)."""
    if not total:
        return None, None
    z = 1.96
    p = preserved / total
    denom = 1 + z ** 2 / total
    centre = (p + z ** 2 / (2 * total)) / denom
    margin = (z * math.sqrt(p * (1 - p) / total + z ** 2 / (4 * total ** 2))) / denom
    return round(max(0.0, centre - margin) * 100, 1), round(min(1.0, centre + margin) * 100, 1)


# ---------------------------------------------------------------------------
# GET /api/rq2/summary
# ---------------------------------------------------------------------------

@router.get("/summary")
def rq2_summary(
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
):
    """Returns all aggregated data needed to render the RQ2 dashboard."""
    session = _session()
    try:
        where, params = _build_where(smell_type, ai_model_version, prompting_approach)

        # ── filter options ────────────────────────────────────────────────
        models_list = [r[0] for r in session.execute(text("""
            SELECT DISTINCT e.ai_model_version
            FROM experiments e
            WHERE e.ai_model_version IS NOT NULL
            ORDER BY e.ai_model_version
        """)).fetchall()]

        smells_list = [r[0] for r in session.execute(text(f"""
            SELECT DISTINCT {SMELL_TYPE_COL} AS st
            {SMELL_JOIN}
            WHERE {SMELL_TYPE_COL} IS NOT NULL AND {INCLUSION_CLAUSE}
            ORDER BY st
        """)).fetchall()]

        approaches_list = [r[0] for r in session.execute(text("""
            SELECT DISTINCT prompting_approach
            FROM experiments
            WHERE prompting_approach IS NOT NULL
            ORDER BY prompting_approach
        """)).fetchall()]

        # ── overall ───────────────────────────────────────────────────────
        overall_row = session.execute(text(f"""
            SELECT
                COUNT(e.id)                                                        AS n,
                SUM({PRESERVED_EXPR})                                              AS preserved,
                COUNT(DISTINCT e.ai_model_version)                                 AS models_count,
                COUNT(DISTINCT e.prompting_approach)                               AS strategies_count,
                SUM({TESTS_EXECUTED_EXPR})                                         AS total_tests_executed,
                SUM({TESTS_PASSED_EXPR})                                           AS total_tests_passed,
                SUM({TESTS_FAILED_COUNT_EXPR})                                     AS total_tests_failed,
                SUM({TESTS_SKIPPED_EXPR})                                          AS total_tests_skipped,
                SUM({TESTS_TODO_EXPR})                                             AS total_tests_todo
            {SMELL_JOIN}
            {where}
        """), params).fetchone()

        n_included        = overall_row[0] or 0
        n_preserved       = overall_row[1] or 0
        models_count      = overall_row[2] or 0
        strats_count      = overall_row[3] or 0
        total_executed    = overall_row[4] or 0
        total_passed      = overall_row[5] or 0
        total_failed_cnt  = overall_row[6] or 0
        total_skipped     = overall_row[7] or 0
        total_todo        = overall_row[8] or 0

        total_experiments = session.execute(text("""
            SELECT COUNT(*) FROM experiments
        """)).scalar() or 0

        baseline_excluded = total_experiments - n_included

        # ── by smell type ─────────────────────────────────────────────────
        by_smell_rows = session.execute(text(f"""
            SELECT
                {SMELL_TYPE_COL}         AS smell_type,
                COUNT(e.id)              AS n,
                SUM({PRESERVED_EXPR})    AS preserved
            {SMELL_JOIN}
            {where}
            GROUP BY {SMELL_TYPE_COL}
            ORDER BY SUM({PRESERVED_EXPR}) * 1.0 / NULLIF(COUNT(e.id), 0) DESC
        """), params).fetchall()

        by_smell = []
        for r in by_smell_rows:
            pv, n = int(r[2] or 0), r[1]
            ci_lo, ci_hi = _ci95(pv, n)
            by_smell.append({
                "smell_type": r[0] or "Unknown",
                "n": n,
                "preserved": pv,
                "ppr": _ppr(pv, n),
                "ci_lower": ci_lo,
                "ci_upper": ci_hi,
            })

        # ── by prompt strategy ────────────────────────────────────────────
        by_prompt_rows = session.execute(text(f"""
            SELECT
                e.prompting_approach     AS prompt,
                COUNT(e.id)              AS n,
                SUM({PRESERVED_EXPR})    AS preserved
            {SMELL_JOIN}
            {where}
            GROUP BY e.prompting_approach
            ORDER BY
                CASE e.prompting_approach
                    WHEN 'Zero-Shot'        THEN 1
                    WHEN 'zero-shot'        THEN 1
                    WHEN 'Few-Shot'         THEN 2
                    WHEN 'few-shot'         THEN 2
                    WHEN 'Chain-of-Thought' THEN 3
                    WHEN 'cot'             THEN 3
                    ELSE 4
                END
        """), params).fetchall()

        by_prompt = [
            {
                "prompt": r[0] or "Unknown",
                "n": r[1],
                "preserved": int(r[2] or 0),
                "ppr": _ppr(int(r[2] or 0), r[1]),
            }
            for r in by_prompt_rows
        ]

        # ── model × prompt matrix ─────────────────────────────────────────
        matrix_rows = session.execute(text(f"""
            SELECT
                e.ai_model_version       AS model,
                e.prompting_approach     AS prompt,
                COUNT(e.id)              AS n,
                SUM({PRESERVED_EXPR})    AS preserved
            {SMELL_JOIN}
            {where}
            GROUP BY e.ai_model_version, e.prompting_approach
        """), params).fetchall()

        matrix_map: dict = {}
        for r in matrix_rows:
            model  = r[0] or "Unknown"
            prompt = r[1] or "Unknown"
            pv = int(r[3] or 0)
            n  = r[2]
            matrix_map.setdefault(model, {})[prompt] = {
                "n": n,
                "preserved": pv,
                "ppr": _ppr(pv, n),
            }

        model_matrix = []
        for model, prompts in matrix_map.items():
            mt = sum(v["n"]         for v in prompts.values())
            mp = sum(v["preserved"] for v in prompts.values())
            model_matrix.append({
                "model": model,
                "overall_n": mt,
                "overall_preserved": mp,
                "overall_ppr": _ppr(mp, mt),
                "by_prompt": prompts,
            })
        model_matrix.sort(key=lambda x: x["overall_ppr"] or 0, reverse=True)

        # ── failure taxonomy ──────────────────────────────────────────────
        # Classify every included experiment using the Option B rule:
        #   priority: error_class > intra_suite > suite_increase > preserved
        # Test-case level is the primary signal; suite level is secondary.
        # This matches the Colab regression_type() function exactly.
        taxonomy_rows = session.execute(text(f"""
            SELECT
                CASE
                    WHEN e.tests_failed_type IN ({_ERROR_TYPES})
                        THEN e.tests_failed_type
                    WHEN COALESCE(tr_a.tests_failed, 0) > COALESCE(tr_b.tests_failed, 0)
                        THEN 'intra_suite_regression'
                    WHEN COALESCE(tr_a.test_suites_failed, 0) > COALESCE(tr_b.test_suites_failed, 0)
                        THEN 'suites_failed_increase'
                    ELSE NULL
                END AS failure_type,
                COUNT(e.id)              AS cnt
            {SMELL_JOIN}
            {where}
            GROUP BY 1
            ORDER BY cnt DESC
        """), params).fetchall()

        # pct is share of ALL included experiments (matches Colab's n_total denominator)
        total_for_pct = n_included or 1  # avoid /0
        LABEL_MAP = {
            "suites_failed_increase":  "Behavioral regression",
            "intra_suite_regression":  "Intra-suite regression",
            "syntax_error":            "Error: syntax",
            "module_resolution_error": "Error: module resolution",
            "runtime_error":           "Error: runtime",
            "timeout":                 "Error: timeout",
            "unknown":                 "Error: unknown",
        }
        IS_ERROR = {
            "suites_failed_increase":  False,
            "intra_suite_regression":  False,
            "syntax_error":            True,
            "module_resolution_error": True,
            "runtime_error":           True,
            "timeout":                 True,
            "unknown":                 True,
        }
        failure_taxonomy = [
            {
                "failure_type": r[0] or "none",
                "label": LABEL_MAP.get(r[0] or "none", r[0] or "none"),
                "count": r[1],
                "pct": round(r[1] / total_for_pct * 100, 1),
                "is_error": IS_ERROR.get(r[0] or "none", False),
            }
            for r in taxonomy_rows
            if r[0] is not None  # skip NULL = preserved rows from taxonomy list
        ]

        return {
            "filter_options": {
                "models": models_list,
                "smell_types": smells_list,
                "prompting_approaches": approaches_list,
            },
            "overview": {
                "total_experiments": total_experiments,
                "included_in_rq2": n_included,
                "baseline_excluded": baseline_excluded,
                "models_count": models_count,
                "strategies_count": strats_count,
            },
            "overall": {
                "n": n_included,
                "preserved": n_preserved,
                "ppr": _ppr(n_preserved, n_included),
                "total_tests_executed": total_executed,
                "total_tests_passed": total_passed,
                "total_tests_failed": total_failed_cnt,
                "total_tests_skipped": total_skipped,
                "total_tests_todo": total_todo,
            },
            "by_smell": by_smell,
            "by_prompt": by_prompt,
            "model_matrix": model_matrix,
            "failure_taxonomy": failure_taxonomy,
        }
    finally:
        session.close()


# ---------------------------------------------------------------------------
# GET /api/rq2/export
# ---------------------------------------------------------------------------

_EXPORT_TABLES = {
    "overall", "by_smell", "by_prompt", "model_matrix", "failure_taxonomy", "raw"
}


@router.get("/export")
def rq2_export(
    table: str = Query("raw"),
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
):
    """Stream a CSV. Use ?table= to choose which dataset to export."""
    if table not in _EXPORT_TABLES:
        table = "raw"

    session = _session()
    try:
        where, params = _build_where(smell_type, ai_model_version, prompting_approach)
        output = io.StringIO()
        writer = csv.writer(output)

        # ── raw (per-experiment) ──────────────────────────────────────────
        if table == "raw":
            rows = session.execute(text(f"""
                SELECT
                    -- identifiers & outcome
                    e.id                                                           AS instance_id,
                    {SMELL_TYPE_COL}                                               AS smell_type,
                    e.ai_model_version                                             AS model,
                    e.prompting_approach                                           AS prompt,
                    COALESCE(e.tests_failed_type, 'none')                          AS failure_type,
                    CASE WHEN tr_a.test_suites_failed > COALESCE(tr_b.test_suites_failed,0)
                         THEN 1 ELSE 0 END                                         AS suite_regression,
                    -- before (baseline)
                    COALESCE(tr_b.test_suites_failed, 0)                           AS before_suites_failed,
                    COALESCE(tr_b.tests_total,   0)                                AS before_tests_total,
                    COALESCE(tr_b.tests_passed,  0)                                AS before_tests_passed,
                    COALESCE(tr_b.tests_failed,  0)                                AS before_tests_failed,
                    COALESCE(tr_b.tests_skipped, 0)                                AS before_tests_skipped,
                    MAX(0,
                        COALESCE(tr_b.tests_total,   0)
                      - COALESCE(tr_b.tests_passed,  0)
                      - COALESCE(tr_b.tests_failed,  0)
                      - COALESCE(tr_b.tests_skipped, 0))                           AS before_tests_todo,
                    -- after (post-refactoring; 0 when error-class failure)
                    COALESCE(tr_a.test_suites_failed, 0)                           AS after_suites_failed,
                    {TESTS_EXECUTED_EXPR}                                          AS after_tests_total,
                    {TESTS_PASSED_EXPR}                                            AS after_tests_passed,
                    {TESTS_FAILED_COUNT_EXPR}                                      AS after_tests_failed,
                    {TESTS_SKIPPED_EXPR}                                           AS after_tests_skipped,
                    {TESTS_TODO_EXPR}                                              AS after_tests_todo
                {SMELL_JOIN}
                {where}
                ORDER BY e.id
            """), params).fetchall()

            writer.writerow([
                "instance_id", "smell_type", "model", "prompt",
                "failure_type", "suite_regression",
                "before_suites_failed",
                "before_tests_total", "before_tests_passed", "before_tests_failed",
                "before_tests_skipped", "before_tests_todo",
                "after_suites_failed",
                "after_tests_total", "after_tests_passed", "after_tests_failed",
                "after_tests_skipped", "after_tests_todo",
            ])
            for row in rows:
                writer.writerow(list(row))

        # ── overall ───────────────────────────────────────────────────────
        elif table == "overall":
            data = rq2_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["metric", "value"])
            for k, v in data["overall"].items():
                writer.writerow([k, v])

        # ── by_smell ──────────────────────────────────────────────────────
        elif table == "by_smell":
            data = rq2_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["smell_type", "n", "preserved", "ppr", "ci_lower", "ci_upper"])
            for row in data["by_smell"]:
                writer.writerow([
                    row["smell_type"], row["n"], row["preserved"],
                    row["ppr"], row["ci_lower"], row["ci_upper"],
                ])

        # ── by_prompt ─────────────────────────────────────────────────────
        elif table == "by_prompt":
            data = rq2_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["prompt", "n", "preserved", "ppr"])
            for row in data["by_prompt"]:
                writer.writerow([row["prompt"], row["n"], row["preserved"], row["ppr"]])

        # ── model_matrix ──────────────────────────────────────────────────
        elif table == "model_matrix":
            data = rq2_summary(smell_type, ai_model_version, prompting_approach)
            prompts = sorted({
                p
                for row in data["model_matrix"]
                for p in row["by_prompt"].keys()
            })
            writer.writerow(["model"] + prompts + ["overall_n", "overall_preserved", "overall_ppr"])
            for row in data["model_matrix"]:
                cells = []
                for p in prompts:
                    bp = row["by_prompt"].get(p)
                    cells.append(f"{bp['ppr']}% ({bp['preserved']}/{bp['n']})" if bp else "—")
                writer.writerow(
                    [row["model"]] + cells +
                    [row["overall_n"], row["overall_preserved"], row["overall_ppr"]]
                )

        # ── failure_taxonomy ──────────────────────────────────────────────
        elif table == "failure_taxonomy":
            data = rq2_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["failure_type", "label", "count", "pct", "is_error"])
            for row in data["failure_taxonomy"]:
                writer.writerow([
                    row["failure_type"], row["label"],
                    row["count"], row["pct"], row["is_error"],
                ])

        filename = f"rq2_{table}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    finally:
        session.close()
