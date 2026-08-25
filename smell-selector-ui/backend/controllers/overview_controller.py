from datetime import datetime
import csv
import io
from typing import Optional
from pathlib import Path
import sys

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "llm-refactor-pipeline" / "src"))
from llm_refactor.modules.database.connection import ResearchDB

router = APIRouter(prefix="/api/overview", tags=["Overview"])

_db = ResearchDB()
_db.init_database()


def _session():
    return _db.get_session()


def _split_csv(raw_value: Optional[str]):
    if raw_value is None:
        return []
    return [part.strip() for part in raw_value.split(",") if part and part.strip()]


def _build_filters(repos: Optional[str], smell_types: Optional[str]):
    repo_filters = _split_csv(repos)
    smell_filters = _split_csv(smell_types)

    where_clauses = []
    params = {}

    if repo_filters:
        placeholders = ", ".join(f":repo_{index}" for index in range(len(repo_filters)))
        where_clauses.append(f"r.name IN ({placeholders})")
        for index, repository in enumerate(repo_filters):
            params[f"repo_{index}"] = repository

    if smell_filters:
        placeholders = ", ".join(f":smell_{index}" for index in range(len(smell_filters)))
        where_clauses.append(f"ds.smell_type IN ({placeholders})")
        for index, smell_type in enumerate(smell_filters):
            params[f"smell_{index}"] = smell_type

    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    return where_sql, params, repo_filters, smell_filters


def _query_rows(session, where_sql: str, params: dict):
    return session.execute(text(f"""
        SELECT
            r.name AS repository,
            ds.smell_type AS smell_type,
            COUNT(ds.id) AS count
        FROM detected_smells ds
        JOIN files f ON ds.file_id = f.id
        JOIN repositories r ON r.id = f.repository_id
        {where_sql}
        GROUP BY r.name, ds.smell_type
        ORDER BY r.name ASC, COUNT(ds.id) DESC, ds.smell_type ASC
    """), params).fetchall()


@router.get("")
async def overview_summary(
    repos: Optional[str] = Query(default=None, description="Comma-separated repository names"),
    smell_types: Optional[str] = Query(default=None, description="Comma-separated smell types"),
):
    session = _session()
    try:
        where_sql, params, repo_filters, smell_filters = _build_filters(repos, smell_types)
        rows = _query_rows(session, where_sql, params)

        by_repository = []
        repository_map = {}

        for repository, smell_type, count in rows:
            if repository not in repository_map:
                repository_map[repository] = {"repository": repository, "count": 0, "smell_types": []}
            repository_map[repository]["count"] += int(count)
            repository_map[repository]["smell_types"].append({
                "smell_type": smell_type,
                "count": int(count)
            })

        for repository in sorted(repository_map):
            by_repository.append(repository_map[repository])

        smell_type_rows = session.execute(text(f"""
            SELECT
                ds.smell_type AS smell_type,
                COUNT(ds.id) AS count
            FROM detected_smells ds
            JOIN files f ON ds.file_id = f.id
            JOIN repositories r ON r.id = f.repository_id
            {where_sql}
            GROUP BY ds.smell_type
            ORDER BY COUNT(ds.id) DESC, ds.smell_type ASC
        """), params).fetchall()

        by_smell_type = [
            {"smell_type": smell_type, "count": int(count)}
            for smell_type, count in smell_type_rows
        ]

        all_repo_names = [row[0] for row in session.execute(text("SELECT name FROM repositories ORDER BY name")).fetchall()]
        all_smell_types = [row[0] for row in session.execute(text("SELECT DISTINCT smell_type FROM detected_smells WHERE smell_type IS NOT NULL ORDER BY smell_type")).fetchall()]

        unique_repo_names = sorted({repository for repository, _, _ in rows})
        summary = {
            "total_repositories": len(unique_repo_names) if (repo_filters or smell_filters or rows) else len(all_repo_names),
            "total_smells": sum(item["count"] for item in by_smell_type),
            "unique_smell_types": len(by_smell_type),
        }

        return {
            "summary": summary,
            "by_smell_type": by_smell_type,
            "by_repository": by_repository,
            "filter_options": {
                "repos": all_repo_names,
                "smellTypes": all_smell_types,
            },
        }
    finally:
        session.close()


@router.get("/export")
async def overview_export(
    repos: Optional[str] = Query(default=None, description="Comma-separated repository names"),
    smell_types: Optional[str] = Query(default=None, description="Comma-separated smell types"),
):
    session = _session()
    try:
        where_sql, params, _, _ = _build_filters(repos, smell_types)
        rows = _query_rows(session, where_sql, params)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["repository", "smell_type", "count"])

        for repository, smell_type, count in rows:
            writer.writerow([repository, smell_type, int(count)])

        output.seek(0)
        filename = f"overview_filtered_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    finally:
        session.close()
