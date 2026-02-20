#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backfill Repository Baseline Test Results Script

This script scans the tests_output/ directory and populates the 
repository_baseline_test_results table with baseline metrics from 
test_summary.txt files for each repository.

Usage:
    python3 backfill_repository_baselines.py [--dry-run]
    
    --dry-run: Show what would be updated without making changes
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.models import Repository, RepositoryBaselineTestResult
from llm_refactor.modules.database.crud import (
    get_repository_baseline_tests,
    create_repository_baseline_tests
)
from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary
)


def backfill_repository_baseline(session, repository_folder: Path, dry_run=False):
    """
    Backfill baseline test results for a single repository.
    
    Args:
        session: Database session
        repository_folder: Path to repository folder in tests_output/
        dry_run: If True, don't save changes
    
    Returns:
        tuple: (success: bool, message: str, data: dict or None)
    """
    repository_name = repository_folder.name
    test_summary_path = repository_folder / "test_summary.txt"
    
    # Check if test_summary.txt exists
    if not test_summary_path.exists():
        return False, "test_summary.txt not found", None
    
    # Look up repository in database
    repository = session.query(Repository).filter_by(name=repository_name).first()
    if not repository:
        return False, f"Repository '{repository_name}' not found in database", None
    
    # Check if baseline already exists
    existing = get_repository_baseline_tests(session, repository.id)
    
    # Load and parse test_summary.txt
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
    
    # Prepare data for baseline
    baseline_data = {}
    
    if test_counts:
        baseline_data.update({
            'test_suites_passed': test_counts.get('test_suites_passed'),
            'test_suites_failed': test_counts.get('test_suites_failed'),
            'test_suites_total': test_counts.get('test_suites_total'),
            'tests_passed': test_counts.get('tests_passed'),
            'tests_failed': test_counts.get('tests_failed'),
            'tests_total': test_counts.get('tests_total'),
            'snapshots_total': test_counts.get('snapshots_total'),
        })
        
        # Determine if all tests passed
        if test_counts.get('tests_failed') is not None:
            baseline_data['all_tests_passed'] = test_counts.get('tests_failed') == 0
    
    if coverage_data:
        baseline_data.update({
            'coverage_statements': coverage_data.get('statements'),
            'coverage_branches': coverage_data.get('branches'),
            'coverage_functions': coverage_data.get('functions'),
            'coverage_lines': coverage_data.get('lines'),
        })
    
    if dry_run:
        action = "update" if existing else "create"
        return True, f"Would {action} baseline (dry-run)", baseline_data
    
    # Create or update baseline
    create_repository_baseline_tests(
        session,
        repository.id,
        **baseline_data
    )
    
    session.flush()
    action = "Updated" if existing else "Created"
    return True, f"{action} baseline successfully", baseline_data


def main():
    parser = argparse.ArgumentParser(
        description='Backfill repository baseline test results from tests_output/ folders'
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help='Show what would be updated without making changes'
    )
    args = parser.parse_args()
    
    print("=" * 70)
    print("REPOSITORY BASELINE TEST RESULTS BACKFILL SCRIPT")
    print("=" * 70)
    
    if args.dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    
    print()
    
    # Find tests_output directory
    tests_output_dir = Path(__file__).parent.parent / "tests_output"
    
    if not tests_output_dir.exists():
        print(f"ERROR: tests_output directory not found at {tests_output_dir}")
        return 1
    
    # Get all repository folders
    repository_folders = [f for f in tests_output_dir.iterdir() if f.is_dir()]
    
    if not repository_folders:
        print(f"No repository folders found in {tests_output_dir}")
        return 0
    
    print(f"Found {len(repository_folders)} repository folders in tests_output/")
    print()
    
    # Connect to database
    db = ResearchDB()
    session = db.get_session()
    
    try:
        # Process each repository folder
        created = 0
        updated = 0
        skipped = 0
        failed = 0
        
        for repo_folder in sorted(repository_folders):
            success, message, data = backfill_repository_baseline(
                session, 
                repo_folder, 
                dry_run=args.dry_run
            )
            
            if success:
                if "Created" in message or "create" in message:
                    created += 1
                    print(f"[CREATE] {repo_folder.name}: {message}")
                else:
                    updated += 1
                    print(f"[UPDATE] {repo_folder.name}: {message}")
                
                if data and args.dry_run:
                    if data.get('tests_total'):
                        print(f"         Tests: {data.get('tests_passed')}/{data.get('tests_total')}")
                    if data.get('coverage_statements') is not None:
                        print(f"         Coverage: {data.get('coverage_statements'):.2f}%")
            else:
                if "not found in database" in message:
                    skipped += 1
                    print(f"[SKIP] {repo_folder.name}: {message}")
                else:
                    failed += 1
                    print(f"[FAIL] {repo_folder.name}: {message}")
        
        # Commit if not dry-run
        if not args.dry_run:
            session.commit()
            print()
            print("=" * 70)
            print("[SUCCESS] Backfill completed!")
            print(f"  Created: {created}")
            print(f"  Updated: {updated}")
            print(f"  Skipped (repo not in DB): {skipped}")
            print(f"  Failed (missing/invalid data): {failed}")
            print("=" * 70)
        else:
            print()
            print("=" * 70)
            print("[DRY RUN] Summary:")
            print(f"  Would create: {created}")
            print(f"  Would update: {updated}")
            print(f"  Would skip: {skipped}")
            print(f"  Would fail: {failed}")
            print("=" * 70)
        
        return 0
        
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        session.rollback()
        return 1
    
    finally:
        session.close()


if __name__ == '__main__':
    sys.exit(main())
