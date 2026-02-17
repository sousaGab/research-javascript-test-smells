"""
Smell Analysis Module.

Provides functionality to compare smell detection results before and after refactoring,
identifying removed smells and newly introduced smells.
Also includes test results analysis for coverage and test count comparisons.
"""

from llm_refactor.modules.smell_analysis.analyzer import SmellAnalyzer, normalize_smell_name, smell_names_match
from llm_refactor.modules.smell_analysis.report_generator import save_analysis_json
from llm_refactor.modules.smell_analysis.db_persister import update_experiment_analysis_flags
from llm_refactor.modules.smell_analysis.test_analyzer import (
    analyze_test_results,
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    compare_coverage,
    compare_test_counts
)

__all__ = [
    'SmellAnalyzer',
    'normalize_smell_name',
    'smell_names_match',
    'save_analysis_json',
    'update_experiment_analysis_flags',
    'analyze_test_results',
    'parse_coverage_from_summary',
    'parse_test_counts_from_summary',
    'compare_coverage',
    'compare_test_counts'
]
