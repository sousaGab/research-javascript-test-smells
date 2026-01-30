"""
Schema validation utilities.

This module provides tools to validate that ORM models match the actual database schema.
"""

from typing import Dict, List, Tuple, Set
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from .models import Base
import logging

logger = logging.getLogger(__name__)


def get_database_tables(session: Session) -> Set[str]:
    """Get all table names from the database."""
    result = session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
    return {row[0] for row in result}


def get_database_columns(session: Session, table_name: str) -> Dict[str, str]:
    """Get all columns and their types for a table."""
    result = session.execute(text(f"PRAGMA table_info({table_name})"))
    return {row[1]: row[2] for row in result}  # row[1] is name, row[2] is type


def get_orm_tables() -> Set[str]:
    """Get all table names defined in ORM models."""
    return {mapper.mapped_table.name for mapper in Base.registry.mappers}


def get_orm_columns(table_name: str) -> Dict[str, str]:
    """Get all columns defined in ORM for a table."""
    for mapper in Base.registry.mappers:
        if mapper.mapped_table.name == table_name:
            columns = {}
            for column in mapper.mapped_table.columns:
                col_type = str(column.type)
                columns[column.name] = col_type
            return columns
    return {}


def validate_schema(session: Session) -> Tuple[bool, List[str]]:
    """
    Validate that ORM models match database schema.

    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    issues = []

    # Get tables from both sources
    db_tables = get_database_tables(session)
    orm_tables = get_orm_tables()

    # Remove system tables
    db_tables = {t for t in db_tables if not t.startswith('sqlite_')}

    # Check for missing tables in database
    missing_in_db = orm_tables - db_tables
    if missing_in_db:
        issues.append(f"Tables defined in ORM but missing in database: {', '.join(missing_in_db)}")

    # Check for extra tables in database
    extra_in_db = db_tables - orm_tables
    if extra_in_db:
        issues.append(f"Tables in database but not in ORM: {', '.join(extra_in_db)}")

    # Check columns for tables that exist in both
    common_tables = db_tables & orm_tables
    for table in common_tables:
        db_columns = get_database_columns(session, table)
        orm_columns = get_orm_columns(table)

        # Check for missing columns in database
        missing_cols = set(orm_columns.keys()) - set(db_columns.keys())
        if missing_cols:
            issues.append(f"Table '{table}': Columns in ORM but missing in DB: {', '.join(missing_cols)}")

        # Check for extra columns in database
        extra_cols = set(db_columns.keys()) - set(orm_columns.keys())
        if extra_cols:
            issues.append(f"Table '{table}': Columns in DB but not in ORM: {', '.join(extra_cols)}")

    is_valid = len(issues) == 0
    return is_valid, issues


def format_validation_report(is_valid: bool, issues: List[str]) -> str:
    """Format validation results as a readable report."""
    if is_valid:
        return "✓ Schema validation passed: ORM models match database schema"

    report = "✗ Schema validation failed!\n"
    report += "=" * 60 + "\n\n"
    report += "Issues found:\n"
    for i, issue in enumerate(issues, 1):
        report += f"{i}. {issue}\n"

    report += "\n" + "=" * 60 + "\n"
    report += "Recommendations:\n"
    report += "1. Update ORM models in models.py to match database schema\n"
    report += "2. Or run database migration to update schema\n"
    report += "3. Check git history to see when schema diverged\n"

    return report


def cmd_validate_schema(session: Session) -> str:
    """Command to validate schema and return formatted report."""
    is_valid, issues = validate_schema(session)
    return format_validation_report(is_valid, issues)
