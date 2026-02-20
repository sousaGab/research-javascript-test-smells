#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backfill Coverage Decreased Script

This script analyzes existing experiments and populates the coverage_decreased
field by comparing baseline and refactored test results.

Usage:
    python3 backfill_coverage_decreased.py [--dry-run] [--limit N]
    
    --dry-run: Show what would be updated without making changes
    --limit N: Only process first N experiments
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import update_experiment
from llm_refactor.modules.smell_analysis.test_analyzer import (
    analyze_test_results,
    load_test_summary
)
from llm_refactor.core.config import Config


def find_baseline_summary(repo_name: str) -> Path:
    """
    Find baseline test_summary.txt for a repository.
    
    Args:
        repo_name: Repository name
        
    Returns:
        Path to baseline test_summary.txt in tests_output/{repo_name}/
    """
    project_root = Config.PROJECT_ROOT.parent
    baseline_path = project_root / "tests_output" / repo_name / "test_summary.txt"
    return baseline_path if baseline_path.exists() else None


def find_refactored_summary(experiment_id: int, strategy: str, model: str, smell_id: int) -> Path:
    """
    Find refactored test_summary.txt for an experiment.
    
    Args:
        experiment_id: Experiment ID
        strategy: Prompting strategy (e.g., "Zero-Shot")
        model: Model version (e.g., "Qwen 2.5 Coder 32B")
        smell_id: Study smell ID
        
    Returns:
        Path to test_summary.txt in dataset/{strategy}/{model}/smell_{id}/
    """
    # Convert strategy name to directory format
    strategy_dir = strategy.lower().replace("-", "_").replace(" ", "_")
    
    # Convert model name to directory format
    model_dir = model.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-")
    
    refactored_path = Config.PROJECT_ROOT / "dataset" / strategy_dir / model_dir / f"smell_{smell_id}" / "test_summary.txt"
    return refactored_path if refactored_path.exists() else None


def backfill_experiment(session, experiment, dry_run=False):
    """
    Backfill coverage_decreased for a single experiment.
    
    Args:
        session: Database session
        experiment: Experiment tuple from database
        dry_run: If True, don't save changes
    
    Returns:
        tuple: (success: bool, message: str, coverage_decreased: bool or None)
    """
    exp_id, repo_name, strategy, model, smell_id, current_coverage_decreased = experiment
    
    # Check if already populated
    if current_coverage_decreased is not None:
        return True, "Already has coverage_decreased value", current_coverage_decreased
    
    # Find baseline summary
    baseline_path = find_baseline_summary(repo_name)
    if not baseline_path:
        return False, f"Baseline not found: tests_output/{repo_name}/test_summary.txt", None
    
    # Find refactored summary
    refactored_path = find_refactored_summary(exp_id, strategy, model, smell_id)
    if not refactored_path:
        return False, f"Refactored summary not found for {strategy}/{model}/smell_{smell_id}", None
    
    # Analyze test results
    try:
        analysis = analyze_test_results(baseline_path, refactored_path)
        
        if not analysis or not analysis.get('baseline_available') or not analysis.get('refactored_available'):
            return False, "Analysis failed: files not available", None
        
        coverage_decreased = analysis.get('coverage_decreased')
        
        if coverage_decreased is None:
            return False, "Coverage comparison not available", None
        
        if dry_run:
            return True, f"Would set coverage_decreased={coverage_decreased}", coverage_decreased
        
        # Update database
        update_experiment(session, exp_id, coverage_decreased=coverage_decreased)
        session.flush()
        
        return True, f"Set coverage_decreased={coverage_decreased}", coverage_decreased
        
    except Exception as e:
        return False, f"Analysis error: {str(e)}", None


def main():
    parser = argparse.ArgumentParser(
        description='Backfill coverage_decreased field for existing experiments'
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help='Show what would be updated without making changes'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Only process first N experiments'
    )
    args = parser.parse_args()
    
    print("=" * 70)
    print("COVERAGE DECREASED BACKFILL SCRIPT")
    print("=" * 70)
    
    if args.dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    
    if args.limit:
        print(f"[LIMIT: Processing only first {args.limit} experiments]")
    
    print()
    
    # Connect to database
    db = ResearchDB()
    session = db.get_session()
    
    try:
        # Get all experiments with NULL coverage_decreased
        # Join with repositories and study_smells to get necessary info
        query = """
            SELECT 
                e.id,
                r.name as repo_name,
                e.prompting_approach,
                e.ai_model_version,
                e.study_smell_id,
                e.coverage_decreased
            FROM experiments e
            JOIN files f ON e.file_id = f.id
            JOIN repositories r ON f.repository_id = r.id
            WHERE e.study_smell_id IS NOT NULL
            ORDER BY e.id
        """
        
        if args.limit:
            query += f" LIMIT {args.limit}"
        
        from sqlalchemy import text
        result = session.execute(text(query))
        experiments = result.fetchall()
        
        if not experiments:
            print("No experiments found to process.")
            return 0
        
        print(f"Found {len(experiments)} experiments to process")
        print()
        
        # Process each experiment
        updated = 0
        skipped = 0
        failed = 0
        
        for exp in experiments:
            exp_id = exp[0]
            repo_name = exp[1]
            
            success, message, coverage_decreased = backfill_experiment(
                session, 
                exp, 
                dry_run=args.dry_run
            )
            
            if success:
                if "Already has" in message:
                    skipped += 1
                    print(f"[SKIP] Exp {exp_id:>4} ({repo_name:<20}): {message}")
                else:
                    updated += 1
                    status = "✓" if coverage_decreased is False else "⚠" if coverage_decreased else "?"
                    print(f"[{status} OK] Exp {exp_id:>4} ({repo_name:<20}): {message}")
            else:
                failed += 1
                print(f"[FAIL] Exp {exp_id:>4} ({repo_name:<20}): {message}")
        
        # Commit if not dry-run
        if not args.dry_run:
            session.commit()
            print()
            print("=" * 70)
            print("[SUCCESS] Backfill completed!")
            print(f"  Updated: {updated}")
            print(f"  Skipped (already has data): {skipped}")
            print(f"  Failed (no data available): {failed}")
            print("=" * 70)
        else:
            print()
            print("=" * 70)
            print("[DRY RUN] Summary:")
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
