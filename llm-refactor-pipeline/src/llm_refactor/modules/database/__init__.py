"""
Research Database Module

Provides database functionality for tracking LLM-based test smell refactoring experiments.

Main components:
- ResearchDB: Database connection and initialization
- Models: SQLAlchemy ORM models for all tables
- CRUD: Create, Read, Update, Delete operations
- Export: CSV export functionality (to be implemented)
"""

from .connection import ResearchDB, init_database
from .models import (
    Base,
    SchemaVersion,
    Repository,
    File,
    DetectedSmells,
    StudySmells,
    Experiment,
    SmellDetectionResult,
    CodeMetric,
    TestResult,
    AIResponse,
)
from . import crud

__all__ = [
    # Connection
    'ResearchDB',
    'init_database',
    # Models
    'Base',
    'SchemaVersion',
    'Repository',
    'File',
    'DetectedSmells',
    'StudySmells',
    'Experiment',
    'SmellDetectionResult',
    'CodeMetric',
    'TestResult',
    'AIResponse',
    # CRUD module
    'crud',
]

__version__ = '1.0.0'
