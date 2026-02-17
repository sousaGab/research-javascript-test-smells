"""
Smell Analysis Module.

Provides functionality to compare smell detection results before and after refactoring,
identifying removed smells and newly introduced smells.
"""

from llm_refactor.modules.smell_analysis.analyzer import SmellAnalyzer, normalize_smell_name, smell_names_match
from llm_refactor.modules.smell_analysis.report_generator import save_analysis_json
from llm_refactor.modules.smell_analysis.db_persister import update_experiment_analysis_flags

__all__ = [
    'SmellAnalyzer',
    'normalize_smell_name',
    'smell_names_match',
    'save_analysis_json',
    'update_experiment_analysis_flags'
]
