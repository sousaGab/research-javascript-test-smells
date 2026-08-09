"""
RQ4 Controller — Refactoring Success Rate (RSR) analysis.

What is the overall success rate of LLM-generated test refactorings?

A refactoring attempt is considered SUCCESSFUL iff ALL three conditions hold:
  1. smell_removed = 1          (targeted smell was eliminated)
  2. behavior_preserved = 1     (same count-based rule as RQ2 / Option B)
  3. delta_coverage >= -0.5     (coverage did not degrade beyond -0.5 pp;
                                 strictly less than -0.5 is a violation)

The introduction of new smells is intentionally excluded from the success
definition — an attempt may still succeed even if additional smells appear.

Derived indicators:
  success            = 1 if all three conditions satisfied, else 0
  removal_failure    = 1 if smell_removed = 0,        else 0
  behavior_violation = 1 if behavior_preserved = 0,   else 0
  coverage_violation = 1 if delta_coverage < -0.5,    else 0

Each indicator is computed independently so that overlapping failures are
counted separately (failure causes sum may exceed total failures).

Aggregations produced:
  Table A — Global statistics
  Table B — Success rate by prompt strategy
  Table C — Success rate by model
  Table D — Model × Prompt interaction matrix
  Table E — Failure cause distribution

Inclusion scope (same as RQ2):
  Only experiments that have an after-phase test_results row
  (tr_a.id IS NOT NULL).

Endpoints:
  GET /api/rq4/summary  – all aggregated data for the dashboard
  GET /api/rq4/export   – CSV download, table= param selects which dataset
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

router = APIRouter(prefix="/api/rq4", tags=["RQ4"])

_db = ResearchDB()
_db.init_database()


def _session():
    return _db.get_session()


# ---------------------------------------------------------------------------
# Shared SQL fragments
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

# Inclusion: only experiments that have an after-phase test_results row (same as RQ2)
INCLUSION_CLAUSE = "tr_a.id IS NOT NULL"

# Error-class failure types where the runner could not execute tests at all
_ERROR_TYPES = "'syntax_error', 'runtime_error', 'module_resolution_error', 'timeout', 'unknown'"

# ── Derived expression: behavior_preserved (Option B — count-based, identical to RQ2) ──
# behavior_preserved = 1 iff:
#   (a) no increase in individual test failures
#   (b) no increase in failing suites
#   (c) runner actually executed tests (not an error-class run)
PRESERVED_EXPR = f"""
    CASE WHEN
        COALESCE(tr_a.tests_failed,        0) <= COALESCE(tr_b.tests_failed,        0)
        AND COALESCE(tr_a.test_suites_failed, 0) <= COALESCE(tr_b.test_suites_failed, 0)
        AND (e.tests_failed_type IS NULL
             OR e.tests_failed_type NOT IN ({_ERROR_TYPES}))
    THEN 1 ELSE 0 END
"""

# ── Coverage delta: statement-level percentage-point change (after − before) ──
DELTA_COVERAGE_EXPR = """
    (COALESCE(tr_a.coverage_statements, 0) - COALESCE(tr_b.coverage_statements, 0))
"""

# ── Derived indicators ──
# coverage_violation: strictly less than -0.5 pp (boundary value -0.5 is acceptable)
COVERAGE_VIOLATION_EXPR = f"""
    CASE WHEN {DELTA_COVERAGE_EXPR} < -0.5 THEN 1 ELSE 0 END
"""

BEHAVIOR_VIOLATION_EXPR = f"""
    CASE WHEN ({PRESERVED_EXPR}) = 0 THEN 1 ELSE 0 END
"""

REMOVAL_FAILURE_EXPR = """
    CASE WHEN COALESCE(e.smell_removed, 0) = 0 THEN 1 ELSE 0 END
"""

# ── Composite success indicator ──
# success = 1 iff smell_removed=1 AND behavior_preserved=1 AND delta_coverage >= -0.5
SUCCESS_EXPR = f"""
    CASE WHEN
        COALESCE(e.smell_removed, 0) = 1
        AND ({PRESERVED_EXPR}) = 1
        AND {DELTA_COVERAGE_EXPR} >= -0.5
    THEN 1 ELSE 0 END
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_where(smell_type, ai_model_version, prompting_approach):
    """Build WHERE clause + params dict; always enforces inclusion clause."""
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


def _rate(successes, total):
    """Success rate as a rounded percentage, or None if total is 0."""
    if not total:
        return None
    return round(successes / total * 100, 1)


def _ci95(successes, total):
    """Wilson 95% confidence interval for a proportion; returns (lower%, upper%)."""
    if not total:
        return None, None
    z = 1.96
    p = successes / total
    denom = 1 + z ** 2 / total
    centre = (p + z ** 2 / (2 * total)) / denom
    margin = (z * math.sqrt(p * (1 - p) / total + z ** 2 / (4 * total ** 2))) / denom
    return round(max(0.0, centre - margin) * 100, 1), round(min(1.0, centre + margin) * 100, 1)


