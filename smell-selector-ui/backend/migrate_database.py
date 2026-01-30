"""
Database migration script to add smell_ui_metadata table.

This script applies the UI metadata table to the existing research.db database.
Run this once before starting the UI server.
"""

import sys
from pathlib import Path

# Add parent directories to path to import from llm-refactor-pipeline
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root / "llm-refactor-pipeline" / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from sqlalchemy import text


def apply_migration():
    """Apply the UI metadata table migration."""
    print("🔄 Starting database migration...")

    # Initialize database connection
    db = ResearchDB()
    db.init_database()

    # Get raw connection for executescript
    engine = db.engine
    connection = engine.raw_connection()

    try:
        cursor = connection.cursor()

        # Read SQL migration file
        sql_file = Path(__file__).parent / "add_ui_metadata_table.sql"
        with open(sql_file, 'r') as f:
            sql_content = f.read()

        print("  Executing SQL migration script...")
        cursor.executescript(sql_content)
        connection.commit()
        print("✓ Migration completed successfully!")

        # Verify table was created
        result = cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='smell_ui_metadata'"
        ).fetchone()

        if result:
            print("✓ Table 'smell_ui_metadata' verified!")
        else:
            print("✗ Warning: Table not found after migration")

        # Show table info
        count = cursor.execute("SELECT COUNT(*) FROM detected_smells").fetchone()[0]
        print(f"\n📊 Database stats:")
        print(f"   Total detected smells: {count}")

    except Exception as e:
        connection.rollback()
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        connection.close()
        db.close()


if __name__ == "__main__":
    apply_migration()
