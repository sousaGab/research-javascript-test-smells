#!/usr/bin/env python3
"""
Database Export Script

Standalone script to export the research database to SQL dump format.
Can be run independently without the full CLI.

Usage:
    python scripts/export_database.py
    python scripts/export_database.py --output=/path/to/backup.sql
"""

import sys
import sqlite3
from datetime import datetime
from pathlib import Path

# Add the llm-refactor-pipeline src to path
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
LLM_PIPELINE_SRC = PROJECT_ROOT / "llm-refactor-pipeline" / "src"
sys.path.insert(0, str(LLM_PIPELINE_SRC))


def export_database(db_path: Path, output_path: Path = None) -> dict:
    """
    Export SQLite database to SQL dump file.
    
    Args:
        db_path: Path to source database file
        output_path: Optional custom output path
        
    Returns:
        dict with export statistics
    """
    # Generate default filename with timestamp if not provided
    if not output_path:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f"research.db.dump-{timestamp}.sql"
        output_path = db_path.parent / output_filename
    else:
        output_path = Path(output_path)
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Check if database exists
    if not db_path.exists():
        raise FileNotFoundError(f"Database not found: {db_path}")
    
    # Get database size
    db_size_mb = db_path.stat().st_size / (1024 * 1024)
    
    # Connect and export
    conn = sqlite3.connect(str(db_path))
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            # Write header
            f.write(f"-- SQLite Database Dump\n")
            f.write(f"-- Database: {db_path}\n")
            f.write(f"-- Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- Database Size: {db_size_mb:.2f} MB\n")
            f.write(f"--\n\n")
            
            # Dump all tables and data
            for line in conn.iterdump():
                f.write(f"{line}\n")
    finally:
        conn.close()
    
    # Get output file size
    dump_size_mb = output_path.stat().st_size / (1024 * 1024)
    
    return {
        'source': db_path,
        'destination': output_path,
        'db_size_mb': db_size_mb,
        'dump_size_mb': dump_size_mb,
    }


def main():
    """Main entry point for standalone script."""
    # Parse arguments
    output_path = None
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.startswith('--output='):
                output_path = arg.split('=', 1)[1]
            elif arg in ['-h', '--help']:
                print(__doc__)
                print("\nOptions:")
                print("  --output=PATH    Custom output path for SQL dump")
                print("  -h, --help       Show this help message")
                sys.exit(0)
    
    # Default database path
    db_path = PROJECT_ROOT / "research_data" / "research.db"
    
    try:
        print("=" * 70)
        print("Database Export Script")
        print("=" * 70)
        print()
        
        # Perform export
        result = export_database(db_path, output_path)
        
        # Print results
        print(f"✓ Successfully exported database\n")
        print(f"Source:      {result['source']}")
        print(f"Destination: {result['destination']}")
        print(f"DB Size:     {result['db_size_mb']:.2f} MB")
        print(f"Dump Size:   {result['dump_size_mb']:.2f} MB")
        print()
        print("The SQL dump can be restored using:")
        print(f"  sqlite3 new_database.db < {result['destination']}")
        print()
        
        return 0
        
    except Exception as e:
        print(f"✗ Export failed: {str(e)}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
