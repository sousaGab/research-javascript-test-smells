"""
Simple test to verify snippet_start_line and snippet_end_line are correctly
returned by the API using the actual database.

This test uses the real database with mock data.
"""

import sqlite3
import sys
from pathlib import Path
import requests
import json

# Find research.db
project_root = Path(__file__).parent.parent.parent
db_path = project_root / "research_data" / "research.db"

print("=" * 80)
print("SNIPPET LINE NUMBERS - API TEST")
print("=" * 80)
print(f"\nDatabase: {db_path}")

if not db_path.exists():
    print("❌ Database not found. Please create it first.")
    sys.exit(1)

print("✅ Database found\n")

# Step 1: Insert test data into database
print("Step 1: Inserting test data into database...")
print("-" * 80)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if tables have snippet_start_line column
cursor.execute("PRAGMA table_info(detected_smells)")
columns = [col[1] for col in cursor.fetchall()]

if 'snippet_start_line' not in columns:
    print("❌ Column snippet_start_line does not exist in detected_smells table")
    print("   Run migration first: python add_snippet_columns_migration.py")
    conn.close()
    sys.exit(1)

print("✅ Column snippet_start_line exists")

# Clean test data
cursor.execute("DELETE FROM detected_smells WHERE detection_tool = 'TEST'")
cursor.execute("DELETE FROM files WHERE path = '/test/api_test.test.js'")
cursor.execute("DELETE FROM repositories WHERE name = 'api-test-repo'")
conn.commit()

# Insert test repository
cursor.execute("""
    INSERT INTO repositories (name, url, language)
    VALUES ('api-test-repo', 'https://github.com/test/repo', 'JavaScript')
""")
repo_id = cursor.lastrowid

# Insert test file
cursor.execute("""
    INSERT INTO files (repository_id, path, file_type)
    VALUES (?, '/test/api_test.test.js', 'test')
""", (repo_id,))
file_id = cursor.lastrowid

# Insert test smell with snippet lines
cursor.execute("""
    INSERT INTO detected_smells (
        file_id, smell_type, line_numbers, severity,
        code_snippet, snippet_start_line, snippet_end_line,
        detection_tool
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", (
    file_id,
    "AnonymousTest",
    '{"startLine":52,"endLine":55}',
    "medium",
    'test("API test", () => { expect(1+1).toBe(2); })',
    45,  # snippet_start_line
    60,  # snippet_end_line
    "TEST"
))
smell_id = cursor.lastrowid

conn.commit()
print(f"✅ Test data inserted (smell_id: {smell_id})")
print(f"   - Repository ID: {repo_id}")
print(f"   - File ID: {file_id}")
print(f"   - Smell ID: {smell_id}")
print(f"   - Snippet lines: 45-60")
print()

# Step 2: Test API
print("Step 2: Testing API endpoints...")
print("-" * 80)

# Check if backend is running
API_BASE = "http://localhost:8000"

try:
    response = requests.get(f"{API_BASE}/api/smells?limit=1", timeout=2)
    print("✅ Backend is running")
except requests.exceptions.ConnectionError:
    print("❌ Backend is NOT running")
    print("   Start with: cd smell-selector-ui/backend && python -m uvicorn main:app --reload")
    conn.close()
    sys.exit(1)
except requests.exceptions.Timeout:
    print("❌ Backend timed out")
    conn.close()
    sys.exit(1)

print()

# Test 1: GET /api/smells (list)
print("Test 1: GET /api/smells")
print("-" * 40)

response = requests.get(f"{API_BASE}/api/smells?repo=api-test-repo&limit=10")
print(f"Response text: {response.text[:200]}")
if not response.text:
    print("❌ Empty response from API")
    conn.close()
    sys.exit(1)
data = response.json()
smells = data.get("smells", [])

print(f"Status: {response.status_code}")
print(f"Smells returned: {len(smells)}")

if len(smells) == 0:
    print("❌ No smells returned")
    print("   API might be filtering or database not read correctly")
    conn.close()
    sys.exit(1)

smell = smells[0]
print(f"\nSmell data:")
print(f"  ID: {smell.get('id')}")
print(f"  Type: {smell.get('smell_type')}")
print(f"  Line numbers: {smell.get('line_numbers')}")
print(f"  Snippet start line: {smell.get('snippet_start_line')}")
print(f"  Snippet end line: {smell.get('snippet_end_line')}")

# Verify snippet_start_line exists
if "snippet_start_line" not in smell:
    print("\n❌ FAILED: snippet_start_line field NOT in response")
    print("   Check backend/main.py smell_to_response() function")
    conn.close()
    sys.exit(1)

print("✅ Field snippet_start_line exists in response")

# Verify snippet_start_line has correct value
if smell.get("snippet_start_line") == 45:
    print("✅ snippet_start_line has correct value (45)")
else:
    print(f"❌ FAILED: Expected snippet_start_line=45, got {smell.get('snippet_start_line')}")
    conn.close()
    sys.exit(1)

if smell.get("snippet_end_line") == 60:
    print("✅ snippet_end_line has correct value (60)")
else:
    print(f"❌ FAILED: Expected snippet_end_line=60, got {smell.get('snippet_end_line')}")
    conn.close()
    sys.exit(1)

print()

# Test 2: GET /api/smells/{id} (detail)
print("Test 2: GET /api/smells/{id}")
print("-" * 40)

response = requests.get(f"{API_BASE}/api/smells/{smell_id}")
smell_detail = response.json()

print(f"Status: {response.status_code}")
print(f"Smell ID: {smell_detail.get('id')}")
print(f"Snippet start line: {smell_detail.get('snippet_start_line')}")
print(f"Snippet end line: {smell_detail.get('snippet_end_line')}")

if smell_detail.get("snippet_start_line") == 45:
    print("✅ Detail endpoint returns correct snippet_start_line")
else:
    print("❌ Detail endpoint has wrong snippet_start_line")
    conn.close()
    sys.exit(1)

print()

# Cleanup
print("Cleaning up test data...")
cursor.execute("DELETE FROM detected_smells WHERE detection_tool = 'TEST'")
cursor.execute("DELETE FROM files WHERE path = '/test/api_test.test.js'")
cursor.execute("DELETE FROM repositories WHERE name = 'api-test-repo'")
conn.commit()
conn.close()
print("✅ Test data cleaned up")

print()
print("=" * 80)
print("✅ ALL TESTS PASSED")
print("=" * 80)
print("\nConclusion:")
print("  - Backend correctly reads snippet_start_line from database")
print("  - API correctly returns snippet_start_line in JSON response")
print("  - Both list and detail endpoints work correctly")
print()
