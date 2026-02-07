"""
Pydantic models for API requests and responses.

These models mirror the SQLAlchemy models but are used for API validation.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


# =============================================================================
# REPOSITORY MODELS
# =============================================================================

class RepositoryResponse(BaseModel):
    """Repository information with smell counts."""
    id: int
    name: str
    url: Optional[str] = None
    stars: Optional[int] = None
    language: str = "JavaScript"
    total_smells: int = 0
    selected_smells: int = 0

    class Config:
        from_attributes = True


# =============================================================================
# FILE MODELS
# =============================================================================

class FileInfo(BaseModel):
    """File information (nested in smell responses)."""
    id: int
    path: str
    repository_id: int
    repository_name: str

    class Config:
        from_attributes = True


# =============================================================================
# UI METADATA MODELS
# =============================================================================

class UIMetadata(BaseModel):
    """UI-specific metadata for a smell."""
    id: Optional[int] = None
    annotations: Optional[str] = None
    priority: int = 0
    tags: Optional[List[str]] = []
    ui_status: str = "pending"
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UIMetadataUpdate(BaseModel):
    """Request body for updating UI metadata."""
    annotations: Optional[str] = None
    priority: Optional[int] = Field(None, ge=0, le=5)
    tags: Optional[List[str]] = None
    ui_status: Optional[str] = None


# =============================================================================
# SMELL MODELS
# =============================================================================

class SmellResponse(BaseModel):
    """Complete smell information including file and metadata."""
    id: int
    file: FileInfo
    smell_type: str
    line_numbers: str  # JSON string: "[44, 45, 46]"
    severity: Optional[str] = None
    code_snippet: Optional[str] = None
    detection_tool: Optional[str] = None
    detected_at: datetime
    is_selected: bool = False
    study_smell_id: Optional[int] = None
    snippet_start_line: Optional[int] = None  # Start line of the method/snippet
    snippet_end_line: Optional[int] = None    # End line of the method/snippet
    ui_metadata: Optional[UIMetadata] = None

    class Config:
        from_attributes = True


class SmellListResponse(BaseModel):
    """Paginated list of smells."""
    smells: List[SmellResponse]
    total: int
    selected_count: int


class SmellDetailResponse(SmellResponse):
    """Smell with full file content."""
    full_file_content: Optional[str] = None


class SelectSmellRequest(BaseModel):
    """Request body for selecting a smell for study."""
    annotations: Optional[str] = None
    priority: int = Field(0, ge=0, le=5)
    tags: Optional[List[str]] = []


# =============================================================================
# STATISTICS MODELS
# =============================================================================

class StatsResponse(BaseModel):
    """Database statistics."""
    repositories: int
    files: int
    detected_smells: int
    study_smells: int
    experiments: int


# =============================================================================
# BATCH OPERATION MODELS
# =============================================================================

class BatchSelectRequest(BaseModel):
    """Request body for batch selecting smells."""
    smell_ids: List[int]
    annotations: Optional[str] = None
    priority: int = Field(0, ge=0, le=5)
    tags: Optional[List[str]] = []


class BatchOperationResponse(BaseModel):
    """Response for batch operations."""
    success_count: int
    failed_count: int
    failed_ids: List[int] = []
    message: str
