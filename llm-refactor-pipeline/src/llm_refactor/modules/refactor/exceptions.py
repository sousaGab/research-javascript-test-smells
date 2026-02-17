"""
Custom exceptions for the refactor module.

Provides specific exception types for backup, restore, and file replacement operations.
"""


class BackupError(Exception):
    """Base exception for backup-related operations."""


class BackupExistsError(BackupError):
    """Raised when attempting to create a backup that already exists."""


class BackupNotFoundError(BackupError):
    """Raised when attempting to restore from a non-existent backup."""


class BackupFileNotFoundError(BackupError):
    """Raised when the original file to backup does not exist."""


class InvalidPathError(BackupError):
    """Raised when a provided file path is invalid or malformed."""


class SnippetReplacementError(Exception):
    """Raised when snippet replacement fails."""
