"""
FastAPI server for Smell Selector UI.

This server provides REST API endpoints to interact with the research.db database,
allowing the frontend to view, select, and manage test smells.
"""

import sys
import json
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import text, func, and_
from sqlalchemy.orm import Session
import csv
import io

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root / "llm-refactor-pipeline" / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database import models as db_models
from llm_refactor.modules.database import crud

import models as api_models
import smell_constants

# =============================================================================
# APP INITIALIZATION
# =============================================================================

app = FastAPI(
    title="Smell Selector API",
    description="API for managing test smell detection and selection",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db = ResearchDB()
db.init_database()


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_db_session() -> Session:
    """Get database session."""
    return db.get_session()


def parse_line_numbers(line_numbers_str: Optional[str]) -> List[int]:
    """Parse line numbers from JSON string."""
    if not line_numbers_str:
        return []
    try:
        return json.loads(line_numbers_str)
    except:
        return []


def parse_tags(tags_str: Optional[str]) -> List[str]:
    """Parse tags from JSON string."""
    if not tags_str:
        return []
    try:
        return json.loads(tags_str)
    except:
        return []


def get_or_create_ui_metadata(session: Session, detected_smell_id: int):
    """Get or create UI metadata for a smell."""
    metadata, created = crud.get_or_create_ui_metadata(session, detected_smell_id)

    return {
        "id": metadata.id,
        "annotations": metadata.annotations,
        "priority": metadata.priority,
        "tags": parse_tags(metadata.tags),
        "ui_status": metadata.ui_status,
        "updated_at": metadata.updated_at
    }


def smell_to_response(smell_row, session: Session) -> dict:
    """Convert database row to SmellResponse dict."""
    # Get UI metadata
    ui_metadata = get_or_create_ui_metadata(session, smell_row[0])

    return {
        "id": smell_row[0],
        "file": {
            "id": smell_row[1],
            "path": smell_row[2],
            "repository_id": smell_row[3],
            "repository_name": smell_row[4]
        },
        "smell_type": smell_row[5],
        "line_numbers": smell_row[6],
        "severity": smell_row[7],
        "code_snippet": smell_row[8],
        "detection_tool": smell_row[9],
        "detected_at": smell_row[10],
        "is_selected": bool(smell_row[11]),
        "study_smell_id": smell_row[12],
        "snippet_start_line": smell_row[13],
        "snippet_end_line": smell_row[14],
        "ui_metadata": ui_metadata
    }


# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    """API health check."""
    return {
        "message": "Smell Selector API is running",
        "version": "1.0.0",
        "database": str(db.db_path)
    }


@app.get("/api/repositories", response_model=List[api_models.RepositoryResponse])
async def get_repositories():
    """
    Get all repositories with smell counts.

    Returns:
        List of repositories with total_smells and selected_smells counts
    """
    session = get_db_session()
    try:
        # Query repositories with smell counts
        query = text("""
            SELECT
                r.id,
                r.name,
                r.url,
                r.stars,
                r.language,
                COUNT(DISTINCT ds.id) as total_smells,
                COUNT(DISTINCT ss.id) as selected_smells
            FROM repositories r
            LEFT JOIN files f ON r.id = f.repository_id
            LEFT JOIN detected_smells ds ON f.id = ds.file_id
            LEFT JOIN study_smells ss ON f.id = ss.file_id
            GROUP BY r.id, r.name, r.url, r.stars, r.language
            ORDER BY r.name
        """)

        results = session.execute(query).fetchall()

        repositories = []
        for row in results:
            repositories.append({
                "id": row[0],
                "name": row[1],
                "url": row[2],
                "stars": row[3],
                "language": row[4],
                "total_smells": row[5],
                "selected_smells": row[6]
            })

        return repositories

    finally:
        session.close()


@app.get("/api/smells", response_model=api_models.SmellListResponse)
async def get_smells(
    repo: Optional[str] = Query(None, description="Filter by repository name"),
    smell_type: Optional[str] = Query(None, description="Filter by smell type"),
    tool: Optional[str] = Query(None, description="Filter by detection tool (steel/snutsjs)"),
    selected: Optional[bool] = Query(None, description="Filter by selected status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """
    Get list of detected smells with filters.

    Query Parameters:
        - repo: Repository name
        - smell_type: Type of smell (e.g., 'Assertion Roulette')
        - tool: Detection tool ('steel' or 'snutsjs')
        - selected: Filter by selection status (true/false)
        - limit: Max results (default 100)
        - offset: Pagination offset (default 0)

    Returns:
        SmellListResponse with smells, total count, and selected count
    """
    session = get_db_session()
    try:
        # Build WHERE clause
        where_clauses = []
        params = {}

        if repo:
            where_clauses.append("r.name = :repo")
            params["repo"] = repo

        if smell_type:
            where_clauses.append("ds.smell_type = :smell_type")
            params["smell_type"] = smell_type

        if tool:
            where_clauses.append("ds.detection_tool = :tool")
            params["tool"] = tool

        if selected is not None:
            if selected:
                where_clauses.append("ss.id IS NOT NULL")
            else:
                where_clauses.append("ss.id IS NULL")

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        # Count total
        count_query = text(f"""
            SELECT COUNT(DISTINCT ds.id)
            FROM detected_smells ds
            JOIN files f ON ds.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
                AND ds.smell_type = ss.smell_type
                AND ds.line_numbers = ss.line_numbers
            {where_sql}
        """)

        total_count = session.execute(count_query, params).scalar()

        # Count selected
        selected_count_query = text(f"""
            SELECT COUNT(DISTINCT ds.id)
            FROM detected_smells ds
            JOIN files f ON ds.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
                AND ds.smell_type = ss.smell_type
                AND ds.line_numbers = ss.line_numbers
            {where_sql}
            AND ss.id IS NOT NULL
        """)

        selected_count = session.execute(selected_count_query, params).scalar()

        # Get smells
        params["limit"] = limit
        params["offset"] = offset

        smells_query = text(f"""
            SELECT
                ds.id,
                f.id as file_id,
                f.path,
                r.id as repo_id,
                r.name as repo_name,
                ds.smell_type,
                ds.line_numbers,
                ds.severity,
                ds.code_snippet,
                ds.detection_tool,
                ds.detected_at,
                CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as is_selected,
                ss.id as study_smell_id,
                ds.snippet_start_line,
                ds.snippet_end_line
            FROM detected_smells ds
            JOIN files f ON ds.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
                AND ds.smell_type = ss.smell_type
                AND ds.line_numbers = ss.line_numbers
            {where_sql}
            ORDER BY ds.detected_at DESC, ds.id
            LIMIT :limit OFFSET :offset
        """)

        results = session.execute(smells_query, params).fetchall()

        smells = [smell_to_response(row, session) for row in results]

        return {
            "smells": smells,
            "total": total_count or 0,
            "selected_count": selected_count or 0
        }

    finally:
        session.close()


@app.get("/api/smells/{smell_id}", response_model=api_models.SmellDetailResponse)
async def get_smell_detail(smell_id: int):
    """
    Get detailed information about a specific smell, including full file content.

    Parameters:
        smell_id: ID of the detected smell

    Returns:
        SmellDetailResponse with full file content
    """
    session = get_db_session()
    try:
        # Get smell with file path
        query = text("""
            SELECT
                ds.id,
                f.id as file_id,
                f.path,
                r.id as repo_id,
                r.name as repo_name,
                ds.smell_type,
                ds.line_numbers,
                ds.severity,
                ds.code_snippet,
                ds.detection_tool,
                ds.detected_at,
                CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as is_selected,
                ss.id as study_smell_id,
                ds.snippet_start_line,
                ds.snippet_end_line
            FROM detected_smells ds
            JOIN files f ON ds.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
                AND ds.smell_type = ss.smell_type
                AND ds.line_numbers = ss.line_numbers
            WHERE ds.id = :smell_id
        """)

        result = session.execute(query, {"smell_id": smell_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail=f"Smell {smell_id} not found")

        smell = smell_to_response(result, session)

        # Try to read file content
        repo_name = result[4]
        file_path = result[2]
        full_path = project_root / "repositories" / repo_name / file_path.lstrip('/')

        file_content = None
        if full_path.exists():
            try:
                file_content = full_path.read_text(encoding='utf-8')
            except Exception as e:
                print(f"Warning: Could not read file {full_path}: {e}")

        smell["full_file_content"] = file_content

        return smell

    finally:
        session.close()


@app.post("/api/smells/{smell_id}/select")
async def select_smell_for_study(
    smell_id: int,
    request: api_models.SelectSmellRequest
):
    """
    Select a smell for study (move from detected_smells to study_smells).

    Parameters:
        smell_id: ID of the detected smell
        request: SelectSmellRequest with annotations, priority, tags

    Returns:
        Success message with study_smell_id
    """
    session = get_db_session()
    try:
        # Get detected smell
        detected_smell = session.query(db_models.DetectedSmells).filter_by(id=smell_id).first()
        if not detected_smell:
            raise HTTPException(status_code=404, detail=f"Smell {smell_id} not found")

        # Check if already selected
        existing = session.query(db_models.StudySmells).filter(
            and_(
                db_models.StudySmells.file_id == detected_smell.file_id,
                db_models.StudySmells.smell_type == detected_smell.smell_type,
                db_models.StudySmells.line_numbers == detected_smell.line_numbers
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Smell already selected for study (study_smell_id={existing.id})"
            )

        # Create study smell
        study_smell = db_models.StudySmells(
            file_id=detected_smell.file_id,
            smell_type=detected_smell.smell_type,
            line_numbers=detected_smell.line_numbers,
            severity=detected_smell.severity,
            code_snippet=detected_smell.code_snippet,
            detection_tool=detected_smell.detection_tool
        )
        session.add(study_smell)
        session.flush()

        # Update UI metadata using CRUD
        tags_json = json.dumps(request.tags) if request.tags else "[]"
        crud.update_ui_metadata(
            session,
            smell_id,
            annotations=request.annotations,
            priority=request.priority,
            tags=tags_json,
            ui_status='selected'
        )

        session.commit()

        return {
            "message": "Smell selected for study successfully",
            "study_smell_id": study_smell.id,
            "detected_smell_id": smell_id
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@app.delete("/api/smells/{smell_id}/unselect")
async def unselect_smell(smell_id: int):
    """
    Unselect a smell (remove from study_smells).

    Parameters:
        smell_id: ID of the detected smell

    Returns:
        Success message
    """
    session = get_db_session()
    try:
        # Get detected smell
        detected_smell = session.query(db_models.DetectedSmells).filter_by(id=smell_id).first()
        if not detected_smell:
            raise HTTPException(status_code=404, detail=f"Smell {smell_id} not found")

        # Find and delete study smell
        study_smell = session.query(db_models.StudySmells).filter(
            and_(
                db_models.StudySmells.file_id == detected_smell.file_id,
                db_models.StudySmells.smell_type == detected_smell.smell_type,
                db_models.StudySmells.line_numbers == detected_smell.line_numbers
            )
        ).first()

        if not study_smell:
            raise HTTPException(status_code=400, detail="Smell not currently selected for study")

        session.delete(study_smell)

        # Update UI metadata status using CRUD
        crud.update_ui_metadata(
            session,
            smell_id,
            ui_status='pending'
        )

        session.commit()

        return {
            "message": "Smell unselected successfully",
            "detected_smell_id": smell_id
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@app.patch("/api/smells/{smell_id}/metadata")
async def update_smell_metadata(
    smell_id: int,
    request: api_models.UIMetadataUpdate
):
    """
    Update UI metadata for a smell (annotations, priority, tags).

    Parameters:
        smell_id: ID of the detected smell
        request: UIMetadataUpdate with fields to update

    Returns:
        Updated metadata
    """
    session = get_db_session()
    try:
        # Verify smell exists
        detected_smell = session.query(db_models.DetectedSmells).filter_by(id=smell_id).first()
        if not detected_smell:
            raise HTTPException(status_code=404, detail=f"Smell {smell_id} not found")

        # Check if any fields are provided
        if all(v is None for v in [request.annotations, request.priority, request.tags, request.ui_status]):
            raise HTTPException(status_code=400, detail="No fields to update")

        # Update metadata using CRUD (handles upsert automatically)
        tags_json = json.dumps(request.tags) if request.tags is not None else None
        metadata = crud.update_ui_metadata(
            session,
            smell_id,
            annotations=request.annotations,
            priority=request.priority,
            tags=tags_json,
            ui_status=request.ui_status
        )

        session.commit()

        # Return updated metadata
        return {
            "id": metadata.id,
            "annotations": metadata.annotations,
            "priority": metadata.priority,
            "tags": parse_tags(metadata.tags),
            "ui_status": metadata.ui_status,
            "updated_at": metadata.updated_at
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@app.get("/api/study-smells", response_model=List[api_models.SmellResponse])
async def get_study_smells():
    """
    Get all smells selected for study.

    Returns:
        List of SmellResponse objects
    """
    session = get_db_session()
    try:
        query = text("""
            SELECT
                ds.id,
                f.id as file_id,
                f.path,
                r.id as repo_id,
                r.name as repo_name,
                ds.smell_type,
                ds.line_numbers,
                ds.severity,
                ds.code_snippet,
                ds.detection_tool,
                ds.detected_at,
                1 as is_selected,
                ss.id as study_smell_id
            FROM study_smells ss
            JOIN files f ON ss.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            JOIN detected_smells ds ON ss.file_id = ds.file_id
                AND ss.smell_type = ds.smell_type
                AND ss.line_numbers = ds.line_numbers
            ORDER BY ss.selected_at DESC
        """)

        results = session.execute(query).fetchall()
        smells = [smell_to_response(row, session) for row in results]

        return smells

    finally:
        session.close()


@app.get("/api/stats", response_model=api_models.StatsResponse)
async def get_statistics():
    """
    Get database statistics.

    Returns:
        StatsResponse with counts of various entities
    """
    session = get_db_session()
    try:
        stats = crud.get_statistics(session)
        return api_models.StatsResponse(
            repositories=stats["repositories"],
            files=stats["files"],
            detected_smells=stats["detected_smells"],
            study_smells=stats["study_smells"],
            experiments=stats["experiments"]
        )
    finally:
        session.close()


@app.get("/api/filter-options")
async def get_filter_options():
    """
    Get available filter options from the database.

    Returns:
        Dictionary with detection_tools and smell_types arrays
    """
    session = get_db_session()
    try:
        # Get detection tools from database
        tools_query = text("""
            SELECT DISTINCT detection_tool
            FROM detected_smells
            WHERE detection_tool IS NOT NULL
            ORDER BY detection_tool
        """)
        tools_result = session.execute(tools_query).fetchall()
        detection_tools = [row[0] for row in tools_result]

        # Get smell types from database
        smells_query = text("""
            SELECT DISTINCT smell_type, COUNT(*) as count
            FROM detected_smells
            WHERE smell_type IS NOT NULL
            GROUP BY smell_type
            ORDER BY smell_type
        """)
        smells_result = session.execute(smells_query).fetchall()
        smell_types = [{"name": row[0], "count": row[1]} for row in smells_result]

        # Add metadata from constants
        enriched_smells = []
        for smell in smell_types:
            smell_info = smell_constants.get_smell_info(smell["name"])
            is_primary = smell_constants.is_primary_research_smell(smell["name"])

            enriched_smells.append({
                "name": smell["name"],
                "count": smell["count"],
                "is_primary": is_primary,
                "description": smell_info.get("description", ""),
                "refactoring_guidance": smell_info.get("refactoring_guidance", "")
            })

        return {
            "detection_tools": detection_tools,
            "smell_types": enriched_smells,
            "primary_smells": smell_constants.PRIMARY_SMELLS
        }

    finally:
        session.close()


@app.get("/api/smell-catalog")
async def get_smell_catalog():
    """
    Get the complete smell catalog with descriptions and refactoring guidance.

    Returns:
        List of primary research smells with full metadata
    """
    return {
        "smells": smell_constants.test_smells_catalog,
        "total": len(smell_constants.test_smells_catalog)
    }


@app.get("/api/export-selected-smells")
async def export_selected_smells():
    """
    Export selected smells (study_smells) to CSV file.

    Returns:
        CSV file with all selected smells and their attributes
    """
    session = get_db_session()
    try:
        # Query selected smells with all details
        query = text("""
            SELECT
                ss.id as smell_id,
                r.name as repository,
                f.path as file_path,
                ds.smell_type,
                ds.line_numbers,
                ds.severity,
                ds.code_snippet,
                ds.detection_tool,
                ds.detected_at,
                ss.selected_at,
                meta.annotations,
                meta.priority,
                meta.tags
            FROM study_smells ss
            JOIN files f ON ss.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            JOIN detected_smells ds ON ss.file_id = ds.file_id
                AND ss.smell_type = ds.smell_type
                AND ss.line_numbers = ds.line_numbers
            LEFT JOIN smell_ui_metadata meta ON ds.id = meta.detected_smell_id
            ORDER BY r.name, f.path, ds.smell_type
        """)

        results = session.execute(query).fetchall()

        if not results:
            raise HTTPException(status_code=404, detail="No smells selected for export")

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            'smell_id',
            'repository',
            'file_path',
            'smell_type',
            'line_numbers',
            'severity',
            'detection_tool',
            'detected_at',
            'selected_at',
            'annotations',
            'priority',
            'tags',
            'code_snippet'
        ])

        # Write data rows
        for row in results:
            writer.writerow([
                row[0],  # smell_id
                row[1],  # repository
                row[2],  # file_path
                row[3],  # smell_type
                row[4],  # line_numbers
                row[5] or '',  # severity
                row[7],  # detection_tool
                row[8],  # detected_at
                row[9],  # selected_at
                row[10] or '',  # annotations
                row[11] or 0,  # priority
                row[12] or '',  # tags
                row[6] or ''  # code_snippet (preserve line breaks)
            ])

        # Prepare response
        output.seek(0)
        filename = f"selected_smells_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    finally:
        session.close()


@app.get("/api/export-all-smells")
async def export_all_smells(
    repo: Optional[str] = Query(None, description="Filter by repository"),
    smell_type: Optional[str] = Query(None, description="Filter by smell type"),
    tool: Optional[str] = Query(None, description="Filter by detection tool")
):
    """
    Export all detected smells to CSV file with optional filters.

    Parameters:
        repo: Repository name filter
        smell_type: Smell type filter
        tool: Detection tool filter

    Returns:
        CSV file with filtered smells
    """
    session = get_db_session()
    try:
        # Build query with filters
        where_clauses = []
        params = {}

        if repo:
            where_clauses.append("r.name = :repo")
            params["repo"] = repo

        if smell_type:
            where_clauses.append("ds.smell_type = :smell_type")
            params["smell_type"] = smell_type

        if tool:
            where_clauses.append("ds.detection_tool = :tool")
            params["tool"] = tool

        where_sql = " AND " + " AND ".join(where_clauses) if where_clauses else ""

        query = text(f"""
            SELECT
                r.name as repository,
                f.path as file_path,
                ds.smell_type,
                ds.line_numbers,
                ds.severity,
                ds.code_snippet,
                ds.detection_tool,
                ds.detected_at,
                CASE WHEN ss.id IS NOT NULL THEN 'Yes' ELSE 'No' END as is_selected
            FROM detected_smells ds
            JOIN files f ON ds.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
                AND ds.smell_type = ss.smell_type
                AND ds.line_numbers = ss.line_numbers
            {where_sql}
            ORDER BY r.name, f.path, ds.smell_type
        """)

        results = session.execute(query, params).fetchall()

        if not results:
            raise HTTPException(status_code=404, detail="No smells found with the specified filters")

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            'repository',
            'file_path',
            'smell_type',
            'line_numbers',
            'severity',
            'detection_tool',
            'detected_at',
            'is_selected',
            'code_snippet'
        ])

        # Write data rows
        for row in results:
            writer.writerow([
                row[0],  # repository
                row[1],  # file_path
                row[2],  # smell_type
                row[3],  # line_numbers
                row[4] or '',  # severity
                row[6],  # detection_tool
                row[7],  # detected_at
                row[8],  # is_selected
                row[5] or ''  # code_snippet (preserve line breaks)
            ])

        # Prepare response
        output.seek(0)
        filters_str = f"_{repo}" if repo else ""
        filters_str += f"_{smell_type}" if smell_type else ""
        filters_str += f"_{tool}" if tool else ""
        filename = f"all_smells{filters_str}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    finally:
        session.close()


# =============================================================================
# REFATORACOES ENDPOINTS
# =============================================================================

@app.get("/api/refatoracoes/filter-options")
async def get_refatoracoes_filter_options():
    """
    Get available filter options for the refatoracoes page.

    Returns:
        Dictionary with repositories, smell_types, ai_models, prompting_approaches
    """
    session = get_db_session()
    try:
        repos_query = text("""
            SELECT DISTINCT r.name
            FROM experiments e
            JOIN files f ON e.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            ORDER BY r.name
        """)
        repos = [row[0] for row in session.execute(repos_query).fetchall()]

        smell_types_query = text("""
            SELECT
                COALESCE(ss.smell_type, bsd.smell_type) as smell_type,
                COUNT(e.id) as count
            FROM experiments e
            LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
            LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
            WHERE COALESCE(ss.smell_type, bsd.smell_type) IS NOT NULL
            GROUP BY COALESCE(ss.smell_type, bsd.smell_type)
            ORDER BY count DESC
        """)
        smell_types = [
            {"name": row[0], "count": row[1]}
            for row in session.execute(smell_types_query).fetchall()
        ]

        models_query = text("""
            SELECT DISTINCT
                e.ai_tool,
                e.ai_model_version,
                COUNT(e.id) as count
            FROM experiments e
            WHERE e.ai_tool IS NOT NULL
            GROUP BY e.ai_tool, e.ai_model_version
            ORDER BY count DESC
        """)
        ai_models = []
        for row in session.execute(models_query).fetchall():
            label = row[0]
            if row[1]:
                label = f"{row[0]} / {row[1]}"
            ai_models.append({"label": label, "ai_tool": row[0], "ai_model_version": row[1], "count": row[2]})

        approaches_query = text("""
            SELECT DISTINCT prompting_approach, COUNT(id) as count
            FROM experiments
            WHERE prompting_approach IS NOT NULL
            GROUP BY prompting_approach
            ORDER BY count DESC
        """)
        prompting_approaches = [
            {"name": row[0], "count": row[1]}
            for row in session.execute(approaches_query).fetchall()
        ]

        return {
            "repositories": repos,
            "smell_types": smell_types,
            "ai_models": ai_models,
            "prompting_approaches": prompting_approaches,
        }

    finally:
        session.close()


@app.get("/api/refatoracoes")
async def get_refatoracoes(
    repo: Optional[str] = Query(None, description="Filter by repository name"),
    smell_type: Optional[str] = Query(None, description="Filter by smell type"),
    ai_model: Optional[str] = Query(None, description="Filter by ai_tool value"),
    ai_model_version: Optional[str] = Query(None, description="Filter by ai_model_version value"),
    prompting_approach: Optional[str] = Query(None, description="Filter by prompting approach"),
    smell_removed: Optional[bool] = Query(None, description="Filter by smell_removed"),
    tests_changed: Optional[bool] = Query(None, description="Filter by tests_changed"),
    coverage_changed: Optional[bool] = Query(None, description="Filter by coverage_changed"),
    limit: int = Query(50, ge=1, le=500, description="Page size"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
):
    """
    Get paginated list of refactoring experiments with filters.
    """
    session = get_db_session()
    try:
        where_clauses = []
        params = {}

        if repo:
            where_clauses.append("r.name = :repo")
            params["repo"] = repo

        if smell_type:
            where_clauses.append("COALESCE(ss.smell_type, bsd.smell_type) = :smell_type")
            params["smell_type"] = smell_type

        if ai_model:
            where_clauses.append("e.ai_tool = :ai_model")
            params["ai_model"] = ai_model

        if ai_model_version:
            where_clauses.append("e.ai_model_version = :ai_model_version")
            params["ai_model_version"] = ai_model_version

        if prompting_approach:
            where_clauses.append("e.prompting_approach = :prompting_approach")
            params["prompting_approach"] = prompting_approach

        if smell_removed is not None:
            where_clauses.append("e.smell_removed = :smell_removed")
            params["smell_removed"] = 1 if smell_removed else 0

        if tests_changed is not None:
            where_clauses.append("e.tests_changed = :tests_changed")
            params["tests_changed"] = 1 if tests_changed else 0

        if coverage_changed is not None:
            where_clauses.append("e.coverage_changed = :coverage_changed")
            params["coverage_changed"] = 1 if coverage_changed else 0

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        count_query = text(f"""
            SELECT COUNT(e.id)
            FROM experiments e
            JOIN files f ON e.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
            LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
            {where_sql}
        """)
        total = session.execute(count_query, params).scalar() or 0

        params["limit"] = limit
        params["offset"] = offset

        query = text(f"""
            SELECT
                e.id,
                r.name as repository,
                f.path as file_path,
                COALESCE(ss.smell_type, bsd.smell_type) as smell_type,
                e.ai_tool,
                e.ai_model_version,
                e.prompting_approach,
                e.smell_removed,
                e.tests_changed,
                e.coverage_changed,
                e.tests_still_passing,
                e.refactoring_completed,
                e.introduced_new_smells,
                e.experiment_date,
                e.execution_time_seconds,
                e.tokens_used,
                e.study_smell_id,
                e.baseline_smell_id
            FROM experiments e
            JOIN files f ON e.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
            LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
            {where_sql}
            ORDER BY e.experiment_date DESC, e.id DESC
            LIMIT :limit OFFSET :offset
        """)

        rows = session.execute(query, params).fetchall()

        experiments = []
        for row in rows:
            experiments.append({
                "id": row[0],
                "repository": row[1],
                "file_path": row[2],
                "smell_type": row[3],
                "ai_tool": row[4],
                "ai_model_version": row[5],
                "prompting_approach": row[6],
                "smell_removed": bool(row[7]) if row[7] is not None else None,
                "tests_changed": bool(row[8]) if row[8] is not None else None,
                "coverage_changed": bool(row[9]) if row[9] is not None else None,
                "tests_still_passing": bool(row[10]) if row[10] is not None else None,
                "refactoring_completed": bool(row[11]) if row[11] is not None else None,
                "introduced_new_smells": bool(row[12]) if row[12] is not None else None,
                "experiment_date": str(row[13]) if row[13] else None,
                "execution_time_seconds": row[14],
                "tokens_used": row[15],
                "study_smell_id": row[16],
                "baseline_smell_id": row[17],
            })

        return {
            "experiments": experiments,
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    finally:
        session.close()


@app.get("/api/refatoracoes/{experiment_id}")
async def get_refatoracao_detail(experiment_id: int):
    """
    Get full details of a single refactoring experiment including code and test results.
    """
    session = get_db_session()
    try:
        query = text("""
            SELECT
                e.id,
                r.name as repository,
                f.path as file_path,
                COALESCE(ss.smell_type, bsd.smell_type) as smell_type,
                e.ai_tool,
                e.ai_model_version,
                e.prompting_approach,
                e.smell_removed,
                e.tests_changed,
                e.coverage_changed,
                e.tests_still_passing,
                e.refactoring_completed,
                e.introduced_new_smells,
                e.experiment_date,
                e.execution_time_seconds,
                e.tokens_used,
                e.study_smell_id,
                e.baseline_smell_id,
                e.original_code,
                e.refactored_code,
                e.original_method,
                e.refactored_method,
                e.prompt_text,
                e.notes
            FROM experiments e
            JOIN files f ON e.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            LEFT JOIN study_smells ss ON e.study_smell_id = ss.id
            LEFT JOIN baseline_smell_detections bsd ON e.baseline_smell_id = bsd.id
            WHERE e.id = :experiment_id
        """)

        row = session.execute(query, {"experiment_id": experiment_id}).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Experiment {experiment_id} not found")

        # Get test results before/after
        test_results_query = text("""
            SELECT
                phase,
                test_suites_passed,
                test_suites_failed,
                test_suites_total,
                tests_passed,
                tests_failed,
                tests_total,
                execution_time_seconds,
                coverage_statements,
                coverage_branches,
                coverage_functions,
                coverage_lines,
                all_tests_passed
            FROM test_results
            WHERE experiment_id = :experiment_id
            ORDER BY phase
        """)
        test_rows = session.execute(test_results_query, {"experiment_id": experiment_id}).fetchall()

        def parse_test_result(r):
            return {
                "phase": r[0],
                "test_suites_passed": r[1],
                "test_suites_failed": r[2],
                "test_suites_total": r[3],
                "tests_passed": r[4],
                "tests_failed": r[5],
                "tests_total": r[6],
                "execution_time_seconds": r[7],
                "coverage_statements": r[8],
                "coverage_branches": r[9],
                "coverage_functions": r[10],
                "coverage_lines": r[11],
                "all_tests_passed": bool(r[12]) if r[12] is not None else None,
            }

        test_results_before = None
        test_results_after = None
        for tr in test_rows:
            if tr[0] == "before":
                test_results_before = parse_test_result(tr)
            elif tr[0] == "after":
                test_results_after = parse_test_result(tr)

        return {
            "id": row[0],
            "repository": row[1],
            "file_path": row[2],
            "smell_type": row[3],
            "ai_tool": row[4],
            "ai_model_version": row[5],
            "prompting_approach": row[6],
            "smell_removed": bool(row[7]) if row[7] is not None else None,
            "tests_changed": bool(row[8]) if row[8] is not None else None,
            "coverage_changed": bool(row[9]) if row[9] is not None else None,
            "tests_still_passing": bool(row[10]) if row[10] is not None else None,
            "refactoring_completed": bool(row[11]) if row[11] is not None else None,
            "introduced_new_smells": bool(row[12]) if row[12] is not None else None,
            "experiment_date": str(row[13]) if row[13] else None,
            "execution_time_seconds": row[14],
            "tokens_used": row[15],
            "study_smell_id": row[16],
            "baseline_smell_id": row[17],
            "original_code": row[18],
            "refactored_code": row[19],
            "original_method": row[20],
            "refactored_method": row[21],
            "prompt_text": row[22],
            "notes": row[23],
            "test_results_before": test_results_before,
            "test_results_after": test_results_after,
        }

    finally:
        session.close()


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Smell Selector API server...")
    print(f"📊 Database: {db.db_path}")
    print(f"🌐 API docs: http://localhost:8001/docs")
    print(f"🎨 Frontend: http://localhost:5173")
    print()
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
