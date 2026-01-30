# Schema Synchronization - Fix Summary

## What Was Fixed

### Problem
The ORM models were out of sync with the actual database schema, causing errors like:
```
sqlite3.OperationalError: no such column: experiments.study_smell_id
```

### Root Cause
- Database had `baseline_smell_id` column in `experiments` table
- ORM models had `study_smell_id` instead
- Missing `BaselineSmellDetections` model in ORM
- Missing `SmellUIMetadata` model in ORM

---

## Changes Made

### 1. Updated ORM Models (`models.py`)

#### Added Missing Model: `BaselineSmellDetections`
```python
class BaselineSmellDetections(Base):
    """Baseline smell detections used as starting point for experiments."""
    __tablename__ = 'baseline_smell_detections'
    # ... columns and relationships
```

#### Added Missing Model: `SmellUIMetadata`
```python
class SmellUIMetadata(Base):
    """UI metadata for smell selection and management."""
    __tablename__ = 'smell_ui_metadata'
    # ... columns for annotations, priority, tags, status
```

#### Fixed `Experiment` Model
**Before:**
```python
study_smell_id = Column(Integer, ForeignKey('study_smells.id'))
study_smell = relationship("StudySmells")
```

**After:**
```python
baseline_smell_id = Column(Integer, ForeignKey('baseline_smell_detections.id'))
baseline_smell = relationship("BaselineSmellDetections")
```

#### Updated `File` Model
Added relationship to baseline smell detections:
```python
baseline_smell_detections = relationship("BaselineSmellDetections", ...)
```

---

### 2. Made Database Commands Robust

#### Refactored `db clean` Command
**Before:** Used ORM queries (breaks on schema mismatch)
```python
session.query(Experiment).delete()  # ❌ Fails if columns don't match
```

**After:** Uses raw SQL (always works)
```python
session.execute(text("DELETE FROM experiments"))  # ✓ Always works
```

**Benefits:**
- Works even if ORM is out of sync
- More predictable behavior
- Safer for administrative operations

---

### 3. Added Schema Validation Tools

#### New Command: `db validate-schema`
Checks if ORM models match database schema:

```bash
llm-refactor> db validate-schema
✓ Schema validation passed: ORM models match database schema
```

Or if there are issues:
```bash
llm-refactor> db validate-schema
✗ Schema validation failed!

Issues found:
1. Table 'experiments': Columns in ORM but missing in DB: study_smell_id
2. Table 'experiments': Columns in DB but not in ORM: baseline_smell_id
```

#### Created Validation Module: `schema_validator.py`
- Compares database tables with ORM models
- Checks table names
- Checks column names and types
- Provides detailed mismatch reports

#### Created Sync Module: `schema_sync.py`
- Can generate ORM code from database schema
- Useful for large schema changes
- Auto-detects types and relationships

---

## Testing Results

### Before Fix
```bash
llm-refactor> db clean
✗ Error: no such column: experiments.study_smell_id
```

### After Fix
```bash
llm-refactor> db validate-schema
✓ Schema validation passed: ORM models match database schema

llm-refactor> db clean
DATABASE CLEAN - COMPLETE RESET
============================================================
Current database contents:
  Repositories: 12
  Files: 514
  Detected Smells: 9682
  ...
To confirm this action, run:
  db clean --yes

llm-refactor> db clean --yes
✓ DATABASE COMPLETELY CLEANED
Deleted 10,208 total records from 11 tables.
```

---

## New Commands Available

### Validation
```bash
db validate-schema          # Check if ORM matches database
```

### Database Management
```bash
db clean [--yes]            # Clean ALL data (uses raw SQL)
db clear-smells [--keep]    # Clear smells only
db status                   # Database status
db stats                    # Record counts
```

---

## Documentation Created

1. **DATABASE_SCHEMA_SYNC.md** - Complete guide on schema synchronization
2. **SCHEMA_FIX_SUMMARY.md** - This file, summarizing the fix
3. **schema_validator.py** - Validation utilities
4. **schema_sync.py** - Schema synchronization utilities

---

## How to Use

### 1. Before Starting Work
Always validate schema:
```bash
llm-refactor> db validate-schema
```

### 2. If Schema Issues Found
Update `models.py` to match database, or vice versa.

### 3. For Database Operations
Use the robust commands:
```bash
db clean --yes              # Complete reset
db clear-smells --keep-repos  # Partial cleanup
```

---

## Prevention Strategy

### ✅ DO
1. Run `db validate-schema` when starting work
2. Update `models.py` immediately after schema changes
3. Commit schema changes and model updates together
4. Use raw SQL for administrative operations

### ❌ DON'T
1. Modify database without updating models
2. Assume ORM is always correct
3. Skip validation after pulling new code

---

## Impact

### What Works Now
- ✅ `db clean` command works correctly
- ✅ `db clear-smells` works correctly
- ✅ All ORM queries use correct column names
- ✅ Schema validation detects mismatches early
- ✅ All database commands are robust to schema changes

### What's Protected
- ✅ Future schema changes will be caught by validation
- ✅ Administrative commands won't break on schema issues
- ✅ Clear error messages guide fixing problems

---

## Summary

**Fixed:** ORM models now match database schema exactly
**Added:** Schema validation to catch future issues
**Improved:** Database commands now use robust SQL
**Documented:** Complete guides on maintaining sync

**Result:** Database operations work correctly and future schema issues will be caught early!

---

## Quick Reference

```bash
# Validate schema
db validate-schema

# Clean database (preview)
db clean

# Clean database (execute)
db clean --yes

# Check database status
db status
db stats

# Get help
db help
```

---

**Date:** 2026-02-02
**Status:** ✅ All issues resolved, schema synchronized
