#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Database Migration: Add repository_baseline_test_results Table

This migration adds a new table to store baseline test results once per repository,
avoiding duplication of baseline data across multiple experiments.

Changes:
- Adds repository_baseline_test_results table
- Adds index on repository_id
- Optionally migrates existing 'before' phase data from test_results table

Usage:
    python add_repository_baseline_tests_table.py [--backfill]
    
    --backfill: Optionally migrate existing test_results (phase='before') to new table
"""

import sys
import sqlite3
from pathlib import Path
from datetime import datetime


def get_database_path():
    """Get the path to the research database."""
    script_dir = Path(__file__).parent
    db_path = script_dir.parent / "research_data" / "research.db"
    return db_path


def create_table(conn):
    """Create the repository_baseline_test_results table."""
    cursor = conn.cursor()
    
    # Check if table already exists
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='repository_baseline_test_results'
    """)
    
    if cursor.fetchone():
        print("Table 'repository_baseline_test_results' already exists")
        return False
    
    # Create table
    print("Creating 'repository_baseline_test_results' table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS repository_baseline_test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,

            -- Test Execution Summary
            test_suites_passed INTEGER,
            test_suites_failed INTEGER,
            test_suites_total INTEGER,
            tests_passed INTEGER,
            tests_failed INTEGER,
            tests_total INTEGER,
            snapshots_total INTEGER,
            execution_time_seconds REAL,

            -- Code Coverage
            coverage_statements REAL,
            coverage_branches REAL,
            coverage_functions REAL,
            coverage_lines REAL,

            -- Overall Status
            all_tests_passed BOOLEAN,

            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(repository_id)
        )
    """)
    
    # Create index
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_repo_baseline_tests_repo 
        ON repository_baseline_test_results(repository_id)
    """)
    
    conn.commit()
    print("[OK] Table created successfully")
    return True


def backfill_data(conn):
    """
    Backfill baseline data from test_results table.
    
    Migrates test_results with phase='before' to repository_baseline_test_results.
    Keeps only the most recent baseline per repository.
    """
    cursor = conn.cursor()
    
    print("\nBackfilling baseline test results...")
    
    # Query existing 'before' phase test results grouped by repository
    cursor.execute("""
        SELECT 
            f.repository_id,
            tr.test_suites_passed,
            tr.test_suites_failed,
            tr.test_suites_total,
            tr.tests_passed,
            tr.tests_failed,
            tr.tests_total,
            tr.snapshots_total,
            tr.execution_time_seconds,
            tr.coverage_statements,
            tr.coverage_branches,
            tr.coverage_functions,
            tr.coverage_lines,
            tr.all_tests_passed,
            tr.executed_at,
            COUNT(*) as count
        FROM test_results tr
        JOIN experiments e ON e.id = tr.experiment_id
        JOIN files f ON f.id = e.file_id
        WHERE tr.phase = 'before'
        GROUP BY f.repository_id
        ORDER BY tr.executed_at DESC
    """)
    
    before_results = cursor.fetchall()
    
    if not before_results:
        print("  No 'before' phase test results found to migrate")
        return 0
    
    print("  Found {} repositories with 'before' phase data".format(len(before_results)))
    
    migrated = 0
    for row in before_results:
        repository_id = row[0]
        
        # Check if baseline already exists for this repository
        cursor.execute("""
            SELECT id FROM repository_baseline_test_results 
            WHERE repository_id = ?
        """, (repository_id,))
        
        if cursor.fetchone():
            print("  [SKIP] repository_id={} (baseline already exists)".format(repository_id))
            continue
        
        # Insert baseline
        cursor.execute("""
            INSERT INTO repository_baseline_test_results (
                repository_id,
                test_suites_passed,
                test_suites_failed,
                test_suites_total,
                tests_passed,
                tests_failed,
                tests_total,
                snapshots_total,
                execution_time_seconds,
                coverage_statements,
                coverage_branches,
                coverage_functions,
                coverage_lines,
                all_tests_passed,
                executed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, row[:15])
        
        migrated += 1
        print("  [OK] Migrated baseline for repository_id={}".format(repository_id))
    
    conn.commit()
    print("\n[OK] Migrated {} repository baselines".format(migrated))
    return migrated


def main():
    """Run the migration."""
    print("=" * 70)
    print("DATABASE MIGRATION: Add repository_baseline_test_results Table")
    print("=" * 70)
    print()
    
    # Check for backfill flag
    do_backfill = '--backfill' in sys.argv
    
    # Get database path
    db_path = get_database_path()
    
    if not db_path.exists():
        print("[ERROR] Database not found at {}".format(db_path))
        print("   Make sure you're running this from the llm-refactor-pipeline directory")
        return 1
    
    print("Database: {}".format(db_path))
    print()
    
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        
        # Create table
        table_created = create_table(conn)
        
        # Backfill data if requested and table was created
        if do_backfill:
            if not table_created:
                print("\n[INFO] Table already exists. Backfill may still process if data is missing.")
            backfill_data(conn)
        else:
            print("\n[INFO] Skipping backfill (use --backfill flag to migrate existing data)")
        
        # Close connection
        conn.close()
        
        print("\n" + "=" * 70)
        print("[SUCCESS] Migration completed successfully!")
        print("=" * 70)
        
        return 0
        
    except sqlite3.Error as e:
        print("\n[ERROR] Database error: {}".format(e))
        return 1
    except Exception as e:
        print("\n[ERROR] Unexpected error: {}".format(e))
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
