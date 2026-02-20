#!/usr/bin/env python3
"""
Database Migration: Add LLM Metrics Columns

Adds llm_latency_seconds column to experiments table to track LLM API response time.
The existing tokens_used column will be populated with actual token counts.

Usage:
    python3 add_llm_metrics_columns.py
"""

import sys
from pathlib import Path

# Add llm-refactor-pipeline to path
sys.path.insert(0, str(Path(__file__).parent / "llm-refactor-pipeline"))

from sqlalchemy import text
from llm_refactor.modules.database.connection import ResearchDB


def add_llm_metrics_columns():
    """Add llm_latency_seconds column to experiments table."""
    db = ResearchDB()
    db.init_database()
    
    session = db.get_session()
    
    try:
        print("🔍 Checking database schema...")
        
        # Check if llm_latency_seconds column exists
        result = session.execute(text("PRAGMA table_info(experiments)")).fetchall()
        columns = [row[1] for row in result]
        
        has_latency = 'llm_latency_seconds' in columns
        has_tokens = 'tokens_used' in columns
        
        if has_latency:
            print("✅ Column 'llm_latency_seconds' already exists")
        else:
            print("➕ Adding column 'llm_latency_seconds'...")
            session.execute(text("""
                ALTER TABLE experiments 
                ADD COLUMN llm_latency_seconds REAL
            """))
            session.commit()
            print("✅ Column 'llm_latency_seconds' added successfully")
        
        if has_tokens:
            print("✅ Column 'tokens_used' already exists")
        else:
            print("⚠️  Warning: Column 'tokens_used' not found (should exist in schema)")
        
        # Get counts
        total_experiments = session.execute(text("SELECT COUNT(*) FROM experiments")).scalar()
        print(f"\n📊 Total experiments in database: {total_experiments}")
        
        print("\n✅ Migration completed successfully!")
        print("\nNOTE: Existing experiments will have NULL for llm_latency_seconds and tokens_used.")
        print("These fields will be populated for new experiments going forward.")
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    add_llm_metrics_columns()
