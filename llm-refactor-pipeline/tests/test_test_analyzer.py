"""
Unit tests for test results analysis module.
"""

import pytest
from pathlib import Path
from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary,
    compare_coverage,
    compare_test_counts,
    analyze_test_results
)


# Sample test summary content
SAMPLE_SUMMARY = """
=============================== Coverage summary ===============================
Statements   : 92.93% ( 2591/2788 )
Branches     : 84.28% ( 1132/1343 )
Functions    : 86.14% ( 230/267 )
Lines        : 92.87% ( 2568/2765 )
================================================================================

Test Suites: 70 passed, 70 total
Tests:       7 skipped, 455 passed, 462 total
Snapshots:   2 passed, 2 total
Time:        13.853 s
"""

SAMPLE_WITH_FAILURES = """
=============================== Coverage summary ===============================
Statements   : 91.50% ( 2500/2730 )
Branches     : 83.00% ( 1100/1325 )
Functions    : 85.00% ( 225/265 )
Lines        : 91.40% ( 2480/2715 )
================================================================================

Test Suites: 2 failed, 68 passed, 70 total
Tests:       7 skipped, 3 failed, 452 passed, 462 total
Snapshots:   2 passed, 2 total
Time:        14.250 s
"""


class TestParseCoverage:
    """Test coverage parsing."""
    
    def test_parse_coverage_success(self):
        """Should parse all coverage metrics."""
        result = parse_coverage_from_summary(SAMPLE_SUMMARY)
        
        assert result is not None
        assert result['statements'] == 92.93
        assert result['branches'] == 84.28
        assert result['functions'] == 86.14
        assert result['lines'] == 92.87
    
    def test_parse_coverage_empty_string(self):
        """Should return None for empty string."""
        result = parse_coverage_from_summary("")
        assert result is None
    
    def test_parse_coverage_invalid_format(self):
        """Should return None for invalid format."""
        result = parse_coverage_from_summary("Invalid content")
        assert result is None


class TestParseTestCounts:
    """Test count parsing."""
    
    def test_parse_test_counts_all_passed(self):
        """Should parse test counts when all passed."""
        result = parse_test_counts_from_summary(SAMPLE_SUMMARY)
        
        assert result is not None
        assert result['test_suites_passed'] == 70
        assert result['test_suites_failed'] == 0
        assert result['test_suites_total'] == 70
        assert result['tests_passed'] == 455
        assert result['tests_failed'] == 0
        assert result['tests_skipped'] == 7
        assert result['tests_total'] == 462
    
    def test_parse_test_counts_with_failures(self):
        """Should parse test counts with failures."""
        result = parse_test_counts_from_summary(SAMPLE_WITH_FAILURES)
        
        assert result is not None
        assert result['test_suites_passed'] == 68
        assert result['test_suites_failed'] == 2
        assert result['test_suites_total'] == 70
        assert result['tests_passed'] == 452
        assert result['tests_failed'] == 3
        assert result['tests_skipped'] == 7
        assert result['tests_total'] == 462
    
    def test_parse_test_counts_empty_string(self):
        """Should return None for empty string."""
        result = parse_test_counts_from_summary("")
        assert result is None


class TestCompareCoverage:
    """Test coverage comparison."""
    
    def test_no_coverage_change(self):
        """Should detect no change when coverage is identical."""
        baseline = {
            'statements': 92.93,
            'branches': 84.28,
            'functions': 86.14,
            'lines': 92.87
        }
        refactored = baseline.copy()
        
        result = compare_coverage(baseline, refactored)
        
        assert result['changed'] == False
        assert len(result['improvements']) == 0
        assert len(result['regressions']) == 0
    
    def test_coverage_improvement(self):
        """Should detect improvements."""
        baseline = {
            'statements': 90.00,
            'branches': 80.00,
            'functions': 85.00,
            'lines': 90.00
        }
        refactored = {
            'statements': 92.00,  # +2.00%
            'branches': 81.00,     # +1.00%
            'functions': 85.00,    # no change
            'lines': 90.50         # +0.50%
        }
        
        result = compare_coverage(baseline, refactored)
        
        assert result['changed'] == True
        assert 'statements' in result['improvements']
        assert 'branches' in result['improvements']
        assert 'lines' in result['improvements']
        assert len(result['regressions']) == 0
    
    def test_coverage_regression(self):
        """Should detect regressions."""
        baseline = {
            'statements': 92.00,
            'branches': 84.00,
            'functions': 86.00,
            'lines': 92.00
        }
        refactored = {
            'statements': 90.00,  # -2.00%
            'branches': 84.00,    # no change
            'functions': 85.00,   # -1.00%
            'lines': 92.00        # no change
        }
        
        result = compare_coverage(baseline, refactored)
        
        assert result['changed'] == True
        assert len(result['improvements']) == 0
        assert 'statements' in result['regressions']
        assert 'functions' in result['regressions']
    
    def test_coverage_details(self):
        """Should provide detailed diff information."""
        baseline = {'statements': 90.00, 'branches': 80.00, 'functions': 85.00, 'lines': 90.00}
        refactored = {'statements': 92.00, 'branches': 80.00, 'functions': 85.00, 'lines': 90.00}
        
        result = compare_coverage(baseline, refactored)
        
        assert 'details' in result
        assert result['details']['statements']['before'] == 90.00
        assert result['details']['statements']['after'] == 92.00
        assert result['details']['statements']['diff'] == 2.00


