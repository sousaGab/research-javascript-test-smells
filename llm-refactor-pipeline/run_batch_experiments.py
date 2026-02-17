"""
Batch Experiment Runner

Execute refactoring experiments for all study smells with a specific strategy and model.

Usage:
    python run_batch_experiments.py --strategy 1 --model 1
    python run_batch_experiments.py --strategy 1 --model 1 --start-from 50
    python run_batch_experiments.py --strategy 1 --model 1 --limit 10
    python run_batch_experiments.py --list-smells
    python run_batch_experiments.py --list-pending --strategy 1 --model 1
"""

import argparse
import sys
import time
from datetime import datetime
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.execute_experiment import ExecuteExperimentModule
from llm_refactor.modules.refactor.hf_client import PromptStrategy, HuggingFaceModels


def get_study_smells(db):
    """Get all study smells from database."""
    from llm_refactor.modules.database.models import StudySmells, File, Repository
    
    session = db.get_session()
    try:
        smells = session.query(
            StudySmells.id,
            Repository.name,
            File.path,
            StudySmells.smell_type
        ).join(
            File, StudySmells.file_id == File.id
        ).join(
            Repository, File.repository_id == Repository.id
        ).order_by(StudySmells.id).all()
        
        return [(s[0], s[1], s[2], s[3]) for s in smells]
    finally:
        session.close()


def get_pending_smells(db, strategy_id, model_id):
    """Get smells that haven't been executed for this strategy/model combination."""
    from llm_refactor.modules.database.models import (
        StudySmells, File, Repository, Experiment
    )
    from sqlalchemy import and_
    
    session = db.get_session()
    try:
        # Get all study smells
        all_smells = session.query(StudySmells.id).all()
        all_smell_ids = {s[0] for s in all_smells}
        
        # Get already executed smells for this strategy/model
        executed = session.query(Experiment.study_smell_id).filter(
            and_(
                Experiment.study_smell_id.isnot(None),
                Experiment.prompting_approach == PromptStrategy.STRATEGIES[strategy_id][1],
                Experiment.ai_model_version.like(f"%{HuggingFaceModels.MODELS[model_id-1]['name'][:20]}%")
            )
        ).all()
        
        executed_ids = {e[0] for e in executed if e[0] is not None}
        
        # Pending = all - executed
        pending_ids = all_smell_ids - executed_ids
        
        # Get details for pending smells
        pending_smells = session.query(
            StudySmells.id,
            Repository.name,
            File.path,
            StudySmells.smell_type
        ).join(
            File, StudySmells.file_id == File.id
        ).join(
            Repository, File.repository_id == Repository.id
        ).filter(
            StudySmells.id.in_(pending_ids)
        ).order_by(StudySmells.id).all()
        
        return [(s[0], s[1], s[2], s[3]) for s in pending_smells]
    finally:
        session.close()


def list_smells(db):
    """List all study smells."""
    smells = get_study_smells(db)
    
    print(f"\n📋 Study Smells ({len(smells)} total)")
    print("=" * 100)
    print(f"{'ID':<5} {'Repository':<25} {'File':<40} {'Smell Type':<25}")
    print("─" * 100)
    
    for smell_id, repo, file_path, smell_type in smells:
        file_short = file_path[:37] + "..." if len(file_path) > 40 else file_path
        print(f"{smell_id:<5} {repo:<25} {file_short:<40} {smell_type:<25}")
    
    print()


def list_pending(db, strategy_id, model_id):
    """List pending smells for a strategy/model combination."""
    pending = get_pending_smells(db, strategy_id, model_id)
    
    strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
    model_name = HuggingFaceModels.MODELS[model_id-1]['name']
    
    print(f"\n⏳ Pending Smells for {strategy_name} + {model_name}")
    print("=" * 100)
    print(f"{'ID':<5} {'Repository':<25} {'File':<40} {'Smell Type':<25}")
    print("─" * 100)
    
    for smell_id, repo, file_path, smell_type in pending:
        file_short = file_path[:37] + "..." if len(file_path) > 40 else file_path
        print(f"{smell_id:<5} {repo:<25} {file_short:<40} {smell_type:<25}")
    
    print(f"\nTotal pending: {len(pending)}")
    print()


