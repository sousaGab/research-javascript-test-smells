#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unit tests for BackupManager module.

Tests backup, restore, and snippet replacement functionality.
Can be run with pytest if available, or as a standalone script.

Usage:
    python test_backup_manager.py           # Run as standalone script
    pytest test_backup_manager.py           # Run with pytest
    pytest test_backup_manager.py -v        # Verbose output
"""

import sys
import tempfile
from pathlib import Path
from typing import Generator

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

try:
    import pytest
    PYTEST_AVAILABLE = True
except ImportError:
    PYTEST_AVAILABLE = False
    print("Note: pytest not available, running as standalone script")

from llm_refactor.modules.backup_manager import BackupManager
from llm_refactor.modules.backup_manager import (
    BackupExistsError,
    BackupNotFoundError,
    BackupFileNotFoundError,
    InvalidPathError,
    SnippetReplacementError
)


# ============================================================================
# Test Fixtures and Utilities
# ============================================================================

def create_test_environment():
    """Create a temporary test environment with mock repositories."""
    temp_dir = tempfile.mkdtemp()
    temp_path = Path(temp_dir)
    
    # Create mock repository structure
    repo_dir = temp_path / "repositories" / "test-repo"
    repo_dir.mkdir(parents=True)
    
    # Create a test file
    test_file = repo_dir / "test" / "sample.test.js"
    test_file.parent.mkdir(parents=True, exist_ok=True)
    
    test_file.write_text("""// Sample test file
describe('Calculator', () => {
    it('should add numbers', () => {
        const result = add(2, 3);
        expect(result).toBe(5);
    });
    
    it('should subtract numbers', () => {
        const result = subtract(5, 3);
        expect(result).toBe(2);
    });
});
""")
    
    # Create another test file
    nested_file = repo_dir / "test" / "utils" / "helper.test.js"
    nested_file.parent.mkdir(parents=True, exist_ok=True)
    nested_file.write_text("""// Helper tests
