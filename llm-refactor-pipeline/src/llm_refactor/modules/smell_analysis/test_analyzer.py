"""
Test Results Analysis Module.

Parses and compares test execution results (coverage and test counts) 
between baseline and refactored versions.
"""

import re
from pathlib import Path
from typing import Dict, Optional


def parse_coverage_from_summary(summary_text: str) -> Optional[Dict[str, float]]:
    """
    Parse coverage percentages from test summary text.
    
    Expected format:
        Statements   : 92.93% ( 2591/2788 )
        Branches     : 84.28% ( 1132/1343 )
        Functions    : 86.14% ( 230/267 )
        Lines        : 92.87% ( 2568/2765 )
    
    Args:
        summary_text: Content of test_summary.txt file
        
    Returns:
        Dict with coverage percentages or None if parsing fails
        {
            'statements': 92.93,
            'branches': 84.28,
            'functions': 86.14,
            'lines': 92.87
        }
    """
    try:
        coverage = {}
        
        # Extract Statements
        match = re.search(r'Statements\s*:\s*([\d.]+)%', summary_text)
        if match:
            coverage['statements'] = float(match.group(1))
        
        # Extract Branches
        match = re.search(r'Branches\s*:\s*([\d.]+)%', summary_text)
        if match:
            coverage['branches'] = float(match.group(1))
        
        # Extract Functions
        match = re.search(r'Functions\s*:\s*([\d.]+)%', summary_text)
        if match:
            coverage['functions'] = float(match.group(1))
        
        # Extract Lines
        match = re.search(r'Lines\s*:\s*([\d.]+)%', summary_text)
        if match:
            coverage['lines'] = float(match.group(1))
        
        if not coverage:
            return None
        
        return coverage
        
    except (ValueError, AttributeError):
        return None


def parse_test_counts_from_summary(summary_text: str) -> Optional[Dict[str, int]]:
    """
    Parse test counts from test summary text.
    
    Expected formats:
        Test Suites: 70 passed, 70 total
        Tests:       7 skipped, 455 passed, 462 total
    
    Args:
        summary_text: Content of test_summary.txt file
        
    Returns:
        Dict with test counts or None if parsing fails
        {
            'test_suites_passed': 70,
            'test_suites_total': 70,
            'tests_passed': 455,
            'tests_failed': 0,
            'tests_skipped': 7,
            'tests_total': 462
        }
    """
    try:
        counts = {}
        
        # Extract Test Suites
        suite_match = re.search(
            r'Test Suites:\s*(?:(\d+)\s+failed,\s*)?(?:(\d+)\s+passed,\s*)?(\d+)\s+total',
            summary_text
        )
        if suite_match:
            counts['test_suites_failed'] = int(suite_match.group(1) or 0)
            counts['test_suites_passed'] = int(suite_match.group(2) or 0)
            counts['test_suites_total'] = int(suite_match.group(3))
        
        # Extract Tests
        tests_match = re.search(
            r'Tests:\s*(?:(\d+)\s+skipped,\s*)?(?:(\d+)\s+failed,\s*)?(?:(\d+)\s+passed,\s*)?(\d+)\s+total',
            summary_text
        )
        if tests_match:
            counts['tests_skipped'] = int(tests_match.group(1) or 0)
            counts['tests_failed'] = int(tests_match.group(2) or 0)
            counts['tests_passed'] = int(tests_match.group(3) or 0)
            counts['tests_total'] = int(tests_match.group(4))
        
        if not counts:
            return None
        
        return counts
        
    except (ValueError, AttributeError):
        return None


def load_test_summary(summary_path: Path) -> Optional[str]:
    """
    Load test summary file content.
    
    Args:
        summary_path: Path to test_summary.txt file
        
    Returns:
        File content or None if file not found
    """
    try:
        if not summary_path.exists():
            return None
        
        return summary_path.read_text(encoding='utf-8')
        
    except (OSError, IOError):
        return None


def compare_coverage(baseline: Dict[str, float], refactored: Dict[str, float]) -> Dict:
    """
    Compare coverage between baseline and refactored.
    
    Args:
        baseline: Baseline coverage percentages
        refactored: Refactored coverage percentages
        
    Returns:
        Dict with comparison results
        {
            'changed': bool,  # True if ANY metric changed
            'improvements': [...],  # List of metrics that improved
            'regressions': [...],   # List of metrics that regressed
            'details': {
                'statements': {'before': 92.93, 'after': 93.00, 'diff': +0.07},
                ...
            }
        }
    """
    details = {}
    improvements = []
    regressions = []
    
    for metric in ['statements', 'branches', 'functions', 'lines']:
        before = baseline.get(metric, 0.0)
        after = refactored.get(metric, 0.0)
        diff = round(after - before, 2)
        
        details[metric] = {
            'before': before,
            'after': after,
            'diff': diff
        }
        
        if diff > 0.01:  # Improved (threshold 0.01%)
            improvements.append(metric)
        elif diff < -0.01:  # Regressed (threshold 0.01%)
            regressions.append(metric)
    
    changed = len(improvements) > 0 or len(regressions) > 0
    
    return {
        'changed': changed,
        'improvements': improvements,
        'regressions': regressions,
        'details': details
    }


