# Backup Manager Module - Usage Guide

## Overview

The `BackupManager` module provides safe file handling operations for the LLM refactoring pipeline. It ensures that file modifications during the refactoring process are reversible and traceable.

## Features

- ✅ **Automatic backups** before file modifications
- ✅ **Precise snippet replacement** (only modifies targeted code)
- ✅ **Undo functionality** to restore from backups
- ✅ **Directory structure preservation** in backups
- ✅ **Comprehensive error handling** with meaningful exceptions
- ✅ **Full logging** of all operations
- ✅ **Safe-by-default** (prevents backup overwrites)

## Basic Usage

### 1. Initialize the BackupManager

```python
from llm_refactor.modules.refactor import BackupManager

# Use default paths (PROJECT_ROOT/repositories and PROJECT_ROOT/backup)
manager = BackupManager()

# Or specify custom paths
from pathlib import Path
manager = BackupManager(
    repositories_dir=Path("/path/to/repositories"),
    backup_dir=Path("/path/to/backup"),
    allow_backup_overwrite=False  # Safety first!
)
```

### 2. Create a Backup

```python
# Backup a file before modifying it
backup_path = manager.backup_file(
    repo_name="luxon",
    file_path="test/datetime/parse.test.js"
)
print(f"Backup created at: {backup_path}")
# Output: Backup created at: /path/to/backup/luxon/test/datetime/parse.test.js
```

### 3. Replace a Code Snippet

```python
# Replace a specific snippet (automatically creates backup)
original_snippet = """
    it('should parse date', () => {
        expect(result).toBe(5);
    });
"""

refactored_snippet = """
    it('should parse date', () => {
        expect(result).toEqual(5);
    });
"""

file_path, backup_created = manager.replace_snippet(
    repo_name="luxon",
    file_path="test/datetime/parse.test.js",
    original_snippet=original_snippet,
    refactored_snippet=refactored_snippet,
    create_backup=True  # Recommended - creates backup first
)
```

### 4. Undo a Refactor (Restore from Backup)

```python
# Restore the original file from backup
restored_path = manager.undo_refactor(
    repo_name="luxon",
    file_path="test/datetime/parse.test.js"
)
print(f"File restored to: {restored_path}")
```

## Complete Workflow Example

```python
from llm_refactor.modules.refactor import BackupManager
from llm_refactor.modules.refactor.exceptions import (
    SnippetReplacementError,
    BackupNotFoundError
)

# Initialize manager
manager = BackupManager()

# Step 1: Replace a smell with backup
try:
    file_path, backup_created = manager.replace_snippet(
        repo_name="luxon",
        file_path="test/datetime/parse.test.js",
        original_snippet="expect(x).toBe(5)",
        refactored_snippet="expect(x).toEqual(5)",
        create_backup=True
    )
    
    print(f"Refactoring complete. Backup: {backup_created}")
    
except SnippetReplacementError as e:
    print(f"Could not replace snippet: {e}")
    # Snippet not found or found multiple times

# Step 2: Run tests to verify the refactoring
# (Integration with test runner here)

# Step 3a: If tests pass, delete the backup
if tests_passed:
    manager.delete_backup("luxon", "test/datetime/parse.test.js")
    print("Refactoring successful - backup removed")

# Step 3b: If tests fail, restore from backup
else:
    try:
        manager.undo_refactor("luxon", "test/datetime/parse.test.js")
        print("Tests failed - file restored from backup")
    except BackupNotFoundError:
        print("ERROR: No backup found to restore!")
```

## Integration with Refactor Pipeline

Here's how to integrate the BackupManager into the existing refactor workflow:

```python
from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import get_study_smell
from llm_refactor.modules.refactor import (
    BackupManager,
    HuggingFaceRefactorClient
)

def refactor_with_backup(smell_id: int, strategy_id: int = 3, model_id: int = 1):
    """
    Refactor a test smell with automatic backup and restore.
    """
    # Initialize managers
    backup_manager = BackupManager()
    
    # Get smell from database
    with ResearchDB() as db:
        smell = get_study_smell(db.session, smell_id)
        if not smell:
            return f"Smell ID {smell_id} not found"
        
        # Get file and repository info
        file = smell.file
        repo = file.repository
        
        # Get LLM refactoring
        llm_client = HuggingFaceRefactorClient()
        refactored_code = llm_client.refactor_smell(
            smell_type=smell.smell_type,
            original_code=smell.code_snippet,
            strategy_id=strategy_id,
            model_id=model_id
        )
        
        # Apply refactoring with backup
        try:
            file_path, backup_created = backup_manager.replace_snippet(
                repo_name=repo.name,
                file_path=file.path,
                original_snippet=smell.code_snippet,
                refactored_snippet=refactored_code,
                create_backup=True
            )
            
            return f"Refactoring applied to {file.path}. Backup: {backup_created}"
            
        except Exception as e:
            return f"Refactoring failed: {e}"
```

