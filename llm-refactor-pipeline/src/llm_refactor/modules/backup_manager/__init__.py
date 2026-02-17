"""
Backup Manager Module

Provides safe file backup and restore functionality for the refactoring pipeline.

This module includes:
- BackupManager class for file operations
- Custom exceptions for error handling
- CLI interface for backup commands

Usage from code:
    from llm_refactor.modules.backup_manager import BackupManager
    
    manager = BackupManager()
    manager.backup_file("luxon", "test/parse.test.js")

Usage from CLI:
    backup list
    backup create luxon test/parse.test.js
    backup restore luxon test/parse.test.js
"""

from .manager import BackupManager
from .exceptions import (
    BackupError,
    BackupExistsError,
    BackupNotFoundError,
    BackupFileNotFoundError,
    InvalidPathError,
    SnippetReplacementError,
)
from .backup_module import execute

__all__ = [
    'BackupManager',
    'BackupError',
    'BackupExistsError',
    'BackupNotFoundError',
    'BackupFileNotFoundError',
    'InvalidPathError',
    'SnippetReplacementError',
    'execute',
]