test('helper function works', () => {
    expect(helper()).toBe(true);
});
""")
    
    backup_dir = temp_path / "backup"
    
    return temp_path, repo_dir, backup_dir, test_file, nested_file


def cleanup_test_environment(temp_path):
    """Clean up temporary test environment."""
    import shutil
    if temp_path.exists():
        shutil.rmtree(temp_path)


# ============================================================================
# Pytest Fixtures (used if pytest is available)
# ============================================================================

if PYTEST_AVAILABLE:
    @pytest.fixture
    def test_env():
        """Pytest fixture for test environment."""
        temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
        yield temp_path, repo_dir, backup_dir, test_file, nested_file
        cleanup_test_environment(temp_path)
    
    @pytest.fixture
    def backup_manager(test_env):
        """Pytest fixture for BackupManager instance."""
        temp_path, repo_dir, backup_dir, test_file, nested_file = test_env
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir,
            allow_backup_overwrite=False
        )
        return manager, test_env


# ============================================================================
# Test Cases
# ============================================================================

def test_initialization():
    """Test BackupManager initialization."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        # Test successful initialization
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        assert manager.repositories_dir.exists()
        assert manager.backup_dir.exists()
        assert manager.allow_backup_overwrite == False
        
        # Test initialization with invalid repository directory
        try:
            invalid_manager = BackupManager(
                repositories_dir=temp_path / "nonexistent"
            )
            assert False, "Should have raised InvalidPathError"
        except InvalidPathError:
            pass  # Expected
        
        print("OK test_initialization passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_backup_file_basic():
    """Test basic file backup functionality."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Create backup
        backup_path = manager.backup_file("test-repo", "test/sample.test.js")
        
        # Verify backup exists
        assert backup_path.exists()
        assert backup_path.read_text() == test_file.read_text()
        
        # Verify directory structure is preserved
        expected_path = backup_dir / "test-repo" / "test" / "sample.test.js"
        assert backup_path == expected_path
        
        print("OK test_backup_file_basic passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_backup_file_nested():
    """Test backup of nested file."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Backup nested file
        backup_path = manager.backup_file("test-repo", "test/utils/helper.test.js")
        
        assert backup_path.exists()
        assert backup_path.read_text() == nested_file.read_text()
        
        # Verify nested structure is preserved
        expected_path = backup_dir / "test-repo" / "test" / "utils" / "helper.test.js"
        assert backup_path == expected_path
        
        print("OK test_backup_file_nested passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_backup_already_exists():
    """Test that backup raises error if backup already exists."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir,
            allow_backup_overwrite=False
        )
        
        # Create first backup
        manager.backup_file("test-repo", "test/sample.test.js")
        
        # Try to create backup again - should raise error
        try:
            manager.backup_file("test-repo", "test/sample.test.js")
            assert False, "Should have raised BackupExistsError"
        except BackupExistsError:
            pass  # Expected
        
        print("OK test_backup_already_exists passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_backup_overwrite():
    """Test backup overwrite functionality."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir,
            allow_backup_overwrite=True
        )
        
        # Create first backup
        backup1 = manager.backup_file("test-repo", "test/sample.test.js")
        content1 = backup1.read_text()
        
        # Modify original file
        test_file.write_text("Modified content")
        
        # Create backup again (should overwrite)
        backup2 = manager.backup_file("test-repo", "test/sample.test.js")
        content2 = backup2.read_text()
        
        assert backup1 == backup2  # Same path
        assert content2 == "Modified content"  # New content
        assert content1 != content2
        
        print("OK test_backup_overwrite passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_backup_nonexistent_file():
    """Test that backing up a non-existent file raises error."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Try to backup file that doesn't exist
        try:
            manager.backup_file("test-repo", "test/nonexistent.js")
            assert False, "Should have raised BackupFileNotFoundError"
        except BackupFileNotFoundError:
            pass  # Expected
        
        print("OK test_backup_nonexistent_file passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_replace_snippet_basic():
    """Test basic snippet replacement."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        original_snippet = "expect(result).toBe(5);"
        refactored_snippet = "expect(result).toEqual(5);"
        
        # Replace snippet
        modified_path, backup_created = manager.replace_snippet(
            "test-repo",
            "test/sample.test.js",
            original_snippet,
            refactored_snippet,
            create_backup=True
        )
        
        # Verify backup was created
        assert backup_created
        
        # Verify file was modified
        new_content = modified_path.read_text()
        assert refactored_snippet in new_content
        assert original_snippet not in new_content
        
        # Verify backup has original content
        backup_path = manager._get_backup_path("test-repo", "test/sample.test.js")
        backup_content = backup_path.read_text()
        assert original_snippet in backup_content
        
        print("OK test_replace_snippet_basic passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_replace_snippet_without_backup():
    """Test snippet replacement without creating backup."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        original_snippet = "expect(result).toBe(5);"
        refactored_snippet = "expect(result).toEqual(5);"
        
        # Replace without backup
        modified_path, backup_created = manager.replace_snippet(
            "test-repo",
            "test/sample.test.js",
            original_snippet,
            refactored_snippet,
            create_backup=False
        )
        
        # Verify backup was not created
        assert not backup_created
        
        # Verify file was still modified
        new_content = modified_path.read_text()
        assert refactored_snippet in new_content
        
        # Verify no backup exists
        backup_path = manager._get_backup_path("test-repo", "test/sample.test.js")
        assert not backup_path.exists()
        
        print("OK test_replace_snippet_without_backup passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_replace_snippet_not_found():
    """Test replacement when snippet is not found."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Try to replace non-existent snippet
        try:
            manager.replace_snippet(
                "test-repo",
                "test/sample.test.js",
                "this snippet does not exist",
                "replacement",
                create_backup=False
            )
            assert False, "Should have raised SnippetReplacementError"
        except SnippetReplacementError:
            pass  # Expected
        
        print("OK test_replace_snippet_not_found passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_replace_snippet_multiple_occurrences():
    """Test replacement fails when snippet appears multiple times."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Try to replace snippet that appears twice
        try:
            manager.replace_snippet(
                "test-repo",
                "test/sample.test.js",
                "const result",  # Appears twice in the file
                "let result",
                create_backup=False
            )
            assert False, "Should have raised SnippetReplacementError"
        except SnippetReplacementError as e:
            assert "2 times" in str(e)
        
        print("OK test_replace_snippet_multiple_occurrences passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_undo_refactor():
    """Test restoring a file from backup."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Get original content
        original_content = test_file.read_text()
        
        # Create backup
        manager.backup_file("test-repo", "test/sample.test.js")
        
        # Modify the file
        test_file.write_text("Modified content that should be reverted")
        
        # Verify file was modified
        assert test_file.read_text() != original_content
        
        # Restore from backup
        restored_path = manager.undo_refactor("test-repo", "test/sample.test.js")
        
        # Verify file was restored
        assert restored_path == test_file
        assert test_file.read_text() == original_content
        
        print("OK test_undo_refactor passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_undo_without_backup():
    """Test that undo fails if no backup exists."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Try to restore without creating backup first
        try:
            manager.undo_refactor("test-repo", "test/sample.test.js")
            assert False, "Should have raised BackupNotFoundError"
        except BackupNotFoundError:
            pass  # Expected
        
        print("OK test_undo_without_backup passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_delete_backup():
    """Test deleting a backup file."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Create backup
        backup_path = manager.backup_file("test-repo", "test/sample.test.js")
        assert backup_path.exists()
        
        # Delete backup
        deleted = manager.delete_backup("test-repo", "test/sample.test.js")
        assert deleted == True
        assert not backup_path.exists()
        
        # Try to delete again
        deleted_again = manager.delete_backup("test-repo", "test/sample.test.js")
        assert deleted_again == False
        
        print("OK test_delete_backup passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_list_backups():
    """Test listing backup files."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Initially no backups
        backups = manager.list_backups()
        assert len(backups) == 0
        
        # Create some backups
        manager.backup_file("test-repo", "test/sample.test.js")
        manager.backup_file("test-repo", "test/utils/helper.test.js")
        
        # List all backups
        all_backups = manager.list_backups()
        assert len(all_backups) == 2
        
        # List backups for specific repo
        repo_backups = manager.list_backups("test-repo")
        assert len(repo_backups) == 2
        
        # List backups for non-existent repo
        other_backups = manager.list_backups("other-repo")
        assert len(other_backups) == 0
        
        print("OK test_list_backups passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_backup_exists():
    """Test checking if backup exists."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        # Initially no backup
        assert not manager.backup_exists("test-repo", "test/sample.test.js")
        
        # Create backup
        manager.backup_file("test-repo", "test/sample.test.js")
        
        # Now backup exists
        assert manager.backup_exists("test-repo", "test/sample.test.js")
        
        # Other file still has no backup
        assert not manager.backup_exists("test-repo", "test/utils/helper.test.js")
        
        print("OK test_backup_exists passed")
        
    finally:
        cleanup_test_environment(temp_path)


def test_full_workflow():
    """Test complete backup -> modify -> restore workflow."""
    temp_path, repo_dir, backup_dir, test_file, nested_file = create_test_environment()
    
    try:
        manager = BackupManager(
            repositories_dir=temp_path / "repositories",
            backup_dir=backup_dir
        )
        
        original_content = test_file.read_text()
        
        # Step 1: Replace snippet with backup
        original_snippet = "expect(result).toBe(5);"
        refactored_snippet = "expect(result).toEqual(5);"
        
        modified_path, backup_created = manager.replace_snippet(
            "test-repo",
            "test/sample.test.js",
            original_snippet,
            refactored_snippet,
            create_backup=True
        )
        
        # Verify modification
        modified_content = test_file.read_text()
        assert refactored_snippet in modified_content
        assert original_snippet not in modified_content
        
        # Step 2: Undo the refactor
        restored_path = manager.undo_refactor("test-repo", "test/sample.test.js")
        
        # Verify restoration
        restored_content = test_file.read_text()
        assert restored_content == original_content
        assert original_snippet in restored_content
        
        # Step 3: Clean up backup
        deleted = manager.delete_backup("test-repo", "test/sample.test.js")
        assert deleted
        
        print("OK test_full_workflow passed")
        
    finally:
        cleanup_test_environment(temp_path)


# ============================================================================
# Test Runner
# ============================================================================

def run_all_tests():
    """Run all tests in standalone mode."""
    print("=" * 70)
    print(" BackupManager Unit Tests")
    print("=" * 70)
    print()
    
    tests = [
        test_initialization,
        test_backup_file_basic,
        test_backup_file_nested,
        test_backup_already_exists,
        test_backup_overwrite,
        test_backup_nonexistent_file,
        test_replace_snippet_basic,
        test_replace_snippet_without_backup,
        test_replace_snippet_not_found,
        test_replace_snippet_multiple_occurrences,
        test_undo_refactor,
        test_undo_without_backup,
        test_delete_backup,
        test_list_backups,
        test_backup_exists,
        test_full_workflow,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            failed += 1
            print("X {0} FAILED: {1}".format(test.__name__, e))
    
    print()
    print("=" * 70)
    print("Results: {0} passed, {1} failed out of {2} tests".format(passed, failed, len(tests)))
    print("=" * 70)
    
    return failed == 0


if __name__ == "__main__":
    if PYTEST_AVAILABLE and len(sys.argv) == 1:
        # Running directly without pytest - use standalone mode
        success = run_all_tests()
        sys.exit(0 if success else 1)
    elif not PYTEST_AVAILABLE:
        # Pytest not available - use standalone mode
        success = run_all_tests()
        sys.exit(0 if success else 1)
    # Otherwise, pytest will run the tests
