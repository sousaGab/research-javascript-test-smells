"""
RQ3 Controller — Structural Side Effects of LLM-based Refactoring.

What unintended structural side effects emerge from LLM-based refactoring?

Two sub-questions:

RQ3a — Smell Side Effects
  Does LLM refactoring reliably remove the targeted smell without introducing
  new ones? Metrics: smell_removal_rate, new_smell_introduction_rate, added_smells.
  Source: experiments.smell_removed / introduced_new_smells / added_smells (JSON).
  added_smells is a JSON dict {smell_type: count_added} populated by the backfill
  script; NULL means the after-phase CSV was not available for that experiment.
  Error-class experiments: runner failed → no after CSV → added_smells IS NULL →
             counted separately as 'detection_not_possible'.

RQ3b — Coverage Side Effects
  Does LLM refactoring preserve, degrade, or improve test coverage?
  Metrics: Δ_statements, Δ_branches, Δ_functions, Δ_lines.
  Source: test_results.coverage_* (phase before/after).
  Inclusion: experiments that have non-NULL coverage_statements in after phase.
  Coverage classification: improved (any Δ>0) / preserved (all Δ=0) / degraded (any Δ<0).

Endpoints:
  GET /api/rq3/summary  – all aggregated data + data_availability block
  GET /api/rq3/export   – CSV download, table= param selects dataset
"""

from typing import Optional
from pathlib import Path
import sys
import csv
import io
import json
from collections import Counter
from datetime import datetime

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "llm-refactor-pipeline" / "src"))
from llm_refactor.modules.database.connection import ResearchDB

router = APIRouter(prefix="/api/rq3", tags=["RQ3"])

_db = ResearchDB()
_db.init_database()

# ── Smell name normalization ──────────────────────────────────────────────────
# Some detectors report the same smell type under different naming conventions
# (e.g. camelCase vs space-separated).  Aliases are merged into a single
# canonical name so counts are not split across two entries.
_SMELL_ALIASES: dict = {
    "ConditionalTestLogic": "Conditional Test Logic",
}

# Only these smell types are counted as "accidentally added" smells.
# Any other type returned by the detector is silently ignored.
# Matching is case-insensitive and space-insensitive.
_ALLOWED_ADDED_SMELLS: set = {
    "Conditional Test Logic",
    "Overcommented Test",
    "Suboptimal Assert",
    "Anonymous Test",
    "Verbose Statement",
    "Duplicate Assert",
    "Exception Handling",
    "Magic Number",
    "Sleepy Test",
    "Unknown Test",
}

# Pre-computed normalised key set (lowercase, no spaces)
_ALLOWED_KEYS: set = {s.lower().replace(" ", "") for s in _ALLOWED_ADDED_SMELLS}


def _normalize_smell(name: str) -> str:
    """Return the canonical smell name, resolving known aliases."""
    return _SMELL_ALIASES.get(name, name)


def _normalize_added_smells(js) -> dict:
    """Parse an added_smells JSON string, merge aliased smell names, and
    keep only smell types present in _ALLOWED_ADDED_SMELLS (case+space insensitive)."""
    if not js or str(js) in ('{}', 'None', ''):
        return {}
    try:
        raw = json.loads(str(js))
    except Exception:
        return {}
    merged: dict = {}
    for k, v in raw.items():
        canon = _normalize_smell(k)
        if canon.lower().replace(" ", "") not in _ALLOWED_KEYS:
            continue
        merged[canon] = merged.get(canon, 0) + int(v)
    return merged


def _session():
    return _db.get_session()


# ---------------------------------------------------------------------------
# Shared SQL fragments
# ---------------------------------------------------------------------------

_ERROR_TYPES = "'syntax_error', 'runtime_error', 'module_resolution_error', 'timeout', 'unknown'"

SMELL_TYPE_COL = "COALESCE(ss.smell_type, bsd.smell_type)"

# Base FROM/JOIN used by all queries
BASE_JOIN = """
    FROM experiments e
    JOIN files f ON e.file_id = f.id
    JOIN repositories r ON f.repository_id = r.id
    LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
    LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
"""

# For coverage queries we need test_results
COVERAGE_JOIN = BASE_JOIN + """
    LEFT JOIN test_results tr_b ON tr_b.experiment_id = e.id AND tr_b.phase = 'before'
    LEFT JOIN test_results tr_a ON tr_a.experiment_id = e.id AND tr_a.phase = 'after'
"""

