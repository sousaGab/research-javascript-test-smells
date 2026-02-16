"""
Test snippet_start_line and snippet_end_line functionality in the API.

This test creates mock data and verifies that the API correctly
returns snippet line numbers.
"""

import sys
from pathlib import Path

# Add parent directory to path to import main
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import tempfile
import os

# Import the app
from main import app, get_db_session

# Create a test database
test_db_path = tempfile.mktemp(suffix=".db")
TEST_DATABASE_URL = f"sqlite:///{test_db_path}"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Override the database dependency for testing."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the dependency
app.dependency_overrides[get_db_session] = override_get_db

client = TestClient(app)


def setup_test_database():
    """Create test database schema and insert test data."""
    session = TestSessionLocal()

    # Create tables
    session.execute(text("""
        CREATE TABLE repositories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            url TEXT,
            stars INTEGER,
            language TEXT DEFAULT 'JavaScript',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    session.execute(text("""
        CREATE TABLE files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repository_id INTEGER NOT NULL,
            path TEXT NOT NULL,
            file_type TEXT DEFAULT 'test',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
        )
    """))

    session.execute(text("""
        CREATE TABLE detected_smells (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER NOT NULL,
            smell_type TEXT NOT NULL,
            line_numbers TEXT,
            severity TEXT,
            code_snippet TEXT,
            snippet_start_line INTEGER,
            snippet_end_line INTEGER,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            detection_tool TEXT,
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        )
    """))

    session.execute(text("""
        CREATE TABLE study_smells (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER NOT NULL,
            smell_type TEXT NOT NULL,
            line_numbers TEXT,
            severity TEXT,
            code_snippet TEXT,
            snippet_start_line INTEGER,
            snippet_end_line INTEGER,
            selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            detection_tool TEXT,
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        )
    """))

    session.execute(text("""
        CREATE TABLE smell_ui_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            detected_smell_id INTEGER NOT NULL UNIQUE,
            annotations TEXT,
            priority INTEGER DEFAULT 0,
            tags TEXT DEFAULT '[]',
            ui_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (detected_smell_id) REFERENCES detected_smells(id) ON DELETE CASCADE
        )
    """))

    # Insert test data
    session.execute(text("""
        INSERT INTO repositories (id, name, url, language)
        VALUES (1, 'test-repo', 'https://github.com/test/repo', 'JavaScript')
    """))

    session.execute(text("""
        INSERT INTO files (id, repository_id, path, file_type)
        VALUES (1, 1, '/test/example.test.js', 'test')
    """))

    session.execute(text("""
        INSERT INTO detected_smells (
            id, file_id, smell_type, line_numbers, severity,
            code_snippet, snippet_start_line, snippet_end_line,
            detection_tool
        )
        VALUES (
            :id, :file_id, :smell_type, :line_numbers, :severity,
            :code_snippet, :snippet_start_line, :snippet_end_line,
            :detection_tool
        )
    """), {
        "id": 1,
        "file_id": 1,
        "smell_type": "AnonymousTest",
        "line_numbers": '{"startLine":52,"endLine":55}',
        "severity": "medium",
        "code_snippet": 'test("should work", () => { expect(true).toBe(true); })',
        "snippet_start_line": 45,
        "snippet_end_line": 60,
        "detection_tool": "steel"
    })

    session.execute(text("""
        INSERT INTO detected_smells (
            id, file_id, smell_type, line_numbers, severity,
            code_snippet, snippet_start_line, snippet_end_line,
            detection_tool
        )
        VALUES (
            :id, :file_id, :smell_type, :line_numbers, :severity,
            :code_snippet, :snippet_start_line, :snippet_end_line,
            :detection_tool
        )
    """), {
        "id": 2,
        "file_id": 1,
        "smell_type": "EagerTest",
        "line_numbers": '{"startLine":120,"endLine":125}',
        "severity": "high",
        "code_snippet": 'describe("suite", () => { test("test", () => {}); })',
        "snippet_start_line": 115,
        "snippet_end_line": 140,
        "detection_tool": "snuts"
    })

    session.commit()
    session.close()

    print("✅ Test database setup complete")


def test_get_smells_returns_snippet_lines():
    """Test that GET /api/smells returns snippet_start_line and snippet_end_line."""
    print("\n" + "="*80)
    print("TEST 1: GET /api/smells returns snippet line numbers")
    print("="*80)

    response = client.get("/api/smells?limit=10")

    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    data = response.json()
    smells = data.get("smells", [])

    print(f"Number of smells returned: {len(smells)}")
    assert len(smells) > 0, "Expected at least one smell"

    # Check first smell
    smell = smells[0]
    print(f"\nSmell ID: {smell.get('id')}")
    print(f"Smell Type: {smell.get('smell_type')}")
    print(f"Line Numbers: {smell.get('line_numbers')}")
    print(f"Snippet Start Line: {smell.get('snippet_start_line')}")
    print(f"Snippet End Line: {smell.get('snippet_end_line')}")

    # Assertions
    assert "snippet_start_line" in smell, "snippet_start_line field missing from response"
    assert "snippet_end_line" in smell, "snippet_end_line field missing from response"

    assert smell["snippet_start_line"] == 45, f"Expected snippet_start_line=45, got {smell['snippet_start_line']}"
    assert smell["snippet_end_line"] == 60, f"Expected snippet_end_line=60, got {smell['snippet_end_line']}"

    print("\n✅ TEST PASSED: snippet line numbers are correctly returned")


def test_get_smell_detail_returns_snippet_lines():
    """Test that GET /api/smells/{id} returns snippet_start_line and snippet_end_line."""
    print("\n" + "="*80)
    print("TEST 2: GET /api/smells/{id} returns snippet line numbers")
    print("="*80)

    response = client.get("/api/smells/1")

    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    smell = response.json()

    print(f"\nSmell ID: {smell.get('id')}")
    print(f"Smell Type: {smell.get('smell_type')}")
    print(f"Snippet Start Line: {smell.get('snippet_start_line')}")
    print(f"Snippet End Line: {smell.get('snippet_end_line')}")
    print(f"Code Snippet: {smell.get('code_snippet', '')[:50]}...")

    # Assertions
    assert "snippet_start_line" in smell, "snippet_start_line field missing"
    assert "snippet_end_line" in smell, "snippet_end_line field missing"

    assert smell["snippet_start_line"] == 45, f"Expected 45, got {smell['snippet_start_line']}"
    assert smell["snippet_end_line"] == 60, f"Expected 60, got {smell['snippet_end_line']}"

    print("\n✅ TEST PASSED: smell detail returns correct snippet lines")


def test_multiple_smells_have_different_snippet_lines():
    """Test that different smells have different snippet line numbers."""
    print("\n" + "="*80)
    print("TEST 3: Multiple smells have different snippet lines")
    print("="*80)

    response = client.get("/api/smells?limit=10")
    data = response.json()
    smells = data.get("smells", [])

    assert len(smells) >= 2, "Need at least 2 smells for this test"

    smell1 = smells[0]
    smell2 = smells[1]

    print(f"Smell 1: lines {smell1['snippet_start_line']}-{smell1['snippet_end_line']}")
    print(f"Smell 2: lines {smell2['snippet_start_line']}-{smell2['snippet_end_line']}")

    assert smell1["snippet_start_line"] == 45
    assert smell1["snippet_end_line"] == 60
    assert smell2["snippet_start_line"] == 115
    assert smell2["snippet_end_line"] == 140

    print("\n✅ TEST PASSED: Different smells have different snippet lines")


def cleanup_test_database():
    """Remove test database."""
    try:
        os.remove(test_db_path)
        print(f"\n🗑️  Cleaned up test database: {test_db_path}")
    except:
        pass


def run_all_tests():
    """Run all tests."""
    print("\n" + "="*80)
    print("BACKEND API TESTS - SNIPPET LINE NUMBERS")
    print("="*80)

    try:
        setup_test_database()

        test_get_smells_returns_snippet_lines()
        test_get_smell_detail_returns_snippet_lines()
        test_multiple_smells_have_different_snippet_lines()

        print("\n" + "="*80)
        print("✅ ALL TESTS PASSED")
        print("="*80)
        print("\nConclusion: Backend API correctly returns snippet_start_line and snippet_end_line")

    except AssertionError as e:
        print("\n" + "="*80)
        print("❌ TEST FAILED")
        print("="*80)
        print(f"Error: {e}")
        raise

    finally:
        cleanup_test_database()


if __name__ == "__main__":
    run_all_tests()
