"""
CLI commands for database operations.

This module provides user-facing commands that can be called from the CLI.
Each function returns a formatted string for display to the user.
"""

import csv
import json
import sqlite3
from datetime import datetime
from typing import Optional
from pathlib import Path
from .connection import ResearchDB
from . import crud


# Global database instance (initialized on first use)
_db_instance: Optional[ResearchDB] = None


def get_db() -> ResearchDB:
    """Get or create global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = ResearchDB()
        _db_instance.connect()
    return _db_instance


def close_db():
    """Close global database instance."""
    global _db_instance
    if _db_instance:
        _db_instance.close()
        _db_instance = None


# =============================================================================
# DATABASE MANAGEMENT COMMANDS
# =============================================================================

def cmd_init(args: str = "") -> str:
    """
    Initialize the database.

    Usage: db init [--force]

    Options:
        --force    Recreate database (WARNING: deletes all data!)
    """
    force = "--force" in args

    if force:
        response = "⚠️  WARNING: This will delete all existing data!\n"
        response += "Are you sure you want to recreate the database? (This is automatic in CLI)\n"
        # In real CLI, we'd prompt for confirmation
        response += "\nRecreating database...\n"

    db = get_db()
    success = db.init_database(force_recreate=force)

    if success:
        status = db.get_status()
        result = f"✓ Database initialized successfully!\n\n"
        result += f"Location: {status['path']}\n"
        result += f"Size: {status['size_mb']:.3f} MB\n"

        # Validate schema
        is_valid, missing = db.validate_schema()
        if is_valid:
            result += f"✓ Schema validated: All 10 tables created\n"
        else:
            result += f"⚠️  Schema validation failed. Missing tables: {missing}\n"

        return result
    else:
        return "✗ Failed to initialize database"


def cmd_clear_smells(args: str = "") -> str:
    """
    Clear all detected smells and study smells from database.

    Usage: db clear-smells [--keep-repos]

    Options:
        --keep-repos    Keep repositories and files, only delete smells

    This will delete:
        - All detected_smells
        - All study_smells
        - All smell_ui_metadata
        - All experiments (if any)
        - Optionally: repositories and files
    """
    keep_repos = "--keep-repos" in args

    db = get_db()
    session = db.get_session()

    try:
        from .models import (
            DetectedSmells, StudySmells, Experiment,
            Repository, File
        )
        from sqlalchemy import text

        # Count before deletion
        smell_count = session.query(DetectedSmells).count()
        study_count = session.query(StudySmells).count()
        repo_count = session.query(Repository).count()
        file_count = session.query(File).count()

        result = "Clear Smells\n"
        result += "=" * 60 + "\n"
        result += f"\nCurrent data:\n"
        result += f"  Detected Smells: {smell_count}\n"
        result += f"  Study Smells: {study_count}\n"
        result += f"  Repositories: {repo_count}\n"
        result += f"  Files: {file_count}\n"
        result += "\n⚠️  WARNING: This will permanently delete the data above!\n\n"

        # Delete smell_ui_metadata (via raw SQL since it's not in models)
        session.execute(text("DELETE FROM smell_ui_metadata"))

        # Delete experiments
        exp_deleted = session.query(Experiment).delete()

        # Delete study smells
        study_deleted = session.query(StudySmells).delete()

        # Delete detected smells
        smells_deleted = session.query(DetectedSmells).delete()

        if not keep_repos:
            # Delete files and repositories
            files_deleted = session.query(File).delete()
            repos_deleted = session.query(Repository).delete()
        else:
            files_deleted = 0
            repos_deleted = 0

        session.commit()

        result += "✓ Deletion completed:\n"
        result += f"  Detected Smells: {smells_deleted}\n"
        result += f"  Study Smells: {study_deleted}\n"
        result += f"  Experiments: {exp_deleted}\n"
        result += f"  UI Metadata: cleared\n"

        if not keep_repos:
            result += f"  Files: {files_deleted}\n"
            result += f"  Repositories: {repos_deleted}\n"
            result += "\n✓ Database is now empty\n"
        else:
            result += f"\n✓ Smells cleared (repositories and files kept)\n"

        result += "\nYou can now import fresh data with:\n"
        result += "  db import-smells\n"

        return result

    except Exception as e:
        session.rollback()
        return f"✗ Error clearing data: {str(e)}"
    finally:
        session.close()


def cmd_clear_experiments(args: str = "") -> str:
    """
    Clear all experiment data only (keep smells, repos, and selected smells).

    Usage: db clear-experiments

    This will delete:
        - All experiments
        - All smell_detection_results (before/after)
        - All code_metrics (before/after)
        - All test_results (before/after)
        - All ai_responses

    This will KEEP:
        - Repositories and files
        - Detected smells (detected_smells table)
        - Selected smells (study_smells table)
        - Baseline smells (baseline_smell_detections table)
        - UI metadata
    """
    db = get_db()
    session = db.get_session()

    try:
        from .models import Experiment
        from sqlalchemy import text

        # Count before deletion
        exp_count = session.query(Experiment).count()
        
        # Count related data (will be cascade deleted)
        metrics_count = session.execute(text("SELECT COUNT(*) FROM code_metrics")).scalar()
        test_results_count = session.execute(text("SELECT COUNT(*) FROM test_results")).scalar()
        smell_results_count = session.execute(text("SELECT COUNT(*) FROM smell_detection_results")).scalar()
        ai_responses_count = session.execute(text("SELECT COUNT(*) FROM ai_responses")).scalar()

        result = "Clear Experiments\n"
        result += "=" * 60 + "\n"
        result += f"\nCurrent experiment data:\n"
        result += f"  Experiments: {exp_count}\n"
        result += f"  Code Metrics: {metrics_count}\n"
        result += f"  Test Results: {test_results_count}\n"
        result += f"  Smell Detection Results: {smell_results_count}\n"
        result += f"  AI Responses: {ai_responses_count}\n"
        result += "\n⚠️  WARNING: This will permanently delete the experiment data above!\n"
        result += "          But will keep: repos, files, detected_smells, study_smells\n\n"

        if exp_count == 0:
            return result + "✓ No experiments to delete\n"

        # Delete experiments (CASCADE will delete related tables automatically)
        experiments_deleted = session.query(Experiment).delete()
        session.commit()

        result += "✓ Deletion completed:\n"
        result += f"  Experiments: {experiments_deleted}\n"
        result += f"  Related data: cleared via cascade delete\n"
        result += f"    - Code metrics\n"
        result += f"    - Test results\n"
        result += f"    - Smell detection results\n"
        result += f"    - AI responses\n"
        result += "\n✓ Experiment data cleared (smells and repositories kept)\n"
        result += "\nYou can now run new experiments with:\n"
        result += "  execute_experiment <smell_id> <strategy_id> <model_id>\n"

        return result

    except Exception as e:
        session.rollback()
        return f"✗ Error clearing experiments: {str(e)}"
    finally:
        session.close()


def cmd_clean(args: str = "") -> str:
    """
    Clean ALL data from database (complete reset).

    Usage: db clean [--yes]

    Options:
        --yes    Skip confirmation (auto-confirm deletion)

    This will delete EVERYTHING:
        - All detected_smells
        - All study_smells
        - All baseline_smell_detections
        - All smell_ui_metadata
        - All experiments
        - All code_metrics
        - All test_results
        - All smell_detection_results
        - All ai_responses
        - All files
        - All repositories

    This is a COMPLETE database reset. Use with caution!
    """
    auto_confirm = "--yes" in args

    db = get_db()
    session = db.get_session()

    try:
        from sqlalchemy import text

        # Count records using raw SQL (more robust than ORM)
        def count_table(table_name):
            try:
                result = session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                return result.scalar() or 0
            except:
                return 0

        # Get current counts
        counts = {
            'repositories': count_table('repositories'),
            'files': count_table('files'),
            'detected_smells': count_table('detected_smells'),
            'study_smells': count_table('study_smells'),
            'baseline_smell_detections': count_table('baseline_smell_detections'),
            'experiments': count_table('experiments'),
            'code_metrics': count_table('code_metrics'),
            'test_results': count_table('test_results'),
            'smell_detection_results': count_table('smell_detection_results'),
            'ai_responses': count_table('ai_responses'),
            'smell_ui_metadata': count_table('smell_ui_metadata'),
        }

        total_records = sum(counts.values())

        result = "DATABASE CLEAN - COMPLETE RESET\n"
        result += "=" * 60 + "\n"
        result += "\n⚠️  WARNING: This will PERMANENTLY DELETE ALL DATA!\n\n"
        result += "Current database contents:\n"
        result += f"  Repositories: {counts['repositories']}\n"
        result += f"  Files: {counts['files']}\n"
        result += f"  Detected Smells: {counts['detected_smells']}\n"
        result += f"  Study Smells: {counts['study_smells']}\n"
        result += f"  Baseline Smells: {counts['baseline_smell_detections']}\n"
        result += f"  Experiments: {counts['experiments']}\n"
        result += f"  Code Metrics: {counts['code_metrics']}\n"
        result += f"  Test Results: {counts['test_results']}\n"
        result += f"  Smell Results: {counts['smell_detection_results']}\n"
        result += f"  AI Responses: {counts['ai_responses']}\n"
        result += f"  UI Metadata: {counts['smell_ui_metadata']}\n"
        result += f"\nTOTAL RECORDS: {total_records}\n"

        if not auto_confirm:
            result += "\n" + "=" * 60 + "\n"
            result += "To confirm this action, run:\n"
            result += "  db clean --yes\n"
            return result

        result += "\n" + "=" * 60 + "\n"
        result += "Proceeding with complete database clean...\n\n"

        # Delete in correct order to respect foreign key constraints
        # Use raw SQL for robustness - works regardless of schema changes

        deleted_counts = {}

        # 1. Delete child tables first (those with foreign keys)
        tables_to_delete = [
            'smell_ui_metadata',
            'ai_responses',
            'test_results',
            'smell_detection_results',
            'code_metrics',
            'experiments',
            'study_smells',
            'baseline_smell_detections',
            'detected_smells',
            'files',
            'repositories',
        ]

        for table in tables_to_delete:
            try:
                delete_result = session.execute(text(f"DELETE FROM {table}"))
                deleted = delete_result.rowcount
                deleted_counts[table] = deleted

                # Format table name for display
                display_name = table.replace('_', ' ').title()
                result += f"  ✓ {display_name}: {deleted} deleted\n"
            except Exception as e:
                result += f"  ⚠ {table}: skipped (table may not exist)\n"

        session.commit()

        result += "\n" + "=" * 60 + "\n"
        result += "✓ DATABASE COMPLETELY CLEANED\n"
        result += f"\nDeleted {sum(deleted_counts.values())} total records from {len(deleted_counts)} tables.\n"
        result += "\nThe database is now empty and ready for fresh data.\n"
        result += "\nNext steps:\n"
        result += "  1. Import smells: db import-smells\n"
        result += "  2. Or re-initialize: db init --force\n"

        return result

    except Exception as e:
        session.rollback()
        return f"✗ Error cleaning database: {str(e)}\n\nDatabase rolled back to previous state."
    finally:
        session.close()


def cmd_status(args: str = "") -> str:
    """
    Show database status.

    Usage: db status
    """
    db = get_db()
    status = db.get_status()

    result = "Database Status\n"
    result += "=" * 60 + "\n"
    result += f"Path: {status['path']}\n"
    result += f"Exists: {'✓ Yes' if status['exists'] else '✗ No'}\n"
    result += f"Initialized: {'✓ Yes' if status['initialized'] else '✗ No'}\n"
    result += f"Size: {status['size_mb']:.3f} MB\n"
    result += f"Writable: {'✓ Yes' if status['writable'] else '✗ No'}\n"

    # Validate schema
    is_valid, missing = db.validate_schema()
    result += f"\nSchema Valid: {'✓ Yes' if is_valid else '✗ No'}\n"
    if missing:
        result += f"Missing Tables: {', '.join(missing)}\n"

    return result


def cmd_stats(args: str = "") -> str:
    """
    Show database statistics.

    Usage: db stats
    """
    db = get_db()
    session = db.get_session()

    try:
        stats = crud.get_statistics(session)

        result = "Database Statistics\n"
        result += "=" * 60 + "\n"
        result += f"Repositories: {stats['repositories']}\n"
        result += f"Files: {stats['files']}\n"
        result += f"Detected Smells: {stats['detected_smells']}\n"
        result += f"Study Smells: {stats['study_smells']}\n"
        result += f"Experiments: {stats['experiments']}\n"
        result += f"  ├─ Successful: {stats['experiments_successful']}\n"
        result += f"  └─ Failed: {stats['experiments_failed']}\n"
        result += f"Code Metrics: {stats['code_metrics']}\n"
        result += f"Test Results: {stats['test_results']}\n"
        result += f"AI Responses: {stats['ai_responses']}\n"
        result += f"Smell Results: {stats['smell_results']}\n"

        if stats['by_ai_tool']:
            result += f"\nBy AI Tool:\n"
            for tool, count in stats['by_ai_tool'].items():
                result += f"  - {tool}: {count}\n"

        return result
    finally:
        session.close()


# =============================================================================
# REPOSITORY COMMANDS
# =============================================================================

def cmd_add_repository(args: str = "") -> str:
    """
    Add a new repository.

    Usage: db add-repository --name=<name> [--url=<url>] [--stars=<n>]

    Example: db add-repository --name=dayjs --url=https://github.com/iamkun/dayjs --stars=45000
    """
    # Parse arguments
    parts = args.split()
    params = {}

    for part in parts:
        if '=' in part:
            key, value = part.split('=', 1)
            key = key.lstrip('-')
            params[key] = value

    if 'name' not in params:
        return "✗ Error: --name is required\n\nUsage: db add-repository --name=<name> [--url=<url>] [--stars=<n>]"

    db = get_db()
    session = db.get_session()

    try:
        # Convert stars to int if provided
        if 'stars' in params:
            try:
                params['stars'] = int(params['stars'])
            except ValueError:
                return f"✗ Error: --stars must be a number"

        repo = crud.create_repository(session, **params)
        session.commit()

        result = f"✓ Repository created successfully!\n\n"
        result += f"ID: {repo.id}\n"
        result += f"Name: {repo.name}\n"
        if repo.url:
            result += f"URL: {repo.url}\n"
        if repo.stars:
            result += f"Stars: {repo.stars:,}\n"

        return result
    except Exception as e:
        session.rollback()
        return f"✗ Error: {str(e)}"
    finally:
        session.close()


def cmd_list_repositories(args: str = "") -> str:
    """
    List all repositories.

    Usage: db list-repositories
    """
    db = get_db()
    session = db.get_session()

    try:
        repos = crud.get_all_repositories(session)

        if not repos:
            return "No repositories found.\n\nUse 'db add-repository' to add one."

        result = f"Repositories ({len(repos)})\n"
        result += "=" * 60 + "\n"

        for repo in repos:
            result += f"\n[{repo.id}] {repo.name}\n"
            if repo.url:
                result += f"    URL: {repo.url}\n"
            if repo.stars:
                result += f"    Stars: {repo.stars:,}\n"
            result += f"    Language: {repo.language}\n"

        return result
    finally:
        session.close()


# =============================================================================
# EXPERIMENT COMMANDS
# =============================================================================

def cmd_list_experiments(args: str = "") -> str:
    """
    List experiments.

    Usage: db list-experiments [--ai-tool=<tool>] [--limit=<n>]

    Example: db list-experiments --ai-tool=Claude --limit=10
    """
    # Parse arguments
    parts = args.split()
    params = {}

    for part in parts:
        if '=' in part:
            key, value = part.split('=', 1)
            key = key.lstrip('-')
            params[key] = value

    limit = int(params.get('limit', 20))
    ai_tool = params.get('ai-tool') or params.get('ai_tool')

    db = get_db()
    session = db.get_session()

    try:
        # Get experiments
        if ai_tool:
            experiments = crud.get_experiments_by_ai_tool(session, ai_tool)
        else:
            from .models import Experiment
            experiments = session.query(Experiment).limit(limit).all()

        if not experiments:
            return "No experiments found."

        result = f"Experiments ({len(experiments)})\n"
        result += "=" * 60 + "\n"

        for exp in experiments[:limit]:
            result += f"\n[{exp.id}] {exp.ai_tool}"
            if exp.ai_model_version:
                result += f" ({exp.ai_model_version})"
            result += "\n"

            # Get repository and file info
            file_obj = session.query(crud.File).filter_by(id=exp.file_id).first()
            if file_obj:
                repo = session.query(crud.Repository).filter_by(id=file_obj.repository_id).first()
                if repo:
                    result += f"    Repository: {repo.name}\n"
                result += f"    File: {file_obj.path}\n"

            # Get smell info
            smell = session.query(crud.StudySmells).filter_by(id=exp.study_smell_id).first()
            if smell:
                result += f"    Smell: {smell.smell_type}\n"

            result += f"    Status: {'✓ Smell removed' if exp.smell_removed else '✗ Smell not removed'}\n"
            result += f"    Tests: {'✓ Passing' if exp.tests_still_passing else '✗ Failing' if exp.tests_still_passing is False else '? Unknown'}\n"
            result += f"    Date: {exp.experiment_date.strftime('%Y-%m-%d %H:%M')}\n"

        if len(experiments) > limit:
            result += f"\n... and {len(experiments) - limit} more. Use --limit to see more.\n"

        return result
    finally:
        session.close()


def cmd_get_experiment(args: str = "") -> str:
    """
    Get detailed information about an experiment.

    Usage: db get-experiment <id>

    Example: db get-experiment 1
    """
    try:
        exp_id = int(args.strip())
    except ValueError:
        return "✗ Error: Experiment ID must be a number\n\nUsage: db get-experiment <id>"

    db = get_db()
    session = db.get_session()

    try:
        exp = crud.get_experiment(session, exp_id)

        if not exp:
            return f"✗ Experiment {exp_id} not found"

        result = f"Experiment #{exp.id}\n"
        result += "=" * 60 + "\n"

        # Basic info
        result += f"\nAI Tool: {exp.ai_tool}"
        if exp.ai_model_version:
            result += f" ({exp.ai_model_version})"
        result += "\n"

        if exp.prompting_approach:
            result += f"Prompting: {exp.prompting_approach}\n"

        # File info
        file_obj = session.query(crud.File).filter_by(id=exp.file_id).first()
        if file_obj:
            repo = session.query(crud.Repository).filter_by(id=file_obj.repository_id).first()
            if repo:
                result += f"Repository: {repo.name}\n"
            result += f"File: {file_obj.path}\n"

        # Smell info
        smell = session.query(crud.StudySmells).filter_by(id=exp.study_smell_id).first()
        if smell:
            result += f"Target Smell: {smell.smell_type}\n"

        # Results
        result += f"\nResults:\n"
        result += f"  Refactoring Completed: {'✓ Yes' if exp.refactoring_completed else '✗ No'}\n"
        result += f"  Smell Removed: {'✓ Yes' if exp.smell_removed else '✗ No'}\n"
        result += f"  New Smells Introduced: {'⚠️  Yes' if exp.introduced_new_smells else '✓ No'}\n"
        result += f"  Tests Passing: {'✓ Yes' if exp.tests_still_passing else '✗ No' if exp.tests_still_passing is False else '? Unknown'}\n"

        # Performance
        if exp.execution_time_seconds:
            result += f"\nExecution Time: {exp.execution_time_seconds:.2f}s\n"
        if exp.tokens_used:
            result += f"Tokens Used: {exp.tokens_used:,}\n"

        # Metrics
        metrics = crud.get_code_metrics(session, exp_id)
        if metrics:
            result += f"\nCode Metrics:\n"
            metrics_before = next((m for m in metrics if m.phase == 'before'), None)
            metrics_after = next((m for m in metrics if m.phase == 'after'), None)

            if metrics_before and metrics_after:
                result += f"  SLOC: {metrics_before.sloc_logical} → {metrics_after.sloc_logical}"
                if metrics_after.sloc_logical != metrics_before.sloc_logical:
                    diff = metrics_after.sloc_logical - metrics_before.sloc_logical
                    result += f" ({'+' if diff > 0 else ''}{diff})"
                result += "\n"

                result += f"  Cyclomatic: {metrics_before.cyclomatic_complexity} → {metrics_after.cyclomatic_complexity}"
                if metrics_after.cyclomatic_complexity != metrics_before.cyclomatic_complexity:
                    diff = metrics_after.cyclomatic_complexity - metrics_before.cyclomatic_complexity
                    result += f" ({'+' if diff > 0 else ''}{diff})"
                result += "\n"

        # Test results
        tests = crud.get_test_results(session, exp_id)
        if tests:
            result += f"\nTest Results:\n"
            test_before = next((t for t in tests if t.phase == 'before'), None)
            test_after = next((t for t in tests if t.phase == 'after'), None)

            if test_before and test_after:
                result += f"  Tests Passed: {test_before.tests_passed}/{test_before.tests_total} → {test_after.tests_passed}/{test_after.tests_total}\n"
                if test_before.coverage_lines and test_after.coverage_lines:
                    result += f"  Coverage: {test_before.coverage_lines:.1f}% → {test_after.coverage_lines:.1f}%\n"

        result += f"\nDate: {exp.experiment_date.strftime('%Y-%m-%d %H:%M:%S')}\n"

        if exp.notes:
            result += f"\nNotes:\n{exp.notes}\n"

        return result
    finally:
        session.close()


# =============================================================================
# SMELL IMPORT COMMANDS
# =============================================================================

def cmd_import_smells(args: str = "") -> str:
    """
    Import detected smells from CSV files in /smells_detected directory.

    Usage: db import-smells [--repo=<name>] [--dry-run]

    Options:
        --repo=<name>    Only import smells for specific repository
        --dry-run        Preview what would be imported without saving

    The command scans the smells_detected/ directory for subdirectories.
    Each subdirectory represents a repository and should contain a smells.csv file.

    CSV format expected:
        file,type,line,method,source
        /path/to/file.js,SmellType,{'startLine':10,'endLine':15},"code snippet",tool

    Example: db import-smells
             db import-smells --repo=redux-offline
             db import-smells --dry-run
    """
    # Parse arguments
    parts = args.split()
    params = {}
    dry_run = False

    for part in parts:
        if part == '--dry-run':
            dry_run = True
        elif '=' in part:
            key, value = part.split('=', 1)
            key = key.lstrip('-')
            params[key] = value

    target_repo = params.get('repo')

    # Find smells_detected directory
    db = get_db()

    # Get project root (go up from database module to project root)
    # Path: .../llm-refactor-pipeline/src/llm_refactor/modules/database/cli_commands.py
    # Need to go up 5 levels: database -> modules -> llm_refactor -> src -> llm-refactor-pipeline -> project root
    current = Path(__file__).parent
    project_root = current.parent.parent.parent.parent.parent
    smells_dir = project_root / "smells_detected"

    if not smells_dir.exists():
        return f"✗ Error: smells_detected directory not found at {smells_dir}"

    # Scan for repository directories
    repo_dirs = [d for d in smells_dir.iterdir() if d.is_dir()]

    if not repo_dirs:
        return f"✗ No repository directories found in {smells_dir}"

    # Filter by target repo if specified
    if target_repo:
        repo_dirs = [d for d in repo_dirs if d.name == target_repo]
        if not repo_dirs:
            return f"✗ Repository '{target_repo}' not found in smells_detected/"

    result = "Import Smells from CSV\n"
    result += "=" * 60 + "\n"

    if dry_run:
        result += "⚠️  DRY RUN MODE - No changes will be saved\n"
        result += "=" * 60 + "\n"

    session = db.get_session()
    total_imported = 0
    total_skipped = 0
    total_errors = 0

    try:
        for repo_dir in repo_dirs:
            csv_file = repo_dir / "smells.csv"

            if not csv_file.exists():
                result += f"\n⚠️  {repo_dir.name}: No smells.csv found, skipping\n"
                continue

            result += f"\n📁 {repo_dir.name}\n"
            result += f"   Reading: {csv_file}\n"

            # Get or create repository
            repo, created = crud.get_or_create_repository(session, name=repo_dir.name)
            if created:
                result += f"   ✓ Created repository: {repo.name} (id={repo.id})\n"
            else:
                result += f"   ✓ Found repository: {repo.name} (id={repo.id})\n"

            # Read CSV file
            try:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    rows = list(reader)

                result += f"   Found {len(rows)} smells in CSV\n"

                imported_count = 0
                skipped_count = 0
                error_count = 0

                for row in rows:
                    try:
                        file_path = row.get('file', '').strip()
                        smell_type = row.get('type', '').strip()
                        line_data = row.get('line', '').strip()
                        code_snippet = row.get('method', '').strip()
                        method_start = row.get('methodStart', '').strip()
                        method_end = row.get('methodEnd', '').strip()
                        detection_tool = row.get('source', '').strip()

                        # Normalize detection tool names
                        tool_mapping = {
                            'snuts': 'SNUTSJS',
                            'steel': 'Steel',
                        }
                        detection_tool = tool_mapping.get(detection_tool.lower(), detection_tool)

                        if not file_path or not smell_type:
                            skipped_count += 1
                            continue

                        # Parse line data (convert Python dict string to JSON)
                        line_numbers = None
                        if line_data:
                            try:
                                # Replace single quotes with double quotes for JSON
                                line_data_json = line_data.replace("'", '"')
                                line_dict = json.loads(line_data_json)
                                line_numbers = json.dumps(line_dict)
                            except json.JSONDecodeError:
                                # If parsing fails, store as-is
                                line_numbers = line_data

                        # Get or create file
                        file_obj, file_created = crud.get_or_create_file(
                            session,
                            repository_id=repo.id,
                            path=file_path,
                            file_type='test'
                        )

                        # Check if smell already exists
                        existing_smells = crud.get_detected_smells_by_file(session, file_obj.id)
                        smell_exists = any(
                            s.smell_type == smell_type and
                            s.line_numbers == line_numbers
                            for s in existing_smells
                        )

                        if smell_exists:
                            skipped_count += 1
                            continue

                        # Parse snippet line numbers
                        snippet_start = None
                        snippet_end = None
                        if method_start and method_start.isdigit():
                            snippet_start = int(method_start)
                        if method_end and method_end.isdigit():
                            snippet_end = int(method_end)

                        # Create detected smell
                        if not dry_run:
                            crud.create_detected_smell(
                                session,
                                file_id=file_obj.id,
                                smell_type=smell_type,
                                line_numbers=line_numbers,
                                code_snippet=code_snippet,
                                snippet_start_line=snippet_start,
                                snippet_end_line=snippet_end,
                                detection_tool=detection_tool
                            )

                        imported_count += 1

                    except Exception as e:
                        error_count += 1
                        result += f"   ✗ Error processing row: {str(e)[:50]}\n"

                result += f"   ✓ Imported: {imported_count} smells\n"
                if skipped_count > 0:
                    result += f"   ⊘ Skipped: {skipped_count} (duplicates or invalid)\n"
                if error_count > 0:
                    result += f"   ✗ Errors: {error_count}\n"

                total_imported += imported_count
                total_skipped += skipped_count
                total_errors += error_count

            except Exception as e:
                result += f"   ✗ Error reading CSV: {str(e)}\n"
                total_errors += 1

        # Commit changes
        if not dry_run:
            session.commit()
            result += f"\n{'=' * 60}\n"
            result += f"✓ Successfully imported {total_imported} smells to database\n"
        else:
            session.rollback()
            result += f"\n{'=' * 60}\n"
            result += f"DRY RUN: Would import {total_imported} smells\n"

        if total_skipped > 0:
            result += f"⊘ Skipped {total_skipped} smells (duplicates or invalid)\n"
        if total_errors > 0:
            result += f"✗ {total_errors} errors occurred\n"

        return result

    except Exception as e:
        session.rollback()
        return f"✗ Import failed: {str(e)}"
    finally:
        session.close()


# =============================================================================
# UTILITY COMMANDS
# =============================================================================

def cmd_help(args: str = "") -> str:
    """
    Show database commands help.

    Usage: db help
    """
    result = "Database Commands\n"
    result += "=" * 60 + "\n\n"

    result += "Management:\n"
    result += "  db init [--force]          Initialize database\n"
    result += "  db clean [--yes]           Clean ALL data (complete reset)\n"
    result += "  db clear-smells [--keep]   Clear smells only (keep repos)\n"
    result += "  db clear-experiments       Clear experiments (keep smells & repos)\n"
    result += "  db status                  Show database status\n"
    result += "  db stats                   Show database statistics\n"
    result += "  db export [--output=PATH]  Export complete SQL dump\n"
    result += "  db validate-schema         Validate ORM matches database\n"
    result += "  db help                    Show this help\n"

    result += "\nRepositories:\n"
    result += "  db add-repository          Add a new repository\n"
    result += "  db list-repositories       List all repositories\n"

    result += "\nExperiments:\n"
    result += "  db list-experiments        List experiments\n"
    result += "  db get-experiment <id>     Get experiment details\n"

    result += "\nSmell Detection:\n"
    result += "  db import-smells           Import smells from CSV files\n"
    result += "  db validate-import         Validate imported smell data\n"

    result += "\nExamples:\n"
    result += "  db add-repository --name=dayjs --url=https://github.com/iamkun/dayjs\n"
    result += "  db clean --yes             Complete database reset\n"
    result += "  db clear-smells --keep-repos  Clear smells but keep repos\n"
    result += "  db clear-experiments       Clear experiment data only\n"
    result += "  db export                  Export to timestamped file\n"
    result += "  db export --output=/tmp/backup.sql  Export to custom path\n"
    result += "  db list-experiments --ai-tool=Claude --limit=10\n"
    result += "  db get-experiment 1\n"
    result += "  db import-smells --repo=redux-offline\n"
    result += "  db import-smells --dry-run\n"

    return result


# Import validation commands
from .test_import import cmd_validate_import
from .schema_validator import cmd_validate_schema as _validate_schema_internal


def cmd_export(args: str = "") -> str:
    """
    Export complete SQL dump of the database.

    Usage: db export [--output=PATH]

    Options:
        --output=PATH    Custom output path (default: research_data/research.db.dump-{timestamp}.sql)

    Examples:
        db export
        db export --output=/tmp/backup.sql
    """
    db = get_db()
    
    # Parse arguments
    output_path = None
    if args:
        for arg in args.split():
            if arg.startswith('--output='):
                output_path = arg.split('=', 1)[1]
    
    # Generate default filename with timestamp if not provided
    if not output_path:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f"research.db.dump-{timestamp}.sql"
        # Place in research_data directory (same location as db)
        output_path = db.db_path.parent / output_filename
    else:
        output_path = Path(output_path)
    
    try:
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Connect directly with sqlite3 for dumping
        conn = sqlite3.connect(str(db.db_path))
        
        # Get file size before dump for statistics
        db_size_mb = db.db_path.stat().st_size / (1024 * 1024)
        
        # Perform SQL dump
        with open(output_path, 'w', encoding='utf-8') as f:
            # Write header comment
            f.write(f"-- SQLite Database Dump\n")
            f.write(f"-- Database: {db.db_path}\n")
            f.write(f"-- Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- Database Size: {db_size_mb:.2f} MB\n")
            f.write(f"--\n\n")
            
            # Use iterdump to generate SQL statements
            for line in conn.iterdump():
                f.write(f"{line}\n")
        
        conn.close()
        
        # Get output file size
        dump_size_mb = output_path.stat().st_size / (1024 * 1024)
        
        result = "Database Export\n"
        result += "=" * 60 + "\n\n"
        result += f"✓ Successfully exported database\n\n"
        result += f"Source:      {db.db_path}\n"
        result += f"Destination: {output_path}\n"
        result += f"DB Size:     {db_size_mb:.2f} MB\n"
        result += f"Dump Size:   {dump_size_mb:.2f} MB\n"
        result += f"\nThe SQL dump can be restored using:\n"
        result += f"  sqlite3 new_database.db < {output_path}\n"
        
        return result
        
    except Exception as e:
        return f"✗ Export failed: {str(e)}"


def cmd_validate_schema(args: str = "") -> str:
    """
    Validate that ORM models match database schema.

    Usage: db validate-schema

    This checks if the SQLAlchemy models are in sync with the actual database.
    """
    db = get_db()
    session = db.get_session()

    try:
        return _validate_schema_internal(session)
    finally:
        session.close()


# Command registry for routing
COMMANDS = {
    'init': cmd_init,
    'clear-smells': cmd_clear_smells,
    'clear-experiments': cmd_clear_experiments,
    'clean': cmd_clean,
    'status': cmd_status,
    'stats': cmd_stats,
    'export': cmd_export,
    'validate-schema': cmd_validate_schema,
    'add-repository': cmd_add_repository,
    'list-repositories': cmd_list_repositories,
    'list-experiments': cmd_list_experiments,
    'get-experiment': cmd_get_experiment,
    'import-smells': cmd_import_smells,
    'validate-import': cmd_validate_import,
    'help': cmd_help,
}


def execute_command(command: str, args: str = "") -> str:
    """
    Execute a database command.

    Args:
        command: Command name (e.g., 'init', 'stats')
        args: Command arguments

    Returns:
        str: Command output
    """
    if command in COMMANDS:
        return COMMANDS[command](args)
    else:
        return f"✗ Unknown command: {command}\n\nUse 'db help' to see available commands."
