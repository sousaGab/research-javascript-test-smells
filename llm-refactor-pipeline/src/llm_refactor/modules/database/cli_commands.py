"""
CLI commands for database operations.

This module provides user-facing commands that can be called from the CLI.
Each function returns a formatted string for display to the user.
"""

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
            result += f"✓ Schema validated: All 9 tables created\n"
        else:
            result += f"⚠️  Schema validation failed. Missing tables: {missing}\n"

        return result
    else:
        return "✗ Failed to initialize database"


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
        result += f"Baseline Smells: {stats['baseline_smells']}\n"
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
            smell = session.query(crud.BaselineSmellDetection).filter_by(id=exp.baseline_smell_id).first()
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
        smell = session.query(crud.BaselineSmellDetection).filter_by(id=exp.baseline_smell_id).first()
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
    result += "  db status                  Show database status\n"
    result += "  db stats                   Show database statistics\n"
    result += "  db help                    Show this help\n"

    result += "\nRepositories:\n"
    result += "  db add-repository          Add a new repository\n"
    result += "  db list-repositories       List all repositories\n"

    result += "\nExperiments:\n"
    result += "  db list-experiments        List experiments\n"
    result += "  db get-experiment <id>     Get experiment details\n"

    result += "\nExamples:\n"
    result += "  db add-repository --name=dayjs --url=https://github.com/iamkun/dayjs\n"
    result += "  db list-experiments --ai-tool=Claude --limit=10\n"
    result += "  db get-experiment 1\n"

    return result


# Command registry for routing
COMMANDS = {
    'init': cmd_init,
    'status': cmd_status,
    'stats': cmd_stats,
    'add-repository': cmd_add_repository,
    'list-repositories': cmd_list_repositories,
    'list-experiments': cmd_list_experiments,
    'get-experiment': cmd_get_experiment,
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
