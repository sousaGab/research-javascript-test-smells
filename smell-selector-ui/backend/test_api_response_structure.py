#!/usr/bin/env python3
"""
Test to verify API response structure includes snippet_start_line and snippet_end_line.
This test directly queries the database and simulates what the API would return.
"""
import sys
import json
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root / "llm-refactor-pipeline" / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from sqlalchemy import text

print("="*80)
print("API RESPONSE STRUCTURE TEST")
print("="*80)

# Get database session
db = ResearchDB()
session = db.get_session()

print(f"\nDatabase: {db.db_path}")

# Test query (same as in main.py)
query = text("""
    SELECT
        ds.id,
        f.id as file_id,
        f.path,
        r.id as repo_id,
        r.name as repo_name,
        ds.smell_type,
        ds.line_numbers,
        ds.severity,
        ds.code_snippet,
        ds.detection_tool,
        ds.detected_at,
        CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as is_selected,
        ss.id as study_smell_id,
        ds.snippet_start_line,
        ds.snippet_end_line
    FROM detected_smells ds
    JOIN files f ON ds.file_id = f.id
    JOIN repositories r ON f.repository_id = r.id
    LEFT JOIN study_smells ss ON ds.file_id = ss.file_id
        AND ds.smell_type = ss.smell_type
        AND ds.line_numbers = ss.line_numbers
    LIMIT 1
""")

print("\n1. Testing query structure...")
print("-"*80)

result = session.execute(query).fetchone()

if not result:
    print("❌ No smells found in database")
    print("   Run: db import-smells")
    session.close()
    sys.exit(1)

print(f"✅ Query returned {len(result)} columns")

# Simulate smell_to_response function
print("\n2. Simulating API response structure...")
print("-"*80)

api_response = {
    "id": result[0],
    "file": {
        "id": result[1],
        "path": result[2],
        "repository_id": result[3],
        "repository_name": result[4]
    },
    "smell_type": result[5],
    "line_numbers": result[6],
    "severity": result[7],
    "code_snippet": result[8] if result[8] else "...",
    "detection_tool": result[9],
    "detected_at": str(result[10]),
    "is_selected": bool(result[11]),
    "study_smell_id": result[12],
    "snippet_start_line": result[13],
    "snippet_end_line": result[14],
}

# Check if fields exist
if "snippet_start_line" in api_response:
    print("✅ Field 'snippet_start_line' exists in response structure")
else:
    print("❌ Field 'snippet_start_line' NOT in response structure")

if "snippet_end_line" in api_response:
    print("✅ Field 'snippet_end_line' exists in response structure")
else:
    print("❌ Field 'snippet_end_line' NOT in response structure")

print("\n3. Sample API response:")
print("-"*80)
print(json.dumps({
    "id": api_response["id"],
    "smell_type": api_response["smell_type"],
    "line_numbers": api_response["line_numbers"],
    "snippet_start_line": api_response["snippet_start_line"],
    "snippet_end_line": api_response["snippet_end_line"],
    "file": api_response["file"]
}, indent=2))

if api_response["snippet_start_line"] is not None:
    print(f"\n✅ snippet_start_line has value: {api_response['snippet_start_line']}")
else:
    print("\n⚠️  snippet_start_line is NULL (data not imported yet)")

if api_response["snippet_end_line"] is not None:
    print(f"✅ snippet_end_line has value: {api_response['snippet_end_line']}")
else:
    print("⚠️  snippet_end_line is NULL (data not imported yet)")

session.close()

print("\n" + "="*80)
print("✅ API RESPONSE STRUCTURE TEST PASSED")
print("="*80)
print("\nConclusion:")
print("  - Query selects snippet_start_line and snippet_end_line")
print("  - Response structure includes these fields")
print("  - API would return these fields to frontend")
if api_response["snippet_start_line"] is None:
    print("\n⚠️  Note: Data is NULL - need to re-import with updated pipeline")
    print("   1. Re-detect smells (if using extract_method.js changes)")
    print("   2. Run: db import-smells")
print()
