# Database Cleanup Guide

## 🗑️ How to Clear the Database

There are multiple ways to clear/reset the database depending on what you want to keep.

---

## Option 1: Clear Only Smells (Keep Repositories) ⭐

**Recommended if you want to re-import smells but keep repository metadata.**

```bash
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db clear-smells --keep-repos
```

**What it deletes:**
- ❌ All detected_smells (9,682 smells)
- ❌ All study_smells
- ❌ All smell_ui_metadata
- ❌ All experiments
- ✅ Keeps repositories (12 repos)
- ✅ Keeps files metadata

**When to use:**
- You want to re-import smells from CSV
- You want to start fresh but keep repo metadata
- You're testing the import process

---

## Option 2: Clear Everything (Smells + Repos)

**Complete cleanup - removes all data.**

```bash
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db clear-smells
```

**What it deletes:**
- ❌ All detected_smells
- ❌ All study_smells
- ❌ All smell_ui_metadata
- ❌ All experiments
- ❌ All repositories
- ❌ All files

**When to use:**
- You want a completely fresh start
- You're switching to a different set of repositories
- You want to clean up test data

---

## Option 3: Recreate Database from Scratch

**Nuclear option - deletes the file and recreates schema.**

```bash
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db init --force
```

**What it does:**
- ❌ Deletes ALL tables and data
- ✅ Recreates empty database with correct schema
- ✅ Reapplies all migrations

**When to use:**
- Database is corrupted
- Schema needs to be reset
- You want guaranteed clean state

---

## Option 4: Manual File Deletion

**Direct file system approach.**

```bash
# 1. Backup first (optional)
cp research_data/research.db research_data/research.db.backup

# 2. Delete the database file
rm research_data/research.db

# 3. Recreate it
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> db init
```

---

## 📊 After Clearing: Re-import Data

After clearing the database, you'll want to import smells again:

```bash
# Import all smells from CSV files
llm-refactor> db import-smells

# Or import specific repository
llm-refactor> db import-smells --repo=redux-offline

# Validate the import
llm-refactor> db validate-import
```

---

## 🔍 Check Current Database State

Before clearing, check what you have:

```bash
llm-refactor> db stats
```

Output example:
```
Database Statistics
============================================================
Repositories: 12
Files: 514
Detected Smells: 9682
Study Smells: 0
Experiments: 0
Code Metrics: 0
Test Results: 0
AI Responses: 0
Smell Results: 0
```

---

## ⚠️ Important Notes

### Warning Messages

All destructive operations will show a warning:

```
⚠️  WARNING: This will permanently delete the data above!

Current data:
  Detected Smells: 9682
  Study Smells: 0
  Repositories: 12
  Files: 514
```

### No Undo

**There is NO undo!** Once data is deleted, it's gone forever unless you have a backup.

### Backup Strategy

If you want to be safe:

```bash
# Create backup
cp research_data/research.db research_data/research.db.backup-$(date +%Y%m%d)

# Clear database
# ... do your operations ...

# Restore if needed
cp research_data/research.db.backup-20260130 research_data/research.db
```

---

## 🎯 Common Scenarios

### Scenario 1: "I imported wrong data"

```bash
llm-refactor> db clear-smells --keep-repos
llm-refactor> db import-smells
```

### Scenario 2: "I want to test with different repositories"

```bash
llm-refactor> db clear-smells
llm-refactor> db import-smells --repo=my-new-repo
```

### Scenario 3: "Database seems corrupted"

```bash
# Backup first!
cp research_data/research.db research_data/research.db.backup

# Recreate
llm-refactor> db init --force
llm-refactor> db import-smells
```

### Scenario 4: "I want to reset my selections"

```bash
# Just clear study_smells, keep detected_smells
sqlite3 research_data/research.db "DELETE FROM study_smells;"
sqlite3 research_data/research.db "DELETE FROM smell_ui_metadata;"
```

---

## 🔧 Direct SQL Commands

If you prefer SQL:

### Clear only smells
```bash
sqlite3 research_data/research.db << EOF
DELETE FROM smell_ui_metadata;
DELETE FROM study_smells;
DELETE FROM detected_smells;
EOF
```

### Clear everything
```bash
sqlite3 research_data/research.db << EOF
DELETE FROM smell_ui_metadata;
DELETE FROM experiments;
DELETE FROM study_smells;
DELETE FROM detected_smells;
DELETE FROM files;
DELETE FROM repositories;
EOF
```

### Check what's in database
```bash
sqlite3 research_data/research.db << EOF
SELECT 'Repositories:', COUNT(*) FROM repositories;
SELECT 'Files:', COUNT(*) FROM files;
SELECT 'Detected Smells:', COUNT(*) FROM detected_smells;
SELECT 'Study Smells:', COUNT(*) FROM study_smells;
EOF
```

---

## 📝 Command Reference

| Command | What it Does | Keeps Repos? |
|---------|-------------|--------------|
| `db clear-smells --keep-repos` | Clear smells only | ✅ Yes |
| `db clear-smells` | Clear smells + repos | ❌ No |
| `db init --force` | Recreate database | ❌ No |
| `rm research.db` + `db init` | Delete file + recreate | ❌ No |

---

## ✅ Verification

After clearing, verify:

```bash
# Check stats
llm-refactor> db stats

# Expected output after full clear:
# Repositories: 0
# Files: 0
# Detected Smells: 0
# Study Smells: 0

# Check database size
llm-refactor> db status

# Expected: Size should be very small (~0.1 MB)
```

---

## 🚨 Troubleshooting

### "Database is locked"

```bash
# Stop all applications using the database
# Kill backend if running
lsof -ti:8001 | xargs kill -9

# Try again
llm-refactor> db clear-smells
```

### "Foreign key constraint failed"

The `clear-smells` command handles this automatically by deleting in correct order:
1. smell_ui_metadata
2. experiments
3. study_smells
4. detected_smells
5. files (if not keeping repos)
6. repositories (if not keeping repos)

### "Cannot find database"

```bash
# Check if database exists
ls -la research_data/research.db

# If not, create it
llm-refactor> db init
```

---

## 💡 Best Practices

1. **Always backup before destructive operations**
   ```bash
   cp research_data/research.db research_data/research.db.backup
   ```

2. **Use `--keep-repos` when testing imports**
   - Faster re-import
   - Preserves repository metadata

3. **Validate after import**
   ```bash
   llm-refactor> db import-smells
   llm-refactor> db validate-import
   ```

4. **Keep timestamped backups**
   ```bash
   cp research_data/research.db backups/research-$(date +%Y%m%d-%H%M%S).db
   ```

---

## 📞 Need Help?

Check current state:
```bash
llm-refactor> db status
llm-refactor> db stats
```

Get command help:
```bash
llm-refactor> db help
```

---

**Remember:** Always backup important data before clearing! 🔒
