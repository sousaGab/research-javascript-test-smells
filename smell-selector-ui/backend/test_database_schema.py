#!/usr/bin/env python3
"""
Test to verify snippet_start_line and snippet_end_line are in database schema.
"""
import sqlite3
import sys
from pathlib import Path

# Find database
project_root = Path(__file__).parent.parent.parent
db_path = project_root / "research_data" / "research.db"

if not db_path.exists():
    print(f"❌ Database not found at: {db_path}")
    sys.exit(1)

print("="*80)
print("DATABASE SCHEMA TEST - snippet_start_line & snippet_end_line")
print("="*80)
print(f"\nDatabase: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check detected_smells schema
print("\n1. Checking detected_smells table schema...")
print("-"*80)
cursor.execute("PRAGMA table_info(detected_smells)")
columns = cursor.fetchall()

snippet_start_found = False
snippet_end_found = False

for col in columns:
    col_id, name, col_type, not_null, default_val, pk = col
    if name == "snippet_start_line":
        snippet_start_found = True
        print(f"✅ Column 'snippet_start_line' found (type: {col_type})")
    elif name == "snippet_end_line":
        snippet_end_found = True
        print(f"✅ Column 'snippet_end_line' found (type: {col_type})")

if not snippet_start_found:
    print("❌ Column 'snippet_start_line' NOT found in detected_smells")
if not snippet_end_found:
    print("❌ Column 'snippet_end_line' NOT found in detected_smells")

if not (snippet_start_found and snippet_end_found):
    print("\n❌ SCHEMA TEST FAILED - Missing columns")
    print("   Run the migration script: python add_snippet_columns_migration.py")
    conn.close()
    sys.exit(1)

# Check if there's any real data with snippet lines
print("\n2. Checking for data with snippet lines...")
print("-"*80)
cursor.execute("""
    SELECT COUNT(*)
    FROM detected_smells
    WHERE snippet_start_line IS NOT NULL
""")
count = cursor.fetchone()[0]

if count > 0:
    print(f"✅ Found {count} smells with snippet_start_line data")

    # Show example
    cursor.execute("""
        SELECT id, smell_type, snippet_start_line, snippet_end_line
        FROM detected_smells
        WHERE snippet_start_line IS NOT NULL
        LIMIT 1
    """)
    row = cursor.fetchone()
    if row:
        smell_id, smell_type, start, end = row
        print(f"   Example: smell_id={smell_id}, type={smell_type}, lines={start}-{end}")
else:
    print("⚠️  No smells found with snippet_start_line data")
    print("   This is expected if you haven't re-imported smells after migration")

conn.close()

print("\n" + "="*80)
print("✅ SCHEMA TEST PASSED")
print("="*80)
print("\nConclusion:")
print("  - Database schema is correct")
print("  - snippet_start_line and snippet_end_line columns exist")
if count > 0:
    print("  - Data is available for testing")
else:
    print("  - No data yet, need to run: db import-smells")
print()
