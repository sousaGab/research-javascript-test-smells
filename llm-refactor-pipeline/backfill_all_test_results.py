#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Backfill Test Results Script

This script populates test_results for ALL experiments that need it:
1. Experiments with test_results but tests_total = NULL
2. Experiments without test_results at all

Usage:
    python3 backfill_all_test_results.py [--dry-run] [--limit N]
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.models import Experiment, TestResult
from llm_refactor.modules.database.crud import create_test_results
from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary
)


def find_test_summary_path(experiment):
    """Find the test_summary.txt path for an experiment."""
    if not experiment.study_smell_id or not experiment.prompting_approach or not experiment.ai_model_version:
        return None
    
    # Build expected path
    strategy = experiment.prompting_approach.lower().replace('-', '_').replace(' ', '_')
    model_safe = experiment.ai_model_version.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('/', '-')
    
    base_path = Path(__file__).parent / "dataset" / strategy / model_safe / f"smell_{experiment.study_smell_id}"
    test_summary = base_path / "test_summary.txt"
    
    return test_summary if test_summary.exists() else None


def backfill_experiment(session, experiment, dry_run=False):
    """
    Backfill test results for a single experiment.
    
    Returns:
        tuple: (success: bool, message: str, data: dict or None)
    """
    # Find test_summary.txt
    test_summary_path = find_test_summary_path(experiment)
    if not test_summary_path:
        return False, "test_summary.txt not found", None
    
    # Load and parse
    summary_text = load_test_summary(test_summary_path)
    if not summary_text:
        return False, "Failed to load test_summary.txt", None
    
    test_counts = parse_test_counts_from_summary(summary_text)
    coverage_data = parse_coverage_from_summary(summary_text)
    
    # Check if we got any data
    has_test_data = test_counts and test_counts.get('tests_total') is not None
    has_coverage_data = coverage_data and coverage_data.get('statements') is not None
    
    if not has_test_data and not has_coverage_data:
        return False, "No parseable data in test_summary.txt", None
    
    # Prepare data
    tests_passed = test_counts.get('tests_passed') if test_counts else None
    tests_failed = test_counts.get('tests_failed') if test_counts else None
    tests_total = test_counts.get('tests_total') if test_counts else None
    all_tests_passed = (tests_failed == 0) if tests_failed is not None else None
    
    data = {
        'test_suites_passed': test_counts.get('test_suites_passed') if test_counts else None,
        'test_suites_failed': test_counts.get('test_suites_failed') if test_counts else None,
        'test_suites_total': test_counts.get('test_suites_total') if test_counts else None,
        'tests_passed': tests_passed,
        'tests_failed': tests_failed,
        'tests_total': tests_total,
        'coverage_statements': coverage_data.get('statements') if coverage_data else None,
        'coverage_branches': coverage_data.get('branches') if coverage_data else None,
        'coverage_functions': coverage_data.get('functions') if coverage_data else None,
        'coverage_lines': coverage_data.get('lines') if coverage_data else None,
        'all_tests_passed': all_tests_passed,
    }
    
    if dry_run:
        return True, "Would create/update (dry-run)", data
    
    # Check if test_result already exists
    existing = session.query(TestResult).filter_by(
        experiment_id=experiment.id,
        phase='after'
    ).first()
    
    if existing:
        # Update existing
        for key, value in data.items():
            if value is not None:
                setattr(existing, key, value)
        session.flush()
        return True, "Updated existing test_result", data
    else:
        # Create new using CRUD function
        try:
            create_test_results(
                session=session,
                experiment_id=experiment.id,
                phase='after',
                test_suites_passed=data['test_suites_passed'],
                test_suites_failed=data['test_suites_failed'],
                test_suites_total=data['test_suites_total'],
                tests_passed=data['tests_passed'],
                tests_failed=data['tests_failed'],
                tests_total=data['tests_total'],
                coverage_statements=data['coverage_statements'],
                coverage_branches=data['coverage_branches'],
                coverage_functions=data['coverage_functions'],
                coverage_lines=data['coverage_lines'],
                all_tests_passed=data['all_tests_passed']
            )
            return True, "Created new test_result", data
        except Exception as e:
            return False, f"Failed to create: {e}", None


def main():
    parser = argparse.ArgumentParser(description='Backfill ALL test results from test_summary.txt files')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be updated without making changes')
    parser.add_argument('--limit', type=int, default=None, help='Limit number of experiments to process')
    args = parser.parse_args()
    
    print("=" * 80)
    print("COMPLETE TEST RESULTS BACKFILL SCRIPT")
    print("=" * 80)
    
    if args.dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    
    print()
    
    # Connect to database
    db = ResearchDB()
    session = db.get_session()
    
    try:
        # Query all experiments that need backfill
        # Option 1: Have test_results but tests_total is NULL
        query1 = session.query(Experiment).join(TestResult).filter(
            TestResult.phase == 'after',
            TestResult.tests_total.is_(None)
        )
        
        # Option 2: Don't have test_results at all
        query2 = session.query(Experiment).filter(
            Experiment.execution_phase_completed == True,
            ~Experiment.id.in_(
                session.query(TestResult.experiment_id).filter(TestResult.phase == 'after')
            )
        )
        
        # Combine both queries
        exp_with_null = query1.all()
        exp_without = query2.all()
        
        experiments = exp_with_null + exp_without
        
        if args.limit:
            experiments = experiments[:args.limit]
            print(f"Processing up to {args.limit} experiments...")
        else:
            print(f"Processing all experiments that need backfilling...")
        
        print(f"Found {len(exp_with_null)} experiments with NULL test metrics")
        print(f"Found {len(exp_without)} experiments without test_results")
        print(f"Total to process: {len(experiments)}")
        print()
        
        if not experiments:
            print("No experiments found that need backfilling")
            return 0
        
        # Process each experiment
        updated = 0
        created = 0
        failed = 0
        
        for i, exp in enumerate(experiments, 1):
            success, message, data = backfill_experiment(session, exp, dry_run=args.dry_run)
            
            if success:
                if "Created" in message:
                    created += 1
                    status = "CREATE"
                else:
                    updated += 1
                    status = "UPDATE"
                
                print(f"[{status}] {i}/{len(experiments)} - Experiment {exp.id}: {message}")
                if data and args.dry_run:
                    if data.get('tests_total'):
                        print(f"         Tests: {data.get('tests_passed')}/{data.get('tests_total')}")
                    if data.get('coverage_statements'):
                        print(f"         Coverage: {data.get('coverage_statements'):.2f}%")
            else:
                failed += 1
                print(f"[FAIL] {i}/{len(experiments)} - Experiment {exp.id}: {message}")
        
        # Commit if not dry-run
        if not args.dry_run:
            session.commit()
            print()
            print("=" * 80)
            print(f"[SUCCESS] Backfill completed!")
            print(f"  Created: {created}")
            print(f"  Updated: {updated}")
            print(f"  Failed: {failed}")
            print(f"  Total processed: {created + updated}")
            print("=" * 80)
        else:
            print()
            print("=" * 80)
            print("[DRY RUN COMPLETE]")
            print(f"  Would create: {created}")
            print(f"  Would update: {updated}")
            print(f"  Would fail: {failed}")
            print("=" * 80)
            print()
            print("Run without --dry-run to apply changes")
        
        return 0
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    sys.exit(main())
