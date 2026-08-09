import importlib
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))


def test_rq5_coverage_violation_considers_all_coverage_metrics():
    module = importlib.import_module('controllers.rq5_controller')

    assert 'coverage_statements' in module.COVERAGE_VIOLATION_EXPR
    assert 'coverage_branches' in module.COVERAGE_VIOLATION_EXPR
    assert 'coverage_functions' in module.COVERAGE_VIOLATION_EXPR
    assert 'coverage_lines' in module.COVERAGE_VIOLATION_EXPR

    where_clause, params = module._build_where('test smell', 'gpt-4', 'Zero-Shot')
    assert 'WHERE' in where_clause
    assert params['smell_type'] == 'test smell'
    assert params['ai_model_version'] == 'gpt-4'
    assert params['prompting_approach'] == 'Zero-Shot'