def compare_test_counts(baseline: Dict[str, int], refactored: Dict[str, int]) -> Dict:
    """
    Compare test counts between baseline and refactored.
    
    Args:
        baseline: Baseline test counts
        refactored: Refactored test counts
        
    Returns:
        Dict with comparison results
        {
            'changed': bool,  # True if counts changed
            'all_passed_before': bool,
            'all_passed_after': bool,
            'details': {
                'tests_passed': {'before': 455, 'after': 455, 'diff': 0},
                ...
            }
        }
    """
    details = {}
    
    metrics = [
        'test_suites_passed', 'test_suites_failed', 'test_suites_total',
        'tests_passed', 'tests_failed', 'tests_skipped', 'tests_total'
    ]
    
    for metric in metrics:
        before = baseline.get(metric, 0)
        after = refactored.get(metric, 0)
        diff = after - before
        
        details[metric] = {
            'before': before,
            'after': after,
            'diff': diff
        }
    
    # Check if all tests passed
    all_passed_before = (
        baseline.get('tests_failed', 0) == 0 and
        baseline.get('tests_passed', 0) == baseline.get('tests_total', 0)
    )
    
    all_passed_after = (
        refactored.get('tests_failed', 0) == 0 and
        refactored.get('tests_passed', 0) == refactored.get('tests_total', 0)
    )
    
    # Changed if any count changed
    changed = any(d['diff'] != 0 for d in details.values())
    
    return {
        'changed': changed,
        'all_passed_before': all_passed_before,
        'all_passed_after': all_passed_after,
        'details': details
    }


def analyze_test_results(baseline_path: Path, refactored_path: Path) -> Optional[Dict]:
    """
    Comprehensive test results analysis.
    
    Compares baseline test results (from tests_output/) with refactored
    test results (from experiment dataset/).
    
    Args:
        baseline_path: Path to baseline test_summary.txt (tests_output/{repo}/test_summary.txt)
        refactored_path: Path to refactored test_summary.txt (dataset/.../test_summary.txt)
        
    Returns:
        Dict with complete analysis or None if files not found
        {
            'coverage_changed': bool,  # Binary: Did coverage change?
            'tests_changed': bool,     # Binary: Did test counts change?
            'coverage_comparison': {...},
            'tests_comparison': {...},
            'baseline_available': bool,
            'refactored_available': bool
        }
    """
    # Load summaries
    baseline_text = load_test_summary(baseline_path)
    refactored_text = load_test_summary(refactored_path)
    
    if not baseline_text:
        return {
            'baseline_available': False,
            'refactored_available': refactored_text is not None,
            'coverage_changed': None,
            'tests_changed': None,
            'error': 'Baseline test summary not found'
        }
    
    if not refactored_text:
        return {
            'baseline_available': True,
            'refactored_available': False,
            'coverage_changed': None,
            'tests_changed': None,
            'error': 'Refactored test summary not found'
        }
    
    # Parse coverage
    baseline_coverage = parse_coverage_from_summary(baseline_text)
    refactored_coverage = parse_coverage_from_summary(refactored_text)
    
    coverage_comparison = None
    coverage_changed = None
    
    if baseline_coverage and refactored_coverage:
        coverage_comparison = compare_coverage(baseline_coverage, refactored_coverage)
        coverage_changed = coverage_comparison['changed']
    
    # Parse test counts
    baseline_tests = parse_test_counts_from_summary(baseline_text)
    refactored_tests = parse_test_counts_from_summary(refactored_text)
    
    tests_comparison = None
    tests_changed = None
    
    if baseline_tests and refactored_tests:
        tests_comparison = compare_test_counts(baseline_tests, refactored_tests)
        tests_changed = tests_comparison['changed']
    
    return {
        'baseline_available': True,
        'refactored_available': True,
        'coverage_changed': coverage_changed,
        'tests_changed': tests_changed,
        'coverage_comparison': coverage_comparison,
        'tests_comparison': tests_comparison
    }
