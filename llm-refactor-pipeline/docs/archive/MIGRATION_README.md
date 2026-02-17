# Database Migration: Add Snippet Line Numbers

This migration adds `snippet_start_line` and `snippet_end_line` columns to track where test methods are located in the source code.

## What This Fixes

Previously, code snippets in the UI showed line numbers starting from 1, instead of showing the actual line numbers from the source file where the method exists.

**Example:**
- Before: Code snippet shows lines 1, 2, 3, 4...
- After: Code snippet shows lines 45, 46, 47, 48... (actual file line numbers)

## Tables Modified

The migration adds two new columns to these tables:
- `detected_smells`
- `study_smells`
- `baseline_smell_detections`

New columns:
- `snippet_start_line` (INTEGER) - Line where the test method starts
- `snippet_end_line` (INTEGER) - Line where the test method ends

## How to Run

### Option 1: Auto-detect database location (recommended)

```bash
cd llm-refactor-pipeline
python add_snippet_columns_migration.py
```

The script will:
1. Try to import `ResearchDB` to find the default database location
2. Fall back to searching common locations if import fails
3. Ask you to provide the path if it can't find the database

### Option 2: Specify database path manually

```bash
python add_snippet_columns_migration.py --db-path=/path/to/research.db
```

### Option 3: Interactive mode

If the script can't find the database, it will prompt you:

```
❌ Could not find research.db

💡 Options:
   1. Specify path: python add_snippet_columns_migration.py --db-path=/path/to/research.db
   2. Enter path now:
   Database path: _
```

Simply type or paste the full path to your `research.db` file.

## After Migration

### Re-detect Smells

To populate the new columns with data, you need to re-run smell detection:

```bash
# From the CLI tool
/analyze-smells <repository-name>
```

This will:
1. Detect smells with Steel/SNUTS
2. Extract method locations using `extract_method.js`
3. Save method start/end lines in the CSV
4. Import to database with the new columns populated

### Re-import Existing Data

If you want to re-import existing CSV files:

```bash
# Clear and re-import
db clean --yes
db import-smells
```

**Note:** This will only work if your CSV files already have `methodStart` and `methodEnd` columns. If not, you'll need to re-run smell detection.

## Troubleshooting

### "Could not find research.db"

The database might be in a non-standard location. Options:

1. **Find your database:**
   ```bash
   find ~ -name "research.db" 2>/dev/null
   ```

2. **Use the path flag:**
   ```bash
   python add_snippet_columns_migration.py --db-path=/found/path/research.db
   ```

### "Could not import ResearchDB"

This is normal if running from outside the project structure. The script will fall back to searching common locations. You can ignore this warning.

### "Columns already exist"

The migration has already been run. Output will show:

```
  ✓ detected_smells: columns already exist, skipping
  ✓ study_smells: columns already exist, skipping
  ✓ baseline_smell_detections: columns already exist, skipping
```

This is safe and means your database is already up to date.

## Verification

After running the migration, verify the columns exist:

```bash
sqlite3 /path/to/research.db "PRAGMA table_info(detected_smells);"
```

You should see `snippet_start_line` and `snippet_end_line` in the output.

## Need Help?

If you encounter issues:

1. Check that you have write permissions for the database file
2. Ensure the database is not open in another application
3. Make sure you're using Python 3.6+
4. Try specifying the full path with `--db-path`
