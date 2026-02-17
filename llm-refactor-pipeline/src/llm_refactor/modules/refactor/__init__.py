"""
Refactor module for HuggingFace-based test smell refactoring.

This module provides functionality to refactor test smells using
various LLM models available through HuggingFace's API.
"""

from .refactor_smell import execute, refactor_smell_module
from .hf_client import (
    HuggingFaceRefactorClient,
    HuggingFaceModels,
    PromptStrategy,
)

# Re-export BackupManager from backup_manager module for convenience
from llm_refactor.modules.backup_manager import (
    BackupManager,
    BackupError,
    BackupExistsError,
    BackupNotFoundError,
    BackupFileNotFoundError,
    InvalidPathError,
    SnippetReplacementError,
)

__all__ = [
    'execute',
    'refactor_smell_module',
    'HuggingFaceRefactorClient',
    'HuggingFaceModels',
    'PromptStrategy',
    'BackupManager',
    'BackupError',
    'BackupExistsError',
    'BackupNotFoundError',
    'BackupFileNotFoundError',
    'InvalidPathError',
    'SnippetReplacementError',
]
