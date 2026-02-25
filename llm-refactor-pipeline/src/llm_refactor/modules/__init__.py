"""
Feature modules for the LLM Refactor Pipeline.

This package contains:
- base: Base module interface
- detect_smells: Detect smells module
- run_tests: Run tests module
- database_module: Database operations module
- ui_server: Smell Selector UI server module
- refactor: LLM-based refactoring module
- backup_manager: File backup management module
- execute_experiment: Complete experiment workflow module

Add new modules here to extend functionality.
"""

from . import (
    base,
    detect_smells,
    run_tests,
    database_module,
    ui_server,
    refactor,
    backup_manager,
    execute_experiment
)

__all__ = [
    "base",
    "detect_smells",
    "run_tests",
    "database_module",
    "ui_server",
    "refactor",
    "backup_manager",
    "execute_experiment"
]
