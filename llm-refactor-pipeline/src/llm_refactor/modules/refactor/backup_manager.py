"""
Backup and File Replacement Manager for LLM Refactoring Pipeline.

This module provides safe file handling operations for the refactoring process:
- Creating backups before modifications
- Replacing specific code snippets in files
- Restoring files from backups (undo functionality)

All operations preserve directory structure and provide comprehensive logging.
"""

import logging
import shutil
from pathlib import Path
from typing import Optional, Tuple

from llm_refactor.core.config import config
from .exceptions import (
    BackupExistsError,
    BackupNotFoundError,
    BackupFileNotFoundError,
    InvalidPathError,
    SnippetReplacementError
)


logger = logging.getLogger(__name__)


class BackupManager:
    """
    Manages file backups and replacements for safe refactoring operations.
    
    This class handles:
    - Creating backups before file modifications
    - Replacing code snippets in source files
    - Restoring files from backups
    
    The backup directory structure mirrors the repository structure:
    backup/{repo_name}/{file_path}/{file_name}
    
    Example:
        manager = BackupManager()
        
        # Backup a file before modifying it
        backup_path = manager.backup_file("luxon", "test/datetime/formatter.test.js")
        
        # Replace a snippet in the file
        manager.replace_snippet(
            "luxon",
            "test/datetime/formatter.test.js",
            "expect(x).toBe(5)",
            "expect(x).toBe(5) // fixed assertion"
        )
        
        # Restore from backup if needed
        manager.undo_refactor("luxon", "test/datetime/formatter.test.js")
    """
    
    def __init__(
        self,
        repositories_dir: Optional[Path] = None,
        backup_dir: Optional[Path] = None,
        allow_backup_overwrite: bool = False
    ):
        """
        Initialize the BackupManager.
        
        Args:
            repositories_dir: Path to the repositories directory.
                Defaults to PROJECT_ROOT/repositories
            backup_dir: Path to the backup directory.
                Defaults to PROJECT_ROOT/backup
            allow_backup_overwrite: If True, allows overwriting existing backups.
                Defaults to False for safety.
        
        Raises:
            InvalidPathError: If repositories_dir does not exist.
        """
        self.repositories_dir = repositories_dir or (config.PROJECT_ROOT / "repositories")
        self.backup_dir = backup_dir or (config.PROJECT_ROOT / "backup")
        self.allow_backup_overwrite = allow_backup_overwrite
        
        # Validate repositories directory exists
        if not self.repositories_dir.exists():
            raise InvalidPathError(
                f"Repositories directory does not exist: {self.repositories_dir}"
            )
        
        # Create backup directory if it doesn't exist
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(
            "BackupManager initialized with repositories_dir=%s, "
            "backup_dir=%s, allow_overwrite=%s",
            self.repositories_dir, self.backup_dir, self.allow_backup_overwrite
        )
    
    def _get_file_path(self, repo_name: str, file_path: str) -> Path:
        """
        Get the absolute path to a file in a repository.
        
        Args:
            repo_name: Repository name (e.g., "luxon")
            file_path: Relative path within repository (e.g., "test/parse.test.js")
        
        Returns:
            Absolute Path to the file
        
        Raises:
            InvalidPathError: If the path is invalid
            BackupFileNotFoundError: If the file does not exist
        """
        # Clean up the file path (remove leading slashes)
        file_path = file_path.lstrip("/")
        
        # Construct full path
        full_path = self.repositories_dir / repo_name / file_path
        
        # Validate it exists
        if not full_path.exists():
            raise BackupFileNotFoundError(
                f"File not found: {full_path}\n"
                f"Repository: {repo_name}\n"
                f"File path: {file_path}"
            )
        
        if not full_path.is_file():
            raise InvalidPathError(f"Path is not a file: {full_path}")
        
        return full_path
    
    def _get_backup_path(self, repo_name: str, file_path: str) -> Path:
        """
        Get the backup path for a file, preserving directory structure.
        
        Args:
            repo_name: Repository name
            file_path: Relative path within repository
        
        Returns:
            Path to the backup file
        """
        # Clean up the file path
        file_path = file_path.lstrip("/")
        
        # Construct backup path: backup/{repo_name}/{file_path}
        backup_path = self.backup_dir / repo_name / file_path
        
        return backup_path
    
    def backup_file(
        self,
        repo_name: str,
        file_path: str,
        overwrite: Optional[bool] = None
    ) -> Path:
        """
        Create a backup of a file before modification.
        
        The backup preserves the original directory structure:
        backup/{repo_name}/{file_path}
        
        Args:
            repo_name: Repository name (e.g., "luxon")
            file_path: Relative path within repository (e.g., "test/parse.test.js")
            overwrite: Override the instance setting for backup overwrite.
                If None, uses the instance setting.
        
        Returns:
            Path to the created backup file
        
        Raises:
            BackupFileNotFoundError: If the original file does not exist
            BackupExistsError: If backup exists and overwrite is False
            InvalidPathError: If the path is invalid
        
        Example:
            >>> manager = BackupManager()
            >>> backup_path = manager.backup_file("luxon", "test/parse.test.js")
            >>> print(backup_path)
            /path/to/backup/luxon/test/parse.test.js
        """
        # Determine overwrite behavior
        should_overwrite = overwrite if overwrite is not None else self.allow_backup_overwrite
        
        # Get source and destination paths
        source_path = self._get_file_path(repo_name, file_path)
        backup_path = self._get_backup_path(repo_name, file_path)
        
        # Check if backup already exists
        if backup_path.exists() and not should_overwrite:
            raise BackupExistsError(
                f"Backup already exists: {backup_path}\n"
                f"Set allow_backup_overwrite=True or overwrite=True to replace it."
            )
        
        # Create backup directory structure
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy the file
        try:
            shutil.copy2(source_path, backup_path)
            logger.info(
                "Backup created successfully:\n"
                "  Source: %s\n"
                "  Backup: %s",
                source_path, backup_path
            )
            return backup_path
        except Exception as e:
            logger.error("Failed to create backup: %s", e)
            raise
    
    def replace_snippet(
        self,
        repo_name: str,
        file_path: str,
        original_snippet: str,
        refactored_snippet: str,
        create_backup: bool = True
    ) -> Tuple[Path, bool]:
        """
        Replace a specific code snippet in a file.
        
        This method:
        1. Optionally creates a backup (recommended)
        2. Reads the file content
        3. Replaces the original snippet with the refactored version
        4. Writes the modified content back to the file
        
        Args:
            repo_name: Repository name
            file_path: Relative path within repository
            original_snippet: The exact code snippet to replace
            refactored_snippet: The new code snippet
            create_backup: If True, creates a backup before modification (default: True)
        
        Returns:
            Tuple of (file_path, backup_created)
            - file_path: Path to the modified file
            - backup_created: Whether a backup was created
        
        Raises:
            BackupFileNotFoundError: If the file does not exist
            SnippetReplacementError: If the snippet is not found or found multiple times
        
        Example:
            >>> manager = BackupManager()
            >>> file_path, backed_up = manager.replace_snippet(
            ...     "luxon",
            ...     "test/parse.test.js",
            ...     "expect(result).toBe(5)",
            ...     "expect(result).toEqual(5)"
            ... )
        """
        # Get the file path
        target_file = self._get_file_path(repo_name, file_path)
        
        # Create backup if requested
        backup_created = False
        if create_backup:
            try:
                self.backup_file(repo_name, file_path)
                backup_created = True
            except BackupExistsError:
                logger.warning(
                    "Backup already exists for %s, "
                    "proceeding with replacement without creating new backup",
                    file_path
                )
        
        # Read file content
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error("Failed to read file %s: %s", target_file, e)
            raise
        
        # Verify the snippet exists and is unique
        occurrences = content.count(original_snippet)
        
        if occurrences == 0:
            raise SnippetReplacementError(
                f"Original snippet not found in file: {target_file}\n"
                f"Snippet to find:\n{original_snippet}\n\n"
                f"This could mean:\n"
                f"  - The snippet has already been modified\n"
                f"  - The snippet text doesn't match exactly\n"
                f"  - Whitespace differences exist"
            )
        
        if occurrences > 1:
            raise SnippetReplacementError(
                f"Original snippet found {occurrences} times in file: {target_file}\n"
                f"Snippet must be unique for safe replacement.\n"
                f"Consider including more surrounding context."
            )
        
        # Replace the snippet
        new_content = content.replace(original_snippet, refactored_snippet)
        
        # Write the modified content back
        try:
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            logger.info(
                "Snippet replaced successfully in %s\n"
                "  Backup created: %s",
                target_file, backup_created
            )
            
            return target_file, backup_created
            
        except (OSError, IOError) as e:
            logger.error("Failed to write modified content to %s: %s", target_file, e)
            # Attempt to restore from backup if we created one
            if backup_created:
                logger.info("Attempting to restore from backup...")
                try:
                    self.undo_refactor(repo_name, file_path)
                    logger.info("Successfully restored from backup")
                except (OSError, IOError, BackupNotFoundError):
                    logger.error("Failed to restore from backup", exc_info=True)
            raise
    
    def undo_refactor(self, repo_name: str, file_path: str) -> Path:
        """
        Restore a file from its backup.
        
        This replaces the current file with the backup version.
        The backup file is preserved (not deleted) after restoration.
        
        Args:
            repo_name: Repository name
            file_path: Relative path within repository
        
        Returns:
            Path to the restored file
        
        Raises:
            BackupNotFoundError: If no backup exists for the file
            InvalidPathError: If the target location is invalid
        
        Example:
            >>> manager = BackupManager()
            >>> restored = manager.undo_refactor("luxon", "test/parse.test.js")
            >>> print(f"Restored: {restored}")
        """
        # Get backup and target paths
        backup_path = self._get_backup_path(repo_name, file_path)
        
        # Verify backup exists
        if not backup_path.exists():
            raise BackupNotFoundError(
                f"No backup found for restoration:\n"
                f"  Repository: {repo_name}\n"
                f"  File: {file_path}\n"
                f"  Expected backup location: {backup_path}"
            )
        
        # Get target path (create if doesn't exist for edge cases)
        file_path_clean = file_path.lstrip("/")
        target_path = self.repositories_dir / repo_name / file_path_clean
        
        # Create target directory if it doesn't exist
        target_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Restore the file
        try:
            shutil.copy2(backup_path, target_path)
            logger.info(
                "File restored successfully:\n"
                "  From backup: %s\n"
                "  To: %s",
                backup_path, target_path
            )
            return target_path
        except Exception as e:
            logger.error("Failed to restore file from backup: %s", e)
            raise
    
    def delete_backup(self, repo_name: str, file_path: str) -> bool:
        """
        Delete a backup file.
        
        Use this to clean up backups after successful refactoring.
        
        Args:
            repo_name: Repository name
            file_path: Relative path within repository
        
        Returns:
            True if backup was deleted, False if backup didn't exist
        
        Example:
            >>> manager = BackupManager()
            >>> deleted = manager.delete_backup("luxon", "test/parse.test.js")
        """
        backup_path = self._get_backup_path(repo_name, file_path)
        
        if not backup_path.exists():
            logger.warning("No backup to delete: %s", backup_path)
            return False
        
        try:
            backup_path.unlink()
            logger.info("Backup deleted: %s", backup_path)
            
            # Clean up empty parent directories
            parent = backup_path.parent
            try:
                while parent != self.backup_dir and not list(parent.iterdir()):
                    parent.rmdir()
                    parent = parent.parent
            except OSError:
                pass  # Parent not empty or other issue, ignore
            
            return True
        except Exception as e:
            logger.error("Failed to delete backup %s: %s", backup_path, e)
            raise
    
    def list_backups(self, repo_name: Optional[str] = None) -> list[Path]:
        """
        List all backup files, optionally filtered by repository.
        
        Args:
            repo_name: Optional repository name to filter by
        
        Returns:
            List of paths to backup files
        
        Example:
            >>> manager = BackupManager()
            >>> all_backups = manager.list_backups()
            >>> luxon_backups = manager.list_backups("luxon")
        """
        if repo_name:
            search_path = self.backup_dir / repo_name
        else:
            search_path = self.backup_dir
        
        if not search_path.exists():
            return []
        
        # Recursively find all regular files
        backups = [p for p in search_path.rglob("*") if p.is_file()]
        
        logger.debug("Found %d backup(s) in %s", len(backups), search_path)
        return backups
    
    def backup_exists(self, repo_name: str, file_path: str) -> bool:
        """
        Check if a backup exists for a file.
        
        Args:
            repo_name: Repository name
            file_path: Relative path within repository
        
        Returns:
            True if backup exists, False otherwise
        
        Example:
            >>> manager = BackupManager()
            >>> if manager.backup_exists("luxon", "test/parse.test.js"):
            ...     print("Backup found!")
        """
        backup_path = self._get_backup_path(repo_name, file_path)
        return backup_path.exists()