# RQ3a inclusion: added_smells column was populated by the backfill script
# NULL means the after-phase CSV was not found for that experiment
INCLUSION_RQ3A = "e.added_smells IS NOT NULL"

# RQ3b inclusion: experiment has after-phase coverage data
INCLUSION_RQ3B = "tr_a.coverage_statements IS NOT NULL"


def _build_where(smell_type, ai_model_version, prompting_approach, inclusion_clause):
    clauses = [inclusion_clause]
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


def _pct(k, n):
    if not n:
        return None
    return round(k / n * 100, 1)


def _avg(total, n):
    if not n:
        return None
    return round(total / n, 2)


# ---------------------------------------------------------------------------
# GET /api/rq3/summary
# ---------------------------------------------------------------------------

@router.get("/summary")
def rq3_summary(
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
):
    session = _session()
    try:
        # ── filter options ─────────────────────────────────────────────────
        models_list = [r[0] for r in session.execute(text("""
            SELECT DISTINCT e.ai_model_version
            FROM experiments e WHERE e.ai_model_version IS NOT NULL
            ORDER BY e.ai_model_version
        """)).fetchall()]

        smells_list = [r[0] for r in session.execute(text(f"""
            SELECT DISTINCT {SMELL_TYPE_COL} AS st
            {BASE_JOIN}
            WHERE {SMELL_TYPE_COL} IS NOT NULL
            ORDER BY st
        """)).fetchall()]

        approaches_list = [r[0] for r in session.execute(text("""
            SELECT DISTINCT prompting_approach FROM experiments
            WHERE prompting_approach IS NOT NULL ORDER BY prompting_approach
        """)).fetchall()]

        # ── data availability ──────────────────────────────────────────────
        total_experiments = session.execute(text(
            "SELECT COUNT(*) FROM experiments"
        )).scalar() or 0

        rq3a_included = session.execute(text(f"""
            SELECT COUNT(DISTINCT e.id)
            {BASE_JOIN}
            WHERE e.added_smells IS NOT NULL
        """)).scalar() or 0

        rq3a_error_class = session.execute(text(f"""
            SELECT COUNT(e.id)
            {BASE_JOIN}
            WHERE e.tests_failed_type IN ({_ERROR_TYPES})
        """)).scalar() or 0

        rq3a_excluded_no_after = total_experiments - rq3a_included - rq3a_error_class

        rq3b_included = session.execute(text(f"""
            SELECT COUNT(e.id)
            {COVERAGE_JOIN}
            WHERE {INCLUSION_RQ3B}
        """)).scalar() or 0

        data_availability = {
            "total_experiments":           total_experiments,
            "rq3a_included":               rq3a_included,
            "rq3a_excluded_error_class":   rq3a_error_class,
            "rq3a_excluded_no_after_data": max(0, rq3a_excluded_no_after),
            "rq3b_included":               rq3b_included,
            "rq3b_excluded_no_coverage":   total_experiments - rq3b_included,
            "rq3a_warning":                rq3a_included < 100,
            "rq3b_warning":                rq3b_included < 100,
        }

        # ══════════════════════════════════════════════════════════════════
        # RQ3a — Smell Side Effects
        # ══════════════════════════════════════════════════════════════════
        where_a, params_a = _build_where(smell_type, ai_model_version, prompting_approach, INCLUSION_RQ3A)

        # Core aggregate counts
        fast_a = session.execute(text(f"""
            SELECT
                COUNT(e.id)                                           AS n,
                SUM(CASE WHEN e.smell_removed = 1 THEN 1 ELSE 0 END) AS removed,
                SUM(CASE WHEN e.introduced_new_smells = 1 THEN 1 ELSE 0 END) AS new_introduced
            {BASE_JOIN}
            {where_a}
        """), params_a).fetchone()

        # Total added instances, taxonomy AND interaction matrix — one JSON pass
        n_a = fast_a[0] or 0
        added_rows = session.execute(text(f"""
            SELECT {SMELL_TYPE_COL} AS targeted, e.added_smells
            {BASE_JOIN}
            {where_a}
              AND e.added_smells IS NOT NULL AND e.added_smells != '{{}}'
        """), params_a).fetchall()
        total_added_instances = 0
        tax_counter: Counter = Counter()
        interact_raw: dict = {}
        for (targeted, js) in added_rows:
            tgt = targeted or "Unknown"
            d = _normalize_added_smells(js)
            if d:
                row_c = interact_raw.setdefault(tgt, Counter())
                for stype, cnt in d.items():
                    total_added_instances += cnt
                    tax_counter[stype]    += cnt
                    row_c[stype]          += cnt

        # Build interaction matrix (sparse cells list)
        _all_targeted = sorted(interact_raw.keys())
        _all_added    = [s for s, _ in tax_counter.most_common()]
        _max_count    = max(
            (c for rc in interact_raw.values() for c in rc.values()),
            default=1
        )
        interaction_matrix = {
            "targeted_labels": _all_targeted,
            "added_labels":    _all_added,
            "max_count":       _max_count,
            "cells": [
                {"targeted": t, "added": a, "count": interact_raw[t].get(a, 0)}
                for t in _all_targeted
                for a in _all_added
                if interact_raw[t].get(a, 0) > 0
            ],
        }

        rq3a_overall = {
            "n":                          n_a,
            "removed":                    int(fast_a[1] or 0),
            "removal_rate":               _pct(int(fast_a[1] or 0), n_a),
            "new_introduced_exp":         int(fast_a[2] or 0),
            "new_introduction_rate":      _pct(int(fast_a[2] or 0), n_a),
            "total_added_smell_instances": total_added_instances,
            "avg_added_per_experiment":   round(total_added_instances / n_a, 2) if n_a else 0,
        }

        # By smell type
        by_smell_a_rows = session.execute(text(f"""
            SELECT
                {SMELL_TYPE_COL}                                           AS smell_type,
                COUNT(e.id)                                                AS n,
                SUM(CASE WHEN e.smell_removed=1 THEN 1 ELSE 0 END)        AS removed,
                SUM(CASE WHEN e.introduced_new_smells=1 THEN 1 ELSE 0 END) AS new_introduced
            {BASE_JOIN}
            {where_a}
            GROUP BY {SMELL_TYPE_COL}
            ORDER BY removed * 1.0 / NULLIF(COUNT(e.id), 0) DESC
        """), params_a).fetchall()

        rq3a_by_smell = [
            {
                "smell_type":            r[0] or "Unknown",
                "n":                     r[1],
                "removed":               int(r[2] or 0),
                "removal_rate":          _pct(int(r[2] or 0), r[1]),
                "new_introduced":        int(r[3] or 0),
                "new_introduction_rate": _pct(int(r[3] or 0), r[1]),
            }
            for r in by_smell_a_rows
        ]

        # By model
        by_model_a_rows = session.execute(text(f"""
            SELECT
                e.ai_model_version                                         AS model,
                COUNT(e.id)                                                AS n,
                SUM(CASE WHEN e.smell_removed=1 THEN 1 ELSE 0 END)        AS removed,
                SUM(CASE WHEN e.introduced_new_smells=1 THEN 1 ELSE 0 END) AS new_introduced
            {BASE_JOIN}
            {where_a}
            GROUP BY e.ai_model_version
            ORDER BY removed * 1.0 / NULLIF(COUNT(e.id), 0) DESC
        """), params_a).fetchall()

        rq3a_by_model = [
            {
                "model":               r[0] or "Unknown",
                "n":                   r[1],
                "removed":             int(r[2] or 0),
                "removal_rate":        _pct(int(r[2] or 0), r[1]),
                "new_introduced":      int(r[3] or 0),
                "new_introduction_rate": _pct(int(r[3] or 0), r[1]),
            }
            for r in by_model_a_rows
        ]

        # By prompt
        by_prompt_a_rows = session.execute(text(f"""
            SELECT
                e.prompting_approach                                       AS prompt,
                COUNT(e.id)                                                AS n,
                SUM(CASE WHEN e.smell_removed=1 THEN 1 ELSE 0 END)        AS removed,
                SUM(CASE WHEN e.introduced_new_smells=1 THEN 1 ELSE 0 END) AS new_introduced
            {BASE_JOIN}
            {where_a}
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
        """), params_a).fetchall()

        rq3a_by_prompt = [
            {
                "prompt":              r[0] or "Unknown",
                "n":                   r[1],
                "removed":             int(r[2] or 0),
                "removal_rate":        _pct(int(r[2] or 0), r[1]),
                "new_introduced":      int(r[3] or 0),
                "new_introduction_rate": _pct(int(r[3] or 0), r[1]),
            }
            for r in by_prompt_a_rows
        ]

        # New smell taxonomy — already computed via tax_counter above (same pass as total_added)
        total_new = sum(tax_counter.values()) or 1
        new_smell_taxonomy = [
            {
                "introduced_smell_type": stype,
                "count":                 cnt,
                "pct_of_new":            round(cnt / total_new * 100, 1),
                "pct_of_included":       _pct(cnt, rq3a_included),
            }
            for stype, cnt in tax_counter.most_common()
        ]

        # ══════════════════════════════════════════════════════════════════
        # RQ3b — Coverage Side Effects
        # ══════════════════════════════════════════════════════════════════
        where_b, params_b = _build_where(smell_type, ai_model_version, prompting_approach, INCLUSION_RQ3B)

        overall_b = session.execute(text(f"""
            SELECT
                COUNT(e.id)                                                AS n,
                AVG(COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0)) AS avg_delta_stmt,
                AVG(COALESCE(tr_a.coverage_branches,0)   - COALESCE(tr_b.coverage_branches,0))   AS avg_delta_br,
                AVG(COALESCE(tr_a.coverage_functions,0)  - COALESCE(tr_b.coverage_functions,0))  AS avg_delta_fn,
                AVG(COALESCE(tr_a.coverage_lines,0)      - COALESCE(tr_b.coverage_lines,0))      AS avg_delta_ln,
                SUM(CASE WHEN (
                        COALESCE(tr_a.coverage_statements,0) > COALESCE(tr_b.coverage_statements,0) OR
                        COALESCE(tr_a.coverage_branches,0)   > COALESCE(tr_b.coverage_branches,0)   OR
                        COALESCE(tr_a.coverage_functions,0)  > COALESCE(tr_b.coverage_functions,0)  OR
                        COALESCE(tr_a.coverage_lines,0)      > COALESCE(tr_b.coverage_lines,0)
                    ) THEN 1 ELSE 0 END)                                   AS improved,
                SUM(CASE WHEN (
                        COALESCE(tr_a.coverage_statements,0) = COALESCE(tr_b.coverage_statements,0) AND
                        COALESCE(tr_a.coverage_branches,0)   = COALESCE(tr_b.coverage_branches,0)   AND
                        COALESCE(tr_a.coverage_functions,0)  = COALESCE(tr_b.coverage_functions,0)  AND
                        COALESCE(tr_a.coverage_lines,0)      = COALESCE(tr_b.coverage_lines,0)
                    ) THEN 1 ELSE 0 END)                                   AS preserved,
                SUM(CASE WHEN (
                        COALESCE(tr_a.coverage_statements,0) < COALESCE(tr_b.coverage_statements,0) OR
                        COALESCE(tr_a.coverage_branches,0)   < COALESCE(tr_b.coverage_branches,0)   OR
                        COALESCE(tr_a.coverage_functions,0)  < COALESCE(tr_b.coverage_functions,0)  OR
                        COALESCE(tr_a.coverage_lines,0)      < COALESCE(tr_b.coverage_lines,0)
                    ) THEN 1 ELSE 0 END)                                   AS degraded
            {COVERAGE_JOIN}
            {where_b}
        """), params_b).fetchone()

        n_b = overall_b[0] or 0
        improved_b  = int(overall_b[5] or 0)
        preserved_b = int(overall_b[6] or 0)
        degraded_b  = int(overall_b[7] or 0)

        rq3b_overall = {
            "n":                      n_b,
            "avg_delta_statements":   round(float(overall_b[1] or 0), 3),
            "avg_delta_branches":     round(float(overall_b[2] or 0), 3),
            "avg_delta_functions":    round(float(overall_b[3] or 0), 3),
            "avg_delta_lines":        round(float(overall_b[4] or 0), 3),
            "improved":               improved_b,
            "improved_rate":          _pct(improved_b, n_b),
            "preserved":              preserved_b,
            "preserved_rate":         _pct(preserved_b, n_b),
            "degraded":               degraded_b,
            "degraded_rate":          _pct(degraded_b, n_b),
        }

        # By smell type
        by_smell_b_rows = session.execute(text(f"""
            SELECT
                {SMELL_TYPE_COL}   AS smell_type,
                COUNT(e.id)        AS n,
                AVG(COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0)) AS avg_delta_stmt,
                AVG(COALESCE(tr_a.coverage_branches,0)   - COALESCE(tr_b.coverage_branches,0))   AS avg_delta_br,
                AVG(COALESCE(tr_a.coverage_functions,0)  - COALESCE(tr_b.coverage_functions,0))  AS avg_delta_fn,
                AVG(COALESCE(tr_a.coverage_lines,0)      - COALESCE(tr_b.coverage_lines,0))      AS avg_delta_ln,
                SUM(CASE WHEN e.coverage_decreased=1 THEN 1 ELSE 0 END) AS degraded_exp
            {COVERAGE_JOIN}
            {where_b}
            GROUP BY {SMELL_TYPE_COL}
            ORDER BY AVG(COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0)) DESC
        """), params_b).fetchall()

        rq3b_by_smell = [
            {
                "smell_type":           r[0] or "Unknown",
                "n":                    r[1],
                "avg_delta_statements": round(float(r[2] or 0), 3),
                "avg_delta_branches":   round(float(r[3] or 0), 3),
                "avg_delta_functions":  round(float(r[4] or 0), 3),
                "avg_delta_lines":      round(float(r[5] or 0), 3),
                "degraded_experiments": int(r[6] or 0),
                "degraded_rate":        _pct(int(r[6] or 0), r[1]),
            }
            for r in by_smell_b_rows
        ]

        # By model
        by_model_b_rows = session.execute(text(f"""
            SELECT
                e.ai_model_version AS model,
                COUNT(e.id) AS n,
                AVG(COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0)) AS avg_delta_stmt,
                SUM(CASE WHEN e.coverage_decreased=1 THEN 1 ELSE 0 END) AS degraded_exp
            {COVERAGE_JOIN}
            {where_b}
            GROUP BY e.ai_model_version
            ORDER BY AVG(COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0)) DESC
        """), params_b).fetchall()

        rq3b_by_model = [
            {
                "model":                r[0] or "Unknown",
                "n":                    r[1],
                "avg_delta_statements": round(float(r[2] or 0), 3),
                "degraded_experiments": int(r[3] or 0),
                "degraded_rate":        _pct(int(r[3] or 0), r[1]),
            }
            for r in by_model_b_rows
        ]

        # By prompt strategy (coverage)
        by_prompt_b_rows = session.execute(text(f"""
            SELECT
                e.prompting_approach AS prompt,
                COUNT(e.id)          AS n,
                AVG(COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0)) AS avg_delta_stmt,
                AVG(COALESCE(tr_a.coverage_branches,0)   - COALESCE(tr_b.coverage_branches,0))   AS avg_delta_br,
                AVG(COALESCE(tr_a.coverage_functions,0)  - COALESCE(tr_b.coverage_functions,0))  AS avg_delta_fn,
                AVG(COALESCE(tr_a.coverage_lines,0)      - COALESCE(tr_b.coverage_lines,0))      AS avg_delta_ln,
                SUM(CASE WHEN e.coverage_decreased=1 THEN 1 ELSE 0 END) AS degraded_exp,
                SUM(CASE WHEN (
                        COALESCE(tr_a.coverage_statements,0) > COALESCE(tr_b.coverage_statements,0) OR
                        COALESCE(tr_a.coverage_branches,0)   > COALESCE(tr_b.coverage_branches,0)   OR
                        COALESCE(tr_a.coverage_functions,0)  > COALESCE(tr_b.coverage_functions,0)  OR
                        COALESCE(tr_a.coverage_lines,0)      > COALESCE(tr_b.coverage_lines,0)
                    ) THEN 1 ELSE 0 END) AS improved_exp
            {COVERAGE_JOIN}
            {where_b}
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
        """), params_b).fetchall()

        rq3b_by_prompt = [
            {
                "prompt":               r[0] or "Unknown",
                "n":                    r[1],
                "avg_delta_statements": round(float(r[2] or 0), 3),
                "avg_delta_branches":   round(float(r[3] or 0), 3),
                "avg_delta_functions":  round(float(r[4] or 0), 3),
                "avg_delta_lines":      round(float(r[5] or 0), 3),
                "degraded_experiments": int(r[6] or 0),
                "degraded_rate":        _pct(int(r[6] or 0), r[1]),
                "improved_experiments": int(r[7] or 0),
                "improved_rate":        _pct(int(r[7] or 0), r[1]),
            }
            for r in by_prompt_b_rows
        ]

        return {
            "filter_options": {
                "models":               models_list,
                "smell_types":          smells_list,
                "prompting_approaches": approaches_list,
            },
            "data_availability": data_availability,
            "rq3a": {
                "overall":         rq3a_overall,
                "by_smell":        rq3a_by_smell,
                "by_model":        rq3a_by_model,
                "by_prompt":       rq3a_by_prompt,
                "new_smell_taxonomy": new_smell_taxonomy,
                "interaction_matrix": interaction_matrix,
            },
            "rq3b": {
                "overall":   rq3b_overall,
                "by_smell":  rq3b_by_smell,
                "by_model":  rq3b_by_model,
                "by_prompt": rq3b_by_prompt,
            },
        }
    finally:
        session.close()


