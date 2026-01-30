# Database Schema Synchronization Guide

## Problem

The ORM models (SQLAlchemy) can get out of sync with the actual database schema. This causes runtime errors like:

```
sqlite3.OperationalError: no such column: experiments.study_smell_id
```

## Solution

This project now includes tools to **detect** and **fix** schema mismatches.

---

## Quick Fix

If you encounter schema errors, run:

```bash
cd llm-refactor-pipeline
python -m llm_refactor

llm-refactor> db validate-schema
```

This will show you exactly what's different between ORM and database.

---

## How to Keep ORM in Sync

### Option 1: Validate Before Running (Recommended)

Always run validation when you start working:

```bash
llm-refactor> db validate-schema
```

If it fails, update `models.py` to match the real schema.

### Option 2: Use SQL Directly (When in Doubt)

Commands like `db clean` now use raw SQL instead of ORM queries, making them more robust:

```python
# Old way (breaks if schema changes)
session.query(Experiment).delete()

# New way (always works)
session.execute(text("DELETE FROM experiments"))
```

---

## Schema Validation Commands

### Check if ORM matches database

```bash
llm-refactor> db validate-schema
```

**Output if valid:**
```
✓ Schema validation passed: ORM models match database schema
```

**Output if invalid:**
```
✗ Schema validation failed!
============================================================

Issues found:
1. Table 'experiments': Columns in ORM but missing in DB: study_smell_id
2. Table 'experiments': Columns in DB but not in ORM: baseline_smell_id

============================================================
Recommendations:
1. Update ORM models in models.py to match database schema
2. Or run database migration to update schema
3. Check git history to see when schema diverged
```

---

## How Schema Got Out of Sync

### What Happened

1. **Database was created** with `baseline_smell_id` column
2. **ORM models.py** still had old `study_smell_id` column
3. **ORM queries failed** because column didn't exist

### Why It Happened

- Database schema was updated directly (via migrations or manual SQL)
- `models.py` wasn't updated to reflect changes
- No validation was run to catch the mismatch

---

## Preventing Future Issues

### 1. Always Validate After Schema Changes

After modifying the database:

```bash
llm-refactor> db validate-schema
```

### 2. Keep models.py in Sync

When you change database schema, **immediately** update `models.py`.

**Example:** If you rename a column in the database:

```sql
-- Database change
ALTER TABLE experiments RENAME COLUMN study_smell_id TO baseline_smell_id;
```

**Update models.py immediately:**

```python
# OLD
class Experiment(Base):
    study_smell_id = Column(Integer, ForeignKey('study_smells.id'))

# NEW
class Experiment(Base):
    baseline_smell_id = Column(Integer, ForeignKey('baseline_smell_detections.id'))
```

### 3. Use Type Hints

Add type hints to catch errors early:

```python
from typing import Optional

def get_experiment(session: Session, exp_id: int) -> Optional[Experiment]:
    return session.query(Experiment).get(exp_id)
```

### 4. Write Tests

Test critical queries:

```python
def test_experiment_query():
    session = get_session()
    exp = session.query(Experiment).first()
    assert hasattr(exp, 'baseline_smell_id')  # Catches schema mismatches
```

---

## Current Schema Status

As of **2026-02-02**, the schema is now **synchronized**:

### Key Changes Made

1. **Added `BaselineSmellDetections` model** to match `baseline_smell_detections` table
2. **Updated `Experiment` model**:
   - Changed `study_smell_id` → `baseline_smell_id`
   - Changed relationship `study_smell` → `baseline_smell`
3. **Updated `File` model** to include `baseline_smell_detections` relationship
4. **Made `db clean` robust** by using raw SQL instead of ORM queries

### Current Tables

```
✓ schema_version
✓ repositories
✓ files
✓ detected_smells
✓ baseline_smell_detections  ← Added to ORM
✓ study_smells
✓ experiments  ← Fixed column name
✓ smell_detection_results
✓ code_metrics
✓ test_results
✓ ai_responses
✓ smell_ui_metadata
```

---

## Troubleshooting

### Error: "no such column: X.Y"

**Cause:** ORM model has column `Y` but database table `X` doesn't.

**Fix:**
1. Run `db validate-schema` to see mismatch
2. Update `models.py` to match real schema
3. Restart Python shell to reload models

### Error: "no such table: X"

**Cause:** ORM references table `X` but it doesn't exist in database.

**Fix:**
1. Check if table name is correct (typo?)
2. Run `db status` to see existing tables
3. Either create the table or remove from ORM

### ORM query returns empty results

**Cause:** Might be using wrong table/column names.

**Fix:**
1. Run `db validate-schema` to check
2. Inspect database directly: `sqlite3 research_data/research.db ".schema"`
3. Compare with `models.py`

---

## Best Practices

### ✅ DO

- Run `db validate-schema` when you start working
- Use raw SQL for administrative commands (`DELETE`, `TRUNCATE`, etc.)
- Update `models.py` immediately after schema changes
- Test queries after modifying models
- Document schema changes in commit messages

### ❌ DON'T

- Modify database schema without updating `models.py`
- Assume ORM is always correct
- Skip validation after pulling new code
- Use ORM for operations that should always work (like cleanup)

---

## Tools Reference

### Validation

```bash
db validate-schema          # Check ORM matches database
```

### Database Info

```bash
db status                   # Database file status
db stats                    # Record counts
```

### Schema Management

```bash
db init --force             # Recreate database from ORM models
db clean --yes              # Delete all data (uses raw SQL)
```

---

## Migration Strategy

For future schema changes, follow this process:

1. **Plan the change**
   - Document what needs to change and why

2. **Update database**
   - Create migration SQL script
   - Apply to database

3. **Update ORM immediately**
   - Modify `models.py` to match new schema
   - Update relationships

4. **Validate**
   ```bash
   db validate-schema
   ```

5. **Test**
   - Run queries to ensure they work
   - Check existing data still accessible

6. **Commit together**
   - Commit migration SQL + models.py changes together
   - Never commit one without the other

---

## Summary

- **Problem**: ORM and database got out of sync
- **Solution**: Added validation tools and fixed mismatches
- **Prevention**: Always validate, update models immediately, use raw SQL for admin tasks
- **Tools**: `db validate-schema` command now available

**The database is now properly synchronized and future mismatches will be caught early!**
