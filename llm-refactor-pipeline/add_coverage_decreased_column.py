#!/usr/bin/env python3
"""
Migration script to add coverage_decreased column to experiments table.

This migration adds a new boolean field to track when test coverage decreases
after refactoring (i.e., coverage regression).

Usage:
    python3 add_coverage_decreased_column.py
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
    
    if 'coverage_decreased' in column_names:
        print("✓ Column 'coverage_decreased' already exists. No migration needed.")
    else:
        print("Adding 'coverage_decreased' column to experiments table...")
        
        # Add the column (nullable, default NULL)
        cursor.execute("""
            ALTER TABLE experiments 
            ADD COLUMN coverage_decreased BOOLEAN
        """)
        
        conn.commit()
        print("✓ Migration completed successfully!")
        print()
        print("Note: The column is initially NULL for all existing experiments.")
        print("When experiments are re-analyzed or new experiments run, this field will be populated.")
        print()
        print("To backfill existing experiments with coverage_decreased:")
        print("  1. Ensure test_summary.txt files exist in tests_output/ and dataset/")
        print("  2. The analyze_test_results() function will calculate coverage_decreased")
        print("  3. Run experiments through execution phase to populate this field")
    
except Exception as e:
    print(f"✗ Error during migration: {e}")
    conn.rollback()
    raise

finally:
    conn.close()
    print()
    print("Database connection closed.")