# ---------------------------------------------------------------------------
# GET /api/rq4/summary
# ---------------------------------------------------------------------------

@router.get("/summary")
def rq4_summary(
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
):
    """Returns all aggregated data needed to render the RQ4 dashboard."""
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

        # ── Table A — global statistics ───────────────────────────────────
        overall_row = session.execute(text(f"""
            SELECT
                COUNT(e.id)                                AS n,
                SUM({SUCCESS_EXPR})                        AS successes,
                COUNT(DISTINCT e.ai_model_version)         AS models_count,
                COUNT(DISTINCT e.prompting_approach)       AS strategies_count
            {SMELL_JOIN}
            {where}
        """), params).fetchone()

        n_total       = overall_row[0] or 0
        n_success     = int(overall_row[1] or 0)
        models_count  = overall_row[2] or 0
        strats_count  = overall_row[3] or 0

        total_experiments = session.execute(text(
            "SELECT COUNT(*) FROM experiments"
        )).scalar() or 0

        ci_lo, ci_hi = _ci95(n_success, n_total)

        # ── Table B — by prompt strategy ──────────────────────────────────
        by_prompt_rows = session.execute(text(f"""
            SELECT
                e.prompting_approach          AS prompt,
                COUNT(e.id)                   AS n,
                SUM({SUCCESS_EXPR})           AS successes
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
                    WHEN 'cot'              THEN 3
                    ELSE 4
                END
        """), params).fetchall()

        by_prompt = []
        for r in by_prompt_rows:
            sv, n = int(r[2] or 0), r[1]
            ci_lo_p, ci_hi_p = _ci95(sv, n)
            by_prompt.append({
                "prompt": r[0] or "Unknown",
                "n": n,
                "successes": sv,
                "success_rate": _rate(sv, n),
                "ci_lower": ci_lo_p,
                "ci_upper": ci_hi_p,
            })

        # ── Table C — by model ────────────────────────────────────────────
        by_model_rows = session.execute(text(f"""
            SELECT
                e.ai_model_version            AS model,
                COUNT(e.id)                   AS n,
                SUM({SUCCESS_EXPR})           AS successes
            {SMELL_JOIN}
            {where}
            GROUP BY e.ai_model_version
            ORDER BY SUM({SUCCESS_EXPR}) * 1.0 / NULLIF(COUNT(e.id), 0) DESC
        """), params).fetchall()

        by_model = []
        for r in by_model_rows:
            sv, n = int(r[2] or 0), r[1]
            ci_lo_m, ci_hi_m = _ci95(sv, n)
            by_model.append({
                "model": r[0] or "Unknown",
                "n": n,
                "successes": sv,
                "success_rate": _rate(sv, n),
                "ci_lower": ci_lo_m,
                "ci_upper": ci_hi_m,
            })

        # ── Table D — model × prompt matrix ──────────────────────────────
        matrix_rows = session.execute(text(f"""
            SELECT
                e.ai_model_version            AS model,
                e.prompting_approach          AS prompt,
                COUNT(e.id)                   AS n,
                SUM({SUCCESS_EXPR})           AS successes
            {SMELL_JOIN}
            {where}
            GROUP BY e.ai_model_version, e.prompting_approach
        """), params).fetchall()

        matrix_map: dict = {}
        for r in matrix_rows:
            model  = r[0] or "Unknown"
            prompt = r[1] or "Unknown"
            sv = int(r[3] or 0)
            n  = r[2]
            matrix_map.setdefault(model, {})[prompt] = {
                "n": n,
                "successes": sv,
                "success_rate": _rate(sv, n),
            }

        model_matrix = []
        for model, prompts in matrix_map.items():
            mt = sum(v["n"]         for v in prompts.values())
            ms = sum(v["successes"] for v in prompts.values())
            model_matrix.append({
                "model": model,
                "overall_n": mt,
                "overall_successes": ms,
                "overall_success_rate": _rate(ms, mt),
                "by_prompt": prompts,
            })
        model_matrix.sort(key=lambda x: x["overall_success_rate"] or 0, reverse=True)

        # ── Table E — failure causes ──────────────────────────────────────
        # Each indicator is counted independently among ALL included experiments.
        # An experiment may contribute to multiple failure causes simultaneously.
        failure_row = session.execute(text(f"""
            SELECT
                SUM({REMOVAL_FAILURE_EXPR})    AS removal_failures,
                SUM({BEHAVIOR_VIOLATION_EXPR}) AS behavior_violations,
                SUM({COVERAGE_VIOLATION_EXPR}) AS coverage_violations,
                COUNT(e.id) - SUM({SUCCESS_EXPR}) AS total_failures
            {SMELL_JOIN}
            {where}
        """), params).fetchone()

        total_failures      = int(failure_row[3] or 0)
        removal_cnt         = int(failure_row[0] or 0)
        behavior_cnt        = int(failure_row[1] or 0)
        coverage_cnt        = int(failure_row[2] or 0)
        denom_pct           = max(total_failures, 1)

        failure_causes = [
            {
                "cause": "removal_failure",
                "label": "Smell not removed",
                "count": removal_cnt,
                "pct_of_failures": round(removal_cnt / denom_pct * 100, 1),
            },
            {
                "cause": "behavior_violation",
                "label": "Behavioral regression",
                "count": behavior_cnt,
                "pct_of_failures": round(behavior_cnt / denom_pct * 100, 1),
            },
            {
                "cause": "coverage_violation",
                "label": "Coverage degradation (< −0.5 pp)",
                "count": coverage_cnt,
                "pct_of_failures": round(coverage_cnt / denom_pct * 100, 1),
            },
        ]

        return {
            "filter_options": {
                "models": models_list,
                "smell_types": smells_list,
                "prompting_approaches": approaches_list,
            },
            "overview": {
                "total_experiments": total_experiments,
                "included_in_rq4": n_total,
                "baseline_excluded": total_experiments - n_total,
                "models_count": models_count,
                "strategies_count": strats_count,
            },
            "overall": {
                "n": n_total,
                "successes": n_success,
                "success_rate": _rate(n_success, n_total),
                "ci_lower": ci_lo,
                "ci_upper": ci_hi,
                "total_failures": total_failures,
            },
            "by_prompt": by_prompt,
            "by_model": by_model,
            "model_matrix": model_matrix,
            "failure_causes": failure_causes,
        }
    finally:
        session.close()