def run_batch_experiments(strategy_id, model_id, start_from=None, limit=None, 
                         skip_executed=True, verbose=False, dry_run=False):
    """
    Run experiments for all study smells.
    
    Args:
        strategy_id: Prompt strategy ID (1-based)
        model_id: Model ID (1-based)
        start_from: Start from this smell ID (optional)
        limit: Maximum number of experiments to run (optional)
        skip_executed: Skip smells that were already executed (default: True)
        verbose: Show detailed output (default: False)
        dry_run: Show what would run without executing (default: False)
    """
    # Initialize database
    db = ResearchDB()
    db.init_database()
    
    # Get strategy and model info
    strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
    model_info = HuggingFaceModels.MODELS[model_id - 1]
    model_name = model_info['name']
    
    print("\n" + "=" * 80)
    print("🚀 BATCH EXPERIMENT RUNNER")
    print("=" * 80)
    print(f"Strategy: {strategy_name} (ID: {strategy_id})")
    print(f"Model:    {model_name} (ID: {model_id})")
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    # Get smells to process
    if skip_executed:
        smells = get_pending_smells(db, strategy_id, model_id)
        print(f"📊 Mode: Skip already executed (pending only)")
    else:
        smells = get_study_smells(db)
        print(f"📊 Mode: Process all smells")
    
    # Apply filters
    if start_from:
        smells = [(sid, r, f, st) for sid, r, f, st in smells if sid >= start_from]
        print(f"🔍 Filter: Starting from smell ID {start_from}")
    
    if limit:
        smells = smells[:limit]
        print(f"🔍 Filter: Limited to {limit} experiments")
    
    total_smells = len(smells)
    
    if total_smells == 0:
        print("\n✅ No smells to process!")
        return
    
    print(f"\n📋 Total to process: {total_smells}")
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No experiments will be executed")
        print("\nSmells that would be processed:")
        for idx, (sid, repo, fpath, stype) in enumerate(smells[:10], 1):
            print(f"  {idx}. Smell {sid}: {repo}/{fpath} ({stype})")
        if len(smells) > 10:
            print(f"  ... and {len(smells) - 10} more")
        print("\n✅ Dry run complete")
        return
    
    print()
    
    # Confirm execution
    response = input(f"Proceed with {total_smells} experiments? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Cancelled by user")
        return
    
    # Initialize experiment module
    exp_module = ExecuteExperimentModule()
    
    # Track statistics
    stats = {
        'total': total_smells,
        'completed': 0,
        'failed': 0,
        'skipped': 0,
        'start_time': time.time()
    }
    
    failed_smells = []
    
    print("\n" + "=" * 80)
    print("🔄 STARTING EXPERIMENTS")
    print("=" * 80)
    print()
    
    # Run experiments
    for idx, (smell_id, repo, file_path, smell_type) in enumerate(smells, 1):
        print(f"\n{'─' * 80}")
        print(f"[{idx}/{total_smells}] Processing Smell ID: {smell_id}")
        print(f"  Repository: {repo}")
        print(f"  File: {file_path}")
        print(f"  Smell: {smell_type}")
        print(f"{'─' * 80}")
        
        try:
            # Run experiment - execute() expects a string with space-separated args
            result = exp_module.execute(f"{smell_id} {strategy_id} {model_id}")
            
            if verbose and result:
                print("\n" + "-" * 40)
                print(result)
                print("-" * 40)
            
            if result and "❌" not in result:
                stats['completed'] += 1
                print(f"✅ Success ({stats['completed']}/{total_smells})")
            else:
                stats['failed'] += 1
                # Extract error message from result
                if result:
                    # Find the error line
                    error_lines = [line for line in result.split('\n') if '❌' in line]
                    error_msg = error_lines[0].replace('❌ ', '') if error_lines else "Experiment failed"
                    error_msg = error_msg[:100]  # Truncate long messages
                else:
                    error_msg = "No result returned"
                
                failed_smells.append((smell_id, repo, file_path, smell_type, error_msg))
                print(f"❌ Failed: {error_msg}")
                print(f"   ({stats['failed']}/{total_smells} failures)")

                
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user!")
            print(f"Processed: {idx-1}/{total_smells}")
            print(f"Completed: {stats['completed']}")
            print(f"Failed: {stats['failed']}")
            
            response = input("\nSave progress and exit? (yes/no): ")
            if response.lower() in ['yes', 'y']:
                break
            else:
                print("Continuing...")
                continue
                
        except Exception as e:
            stats['failed'] += 1
            error_msg = str(e)[:100]
            failed_smells.append((smell_id, repo, file_path, smell_type, error_msg))
            print(f"❌ Exception: {error_msg}")
            
            # Ask if should continue
            if stats['failed'] >= 3:
                response = input("\nMultiple failures detected. Continue? (yes/no): ")
                if response.lower() not in ['yes', 'y']:
                    break
        
        # Show progress
        elapsed = time.time() - stats['start_time']
        avg_time = elapsed / idx
        remaining = (total_smells - idx) * avg_time
        
        print(f"\n📊 Progress: {idx}/{total_smells} ({idx/total_smells*100:.1f}%)")
        print(f"⏱️  Elapsed: {elapsed/60:.1f}m | Est. remaining: {remaining/60:.1f}m")
    
    # Final summary
    elapsed_total = time.time() - stats['start_time']
    
    print("\n\n" + "=" * 80)
    print("📊 BATCH EXECUTION SUMMARY")
    print("=" * 80)
    print(f"Strategy:  {strategy_name}")
    print(f"Model:     {model_name}")
    print(f"Total:     {stats['total']}")
    print(f"✅ Success: {stats['completed']}")
    print(f"❌ Failed:  {stats['failed']}")
    print(f"⏱️  Time:    {elapsed_total/60:.1f} minutes")
    print(f"⚡ Avg:     {elapsed_total/max(1,idx):.1f}s per experiment")
    
    if failed_smells:
        print(f"\n❌ Failed Smells ({len(failed_smells)}):")
        for smell_id, repo, file_path, smell_type, error in failed_smells:
            print(f"  • ID {smell_id}: {repo} / {file_path[:50]} - {error[:50]}")
    
    print("=" * 80)
    print()


