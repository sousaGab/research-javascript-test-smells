#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add Test Pass Rate Regression Column to Experiments Table.

This migration adds a new column to track test pass rate regressions:
- tests_pass_rate_decreased: BOOLEAN - True if test pass rate decreased after refactoring

Example:
- Baseline: 470/470 tests passed (100%)
- Refactored: 460/480 tests passed (95.8%)
- Result: tests_pass_rate_decreased = TRUE (regression detected)

This complements the existing coverage_decreased column but focuses on the
percentage of tests that pass rather than code coverage.

Usage:
    python add_test_pass_rate_regression_column.py
"""

import sqlite3
from pathlib import Path


def add_test_pass_rate_column():
    """Add tests_pass_rate_decreased column to experiments table."""
    # Database path
    db_path = Path(__file__).parent.parent / "research_data" / "research.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        print("   Please ensure the database exists before running this migration.")
        return False
    
    print(f"📊 Updating experiments table in: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(experiments)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'tests_pass_rate_decreased' in columns:
            print("   ⚠️  Column 'tests_pass_rate_decreased' already exists!")
            print("   Skipping migration (already applied).")
            conn.close()
            return True
        
        # Add new column
        print("   Adding column: tests_pass_rate_decreased (BOOLEAN)...")
        cursor.execute("""
            ALTER TABLE experiments 
            ADD COLUMN tests_pass_rate_decreased BOOLEAN
        """)
        
        conn.commit()
        
        # Verify column was added
        cursor.execute("PRAGMA table_info(experiments)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'tests_pass_rate_decreased' in columns:
            print(f"\n✅ Successfully added column 'tests_pass_rate_decreased'!")
            print(f"   Total columns in experiments table: {len(columns)}")
            
            # Show related columns for context
            print("\n   Related analysis columns:")
            if 'coverage_changed' in columns:
                print("   ✓ coverage_changed")
            if 'coverage_decreased' in columns:
                print("   ✓ coverage_decreased")
            if 'tests_changed' in columns:
                print("   ✓ tests_changed")
            print("   ✓ tests_pass_rate_decreased (NEW)")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 80)
    print("TEST PASS RATE REGRESSION COLUMN MIGRATION")
    print("=" * 80)
    print()
    print("This migration adds a new analysis column to detect when the percentage")
    print("of passing tests decreases after refactoring.")
    print()
    print("Calculation:")
    print("  pass_rate = tests_passed / tests_total")
    print("  tests_pass_rate_decreased = (refactored_rate < baseline_rate - 0.001)")
    print()
    
    success = add_test_pass_rate_column()
    
    print()
    print("=" * 80)
    if success:
        print("✅ Migration completed successfully!")
        print("\nNext steps:")
        print("  1. Update test_analyzer.py to calculate pass rate regression")
        print("  2. Update execute_experiment.py to save the new field")
        print("  3. Update models.py to include the column definition")
    else:
        print("❌ Migration failed!")
    print("=" * 80)
