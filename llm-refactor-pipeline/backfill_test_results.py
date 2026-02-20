#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backfill Test Results Script

This script populates test_results table with detailed metrics for existing
experiments that have test_summary.txt files but only have boolean flags saved.

Usage:
    python3 backfill_test_results.py [--dry-run] [--limit N]
    
    --dry-run: Show what would be updated without making changes
    --limit N: Only process first N experiments
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.models import Experiment, TestResult
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
    # Check if experiment already has detailed test results
    existing = session.query(TestResult).filter_by(
        experiment_id=experiment.id,
        phase='after'
    ).first()
    
    if existing and existing.tests_total is not None:
        return False, "Already has detailed metrics", None
    
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
    
    # Prepare update data
    update_data = {}
    
    if test_counts:
        update_data.update({
            'test_suites_passed': test_counts.get('test_suites_passed'),
            'test_suites_failed': test_counts.get('test_suites_failed'),
            'test_suites_total': test_counts.get('test_suites_total'),
            'tests_passed': test_counts.get('tests_passed'),
            'tests_failed': test_counts.get('tests_failed'),
            'tests_total': test_counts.get('tests_total'),
        })
    
    if coverage_data:
        update_data.update({
            'coverage_statements': coverage_data.get('statements'),
            'coverage_branches': coverage_data.get('branches'),
            'coverage_functions': coverage_data.get('functions'),
            'coverage_lines': coverage_data.get('lines'),
        })
    
    if dry_run:
        return True, "Would update (dry-run)", update_data
    
    # Update or create test result
    if existing:
        # Update existing
        for key, value in update_data.items():
            setattr(existing, key, value)
    else:
        # Create new (shouldn't happen, but handle gracefully)
        result = TestResult(
            experiment_id=experiment.id,
            phase='after',
            all_tests_passed=experiment.tests_still_passing,
            **update_data
        )
        session.add(result)
    
    session.flush()
    return True, "Updated successfully", update_data


def main():
    parser = argparse.ArgumentParser(description='Backfill test results from test_summary.txt files')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be updated without making changes')
    parser.add_argument('--limit', type=int, default=None, help='Limit number of experiments to process')
    args = parser.parse_args()
    
    print("=" * 70)
    print("TEST RESULTS BACKFILL SCRIPT")
    print("=" * 70)
    
    if args.dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    
    print()
    
    # Connect to database
    db = ResearchDB()
    session = db.get_session()
    
    try:
        # Query experiments that might need backfill
        # (Have test_results with phase='after' but tests_total is NULL)
        query = session.query(Experiment).join(TestResult).filter(
            TestResult.phase == 'after',
            TestResult.tests_total.is_(None)
        ).order_by(Experiment.id.desc())
        
        if args.limit:
            query = query.limit(args.limit)
            print(f"Processing up to {args.limit} experiments...")
        else:
            print("Processing all experiments with NULL test metrics...")
        
        experiments = query.all()
        
        if not experiments:
            print("No experiments found that need backfilling")
            return 0
        
        print(f"Found {len(experiments)} experiments to check")
        print()
        
        # Process each experiment
        updated = 0
        skipped = 0
        failed = 0
        
        for exp in experiments:
            success, message, data = backfill_experiment(session, exp, dry_run=args.dry_run)
            
            if success:
                updated += 1
                print(f"[OK] Experiment {exp.id}: {message}")
                if data and args.dry_run:
                    if data.get('tests_total'):
                        print(f"      Tests: {data.get('tests_passed')}/{data.get('tests_total')}")
                    if data.get('coverage_statements'):
                        print(f"      Coverage: {data.get('coverage_statements'):.2f}%")
            else:
                if "Already has" in message:
                    skipped += 1
                else:
                    failed += 1
                    print(f"[SKIP] Experiment {exp.id}: {message}")
        
        # Commit if not dry-run
        if not args.dry_run:
            session.commit()
            print()
            print("=" * 70)
            print(f"[SUCCESS] Backfill completed!")
            print(f"  Updated: {updated}")
            print(f"  Skipped (already has data): {skipped}")
            print(f"  Failed (no data available): {failed}")
            print("=" * 70)
        else:
            print()
            print("=" * 70)
            print("[DRY RUN COMPLETE]")
            print(f"  Would update: {updated}")
            print(f"  Would skip: {skipped}")
            print(f"  Would fail: {failed}")
            print("=" * 70)
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
