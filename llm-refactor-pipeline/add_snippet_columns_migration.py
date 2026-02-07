#!/usr/bin/env python3
"""
Migration script to add snippet_start_line and snippet_end_line columns
to detected_smells, study_smells, and baseline_smell_detections tables.

Run this script to update your existing database schema.
"""

import sqlite3
from pathlib import Path


def migrate_database(db_path: Path):
    """Add snippet line columns to smell tables."""

    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return False

    print(f"🔧 Migrating database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    tables = ['detected_smells', 'baseline_smell_detections', 'study_smells']

    for table in tables:
        # Check if columns already exist
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [col[1] for col in cursor.fetchall()]

        if 'snippet_start_line' in columns and 'snippet_end_line' in columns:
            print(f"  ✓ {table}: columns already exist, skipping")
            continue

        try:
            # Add snippet_start_line column
            if 'snippet_start_line' not in columns:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN snippet_start_line INTEGER")
                print(f"  ✓ {table}: added snippet_start_line column")

            # Add snippet_end_line column
            if 'snippet_end_line' not in columns:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN snippet_end_line INTEGER")
                print(f"  ✓ {table}: added snippet_end_line column")

            conn.commit()
        except sqlite3.Error as e:
            print(f"  ❌ {table}: Error - {e}")
            conn.rollback()
            return False

    conn.close()
    print("✅ Migration completed successfully!")
    return True


def main():
    # Find database
    script_dir = Path(__file__).parent

    # Try common locations
    db_locations = [
        script_dir / "research_data" / "research.db",
        script_dir / "research.db",
        script_dir / "smell-selector-ui" / "research.db",
    ]

    db_path = None
    for location in db_locations:
        if location.exists():
            db_path = location
            break

    if not db_path:
        print("❌ Could not find research.db")
        print("\nSearched in:")
        for loc in db_locations:
            print(f"  - {loc}")
        print("\nPlease specify the database path:")
        user_path = input("Path: ").strip()
        db_path = Path(user_path)

    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return

    # Run migration
    migrate_database(db_path)


if __name__ == "__main__":
    main()