# ---------------------------------------------------------------------------
# GET /api/rq4/export
# ---------------------------------------------------------------------------

_EXPORT_TABLES = {"raw", "overall", "by_prompt", "by_model", "model_matrix", "failure_causes"}


@router.get("/export")
def rq4_export(
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
                    e.id                                                           AS experiment_id,
                    {SMELL_TYPE_COL}                                               AS smell_type,
                    e.ai_model_version                                             AS model,
                    e.prompting_approach                                           AS prompt,
                    COALESCE(e.smell_removed, 0)                                   AS smell_removed,
                    ({PRESERVED_EXPR})                                             AS behavior_preserved,
                    {DELTA_COVERAGE_EXPR}                                          AS delta_coverage,
                    ({SUCCESS_EXPR})                                               AS success,
                    ({REMOVAL_FAILURE_EXPR})                                       AS removal_failure,
                    ({BEHAVIOR_VIOLATION_EXPR})                                    AS behavior_violation,
                    ({COVERAGE_VIOLATION_EXPR})                                    AS coverage_violation
                {SMELL_JOIN}
                {where}
                ORDER BY e.id
            """), params).fetchall()

            writer.writerow([
                "experiment_id", "smell_type", "model", "prompt",
                "smell_removed", "behavior_preserved", "delta_coverage",
                "success", "removal_failure", "behavior_violation", "coverage_violation",
            ])
            for row in rows:
                writer.writerow(list(row))

        # ── overall ───────────────────────────────────────────────────────
        elif table == "overall":
            data = rq4_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["metric", "value"])
            for k, v in data["overall"].items():
                writer.writerow([k, v])

        # ── by_prompt ─────────────────────────────────────────────────────
        elif table == "by_prompt":
            data = rq4_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["prompt", "attempts", "successes", "success_rate", "ci_lower", "ci_upper"])
            for row in data["by_prompt"]:
                writer.writerow([
                    row["prompt"], row["n"], row["successes"],
                    row["success_rate"], row["ci_lower"], row["ci_upper"],
                ])

        # ── by_model ──────────────────────────────────────────────────────
        elif table == "by_model":
            data = rq4_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["model", "attempts", "successes", "success_rate", "ci_lower", "ci_upper"])
            for row in data["by_model"]:
                writer.writerow([
                    row["model"], row["n"], row["successes"],
                    row["success_rate"], row["ci_lower"], row["ci_upper"],
                ])

        # ── model_matrix ──────────────────────────────────────────────────
        elif table == "model_matrix":
            data = rq4_summary(smell_type, ai_model_version, prompting_approach)
            prompts = sorted({
                p
                for row in data["model_matrix"]
                for p in row["by_prompt"].keys()
            })
            writer.writerow(
                ["model"] + prompts + ["overall_attempts", "overall_successes", "overall_success_rate"]
            )
            for row in data["model_matrix"]:
                cells = []
                for p in prompts:
                    bp = row["by_prompt"].get(p)
                    cells.append(
                        f"{bp['success_rate']}% ({bp['successes']}/{bp['n']})" if bp else "—"
                    )
                writer.writerow(
                    [row["model"]] + cells +
                    [row["overall_n"], row["overall_successes"], row["overall_success_rate"]]
                )

        # ── failure_causes ────────────────────────────────────────────────
        elif table == "failure_causes":
            data = rq4_summary(smell_type, ai_model_version, prompting_approach)
            writer.writerow(["cause", "label", "count", "pct_of_failures"])
            for row in data["failure_causes"]:
                writer.writerow([
                    row["cause"], row["label"], row["count"], row["pct_of_failures"],
                ])

        filename = f"rq4_{table}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    finally:
        session.close()
