# Tests

This directory contains all test files for the LLM Refactor Pipeline.

## Test Files

- **test_backup_manager.py** - Backup manager functionality (16 tests)
- **test_cli.py** - CLI component tests
- **test_csv_structure.py** - CSV structure validation
- **test_refactor_integration.py** - Refactor module integration (5 tests)

## Running Tests

```bash
# Run individual tests
python test_backup_manager.py
python test_cli.py
python test_refactor_integration.py
python test_csv_structure.py

# Or run all tests
python -m pytest tests/
```

## Test Coverage

- ✅ Backup creation and restoration (16 tests)
- ✅ CLI routing and commands (5 tests)
- ✅ Refactor integration with BackupManager
- ✅ CSV structure validation
- ✅ Database import operations

## Writing New Tests

Follow the existing patterns:
1. Import required modules
2. Create test cases
3. Use meaningful test names
4. Assert expected outcomes
5. Clean up resources after tests
