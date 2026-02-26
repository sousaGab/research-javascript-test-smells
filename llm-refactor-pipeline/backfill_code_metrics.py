#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backfill Code Metrics Script

This script computes and populates code_metrics table with complexity metrics
for selected study smells (phase='before') and experiment refactored code (phase='after').

Uses Babel-based JavaScript AST analyzer to compute:
- SLOC (logical lines of code)
- Cyclomatic complexity
- Halstead metrics (effort, bugs, difficulty, volume)
- Maintainability Index

Usage:
    python3 backfill_code_metrics.py --phase before [--dry-run] [--limit N]
    python3 backfill_code_metrics.py --phase after [--dry-run] [--limit N]
    python3 backfill_code_metrics.py --phase all [--dry-run]
    
Options:
    --phase PHASE       Which phase to process: before, after, or all
    --dry-run           Show what would be computed without saving to database
    --limit N           Only process first N records
    --start-from ID     Start from specific smell/experiment ID
    --verbose           Show detailed output including metrics values
    --continue-on-error Continue processing even if some items fail
"""

import sys
import argparse
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.models import (
    StudySmells, Experiment, CodeMetric, File, Repository
)
from llm_refactor.modules.database.crud import create_code_metrics, get_code_metrics


def find_metrics_analyzer_script() -> Optional[Path]:
    """Find the calculate_code_metrics.js script."""
    script_path = Path(__file__).parent / "scripts" / "calculate_code_metrics.js"
    if script_path.exists():
        return script_path
    return None


def compute_metrics_batch(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Compute metrics for a batch of code snippets using Node.js analyzer.
    
    Args:
        items: List of dicts with 'id' and 'code' keys
        
    Returns:
        List of dicts with metrics or errors
    """
    script_path = find_metrics_analyzer_script()
    if not script_path:
        raise FileNotFoundError("calculate_code_metrics.js not found in scripts/")
    
    # Prepare input JSON
    input_data = json.dumps(items)
    
    # Call Node.js script
    try:
        result = subprocess.run(
            ["node", str(script_path)],
            input=input_data,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout for large batches
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown error"
            raise RuntimeError(f"Metrics analyzer failed: {error_msg}")
        
        # Parse output
        metrics_results = json.loads(result.stdout)
        return metrics_results
        
    except subprocess.TimeoutExpired:
        raise RuntimeError("Metrics computation timed out (exceeded 5 minutes)")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse metrics analyzer output: {e}")


def process_before_phase(
    session,
    dry_run: bool = False,
    limit: Optional[int] = None,
    start_from: Optional[int] = None,
    verbose: bool = False,
    continue_on_error: bool = False
) -> Dict[str, int]:
    """
    Process 'before' phase: compute metrics for selected study smells.
    
    Args:
        session: Database session
        dry_run: If True, don't save to database
        limit: Maximum number of smells to process
        start_from: Start from specific smell ID
        verbose: Show detailed output
        continue_on_error: Continue even if some items fail
        
    Returns:
        Dict with statistics (processed, inserted, skipped, failed)
    """
    print("\n" + "=" * 70)
    print("PHASE: BEFORE (Study Smells)")
    print("=" * 70)
    
    # Query all study smells with file/repository info
    query = session.query(
        StudySmells.id,
        StudySmells.code_snippet,
        Repository.name,
        File.path,
        StudySmells.smell_type
    ).join(
        File, StudySmells.file_id == File.id
    ).join(
        Repository, File.repository_id == Repository.id
    ).order_by(StudySmells.id)
    
    if start_from:
        query = query.filter(StudySmells.id >= start_from)
    
    if limit:
        query = query.limit(limit)
    
    smells = query.all()
    
    if not smells:
        print("No study smells found to process")
        return {'processed': 0, 'inserted': 0, 'skipped': 0, 'failed': 0}
    
    print(f"Found {len(smells)} study smells to process")
    if dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    print()
    
    stats = {
        'processed': 0,
        'inserted': 0,
        'skipped': 0,
        'failed': 0,
        'parse_errors': 0
    }
    
    # Process in batches of 50 for efficiency
    batch_size = 50
    for batch_start in range(0, len(smells), batch_size):
        batch_end = min(batch_start + batch_size, len(smells))
        batch_smells = smells[batch_start:batch_end]
        
        print(f"Processing batch {batch_start + 1}-{batch_end} of {len(smells)}...")
        
        # Prepare batch for metrics computation
        items_to_compute = []
        smell_id_map = {}  # Map array index to (smell_id, repo, file, type)
        
        for smell_id, code_snippet, repo_name, file_path, smell_type in batch_smells:
            stats['processed'] += 1
            
            # Check if snippet exists
            if not code_snippet or not code_snippet.strip():
                print(f"  [SKIP] Smell {smell_id}: No code snippet")
                stats['skipped'] += 1
                continue
            
            # Check if metrics already exist for this study smell
            # We need to find experiments that reference this study smell
            experiments_with_this_smell = session.query(Experiment).filter_by(
                study_smell_id=smell_id
            ).all()
            
            # Check if any of these experiments already have 'before' metrics
            has_before_metrics = False
            for exp in experiments_with_this_smell:
                existing_metrics = session.query(CodeMetric).filter_by(
                    experiment_id=exp.id,
                    phase='before'
                ).first()
                if existing_metrics:
                    has_before_metrics = True
                    break
            
            if has_before_metrics:
                if verbose:
                    print(f"  [SKIP] Smell {smell_id}: Already has 'before' metrics")
                stats['skipped'] += 1
                continue
            
            # Add to computation batch
            idx = len(items_to_compute)
            items_to_compute.append({
                'id': idx,
                'code': code_snippet
            })
            smell_id_map[idx] = (smell_id, repo_name, file_path, smell_type, experiments_with_this_smell)
        
        if not items_to_compute:
            continue
        
        # Compute metrics for batch
        try:
            metrics_results = compute_metrics_batch(items_to_compute)
        except Exception as e:
            print(f"  [ERROR] Batch computation failed: {e}")
            if continue_on_error:
                stats['failed'] += len(items_to_compute)
                continue
            else:
                raise
        
        # Process results
        for result in metrics_results:
            idx = result['id']
            smell_id, repo_name, file_path, smell_type, experiments = smell_id_map[idx]
            
            if result.get('error'):
                print(f"  [ERROR] Smell {smell_id}: {result['error']}")
                stats['parse_errors'] += 1
                stats['failed'] += 1
                if not continue_on_error:
                    raise RuntimeError(f"Failed to compute metrics for smell {smell_id}")
                continue
            
            if verbose:
                print(f"  [OK] Smell {smell_id} ({repo_name}/{file_path})")
                print(f"       SLOC: {result['sloc_logical']}, "
                      f"Cyclomatic: {result['cyclomatic_complexity']}, "
                      f"Maintainability: {result['maintainability_index']:.2f}")
            
            # Save to database (for each experiment that references this smell)
            if not dry_run:
                for exp in experiments:
                    try:
                        create_code_metrics(
                            session=session,
                            experiment_id=exp.id,
                            phase='before',
                            sloc_logical=result['sloc_logical'],
                            cyclomatic_complexity=result['cyclomatic_complexity'],
                            cyclomatic_density=result['cyclomatic_density'],
                            halstead_effort=result['halstead_effort'],
                            halstead_bugs=result['halstead_bugs'],
                            halstead_difficulty=result['halstead_difficulty'],
                            halstead_volume=result['halstead_volume'],
                            maintainability_index=result['maintainability_index']
                        )
                        stats['inserted'] += 1
                    except Exception as e:
                        print(f"  [WARN] Smell {smell_id}, Exp {exp.id}: DB insert failed: {e}")
                        if not continue_on_error:
                            raise
            else:
                # Dry run: count what would be inserted
                stats['inserted'] += len(experiments)
        
        # Commit batch
        if not dry_run:
            try:
                session.commit()
                print(f"  ✓ Batch committed ({stats['inserted']} total insertions so far)")
            except Exception as e:
                session.rollback()
                print(f"  [ERROR] Batch commit failed: {e}")
                if not continue_on_error:
                    raise
    
    return stats


def process_after_phase(
    session,
    dry_run: bool = False,
    limit: Optional[int] = None,
    start_from: Optional[int] = None,
    verbose: bool = False,
    continue_on_error: bool = False
) -> Dict[str, int]:
    """
    Process 'after' phase: compute metrics for experiment refactored code.
    
    Args:
        session: Database session
        dry_run: If True, don't save to database
        limit: Maximum number of experiments to process
        start_from: Start from specific experiment ID
        verbose: Show detailed output
        continue_on_error: Continue even if some items fail
        
    Returns:
        Dict with statistics (processed, inserted, skipped, failed)
    """
    print("\n" + "=" * 70)
    print("PHASE: AFTER (Experiment Refactored Code)")
    print("=" * 70)
    
    # Query experiments that don't have 'after' metrics yet
    # Use LEFT JOIN to find experiments without metrics
    from sqlalchemy import and_
    
    query = session.query(Experiment).outerjoin(
        CodeMetric,
        and_(
            CodeMetric.experiment_id == Experiment.id,
            CodeMetric.phase == 'after'
        )
    ).filter(
        CodeMetric.id.is_(None),  # No 'after' metrics exist
        Experiment.refactored_code.isnot(None),  # Has refactored code
        Experiment.refactoring_completed == True  # Refactoring was successful
    ).order_by(Experiment.id)
    
    if start_from:
        query = query.filter(Experiment.id >= start_from)
    
    if limit:
        query = query.limit(limit)
    
    experiments = query.all()
    
    if not experiments:
        print("No experiments found that need 'after' metrics")
        return {'processed': 0, 'inserted': 0, 'skipped': 0, 'failed': 0}
    
    print(f"Found {len(experiments)} experiments to process")
    if dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    print()
    
    stats = {
        'processed': 0,
        'inserted': 0,
        'skipped': 0,
        'failed': 0,
        'parse_errors': 0
    }
    
    # Process in batches of 50
    batch_size = 50
    for batch_start in range(0, len(experiments), batch_size):
        batch_end = min(batch_start + batch_size, len(experiments))
        batch_experiments = experiments[batch_start:batch_end]
        
        print(f"Processing batch {batch_start + 1}-{batch_end} of {len(experiments)}...")
        
        # Prepare batch for metrics computation
        items_to_compute = []
        exp_id_map = {}  # Map array index to experiment_id
        
        for exp in batch_experiments:
            stats['processed'] += 1
            
            # Check if refactored code exists
            if not exp.refactored_code or not exp.refactored_code.strip():
                print(f"  [SKIP] Experiment {exp.id}: No refactored code")
                stats['skipped'] += 1
                continue
            
            # Add to computation batch
            idx = len(items_to_compute)
            items_to_compute.append({
                'id': idx,
                'code': exp.refactored_code
            })
            exp_id_map[idx] = exp.id
        
        if not items_to_compute:
            continue
        
        # Compute metrics for batch
        try:
            metrics_results = compute_metrics_batch(items_to_compute)
        except Exception as e:
            print(f"  [ERROR] Batch computation failed: {e}")
            if continue_on_error:
                stats['failed'] += len(items_to_compute)
                continue
            else:
                raise
        
        # Process results
        for result in metrics_results:
            idx = result['id']
            exp_id = exp_id_map[idx]
            
            if result.get('error'):
                print(f"  [ERROR] Experiment {exp_id}: {result['error']}")
                stats['parse_errors'] += 1
                stats['failed'] += 1
                if not continue_on_error:
                    raise RuntimeError(f"Failed to compute metrics for experiment {exp_id}")
                continue
            
            if verbose:
                print(f"  [OK] Experiment {exp_id}")
                print(f"       SLOC: {result['sloc_logical']}, "
                      f"Cyclomatic: {result['cyclomatic_complexity']}, "
                      f"Maintainability: {result['maintainability_index']:.2f}")
            
            # Save to database
            if not dry_run:
                try:
                    create_code_metrics(
                        session=session,
                        experiment_id=exp_id,
                        phase='after',
                        sloc_logical=result['sloc_logical'],
                        cyclomatic_complexity=result['cyclomatic_complexity'],
                        cyclomatic_density=result['cyclomatic_density'],
                        halstead_effort=result['halstead_effort'],
                        halstead_bugs=result['halstead_bugs'],
                        halstead_difficulty=result['halstead_difficulty'],
                        halstead_volume=result['halstead_volume'],
                        maintainability_index=result['maintainability_index']
                    )
                    stats['inserted'] += 1
                except Exception as e:
                    print(f"  [WARN] Experiment {exp_id}: DB insert failed: {e}")
                    if not continue_on_error:
                        raise
            else:
                stats['inserted'] += 1  # Dry run count
        
        # Commit batch
        if not dry_run:
            try:
                session.commit()
                print(f"  ✓ Batch committed ({stats['inserted']} total insertions so far)")
            except Exception as e:
                session.rollback()
                print(f"  [ERROR] Batch commit failed: {e}")
                if not continue_on_error:
                    raise
    
    return stats


def main():
    parser = argparse.ArgumentParser(
        description='Backfill code metrics for study smells and experiments',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Dry run to see what would be processed
  python3 backfill_code_metrics.py --phase before --dry-run
  
  # Process first 50 study smells
  python3 backfill_code_metrics.py --phase before --limit 50
  
  # Process all experiments (after phase)
  python3 backfill_code_metrics.py --phase after
  
  # Process both phases
  python3 backfill_code_metrics.py --phase all --verbose
        """
    )
    parser.add_argument(
        '--phase',
        choices=['before', 'after', 'all'],
        required=True,
        help='Which phase to process'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Maximum number of records to process'
    )
    parser.add_argument(
        '--start-from',
        type=int,
        help='Start from specific smell/experiment ID'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed output including metrics values'
    )
    parser.add_argument(
        '--continue-on-error',
        action='store_true',
        help='Continue processing even if some items fail'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("CODE METRICS BACKFILL SCRIPT")
    print("=" * 70)
    
    if args.dry_run:
        print("[DRY RUN MODE - No changes will be made]")
    
    # Check if Node.js script exists
    script_path = find_metrics_analyzer_script()
    if not script_path:
        print("\n[ERROR] calculate_code_metrics.js not found in scripts/")
        print("Expected location:", Path(__file__).parent / "scripts" / "calculate_code_metrics.js")
        return 1
    
    print(f"\nUsing metrics analyzer: {script_path.relative_to(Path(__file__).parent)}")
    
    # Connect to database
    db = ResearchDB()
    db.init_database()
    session = db.get_session()
    
    try:
        # Process phases
        if args.phase in ['before', 'all']:
            stats_before = process_before_phase(
                session,
                dry_run=args.dry_run,
                limit=args.limit if args.phase == 'before' else None,
                start_from=args.start_from if args.phase == 'before' else None,
                verbose=args.verbose,
                continue_on_error=args.continue_on_error
            )
        else:
            stats_before = None
        
        if args.phase in ['after', 'all']:
            stats_after = process_after_phase(
                session,
                dry_run=args.dry_run,
                limit=args.limit if args.phase == 'after' else None,
                start_from=args.start_from if args.phase == 'after' else None,
                verbose=args.verbose,
                continue_on_error=args.continue_on_error
            )
        else:
            stats_after = None
        
        # Print summary
        print("\n" + "=" * 70)
        if args.dry_run:
            print("[DRY RUN COMPLETE]")
        else:
            print("[SUCCESS] Backfill completed!")
        print("=" * 70)
        
        if stats_before:
            print("\nBEFORE PHASE (Study Smells):")
            print(f"  Processed: {stats_before['processed']}")
            print(f"  Inserted:  {stats_before['inserted']}")
            print(f"  Skipped:   {stats_before['skipped']}")
            print(f"  Failed:    {stats_before['failed']}")
            if stats_before.get('parse_errors'):
                print(f"  Parse Errors: {stats_before['parse_errors']}")
        
        if stats_after:
            print("\nAFTER PHASE (Experiments):")
            print(f"  Processed: {stats_after['processed']}")
            print(f"  Inserted:  {stats_after['inserted']}")
            print(f"  Skipped:   {stats_after['skipped']}")
            print(f"  Failed:    {stats_after['failed']}")
            if stats_after.get('parse_errors'):
                print(f"  Parse Errors: {stats_after['parse_errors']}")
        
        print("=" * 70)
        
        if args.dry_run:
            print("\nRun without --dry-run to apply changes")
        
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