## Utility Methods

### Check if Backup Exists

```python
if manager.backup_exists("luxon", "test/parse.test.js"):
    print("Backup already exists")
else:
    print("No backup found")
```

### List All Backups

```python
# List all backups
all_backups = manager.list_backups()
print(f"Total backups: {len(all_backups)}")

# List backups for specific repository
luxon_backups = manager.list_backups("luxon")
print(f"Luxon backups: {len(luxon_backups)}")
for backup in luxon_backups:
    print(f"  - {backup}")
```

### Delete a Backup

```python
# Delete a specific backup
deleted = manager.delete_backup("luxon", "test/parse.test.js")
if deleted:
    print("Backup deleted successfully")
else:
    print("No backup to delete")
```

## Error Handling

The module provides specific exceptions for different error scenarios:

```python
from llm_refactor.modules.refactor.exceptions import (
    BackupError,              # Base exception for all backup errors
    BackupExistsError,        # Backup already exists
    BackupNotFoundError,      # Backup not found during restore
    FileNotFoundError,        # Original file doesn't exist
    InvalidPathError,         # Invalid path provided
    SnippetReplacementError   # Snippet replacement failed
)

# Example error handling
try:
    manager.backup_file("luxon", "test/parse.test.js")
except BackupExistsError:
    print("Backup already exists - use overwrite=True to replace")
except FileNotFoundError:
    print("Original file not found")
except InvalidPathError:
    print("Invalid file path")
```

## Configuration

### Allow Backup Overwrite

```python
# Allow overwriting existing backups (globally)
manager = BackupManager(allow_backup_overwrite=True)

# Or per-operation
manager.backup_file(
    "luxon",
    "test/parse.test.js",
    overwrite=True  # Override instance setting
)
```

### Custom Paths

```python
from pathlib import Path

# Use custom directories
manager = BackupManager(
    repositories_dir=Path("/custom/repos"),
    backup_dir=Path("/custom/backups")
)
```

## Logging

The module logs all operations at appropriate levels:

```python
import logging

# Enable debug logging to see all operations
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('llm_refactor.modules.refactor.backup_manager')

# Example log output:
# INFO: BackupManager initialized with repositories_dir=...
# INFO: Backup created successfully: Source: ... Backup: ...
# INFO: Snippet replaced successfully in ...
# WARNING: Backup already exists for ..., proceeding without new backup
# ERROR: Failed to create backup: ...
```

## Best Practices

1. **Always create backups** before modifying files:
   ```python
   manager.replace_snippet(..., create_backup=True)
   ```

2. **Use unique snippets** for replacement to avoid ambiguity:
   ```python
   # ❌ BAD - might appear multiple times
   original = "expect(x).toBe(5)"
   
   # ✅ GOOD - include context for uniqueness
   original = """
       it('should calculate sum', () => {
           expect(x).toBe(5);
       });
   """
   ```

3. **Clean up backups** after successful refactoring:
   ```python
   if refactoring_successful:
       manager.delete_backup(repo_name, file_path)
   ```

4. **Handle errors gracefully**:
   ```python
   try:
       manager.replace_snippet(...)
   except SnippetReplacementError as e:
       # Log or handle the error
       # Possibly try with more context
   ```

5. **Verify operations** before proceeding:
   ```python
   # Check backup exists before attempting restore
   if manager.backup_exists(repo_name, file_path):
       manager.undo_refactor(repo_name, file_path)
   ```

## Testing

Run the test suite to verify the module:

```bash
# Run with Python's virtual environment
source .venv/bin/activate
python test_backup_manager.py

# Or with pytest (if installed)
pytest test_backup_manager.py -v
```

## Architecture Notes

- **Clean separation of concerns**: Backup logic is isolated from refactoring logic
- **Pathlib-based**: Uses `pathlib.Path` for robust path handling
- **Type hints**: Full type annotations for better IDE support
- **Documented**: Comprehensive docstrings for all public methods
- **Tested**: 16 unit tests covering all functionality
- **Production-ready**: Proper error handling, logging, and edge cases

## Future Enhancements

Potential improvements for future versions:

- [ ] Backup versioning (multiple backups per file)
- [ ] Backup expiration/cleanup policies
- [ ] Compression for large backups
- [ ] Transaction support (batch operations)
- [ ] Diff generation (before/after comparison)
- [ ] Metadata tracking (timestamp, user, reason)