def main():
    parser = argparse.ArgumentParser(
        description="Run batch refactoring experiments for study smells"
    )
    
    parser.add_argument(
        '--strategy', '-s',
        type=int,
        help='Prompt strategy ID (1-based)'
    )
    
    parser.add_argument(
        '--model', '-m',
        type=int,
        help='Model ID (1-based)'
    )
    
    parser.add_argument(
        '--start-from',
        type=int,
        help='Start from this smell ID'
    )
    
    parser.add_argument(
        '--limit', '-l',
        type=int,
        help='Maximum number of experiments to run'
    )
    
    parser.add_argument(
        '--list-smells',
        action='store_true',
        help='List all study smells and exit'
    )
    
    parser.add_argument(
        '--list-pending',
        action='store_true',
        help='List pending smells for strategy/model and exit'
    )
    
    parser.add_argument(
        '--no-skip',
        action='store_true',
        help='Do not skip already executed smells (re-run all)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed output from experiments'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be executed without running experiments'
    )
    
    args = parser.parse_args()
    
    # Initialize database
    db = ResearchDB()
    db.init_database()
    
    # Handle list commands
    if args.list_smells:
        list_smells(db)
        return
    
    if args.list_pending:
        if not args.strategy or not args.model:
            print("❌ --list-pending requires --strategy and --model")
            return
        list_pending(db, args.strategy, args.model)
        return
    
    # Validate required args for batch run
    if not args.strategy or not args.model:
        parser.print_help()
        print("\n❌ Error: --strategy and --model are required for batch execution")
        return
    
    # Validate strategy and model
    if args.strategy not in PromptStrategy.STRATEGIES:
        print(f"❌ Invalid strategy ID. Available: {list(PromptStrategy.STRATEGIES.keys())}")
        return
    
    if args.model < 1 or args.model > len(HuggingFaceModels.MODELS):
        print(f"❌ Invalid model ID. Available: 1-{len(HuggingFaceModels.MODELS)}")
        return
    
    # Run batch experiments
    run_batch_experiments(
        strategy_id=args.strategy,
        model_id=args.model,
        start_from=args.start_from,
        limit=args.limit,
        skip_executed=not args.no_skip,
        verbose=args.verbose,
        dry_run=args.dry_run
    )


if __name__ == '__main__':
    main()
