"""
RQ1 Controller — Structural Removal Rate (SRR) analysis.

Endpoints:
  GET /api/rq1/summary   – aggregated tables for the dashboard
  GET /api/rq1/export    – filtered CSV download
"""

from typing import Optional
from pathlib import Path
import sys
import csv
import io
from datetime import datetime

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "llm-refactor-pipeline" / "src"))
from llm_refactor.modules.database.connection import ResearchDB

router = APIRouter(prefix="/api/rq1", tags=["RQ1"])

_db = ResearchDB()
_db.init_database()


def _session():
    return _db.get_session()


SMELL_JOIN = """
    FROM experiments e
    JOIN files f ON e.file_id = f.id
    JOIN repositories r ON f.repository_id = r.id
    LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
    LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
"""

SMELL_TYPE_COL = "COALESCE(ss.smell_type, bsd.smell_type)"


def _build_where(smell_type, ai_model_version, prompting_approach, smell_removed):
    clauses, params = [], {}
    if smell_type:
        clauses.append(f"{SMELL_TYPE_COL} = :smell_type")
        params["smell_type"] = smell_type
    if ai_model_version:
        clauses.append("e.ai_model_version = :ai_model_version")
        params["ai_model_version"] = ai_model_version
    if prompting_approach:
        clauses.append("e.prompting_approach = :prompting_approach")
        params["prompting_approach"] = prompting_approach
    if smell_removed is not None:
        clauses.append("e.smell_removed = :smell_removed")
        params["smell_removed"] = 1 if smell_removed else 0
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    return where, params


def _srr(removed, total):
    if not total:
        return None
    return round(removed / total * 100, 1)


def _ci95(removed, total):
    """Wilson 95% CI for a proportion, returns (lower%, upper%)."""
    if not total:
        return None, None
    import math
    z = 1.96
    p = removed / total
    denom = 1 + z ** 2 / total
    centre = (p + z ** 2 / (2 * total)) / denom
    margin = (z * math.sqrt(p * (1 - p) / total + z ** 2 / (4 * total ** 2))) / denom
    return round(max(0.0, centre - margin) * 100, 1), round(min(1.0, centre + margin) * 100, 1)


# ---------------------------------------------------------------------------
# GET /api/rq1/summary
# ---------------------------------------------------------------------------

