# REDO Functionality Implementation Summary

## Problem
When using `--redo` flag to re-execute experiments, the system was failing with:
```
❌ Exception: (sqlite3.IntegrityError) UNIQUE constraint failed: test_results.experiment_id, test_results.phase
```

This occurred because the execution phase tried to insert new test results but the old ones still existed, violating the UNIQUE constraint on `(experiment_id, phase)`.

## Solution
Implemented automatic cleanup of execution phase data before re-running experiments.

### Changes Made

#### 1. **New Function in `crud.py`**: `delete_test_results()`
- Deletes test results for a specific experiment
- Can filter by phase ('before' or 'after') or delete all
- Returns count of deleted records

#### 2. **New Function in `crud.py`**: `reset_experiment_execution_data()`
- Comprehensive cleanup of execution phase data:
  - Deletes all test_results records
  - Resets experiment flags to None:
    - `execution_phase_completed` → False
    - `tests_still_passing` → None
    - `smell_removed` → None
    - `introduced_new_smells` → None
    - `coverage_decreased` → None
    - `tests_changed` → None
    - `tests_pass_rate_decreased` → None

#### 3. **Updated `execute_experiment.py`**: `_run_execution_phase_only()`
- Added import: `reset_experiment_execution_data`
- Detects when experiment was already executed
- Automatically calls `reset_experiment_execution_data()` to clean previous data
- Commits the cleanup before proceeding with re-execution

### What Gets Preserved
✅ **Preserved (NOT deleted)**:
- Experiment record
- `refactored_code` (Phase 1 data)
- `refactor_phase_completed` flag
- Study smell association
- Baseline smell association
- LLM metrics (tokens, latency)

❌ **Cleaned (deleted/reset)**:
- All `test_results` records
- Analysis flags (smell detection results)
- Test analysis flags
- `execution_phase_completed` flag

## Usage

### Single Experiment
```bash
# Re-execute a specific experiment (automatic cleanup)
execute_experiment --experiment-id 123 --phase execute
```

### Batch Experiments
```bash
# Re-execute ALL experiments for a strategy/model combo
batch_experiments 3 1 --phase execute --redo

# Re-execute with filters
batch_experiments 3 1 --phase execute --redo --limit 10
batch_experiments 3 1 --phase execute --redo --start-from 50
```

### How It Works
1. When re-executing an experiment that has `execution_phase_completed = True`
2. System automatically detects this and prints warning:
   ```
   ⚠️  Warning: Experiment #123 already executed. Cleaning previous data...
   ✓ Previous execution data cleaned successfully
   ```
3. Cleanup happens in a separate commit
4. Execution proceeds normally as if it's the first time
5. No UNIQUE constraint errors!

## Testing
A test script was created: `test_redo_functionality.py`

Run it to validate the implementation:
```bash
python test_redo_functionality.py
```

Expected output:
```
✅ SUCCESS: All checks passed!
📝 The experiment can now be re-executed without UNIQUE constraint errors
```

## Benefits
1. ✅ **No More Constraint Errors**: Automatic cleanup prevents UNIQUE violations
2. ✅ **Safe Re-execution**: Preserves refactored code, only cleans execution data
3. ✅ **Transparent**: Clear logging shows what's being cleaned
4. ✅ **Atomic**: Cleanup committed separately, so partial failures don't corrupt data
5. ✅ **Flexible**: Works for both single and batch re-execution

## Files Modified
- `llm-refactor-pipeline/src/llm_refactor/modules/database/crud.py`
  - Added `delete_test_results()`
  - Added `reset_experiment_execution_data()`
  
- `llm-refactor-pipeline/src/llm_refactor/modules/execute_experiment/execute_experiment.py`
  - Added import of `reset_experiment_execution_data`
  - Added automatic cleanup in `_run_execution_phase_only()`

## Files Created
- `test_redo_functionality.py` - Validation test script
- `REDO_IMPLEMENTATION.md` - This documentation

## Date
2026-02-21
