#!/usr/bin/env python3
"""
Migration script to add phase tracking columns to experiments table.

Adds:
- refactor_phase_completed (BOOLEAN DEFAULT FALSE)
- execution_phase_completed (BOOLEAN DEFAULT FALSE)

These columns enable two-phase experiment execution:
- Phase 1: Refactor (call LLM, save code)
- Phase 2: Execute (backup, test, detect, restore)

This supports time-based LLM pricing by batching all refactoring requests first.

Run this script to update your existing database schema.

Usage:
    python add_experiment_phase_tracking.py
    python add_experiment_phase_tracking.py --db-path=/path/to/research.db
    python add_experiment_phase_tracking.py --backfill  # Also backfill existing experiments
"""

import sqlite3
import sys
import argparse
from pathlib import Path

# Add src directory to path to import ResearchDB
sys.path.insert(0, str(Path(__file__).parent / "src"))


def migrate_database(db_path: Path, backfill: bool = False):
    """Add phase tracking columns to experiments table."""

    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return False

    print(f"🔧 Migrating database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    table = 'experiments'

    # Check if columns already exist
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in cursor.fetchall()]

    columns_added = False

    try:
        # Add refactor_phase_completed column
        if 'refactor_phase_completed' not in columns:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN refactor_phase_completed BOOLEAN DEFAULT FALSE")
            print(f"  ✓ {table}: added refactor_phase_completed column")
            columns_added = True
        else:
            print(f"  ✓ {table}: refactor_phase_completed already exists")

        # Add execution_phase_completed column
        if 'execution_phase_completed' not in columns:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN execution_phase_completed BOOLEAN DEFAULT FALSE")
            print(f"  ✓ {table}: added execution_phase_completed column")
            columns_added = True
        else:
            print(f"  ✓ {table}: execution_phase_completed already exists")

        if columns_added:
            conn.commit()
            print("  ✓ Schema migration completed")

        # Backfill existing experiments
        if backfill:
            print("\n🔄 Backfilling existing experiments...")
            
            # Set both phases to TRUE for experiments with refactored_code
            # (these are complete experiments from before the two-phase system)
            cursor.execute("""
                UPDATE experiments 
                SET refactor_phase_completed = TRUE,
                    execution_phase_completed = TRUE
                WHERE refactored_code IS NOT NULL
                  AND refactoring_completed = TRUE
            """)
            
            updated = cursor.rowcount
            print(f"  ✓ Updated {updated} existing experiments (both phases = TRUE)")
            
            # Handle partial experiments (refactored but not completed)
            cursor.execute("""
                UPDATE experiments 
                SET refactor_phase_completed = TRUE,
                    execution_phase_completed = FALSE
                WHERE refactored_code IS NOT NULL
                  AND refactoring_completed = FALSE
            """)
            
            partial = cursor.rowcount
            if partial > 0:
                print(f"  ✓ Updated {partial} partial experiments (refactor only)")
            
            conn.commit()
            print("  ✓ Backfill completed")

    except sqlite3.Error as e:
        print(f"  ❌ {table}: Error - {e}")
        conn.rollback()
        return False

    # Show statistics
    print("\n📊 Database Statistics:")
    cursor.execute("SELECT COUNT(*) FROM experiments")
    total = cursor.fetchone()[0]
    print(f"  Total experiments: {total}")
    
    cursor.execute("""
        SELECT COUNT(*) FROM experiments 
        WHERE refactor_phase_completed = TRUE AND execution_phase_completed = TRUE
    """)
    complete = cursor.fetchone()[0]
    print(f"  Complete (both phases): {complete}")
    
    cursor.execute("""
        SELECT COUNT(*) FROM experiments 
        WHERE refactor_phase_completed = TRUE AND execution_phase_completed = FALSE
    """)
    pending_execution = cursor.fetchone()[0]
    print(f"  Pending execution (phase 2): {pending_execution}")
    
    cursor.execute("""
        SELECT COUNT(*) FROM experiments 
        WHERE refactor_phase_completed = FALSE
    """)
    pending_refactor = cursor.fetchone()[0]
    print(f"  Pending refactor (phase 1): {pending_refactor}")

    conn.close()
    print("\n✅ Migration completed successfully!")
    return True


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Migrate database to add experiment phase tracking columns',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python add_experiment_phase_tracking.py
    python add_experiment_phase_tracking.py --db-path=/custom/path/research.db
    python add_experiment_phase_tracking.py --backfill
        """
    )
    parser.add_argument(
        '--db-path',
        type=str,
        help='Path to research.db file (optional, uses default location if not specified)'
    )
    parser.add_argument(
        '--backfill',
        action='store_true',
        help='Backfill existing experiments with phase tracking (sets both phases TRUE for complete experiments)'
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
        print("   1. Specify path: python add_experiment_phase_tracking.py --db-path=/path/to/research.db")
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
    migrate_database(db_path, backfill=args.backfill)


if __name__ == '__main__':
    main()
