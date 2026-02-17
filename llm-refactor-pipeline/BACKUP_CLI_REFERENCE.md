# Backup Manager CLI - Quick Reference

## Overview

The backup manager is now available as a CLI command in the llm-refactor pipeline. Use it to safely manage file backups during refactoring operations.

## Installation

The backup manager is automatically available when you run:
```bash
llm-refactor
```

## Commands

### List Backups

```bash
# List all backups
backup list

# List backups for a specific repository
backup list luxon
```

**Output:**
```
======================================================================
All Backups
======================================================================

  • luxon/test/datetime/parse.test.js
  • nock/test/test_request.js

Total: 2 backup(s)
======================================================================
```

### Create a Backup

```bash
# Backup a file before modification
backup create <repo_name> <file_path>

# Examples:
backup create luxon test/parse.test.js
backup create nock test/test_request.js
```

**Output:**
```
✓ Backup created successfully

Repository:  luxon
File:        test/parse.test.js
Backup:      /path/to/backup/luxon/test/parse.test.js

To restore: backup restore luxon test/parse.test.js
```

### Restore from Backup

```bash
# Restore a file to its backed-up state
backup restore <repo_name> <file_path>

# Example:
backup restore luxon test/parse.test.js
```

**Output:**
```
✓ File restored successfully from backup

Repository:  luxon
File:        test/parse.test.js
Restored:    /path/to/repositories/luxon/test/parse.test.js

The file has been reverted to its backed-up state.
```

### Delete a Backup

```bash
# Delete a backup after successful refactoring
backup delete <repo_name> <file_path>

# Example:
backup delete luxon test/parse.test.js
```

**Output:**
```
✓ Backup deleted successfully

Repository:  luxon
File:        test/parse.test.js

The backup has been removed from the system.
```

### Check if Backup Exists

```bash
# Check if a backup exists for a file
backup check <repo_name> <file_path>

# Example:
backup check luxon test/parse.test.js
```

**Output:**
```
✓ Backup exists

Repository:  luxon
File:        test/parse.test.js
Backup:      /path/to/backup/luxon/test/parse.test.js

Use 'backup restore' to restore from this backup.
```

## Workflow Integration

### Safe Refactoring Workflow

```bash
# 1. Start the interactive shell
llm-refactor

# 2. Create a backup before refactoring
llm-refactor> backup create luxon test/parse.test.js

# 3. Refactor the smell
llm-refactor> refactor 42

# 4. Run tests to verify
llm-refactor> run_tests luxon

# 5a. If tests pass - delete the backup
llm-refactor> backup delete luxon test/parse.test.js

# 5b. If tests fail - restore from backup
llm-refactor> backup restore luxon test/parse.test.js
```

### Automated Workflow Example

You can also chain commands or use them programmatically:

```bash
# Create backup, refactor, and verify in sequence
llm-refactor << EOF
backup create luxon test/parse.test.js
refactor 42
run_tests luxon
backup delete luxon test/parse.test.js
EOF
```

## Help

Get help on backup commands:
```bash
llm-refactor> backup help
```

Or get help on all available commands:
```bash
llm-refactor> help
```

## Examples

### Example Session

```
$ llm-refactor

╔══════════════════════════════════════════╗
║   LLM Refactor Pipeline v0.1.0           ║
║   Interactive Code Refactoring Tool      ║
╚══════════════════════════════════════════╝

llm-refactor> backup list
No backups found

llm-refactor> backup create luxon test/datetime/parse.test.js
✓ Backup created successfully

Repository:  luxon
File:        test/datetime/parse.test.js
Backup:      /path/to/backup/luxon/test/datetime/parse.test.js

llm-refactor> backup list
======================================================================
All Backups
======================================================================

  • luxon/test/datetime/parse.test.js

Total: 1 backup(s)
======================================================================

llm-refactor> backup check luxon test/datetime/parse.test.js
✓ Backup exists

Repository:  luxon
File:        test/datetime/parse.test.js
Backup:      /path/to/backup/luxon/test/datetime/parse.test.js

llm-refactor> backup restore luxon test/datetime/parse.test.js
✓ File restored successfully from backup

llm-refactor> backup delete luxon test/datetime/parse.test.js
✓ Backup deleted successfully

llm-refactor> exit
Goodbye! 👋
```

## Related Commands

- `refactor` - Refactor test smells using LLMs
- `run_tests` - Run test suites
- `db` - Database operations

## Programmatic Usage

You can also use the BackupManager directly in Python code:

```python
from llm_refactor.modules.backup_manager import BackupManager

manager = BackupManager()

# Create backup
manager.backup_file("luxon", "test/parse.test.js")

# Replace snippet
manager.replace_snippet(
    "luxon",
    "test/parse.test.js",
    original_snippet="expect(x).toBe(5)",
    refactored_snippet="expect(x).toEqual(5)"
)

# Restore if needed
manager.undo_refactor("luxon", "test/parse.test.js")
```

See [BACKUP_MANAGER_USAGE.md](BACKUP_MANAGER_USAGE.md) for complete API documentation.

## Troubleshooting

### "Repository directory does not exist"

**Problem:** The BackupManager can't find the repositories directory.

**Solution:** Make sure you're running llm-refactor from the correct directory, or that the repositories exist at `../repositories/` relative to the pipeline.

### "Backup already exists"

**Problem:** Trying to create a backup when one already exists.

**Solutions:**
- Use `backup restore` to restore the existing backup
- Use `backup delete` to remove the old backup first
- Manually set `allow_backup_overwrite=True` when using the API

### "No backup found"

**Problem:** Trying to restore or delete a backup that doesn't exist.

**Solutions:**
- Use `backup list` to see what backups exist
- Use `backup check` to verify a backup exists
- Create a backup with `backup create` first

## Tips

1. **Always create backups** before modifying files
2. **List backups regularly** to track what's been backed up
3. **Clean up backups** after successful refactoring to save space
4. **Use check command** before attempting restore operations
5. **Read help messages** - they contain useful information

## Configuration

The backup manager uses these default paths:
- **Repositories**: `{PROJECT_ROOT}/repositories/`
- **Backups**: `{PROJECT_ROOT}/backup/`

These can be customized when using the BackupManager API directly.

## Further Reading

- [BACKUP_MANAGER_USAGE.md](BACKUP_MANAGER_USAGE.md) - Complete usage guide
- [BACKUP_IMPLEMENTATION_SUMMARY.md](BACKUP_IMPLEMENTATION_SUMMARY.md) - Technical details
- [backup_integration_example.py](backup_integration_example.py) - Code examples
