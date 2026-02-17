"""
Backup Manager Module - CLI Interface

Provides command-line interface for backup and restore operations in the refactoring pipeline.
"""

from llm_refactor.modules.base import SimpleModule
from llm_refactor.core.config import config
from .manager import BackupManager
from .exceptions import (
    BackupExistsError,
    BackupNotFoundError,
    BackupFileNotFoundError,
    InvalidPathError
)


class BackupManagerModule(SimpleModule):
    """
    Module for managing file backups during refactoring.
    
    Usage:
        backup list [repo_name]           # List backups
        backup create <repo> <file_path>  # Create a backup
        backup restore <repo> <file_path> # Restore from backup
        backup delete <repo> <file_path>  # Delete a backup
        backup help                       # Show detailed help
    """
    
    name = "backup"
    description = "Manage file backups for safe refactoring"
    
    def _get_backup_manager(self) -> BackupManager:
        """Get BackupManager instance with correct repositories path."""
        # Repositories are in parent directory of llm-refactor-pipeline
        repositories_dir = config.PROJECT_ROOT.parent / "repositories"
        return BackupManager(repositories_dir=repositories_dir)
    
    def execute(self, args: str = "") -> str:
        """Execute backup commands."""
        args = args.strip()
        
        # Handle help
        if args in ["help", "--help", "-h", ""]:
            return self._show_help()
        
        # Parse command
        parts = args.split()
        
        if len(parts) < 1:
            return "Error: Command required. Usage: backup <command> [args]\nTry 'backup help' for details."
        
        command = parts[0].lower()
        
        # Route to appropriate handler
        if command == "list":
            return self._list_backups(parts[1:])
        elif command == "create":
            return self._create_backup(parts[1:])
        elif command == "restore":
            return self._restore_backup(parts[1:])
        elif command == "delete":
            return self._delete_backup(parts[1:])
        elif command == "check":
            return self._check_backup(parts[1:])
        else:
            return f"Error: Unknown command '{command}'\nTry 'backup help' for available commands."
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return """
╔══════════════════════════════════════════════════════════════════════════╗
║                    BACKUP MANAGER - HELP                                 ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Manage file backups for safe refactoring operations.

COMMANDS:
    backup list [repo_name]
        List all backups, optionally filtered by repository.
        
        Examples:
            backup list              # List all backups
            backup list luxon        # List backups for luxon repository
    
    backup create <repo> <file_path>
        Create a backup of a file before modification.
        
        Examples:
            backup create luxon test/parse.test.js
            backup create nock test/test_request.js
    
    backup restore <repo> <file_path>
        Restore a file from its backup (undo refactoring).
        
        Examples:
            backup restore luxon test/parse.test.js
    
    backup delete <repo> <file_path>
        Delete a backup file (after successful refactoring).
        
        Examples:
            backup delete luxon test/parse.test.js
    
    backup check <repo> <file_path>
        Check if a backup exists for a file.
        
        Examples:
            backup check luxon test/parse.test.js

WORKFLOW:
    1. Create backup:   backup create luxon test/parse.test.js
    2. Modify file:     (use refactor command)
    3. If tests fail:   backup restore luxon test/parse.test.js
    4. If tests pass:   backup delete luxon test/parse.test.js

BACKUP LOCATION:
    Backups are stored in: PROJECT_ROOT/backup/
    Structure: backup/{repo_name}/{file_path}

RELATED COMMANDS:
    refactor - Refactor test smells using LLMs

For more information, see: BACKUP_MANAGER_USAGE.md
"""
    
    def _list_backups(self, args: list) -> str:
        """List backups, optionally filtered by repository."""
        manager = self._get_backup_manager()
        
        repo_name = args[0] if args else None
        
        try:
            backups = manager.list_backups(repo_name)
            
            if not backups:
                if repo_name:
                    return f"No backups found for repository '{repo_name}'"
                else:
                    return "No backups found"
            
            # Format output
            header = f"Backups for '{repo_name}'" if repo_name else "All Backups"
            lines = [
                "=" * 70,
                header,
                "=" * 70,
                ""
            ]
            
            for backup in backups:
                # Get relative path from backup directory
                rel_path = backup.relative_to(manager.backup_dir)
                lines.append(f"  • {rel_path}")
            
            lines.extend([
                "",
                f"Total: {len(backups)} backup(s)",
                "=" * 70
            ])
            
            return "\n".join(lines)
            
        except (OSError, IOError) as e:
            return f"Error listing backups: {e}"
    
    def _create_backup(self, args: list) -> str:
        """Create a backup of a file."""
        if len(args) < 2:
            return "Error: Repository and file path required\nUsage: backup create <repo> <file_path>"
        
        repo_name = args[0]
        file_path = " ".join(args[1:])  # Support paths with spaces
        
        manager = self._get_backup_manager()
        
        try:
            backup_path = manager.backup_file(repo_name, file_path)
            
            return f"""
✓ Backup created successfully

Repository:  {repo_name}
File:        {file_path}
Backup:      {backup_path}

To restore: backup restore {repo_name} {file_path}
"""
        except BackupExistsError:
            return f"""
⚠ Backup already exists for this file

Repository:  {repo_name}
File:        {file_path}

Use 'backup restore' to restore from the existing backup.
"""
        except BackupFileNotFoundError as e:
            return f"✗ File not found: {e}"
        except InvalidPathError as e:
            return f"✗ Invalid path: {e}"
        except (OSError, IOError) as e:
            return f"✗ Error creating backup: {e}"
    
    def _restore_backup(self, args: list) -> str:
        """Restore a file from backup."""
        if len(args) < 2:
            return "Error: Repository and file path required\nUsage: backup restore <repo> <file_path>"
        
        repo_name = args[0]
        file_path = " ".join(args[1:])
        
        manager = self._get_backup_manager()
        
        try:
            restored_path = manager.undo_refactor(repo_name, file_path)
            
            return f"""
✓ File restored successfully from backup

Repository:  {repo_name}
File:        {file_path}
Restored:    {restored_path}

The file has been reverted to its backed-up state.
"""
        except BackupNotFoundError:
            return f"""
✗ No backup found

Repository:  {repo_name}
File:        {file_path}

Create a backup first: backup create {repo_name} {file_path}
"""
        except (OSError, IOError) as e:
            return f"✗ Error restoring from backup: {e}"
    
    def _delete_backup(self, args: list) -> str:
        """Delete a backup file."""
        if len(args) < 2:
            return "Error: Repository and file path required\nUsage: backup delete <repo> <file_path>"
        
        repo_name = args[0]
        file_path = " ".join(args[1:])
        
        manager = self._get_backup_manager()
        
        try:
            deleted = manager.delete_backup(repo_name, file_path)
            
            if deleted:
                return f"""
✓ Backup deleted successfully

Repository:  {repo_name}
File:        {file_path}

The backup has been removed from the system.
"""
            else:
                return f"""
⚠ No backup found to delete

Repository:  {repo_name}
File:        {file_path}
"""
        except (OSError, IOError) as e:
            return f"✗ Error deleting backup: {e}"
    
    def _check_backup(self, args: list) -> str:
        """Check if a backup exists."""
        if len(args) < 2:
            return "Error: Repository and file path required\nUsage: backup check <repo> <file_path>"
        
        repo_name = args[0]
        file_path = " ".join(args[1:])
        
        manager = self._get_backup_manager()
        
        exists = manager.backup_exists(repo_name, file_path)
        
        if exists:
            # Construct backup path (same as manager does internally)
            from pathlib import Path
            backup_path = manager.backup_dir / repo_name / file_path.lstrip("/")
            return f"""
✓ Backup exists

Repository:  {repo_name}
File:        {file_path}
Backup:      {backup_path}

Use 'backup restore' to restore from this backup.
"""
        else:
            return f"""
✗ No backup exists

Repository:  {repo_name}
File:        {file_path}

Use 'backup create' to create a backup.
"""


# Create module instance
backup_manager_module = BackupManagerModule()


def execute(args: str = "") -> str:
    """
    Execute the backup manager module.
    
    This is the entry point called by the CLI router.
    """
    return backup_manager_module.execute(args)