@router.get("/summary")
def rq1_summary(
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
    smell_removed: Optional[bool] = Query(None),
):
    """Returns all aggregated data needed to render the RQ1 dashboard tables."""
    session = _session()
    try:
        where, params = _build_where(smell_type, ai_model_version, prompting_approach, smell_removed)

        # ── filter options ────────────────────────────────────────────────
        models_list = [r[0] for r in session.execute(text("""
            SELECT DISTINCT e.ai_model_version
            FROM experiments e
            WHERE e.ai_model_version IS NOT NULL
            ORDER BY e.ai_model_version
        """)).fetchall()]

        smells_list = [r[0] for r in session.execute(text(f"""
            SELECT DISTINCT {SMELL_TYPE_COL} as st
            {SMELL_JOIN}
            WHERE {SMELL_TYPE_COL} IS NOT NULL
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
                COUNT(e.id)                                              AS total,
                SUM(CASE WHEN e.smell_removed = 1 THEN 1 ELSE 0 END)   AS removed
            {SMELL_JOIN}
            {where}
        """), params).fetchone()

        total_attempts = overall_row[0] or 0
        total_removed  = overall_row[1] or 0

        models_in_data = session.execute(text(f"""
            SELECT COUNT(DISTINCT e.ai_model_version)
            {SMELL_JOIN}
            {where}
        """), params).scalar() or 0

        strategies_in_data = session.execute(text(f"""
            SELECT COUNT(DISTINCT e.prompting_approach)
            {SMELL_JOIN}
            {where}
        """), params).scalar() or 0

        # ── by smell type ─────────────────────────────────────────────────
        by_smell_rows = session.execute(text(f"""
            SELECT
                {SMELL_TYPE_COL}                                             AS smell_type,
                COUNT(e.id)                                                  AS n,
                SUM(CASE WHEN e.smell_removed = 1 THEN 1 ELSE 0 END)        AS removed
            {SMELL_JOIN}
            {where}
            GROUP BY {SMELL_TYPE_COL}
            ORDER BY removed * 1.0 / NULLIF(COUNT(e.id), 0) DESC
        """), params).fetchall()

        by_smell = []
        for r in by_smell_rows:
            rm, n = r[2] or 0, r[1]
            ci_lo, ci_hi = _ci95(rm, n)
            by_smell.append({
                "smell_type": r[0] or "Unknown",
                "n": n,
                "removed": rm,
                "srr": _srr(rm, n),
                "ci_lower": ci_lo,
                "ci_upper": ci_hi,
            })

        # ── by prompt strategy ────────────────────────────────────────────
        by_prompt_rows = session.execute(text(f"""
            SELECT
                e.prompting_approach                                         AS prompt,
                COUNT(e.id)                                                  AS n,
                SUM(CASE WHEN e.smell_removed = 1 THEN 1 ELSE 0 END)        AS removed
            {SMELL_JOIN}
            {where}
            GROUP BY e.prompting_approach
            ORDER BY
                CASE e.prompting_approach
                    WHEN 'zero-shot' THEN 1
                    WHEN 'few-shot'  THEN 2
                    WHEN 'cot'       THEN 3
                    ELSE 4
                END
        """), params).fetchall()

        by_prompt = [
            {
                "prompt": r[0] or "Unknown",
                "n": r[1],
                "removed": r[2] or 0,
                "srr": _srr(r[2] or 0, r[1]),
            }
            for r in by_prompt_rows
        ]

        # ── model × prompt matrix ─────────────────────────────────────────
        matrix_rows = session.execute(text(f"""
            SELECT
                e.ai_model_version                                           AS model,
                e.prompting_approach                                         AS prompt,
                COUNT(e.id)                                                  AS n,
                SUM(CASE WHEN e.smell_removed = 1 THEN 1 ELSE 0 END)        AS removed
            {SMELL_JOIN}
            {where}
            GROUP BY e.ai_model_version, e.prompting_approach
        """), params).fetchall()

        matrix_map: dict = {}
        for r in matrix_rows:
            model  = r[0] or "Unknown"
            prompt = r[1] or "Unknown"
            matrix_map.setdefault(model, {})[prompt] = {"n": r[2], "removed": r[3] or 0}

        model_matrix = []
        for model, prompts in matrix_map.items():
            mt = sum(v["n"]       for v in prompts.values())
            mr = sum(v["removed"] for v in prompts.values())
            model_matrix.append({
                "model": model,
                "overall_n": mt,
                "overall_removed": mr,
                "overall_srr": _srr(mr, mt),
                "by_prompt": prompts,
            })
        model_matrix.sort(key=lambda x: x["overall_srr"] or 0, reverse=True)

        return {
            "filter_options": {
                "models": models_list,
                "smell_types": smells_list,
                "prompting_approaches": approaches_list,
            },
            "overview": {
                "total_instances": total_attempts,
                "models_count": models_in_data,
                "strategies_count": strategies_in_data,
                "total_refactorings": total_attempts,
            },
            "overall": {
                "total_attempts": total_attempts,
                "successful_removals": total_removed,
                "overall_srr": _srr(total_removed, total_attempts),
            },
            "by_smell": by_smell,
            "by_prompt": by_prompt,
            "model_matrix": model_matrix,
        }
    finally:
        session.close()


# ---------------------------------------------------------------------------
# GET /api/rq1/export
# ---------------------------------------------------------------------------

@router.get("/export")
def rq1_export(
    smell_type: Optional[str] = Query(None),
    ai_model_version: Optional[str] = Query(None),
    prompting_approach: Optional[str] = Query(None),
    smell_removed: Optional[bool] = Query(None),
):
    """Stream a CSV with columns: instance_id, smell_type, model, prompt, removed."""
    session = _session()
    try:
        where, params = _build_where(smell_type, ai_model_version, prompting_approach, smell_removed)

        rows = session.execute(text(f"""
            SELECT
                e.id                                                         AS instance_id,
                {SMELL_TYPE_COL}                                             AS smell_type,
                e.ai_model_version                                           AS model,
                e.prompting_approach                                         AS prompt,
                CASE WHEN e.smell_removed = 1 THEN 'true' ELSE 'false' END  AS removed
            {SMELL_JOIN}
            {where}
            ORDER BY e.id
        """), params).fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["instance_id", "smell_type", "model", "prompt", "removed"])
        for row in rows:
            writer.writerow(list(row))

        filename = f"rq1_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    finally:
        session.close()
