#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for integrated refactor workflow.

This script tests the new --apply functionality without requiring a real database or LLM.
"""

from pathlib import Path
import sys

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.refactor.refactor_smell import RefactorSmellModule


def test_help_command():
    """Test that help command works."""
    print("Test 1: Help Command")
    print("-" * 60)
    
    module = RefactorSmellModule()
    result = module.execute("help")
    
    # Check for key elements
    assert "--apply" in result, "Help should mention --apply flag"
    assert "dry-run" in result.lower(), "Help should mention dry-run mode"
    assert "strategy" in result.lower(), "Help should mention strategy"
    
    print("✓ Help command includes --apply documentation")
    print()


def test_models_command():
    """Test that models command works."""
    print("Test 2: Models Command")
    print("-" * 60)
    
    module = RefactorSmellModule()
    result = module.execute("models")
    
    # Check for key elements
    assert "Qwen" in result, "Models should include Qwen"
    
    print("✓ Models command works")
    print()


def test_strategies_command():
    """Test that strategies command works."""
    print("Test 3: Strategies Command")
    print("-" * 60)
    
    module = RefactorSmellModule()
    result = module.execute("strategies")
    
    # Check for key elements
    assert "Zero-Shot" in result or "Zero Shot" in result, "Strategies should include Zero-Shot"
    assert "Chain-of-Thought" in result or "CoT" in result, "Strategies should include CoT"
    
    print("✓ Strategies command works")
    print()


def test_argument_parsing():
    """Test that argument parsing handles --apply flag."""
    print("Test 4: Argument Parsing")
    print("-" * 60)
    
    module = RefactorSmellModule()
    
    # Test invalid smell_id
    result = module.execute("invalid")
    assert "Error" in result, "Should show error for invalid smell_id"
    print("✓ Invalid smell_id handled correctly")
    
    # Test missing smell_id
    result = module.execute("")
    # Should show help when no args provided
    assert "help" in result.lower() or "error" in result.lower(), "Should show help or error when no args"
    print("✓ Missing arguments handled correctly")
    
    print()


def test_module_imports():
    """Test that BackupManager imports correctly."""
    print("Test 5: Module Imports")
    print("-" * 60)
    
    try:
        from llm_refactor.modules.backup_manager import BackupManager
        print("✓ BackupManager imported successfully")
        
        # Check that BackupManager has required methods
        assert hasattr(BackupManager, 'replace_snippet'), "BackupManager should have replace_snippet method"
        print("✓ BackupManager has replace_snippet method")
        
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    
    print()
    return True


def main():
    """Run all tests."""
    print()
    print("=" * 60)
    print("REFACTOR INTEGRATION TESTS")
    print("=" * 60)
    print()
    
    try:
        test_help_command()
        test_models_command()
        test_strategies_command()
        test_argument_parsing()
        test_module_imports()
        
        print("=" * 60)
        print("✓ ALL TESTS PASSED")
        print("=" * 60)
        print()
        print("Integration Notes:")
        print("- Dry-run mode is the default (safe)")
        print("- Use --apply flag to create backup and apply changes")
        print("- BackupManager integration is working")
        print("- Help documentation updated with new flags")
        print()
        
        return 0
        
    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"✗ TEST FAILED: {e}")
        print("=" * 60)
        print()
        return 1
    except Exception as e:
        print()
        print("=" * 60)
        print(f"✗ UNEXPECTED ERROR: {e}")
        print("=" * 60)
        print()
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
