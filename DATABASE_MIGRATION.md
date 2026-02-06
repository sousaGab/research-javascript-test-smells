# Database Migration Guide

## Overview

This guide explains how to migrate existing databases to the latest schema version, specifically addressing the UNIQUE constraint requirement for the `smell_ui_metadata` table.

## What Changed

### Version 1.0.0 → 1.1.0

**Added**: UNIQUE constraint on `smell_ui_metadata.detected_smell_id`

**Why**: The FastAPI backend uses SQLite's `ON CONFLICT` clause for upsert operations (insert or update). This requires a UNIQUE constraint or PRIMARY KEY to identify conflicts.

**Impact**: Without this constraint, smell selection fails with:
```
sqlite3.OperationalError: ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE constraint
```

## Migration Options

### Option 1: Fix Existing Database (Recommended)

**Preserves all data** - Use this if you have important data in your database.

```bash
# Navigate to project root
cd research-javascript-test-smells

# Backup your database first
cp research_data/research.db research_data/research.db.backup

# Add the missing constraint
sqlite3 research_data/research.db <<EOF
CREATE UNIQUE INDEX IF NOT EXISTS uq_ui_metadata_smell
ON smell_ui_metadata(detected_smell_id);
EOF

# Verify the fix
sqlite3 research_data/research.db ".schema smell_ui_metadata"
```

**Expected output:**
```sql
CREATE TABLE smell_ui_metadata (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    detected_smell_id INTEGER NOT NULL REFERENCES detected_smells(id) ON DELETE CASCADE,
    annotations TEXT,
    priority INTEGER DEFAULT 0,
    tags TEXT,
    ui_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_ui_metadata_smell ON smell_ui_metadata(detected_smell_id);
```

### Option 2: Recreate Database from Scratch

**Deletes all data** - Only use if you can re-import your data or don't need existing data.

```bash
# Navigate to project root
cd research-javascript-test-smells

# Backup old database (optional)
mv research_data/research.db research_data/research.db.old

# Activate Python environment
source .venv/bin/activate

# Start CLI
cd llm-refactor-pipeline
python -m llm_refactor

# Inside the CLI
llm-refactor> db
# Select option to recreate database
```

This will create a fresh database with the correct schema.

### Option 3: Manual Table Recreation

**Advanced** - For situations where you need precise control over data migration.

```bash
sqlite3 research_data/research.db
```

```sql
-- Start transaction
BEGIN TRANSACTION;

-- Create new table with correct schema
CREATE TABLE smell_ui_metadata_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detected_smell_id INTEGER NOT NULL REFERENCES detected_smells(id) ON DELETE CASCADE,
    annotations TEXT,
    priority INTEGER DEFAULT 0,
    tags TEXT,
    ui_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(detected_smell_id)
);

-- Copy data from old table
INSERT INTO smell_ui_metadata_new
SELECT * FROM smell_ui_metadata;

-- Drop old table
DROP TABLE smell_ui_metadata;

-- Rename new table
ALTER TABLE smell_ui_metadata_new RENAME TO smell_ui_metadata;

-- Commit transaction
COMMIT;

-- Verify
.schema smell_ui_metadata
```

## Verification Steps

After migration, verify everything works:

### 1. Check Schema

```bash
sqlite3 research_data/research.db ".schema smell_ui_metadata"
```

Should include either:
- `UNIQUE(detected_smell_id)` in the CREATE TABLE statement, OR
- `CREATE UNIQUE INDEX uq_ui_metadata_smell ON smell_ui_metadata(detected_smell_id);`

### 2. Check Constraint Works

```bash
sqlite3 research_data/research.db
```

```sql
-- Try to insert duplicate (should fail)
INSERT INTO smell_ui_metadata (detected_smell_id, priority) VALUES (1, 0);
INSERT INTO smell_ui_metadata (detected_smell_id, priority) VALUES (1, 1);
-- Second insert should fail with: UNIQUE constraint failed

-- Clean up test
DELETE FROM smell_ui_metadata WHERE detected_smell_id = 1;
```

### 3. Test UI Selection

```bash
# Start the UI
cd smell-selector-ui
./start.sh

# Open browser to http://localhost:5173
# Try selecting a smell
# Should work without errors
```

## For New Databases

If you're creating a new database from scratch, the correct schema is automatically applied. Just ensure you're using the latest code:

```bash
# Activate environment
source .venv/bin/activate

# Initialize database (automatically uses correct schema)
cd llm-refactor-pipeline
python -m llm_refactor

llm-refactor> db
# Choose "Initialize new database"
```

## Database Shared Across Systems

If your database is used on multiple computers:

### System A (Primary - has write access)

```bash
# Apply migration
sqlite3 research_data/research.db <<EOF
CREATE UNIQUE INDEX IF NOT EXISTS uq_ui_metadata_smell
ON smell_ui_metadata(detected_smell_id);
EOF

# Sync database to shared location
# (example: rsync, git-lfs, cloud storage, etc.)
```

### System B, C, etc. (Read/Write)

```bash
# Pull latest database from shared location
# No additional migration needed - constraint is already applied
```

## Troubleshooting

### Error: "UNIQUE constraint failed"

**Symptom**: After adding the constraint, you get UNIQUE constraint errors.

**Cause**: Existing duplicate records in the table.

**Solution**:
```sql
-- Find duplicates
SELECT detected_smell_id, COUNT(*)
FROM smell_ui_metadata
GROUP BY detected_smell_id
HAVING COUNT(*) > 1;

-- Keep only the most recent record for each smell
DELETE FROM smell_ui_metadata
WHERE id NOT IN (
    SELECT MAX(id)
    FROM smell_ui_metadata
    GROUP BY detected_smell_id
);

-- Now add the constraint
CREATE UNIQUE INDEX uq_ui_metadata_smell
ON smell_ui_metadata(detected_smell_id);
```

### Error: "database is locked"

**Cause**: Another process is using the database.

**Solution**:
```bash
# Stop all services
cd smell-selector-ui
# Press Ctrl+C to stop backend/frontend

# Wait a moment, then try migration again
```

### Constraint Still Missing After Migration

**Verify the migration was successful**:
```bash
sqlite3 research_data/research.db
> .indexes smell_ui_metadata
> .quit
```

Should show: `uq_ui_metadata_smell`

If not shown:
- Check you're editing the correct database file
- Check file permissions (should be writable)
- Try manual recreation (Option 3)

## Best Practices

1. **Always backup before migration**
   ```bash
   cp research_data/research.db research_data/research.db.backup
   ```

2. **Test on a copy first** (if possible)
   ```bash
   cp research_data/research.db test.db
   sqlite3 test.db "CREATE UNIQUE INDEX..."
   # Test with UI
   # If successful, apply to production
   ```

3. **Verify schema version**
   ```bash
   sqlite3 research_data/research.db "SELECT * FROM schema_version;"
   ```

4. **Document custom changes** - If you make manual modifications, document them for your team.

## Future Migrations

When new schema changes are introduced:

1. Check `CHANGELOG.md` or `DATABASE_SCHEMA_SYNC.md`
2. Review migration guide for that version
3. Backup database
4. Apply migration
5. Verify with tests

## Support

If you encounter issues:

1. Check the error message carefully
2. Review this guide's Troubleshooting section
3. Check `README.md` Troubleshooting sections
4. Restore from backup and try again
5. Create an issue with:
   - Error message
   - Steps you followed
   - Database schema output (`.schema smell_ui_metadata`)

---

**Last Updated**: 2025-02-06
**Schema Version**: 1.1.0
