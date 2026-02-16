"""
Test module for validating smell import functionality.

This module provides validation and testing utilities for the smell import process.
"""

from pathlib import Path
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session

from .connection import ResearchDB
from . import crud
from ..smell_constants import (
    DETECTION_TOOLS,
    ALL_DETECTED_SMELLS,
    PRIMARY_SMELLS,
    is_primary_research_smell,
)


class ImportValidator:
    """Validate smell import results."""

    def __init__(self, db: ResearchDB):
        self.db = db

    def validate_detection_tools(self) -> Tuple[bool, str]:
        """
        Validate that all detection tools are correct.

        Returns:
            (success, message): True if valid, with status message
        """
        session = self.db.get_session()
        try:
            from .models import DetectedSmells
            tools = session.query(DetectedSmells.detection_tool).distinct().all()
            tool_names = {t[0] for t in tools}

            # Check for invalid tools
            invalid_tools = tool_names - set(DETECTION_TOOLS)
            if invalid_tools:
                return False, f"Invalid detection tools found: {invalid_tools}"

            # Check tool counts
            result = []
            for tool in DETECTION_TOOLS:
                count = session.query(DetectedSmells).filter_by(
                    detection_tool=tool
                ).count()
                result.append(f"  {tool}: {count} smells")

            message = "Detection Tools:\n" + "\n".join(result)
            return True, message

        finally:
            session.close()

    def validate_smell_types(self) -> Tuple[bool, str]:
        """
        Validate smell type distribution.

        Returns:
            (success, message): Status and smell type breakdown
        """
        session = self.db.get_session()
        try:
            from .models import DetectedSmells
            from sqlalchemy import func

            # Get smell type counts
            smell_counts = (
                session.query(
                    DetectedSmells.smell_type,
                    func.count(DetectedSmells.id).label("count")
                )
                .group_by(DetectedSmells.smell_type)
                .order_by(func.count(DetectedSmells.id).desc())
                .all()
            )

            total_smells = sum(count for _, count in smell_counts)
            primary_count = sum(
                count for smell, count in smell_counts
                if is_primary_research_smell(smell)
            )

            result = [
                f"Total Smells: {total_smells}",
                f"Primary Research Smells: {primary_count}",
                f"Unique Smell Types: {len(smell_counts)}",
                "",
                "Top 10 Smell Types:",
            ]

            for smell, count in smell_counts[:10]:
                percentage = (count / total_smells * 100) if total_smells > 0 else 0
                primary_marker = "★" if is_primary_research_smell(smell) else " "
                result.append(f"  {primary_marker} {smell}: {count} ({percentage:.1f}%)")

            return True, "\n".join(result)

        finally:
            session.close()

    def validate_repositories(self) -> Tuple[bool, str]:
        """
        Validate repository data.

        Returns:
            (success, message): Status and repository breakdown
        """
        session = self.db.get_session()
        try:
            from .models import Repository, File, DetectedSmells
            from sqlalchemy import func

            # Get repository stats
            repo_stats = (
                session.query(
                    Repository.name,
                    func.count(func.distinct(File.id)).label("files"),
                    func.count(DetectedSmells.id).label("smells")
                )
                .outerjoin(File, Repository.id == File.repository_id)
                .outerjoin(DetectedSmells, File.id == DetectedSmells.file_id)
                .group_by(Repository.name)
                .order_by(func.count(DetectedSmells.id).desc())
                .all()
            )

            result = [f"Repositories: {len(repo_stats)}", ""]
            for name, files, smells in repo_stats:
                result.append(f"  {name}:")
                result.append(f"    Files: {files}")
                result.append(f"    Smells: {smells}")

            return True, "\n".join(result)

        finally:
            session.close()

    def validate_data_integrity(self) -> Tuple[bool, str]:
        """
        Validate database integrity.

        Returns:
            (success, message): Status with detailed checks
        """
        session = self.db.get_session()
        issues = []

        try:
            from .models import Repository, File, DetectedSmells

            # Check for orphaned files
            orphaned_files = (
                session.query(File)
                .outerjoin(Repository, File.repository_id == Repository.id)
                .filter(Repository.id == None)
                .count()
            )
            if orphaned_files > 0:
                issues.append(f"⚠️  {orphaned_files} orphaned files (no repository)")

            # Check for orphaned smells
            orphaned_smells = (
                session.query(DetectedSmells)
                .outerjoin(File, DetectedSmells.file_id == File.id)
                .filter(File.id == None)
                .count()
            )
            if orphaned_smells > 0:
                issues.append(f"⚠️  {orphaned_smells} orphaned smells (no file)")

            # Check for smells without line numbers
            no_lines = session.query(DetectedSmells).filter(
                DetectedSmells.line_numbers == None
            ).count()
            if no_lines > 0:
                issues.append(f"ℹ️  {no_lines} smells without line numbers")

            # Check for smells without code snippets
            no_snippets = session.query(DetectedSmells).filter(
                DetectedSmells.code_snippet == None
            ).count()
            if no_snippets > 0:
                issues.append(f"ℹ️  {no_snippets} smells without code snippets")

            if issues:
                return len([i for i in issues if i.startswith("⚠️")]) == 0, "\n".join(issues)
            else:
                return True, "✓ All integrity checks passed"

        finally:
            session.close()

    def run_all_validations(self) -> str:
        """
        Run all validation checks.

        Returns:
            Formatted validation report
        """
        result = ["=" * 60, "Smell Import Validation Report", "=" * 60, ""]

        # Detection tools
        result.append("1. Detection Tools")
        result.append("-" * 60)
        success, message = self.validate_detection_tools()
        result.append(message)
        result.append("")

        # Smell types
        result.append("2. Smell Types")
        result.append("-" * 60)
        success, message = self.validate_smell_types()
        result.append(message)
        result.append("")

        # Repositories
        result.append("3. Repositories")
        result.append("-" * 60)
        success, message = self.validate_repositories()
        result.append(message)
        result.append("")

        # Data integrity
        result.append("4. Data Integrity")
        result.append("-" * 60)
        success, message = self.validate_data_integrity()
        result.append(message)
        result.append("")

        result.append("=" * 60)
        return "\n".join(result)