# ---------------------------------------------------------------------------
# GET /api/rq3/export
# ---------------------------------------------------------------------------

_EXPORT_TABLES = {"raw_smells", "raw_coverage", "by_smell", "by_model", "new_smell_taxonomy", "coverage_summary", "interaction_matrix"}


@router.get("/export")
def rq3_export(
    table: str = Query("raw_smells"),
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
):
    if table not in _EXPORT_TABLES:
        table = "raw_smells"

    session = _session()
    try:
        output = io.StringIO()
        writer = csv.writer(output)

        # ── raw_smells ─────────────────────────────────────────────────────
        if table == "raw_smells":
            where, params = _build_where(smell_type, ai_model_version, prompting_approach, INCLUSION_RQ3A)
            rows = session.execute(text(f"""
                SELECT
                    e.id                                                   AS instance_id,
                    {SMELL_TYPE_COL}                                       AS smell_type,
                    e.ai_model_version                                     AS model,
                    e.prompting_approach                                   AS prompt,
                    COALESCE(e.tests_failed_type, 'none')                  AS failure_type,
                    CASE WHEN e.tests_failed_type IN ({_ERROR_TYPES})
                         THEN 1 ELSE 0 END                                 AS is_error_class,
                    COALESCE(e.smell_removed, 0)                           AS smell_removed,
                    COALESCE(e.introduced_new_smells, 0)                   AS introduced_new_smells,
                    COALESCE(e.added_smells, '{{}}')                       AS added_smells
                {BASE_JOIN}
                {where}
                ORDER BY e.id
            """), params).fetchall()

            writer.writerow([
                "instance_id", "smell_type", "model", "prompt",
                "failure_type", "is_error_class",
                "smell_removed", "introduced_new_smells",
                "added_smells",
            ])
            for row in rows:
                row_list = list(row)
                # Normalize aliases in the exported added_smells JSON
                row_list[8] = json.dumps(
                    _normalize_added_smells(row_list[8]), ensure_ascii=False
                )
                writer.writerow(row_list)

        # ── raw_coverage ──────────────────────────────────────────────────
        elif table == "raw_coverage":
            where, params = _build_where(smell_type, ai_model_version, prompting_approach, INCLUSION_RQ3B)
            rows = session.execute(text(f"""
                SELECT
                    e.id                                                               AS instance_id,
                    {SMELL_TYPE_COL}                                                  AS smell_type,
                    e.ai_model_version                                                AS model,
                    e.prompting_approach                                              AS prompt,
                    COALESCE(e.tests_failed_type, 'none')                             AS failure_type,
                    COALESCE(tr_b.coverage_statements, 0)                             AS before_cov_statements,
                    COALESCE(tr_b.coverage_branches,   0)                             AS before_cov_branches,
                    COALESCE(tr_b.coverage_functions,  0)                             AS before_cov_functions,
                    COALESCE(tr_b.coverage_lines,      0)                             AS before_cov_lines,
                    COALESCE(tr_a.coverage_statements, 0)                             AS after_cov_statements,
                    COALESCE(tr_a.coverage_branches,   0)                             AS after_cov_branches,
                    COALESCE(tr_a.coverage_functions,  0)                             AS after_cov_functions,
                    COALESCE(tr_a.coverage_lines,      0)                             AS after_cov_lines,
                    COALESCE(tr_a.coverage_statements,0) - COALESCE(tr_b.coverage_statements,0) AS delta_statements,
                    COALESCE(tr_a.coverage_branches,0)   - COALESCE(tr_b.coverage_branches,0)   AS delta_branches,
                    COALESCE(tr_a.coverage_functions,0)  - COALESCE(tr_b.coverage_functions,0)  AS delta_functions,
                    COALESCE(tr_a.coverage_lines,0)      - COALESCE(tr_b.coverage_lines,0)      AS delta_lines,
                    COALESCE(e.coverage_decreased, 0)                                 AS coverage_decreased
                {COVERAGE_JOIN}
                {where}
                ORDER BY e.id
            """), params).fetchall()

            writer.writerow([
                "instance_id", "smell_type", "model", "prompt", "failure_type",
                "before_cov_statements", "before_cov_branches",
                "before_cov_functions", "before_cov_lines",
                "after_cov_statements", "after_cov_branches",
                "after_cov_functions", "after_cov_lines",
                "delta_statements", "delta_branches",
                "delta_functions", "delta_lines",
                "coverage_decreased",
            ])
            for row in rows:
                writer.writerow(list(row))

        # ── aggregated tables (delegate to summary) ───────────────────────
        else:
            data = rq3_summary(smell_type, ai_model_version, prompting_approach)

            if table == "by_smell":
                writer.writerow([
                    "smell_type", "n",
                    "removed", "removal_rate",
                    "new_introduced", "new_introduction_rate",
                    "avg_delta_statements", "avg_delta_branches",
                    "avg_delta_functions", "avg_delta_lines", "degraded_rate",
                ])
                a_map = {r["smell_type"]: r for r in data["rq3a"]["by_smell"]}
                b_map = {r["smell_type"]: r for r in data["rq3b"]["by_smell"]}
                all_smells = sorted(set(a_map) | set(b_map))
                for s in all_smells:
                    a = a_map.get(s, {})
                    b = b_map.get(s, {})
                    writer.writerow([
                        s,
                        a.get("n") or b.get("n") or 0,
                        a.get("removed", ""),        a.get("removal_rate", ""),
                        a.get("new_introduced", ""), a.get("new_introduction_rate", ""),
                        b.get("avg_delta_statements", ""), b.get("avg_delta_branches", ""),
                        b.get("avg_delta_functions", ""),  b.get("avg_delta_lines", ""),
                        b.get("degraded_rate", ""),
                    ])

            elif table == "by_model":
                writer.writerow([
                    "model", "n_rq3a",
                    "removal_rate", "new_introduction_rate",
                    "n_rq3b", "avg_delta_statements", "degraded_rate",
                ])
                a_map = {r["model"]: r for r in data["rq3a"]["by_model"]}
                b_map = {r["model"]: r for r in data["rq3b"]["by_model"]}
                for model in sorted(set(a_map) | set(b_map)):
                    a = a_map.get(model, {})
                    b = b_map.get(model, {})
                    writer.writerow([
                        model,
                        a.get("n", ""),              a.get("removal_rate", ""),
                        a.get("new_introduction_rate", ""),
                        b.get("n", ""),              b.get("avg_delta_statements", ""),
                        b.get("degraded_rate", ""),
                    ])

            elif table == "new_smell_taxonomy":
                writer.writerow(["introduced_smell_type", "count", "pct_of_new", "pct_of_included"])
                for row in data["rq3a"]["new_smell_taxonomy"]:
                    writer.writerow([
                        row["introduced_smell_type"], row["count"],
                        row["pct_of_new"], row["pct_of_included"],
                    ])

            elif table == "coverage_summary":
                writer.writerow(["metric", "value"])
                for k, v in data["rq3b"]["overall"].items():
                    writer.writerow([k, v])

            elif table == "interaction_matrix":
                writer.writerow(["targeted_smell", "added_smell", "count"])
                matrix = data["rq3a"].get("interaction_matrix", {})
                for cell in matrix.get("cells", []):
                    writer.writerow([cell["targeted"], cell["added"], cell["count"]])

        filename = f"rq3_{table}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    finally:
        session.close()
