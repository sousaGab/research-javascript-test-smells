"""
Database Migration: Add test analysis columns to experiments table.

Adds:
- coverage_changed: Boolean - Did test coverage change between baseline and refactored?
- tests_changed: Boolean - Did test execution results change?
"""

import sqlite3
from pathlib import Path

def migrate():
    """Add coverage_changed and tests_changed columns to experiments table."""
    
    # Path to database (at project root/research_data/)
    db_path = Path(__file__).parent.parent / "research_data" / "research.db"
    
    if not db_path.exists():
        print(f"❌ Database not found: {db_path}")
        print("   This migration is only needed if the database already exists.")
        return
    
    print(f"🔧 Migrating database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(experiments)")
        columns = [col[1] for col in cursor.fetchall()]
        
        migrations_needed = []
        
        if 'coverage_changed' not in columns:
            migrations_needed.append('coverage_changed')
        
        if 'tests_changed' not in columns:
            migrations_needed.append('tests_changed')
        
        if not migrations_needed:
            print("✓ Database already up-to-date (columns exist)")
            conn.close()
            return
        
        # Add columns
        for col_name in migrations_needed:
            print(f"  → Adding column: {col_name}")
            cursor.execute(f"ALTER TABLE experiments ADD COLUMN {col_name} BOOLEAN")
        
        conn.commit()
        
        # Verify
        cursor.execute("PRAGMA table_info(experiments)")
        columns_after = [col[1] for col in cursor.fetchall()]
        
        success = all(col in columns_after for col in ['coverage_changed', 'tests_changed'])
        
        if success:
            print("✅ Migration successful!")
            print(f"   Added columns: {', '.join(migrations_needed)}")
        else:
            print("❌ Migration verification failed")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate()