def validate_csv_before_import(csv_file: Path) -> Tuple[bool, str]:
    """
    Validate CSV file before importing.

    Args:
        csv_file: Path to CSV file

    Returns:
        (valid, message): True if valid, with validation message
    """
    import csv

    if not csv_file.exists():
        return False, f"File not found: {csv_file}"

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        if not rows:
            return False, "CSV file is empty"

        # Check required columns
        required_cols = {'file', 'type', 'line', 'source'}
        actual_cols = set(reader.fieldnames or [])
        missing = required_cols - actual_cols
        if missing:
            return False, f"Missing required columns: {missing}"

        # Validate rows
        issues = []
        for i, row in enumerate(rows[:100]):  # Check first 100
            if not row.get('file'):
                issues.append(f"Row {i+1}: Missing file path")
            if not row.get('type'):
                issues.append(f"Row {i+1}: Missing smell type")
            if not row.get('source'):
                issues.append(f"Row {i+1}: Missing detection tool")

        if issues:
            return False, "\n".join(issues[:5])  # Show first 5 issues

        return True, f"✓ Valid CSV with {len(rows)} smells"

    except Exception as e:
        return False, f"Error reading CSV: {str(e)}"


def cmd_validate_import(args: str = "") -> str:
    """
    CLI command to validate import results.

    Usage: db validate-import
    """
    from .cli_commands import get_db

    db = get_db()
    validator = ImportValidator(db)
    return validator.run_all_validations()


# For testing standalone
if __name__ == "__main__":
    from .connection import ResearchDB

    db = ResearchDB()
    db.connect()

    validator = ImportValidator(db)
    print(validator.run_all_validations())

    db.close()