class TestCompareTestCounts:
    """Test count comparison."""
    
    def test_no_test_change(self):
        """Should detect no change when counts are identical."""
        baseline = {
            'test_suites_passed': 70,
            'test_suites_failed': 0,
            'test_suites_total': 70,
            'tests_passed': 455,
            'tests_failed': 0,
            'tests_skipped': 7,
            'tests_total': 462
        }
        refactored = baseline.copy()
        
        result = compare_test_counts(baseline, refactored)
        
        assert result['changed'] == False
        assert result['all_passed_before'] == True
        assert result['all_passed_after'] == True
    
    def test_test_failures_introduced(self):
        """Should detect when tests start failing."""
        baseline = {
            'test_suites_passed': 70,
            'test_suites_failed': 0,
            'test_suites_total': 70,
            'tests_passed': 455,
            'tests_failed': 0,
            'tests_skipped': 7,
            'tests_total': 462
        }
        refactored = {
            'test_suites_passed': 68,
            'test_suites_failed': 2,
            'test_suites_total': 70,
            'tests_passed': 453,
            'tests_failed': 2,
            'tests_skipped': 7,
            'tests_total': 462
        }
        
        result = compare_test_counts(baseline, refactored)
        
        assert result['changed'] == True
        assert result['all_passed_before'] == True
        assert result['all_passed_after'] == False
        assert result['details']['tests_failed']['diff'] == 2


class TestAnalyzeTestResults:
    """Test complete analysis function."""
    
    def test_analyze_same_file(self, tmp_path):
        """Should detect no changes when comparing same file."""
        # Create temporary test summary file
        summary_file = tmp_path / "test_summary.txt"
        summary_file.write_text(SAMPLE_SUMMARY)
        
        result = analyze_test_results(summary_file, summary_file)
        
        assert result is not None
        assert result['baseline_available'] == True
        assert result['refactored_available'] == True
        assert result['coverage_changed'] == False
        assert result['tests_changed'] == False
    
    def test_analyze_missing_baseline(self, tmp_path):
        """Should handle missing baseline file."""
        missing_file = tmp_path / "missing.txt"
        valid_file = tmp_path / "valid.txt"
        valid_file.write_text(SAMPLE_SUMMARY)
        
        result = analyze_test_results(missing_file, valid_file)
        
        assert result is not None
        assert result['baseline_available'] == False
        assert 'error' in result
    
    def test_analyze_missing_refactored(self, tmp_path):
        """Should handle missing refactored file."""
        valid_file = tmp_path / "valid.txt"
        valid_file.write_text(SAMPLE_SUMMARY)
        missing_file = tmp_path / "missing.txt"
        
        result = analyze_test_results(valid_file, missing_file)
        
        assert result is not None
        assert result['baseline_available'] == True
        assert result['refactored_available'] == False
        assert 'error' in result
    
    def test_analyze_different_results(self, tmp_path):
        """Should detect changes between different results."""
        baseline_file = tmp_path / "baseline.txt"
        baseline_file.write_text(SAMPLE_SUMMARY)
        
        refactored_file = tmp_path / "refactored.txt"
        refactored_file.write_text(SAMPLE_WITH_FAILURES)
        
        result = analyze_test_results(baseline_file, refactored_file)
        
        assert result is not None
        assert result['baseline_available'] == True
        assert result['refactored_available'] == True
        assert result['coverage_changed'] == True  # Coverage regressed
        assert result['tests_changed'] == True     # Tests started failing
