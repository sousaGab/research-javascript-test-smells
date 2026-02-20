#!/usr/bin/env python3
"""
Test script to verify the test_results parsing fix.

This script checks if test_summary.txt files can be parsed
and if the data would be correctly saved to the database.
"""

import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "llm-refactor-pipeline" / "src"))

from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary
)

def test_parsing():
    """Test parsing of test_summary.txt files."""
    
    # Find a test_summary.txt file from dataset
    dataset_dir = project_root / "llm-refactor-pipeline" / "dataset"
    test_summary_files = list(dataset_dir.glob("**/test_summary.txt"))
    
    if not test_summary_files:
        print("❌ No test_summary.txt files found in dataset")
        return False
    
    print(f"✓ Found {len(test_summary_files)} test_summary.txt files")
    print(f"\nTesting with: {test_summary_files[0].relative_to(project_root)}")
    print("=" * 80)
    
    # Load and parse the first file
    summary_text = load_test_summary(test_summary_files[0])
    
    if not summary_text:
        print("❌ Failed to load test_summary.txt")
        return False
    
    print("\n📄 File content preview:")
    print("-" * 80)
    print(summary_text[:500])
    if len(summary_text) > 500:
        print("...")
    print("-" * 80)
    
    # Parse coverage
    coverage_data = parse_coverage_from_summary(summary_text)
    print("\n📊 Parsed Coverage Data:")
    if coverage_data:
        for key, value in coverage_data.items():
            print(f"  {key}: {value}%")
    else:
        print("  ⚠ No coverage data found")
    
    # Parse test counts
    test_counts = parse_test_counts_from_summary(summary_text)
    print("\n🧪 Parsed Test Counts:")
    if test_counts:
        for key, value in test_counts.items():
            print(f"  {key}: {value}")
    else:
        print("  ⚠ No test counts found")
    
    # Verify all expected fields are present
    print("\n✅ Verification:")
    
    expected_coverage = ['statements', 'branches', 'functions', 'lines']
    expected_tests = ['test_suites_passed', 'test_suites_total', 
                     'tests_passed', 'tests_total']
    
    coverage_ok = coverage_data and all(k in coverage_data for k in expected_coverage)
    tests_ok = test_counts and all(k in test_counts for k in expected_tests)
    
    if coverage_ok:
        print("  ✓ All coverage fields parsed successfully")
    else:
        missing = [k for k in expected_coverage if not coverage_data or k not in coverage_data]
        print(f"  ⚠ Missing coverage fields: {missing}")
    
    if tests_ok:
        print("  ✓ All test count fields parsed successfully")
    else:
        missing = [k for k in expected_tests if not test_counts or k not in test_counts]
        print(f"  ⚠ Missing test count fields: {missing}")
    
    # Show what would be saved to database
    print("\n💾 Data that would be saved to test_results table:")
    print("-" * 80)
    print(f"  test_suites_passed: {test_counts.get('test_suites_passed') if test_counts else None}")
    print(f"  test_suites_total: {test_counts.get('test_suites_total') if test_counts else None}")
    print(f"  tests_passed: {test_counts.get('tests_passed') if test_counts else None}")
    print(f"  tests_total: {test_counts.get('tests_total') if test_counts else None}")
    print(f"  coverage_statements: {coverage_data.get('statements') if coverage_data else None}")
    print(f"  coverage_branches: {coverage_data.get('branches') if coverage_data else None}")
    print(f"  coverage_functions: {coverage_data.get('functions') if coverage_data else None}")
    print(f"  coverage_lines: {coverage_data.get('lines') if coverage_data else None}")
    print("-" * 80)
    
    return coverage_ok and tests_ok

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("🧪 TESTING TEST_RESULTS PARSING FIX")
    print("=" * 80)
    
    success = test_parsing()
    
    print("\n" + "=" * 80)
    if success:
        print("✅ TEST PASSED: Parsing works correctly!")
        print("=" * 80)
        sys.exit(0)
    else:
        print("❌ TEST FAILED: Some issues found")
        print("=" * 80)
        sys.exit(1)
