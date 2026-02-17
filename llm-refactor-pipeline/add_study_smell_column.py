#!/usr/bin/env python3
"""
Migration script to add study_smell_id column to experiments table.

This migration allows experiments to reference study_smells directly,
which makes more sense than referencing baseline_smell_detections.
"""

import sqlite3
from pathlib import Path

# Get database path
project_root = Path(__file__).parent.parent
db_path = project_root / "research_data" / "research.db"

print(f"Connecting to database: {db_path}")

# Connect to database
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(experiments)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    if 'study_smell_id' in column_names:
        print("✓ Column 'study_smell_id' already exists. No migration needed.")
    else:
        print("Adding 'study_smell_id' column to experiments table...")
        
        # Add the column (nullable initially)
        cursor.execute("""
            ALTER TABLE experiments 
            ADD COLUMN study_smell_id INTEGER 
            REFERENCES study_smells(id) ON DELETE CASCADE
        """)
        
        # Also make baseline_smell_id nullable since we're moving to study_smell_id
        # Note: SQLite doesn't support ALTER COLUMN, so we document this instead
        print("✓ Added study_smell_id column")
        print("⚠ Note: baseline_smell_id remains NOT NULL for existing data compatibility")
        print("   New experiments should use study_smell_id instead")
        
        conn.commit()
        print("✓ Migration completed successfully!")
        
        # Verify the change
        cursor.execute("PRAGMA table_info(experiments)")
        columns = cursor.fetchall()
        for col in columns:
            if 'smell' in col[1]:
                print(f"  - {col[1]}: {col[2]} (NOT NULL={col[3]==1})")
    
except sqlite3.Error as e:
    print(f"✗ Migration failed: {e}")
    conn.rollback()
    raise
finally:
    conn.close()
    print("\nDatabase connection closed.")
