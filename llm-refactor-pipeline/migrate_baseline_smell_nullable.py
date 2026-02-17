#!/usr/bin/env python3
"""
Migration script to make baseline_smell_id nullable in experiments table.

SQLite doesn't support ALTER COLUMN, so we need to recreate the table.
"""

import sqlite3
from pathlib import Path

# Get database path
project_root = Path(__file__).parent.parent
db_path = project_root / "research_data" / "research.db"

print(f"Connecting to database: {db_path}")

# Connect to database
conn = sqlite3.connect(str(db_path))
conn.execute("PRAGMA foreign_keys=OFF")
cursor = conn.cursor()

try:
    print("\n🔄 Starting migration to make baseline_smell_id nullable...")
    
    # Step 1: Create new table with correct schema
    print("  [1/6] Creating new experiments table...")
    cursor.execute("""
        CREATE TABLE experiments_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_smell_id INTEGER REFERENCES study_smells(id) ON DELETE CASCADE,
            baseline_smell_id INTEGER REFERENCES baseline_smell_detections(id) ON DELETE CASCADE,
            file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
            experiment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- AI Tool Configuration
            ai_tool TEXT NOT NULL,
            ai_model_version TEXT,
            prompting_approach TEXT,
            prompt_text TEXT,
            
            -- Code States
            original_code TEXT NOT NULL,
            refactored_code TEXT,
            original_method TEXT,
            refactored_method TEXT,
            
            -- Outcomes
            refactoring_completed BOOLEAN DEFAULT FALSE,
            smell_removed BOOLEAN DEFAULT FALSE,
            introduced_new_smells BOOLEAN DEFAULT FALSE,
            tests_still_passing BOOLEAN,
            
            -- Performance
            execution_time_seconds REAL,
            tokens_used INTEGER,
            
            -- Notes
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Step 2: Copy data from old table to new table
    print("  [2/6] Copying existing data...")
    cursor.execute("""
        INSERT INTO experiments_new 
        SELECT * FROM experiments
    """)
    
    # Step 3: Drop old table
    print("  [3/6] Dropping old table...")
    cursor.execute("DROP TABLE experiments")
    
    # Step 4: Rename new table
    print("  [4/6] Renaming new table...")
    cursor.execute("ALTER TABLE experiments_new RENAME TO experiments")
    
    # Step 5: Recreate indexes
    print("  [5/6] Recreating indexes...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_experiments_baseline ON experiments(baseline_smell_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_experiments_study_smell ON experiments(study_smell_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_experiments_file ON experiments(file_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_experiments_date ON experiments(experiment_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_experiments_ai_tool ON experiments(ai_tool)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_experiments_smell_removed ON experiments(smell_removed)")
    
    # Step 6: Commit changes
    print("  [6/6] Committing changes...")
    conn.commit()
    conn.execute("PRAGMA foreign_keys=ON")
    
    print("\n✓ Migration completed successfully!")
    
    # Verify the change
    cursor.execute("PRAGMA table_info(experiments)")
    columns = cursor.fetchall()
    print("\n📊 Updated schema:")
    for col in columns:
        if 'smell' in col[1]:
            nullable = "NULL" if col[3] == 0 else "NOT NULL"
            print(f"  - {col[1]}: {col[2]} ({nullable})")
    
    # Count experiments
    cursor.execute("SELECT COUNT(*) FROM experiments")
    count = cursor.fetchone()[0]
    print(f"\n✓ Verified: {count} experiment(s) preserved")
    
except sqlite3.Error as e:
    print(f"\n✗ Migration failed: {e}")
    conn.rollback()
    raise
finally:
    conn.close()
    print("\nDatabase connection closed.")
