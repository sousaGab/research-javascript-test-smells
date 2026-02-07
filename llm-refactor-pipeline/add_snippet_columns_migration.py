#!/usr/bin/env python3
"""
Migration script to add snippet_start_line and snippet_end_line columns
to detected_smells, study_smells, and baseline_smell_detections tables.

Run this script to update your existing database schema.

Usage:
    python add_snippet_columns_migration.py
    python add_snippet_columns_migration.py --db-path=/path/to/research.db
"""

import sqlite3
import sys
import argparse
from pathlib import Path

# Add src directory to path to import ResearchDB
sys.path.insert(0, str(Path(__file__).parent / "src"))


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
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Migrate database to add snippet line columns',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python add_snippet_columns_migration.py
    python add_snippet_columns_migration.py --db-path=/custom/path/research.db
        """
    )
    parser.add_argument(
        '--db-path',
        type=str,
        help='Path to research.db file (optional, uses default location if not specified)'
    )
    args = parser.parse_args()

    # Try to import and use ResearchDB for consistent path resolution
    db_path = None
    try:
        from llm_refactor.modules.database.connection import ResearchDB

        if args.db_path:
            db = ResearchDB(db_path=args.db_path)
            print(f"📍 Using specified database path: {args.db_path}")
        else:
            db = ResearchDB()
            print(f"📍 Using default database path: {db.db_path}")

        db_path = db.db_path

    except ImportError as e:
        print(f"⚠️  Could not import ResearchDB: {e}")
        print("   Falling back to manual path resolution...")

        # Fallback to manual path finding
        if args.db_path:
            db_path = Path(args.db_path)
        else:
            script_dir = Path(__file__).parent
            # Try common locations
            db_locations = [
                script_dir / "research_data" / "research.db",
                script_dir.parent / "research_data" / "research.db",
                script_dir / "research.db",
                script_dir / "smell-selector-ui" / "research.db",
            ]

            for location in db_locations:
                if location.exists():
                    db_path = location
                    print(f"📍 Found database at: {db_path}")
                    break

    # If still no database found, ask user
    if not db_path or not db_path.exists():
        print("\n❌ Could not find research.db")
        if not args.db_path:
            print("\nSearched in:")
            print(f"  - {Path(__file__).parent / 'research_data' / 'research.db'}")
            print(f"  - {Path(__file__).parent.parent / 'research_data' / 'research.db'}")
            print(f"  - {Path(__file__).parent / 'research.db'}")
            print(f"  - {Path(__file__).parent / 'smell-selector-ui' / 'research.db'}")

        print("\n💡 Options:")
        print("   1. Specify path: python add_snippet_columns_migration.py --db-path=/path/to/research.db")
        print("   2. Enter path now:")

        try:
            user_path = input("   Database path: ").strip()
            if user_path:
                db_path = Path(user_path)
            else:
                print("❌ No path provided. Exiting.")
                return
        except (KeyboardInterrupt, EOFError):
            print("\n❌ Cancelled by user")
            return

    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return

    # Run migration
    print("")
    migrate_database(db_path)


if __name__ == "__main__":
    main()
