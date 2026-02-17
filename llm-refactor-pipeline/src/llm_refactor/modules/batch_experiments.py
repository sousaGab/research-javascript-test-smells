"""
Batch Experiments Module.

Execute refactoring experiments for multiple study smells in batch mode.
Supports filtering by strategy and model, with progress tracking and error handling.
"""

import time
from datetime import datetime
from typing import List, Tuple

from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.execute_experiment import ExecuteExperimentModule
from llm_refactor.modules.refactor.hf_client import PromptStrategy, HuggingFaceModels


class BatchExperimentsModule(SimpleModule):
    """
    Batch Experiments module.
    
    Execute experiments for multiple study smells with specified strategy and model.
    """

    name = "batch_experiments"
    description = "Execute batch refactoring experiments for study smells"

    def __init__(self):
        super().__init__()
        self.db = None
        self.exp_module = None
    
    def execute(self, args: str = "") -> str:
        """Execute the batch experiments command."""
        args = args.strip()
        
        # Handle help
        if args in ["help", "--help", "-h", ""]:
            return self._show_help()
        
        # Handle list commands
        if args == "list":
            return self._list_smells()
        
        # Parse arguments: strategy_id model_id [--limit N] [--start-from N] [--verbose] [--dry-run] [--no-skip]
        parts = args.split()
        
        if len(parts) < 2:
            return (
                "❌ Error: Missing required arguments.\n\n"
                "Usage: batch_experiments <strategy_id> <model_id> [options]\n\n"
                "Try 'batch_experiments help' for details."
            )
        
        try:
            strategy_id = int(parts[0])
            model_id = int(parts[1])
        except ValueError:
            return "❌ Error: strategy_id and model_id must be numbers"
        
        # Parse optional flags
        limit = None
        start_from = None
        verbose = False
        dry_run = False
        skip_executed = True
        
        i = 2
        while i < len(parts):
            if parts[i] == "--limit" and i + 1 < len(parts):
                limit = int(parts[i + 1])
                i += 2
            elif parts[i] == "--start-from" and i + 1 < len(parts):
                start_from = int(parts[i + 1])
                i += 2
            elif parts[i] == "--verbose" or parts[i] == "-v":
                verbose = True
                i += 1
            elif parts[i] == "--dry-run":
                dry_run = True
                i += 1
            elif parts[i] == "--force" or parts[i] == "--no-skip":
                skip_executed = False
                i += 1
            elif parts[i] == "--list-pending":
                return self._list_pending(strategy_id, model_id)
            else:
                return f"❌ Unknown option: {parts[i]}"
        
        # Validate strategy and model
        if strategy_id not in PromptStrategy.STRATEGIES:
            return f"❌ Invalid strategy ID. Available: {list(PromptStrategy.STRATEGIES.keys())}"
        
        if model_id < 1 or model_id > len(HuggingFaceModels.MODELS):
            return f"❌ Invalid model ID. Available: 1-{len(HuggingFaceModels.MODELS)}"
        
        # Execute batch
        return self._run_batch(
            strategy_id, model_id, 
            start_from=start_from, 
            limit=limit,
            skip_executed=skip_executed,
            verbose=verbose,
            dry_run=dry_run
        )
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return """
╔══════════════════════════════════════════════════════════════════════════╗
║                      BATCH EXPERIMENTS COMMAND                            ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Execute refactoring experiments for multiple study smells in batch mode.
    Automatically processes all smells (or pending ones) with specified strategy
    and model combination.

USAGE:
    batch_experiments <strategy_id> <model_id> [options]

ARGUMENTS:
    strategy_id    Prompt strategy ID (1, 2, or 3)
    model_id       LLM model ID (use 'refactor models' to see available)

OPTIONS:
    --limit N         Process at most N smells (for testing)
    --start-from N    Start from smell ID N (for resuming)
    --verbose         Show detailed output from each experiment
    --dry-run         Show what would be executed without running
    --force           Re-run all smells (overwrite existing results)
    --list-pending    List smells pending for this strategy/model

EXAMPLES:
    # List all study smells
    batch_experiments list

    # See pending smells for strategy 1, model 1
    batch_experiments 1 1 --list-pending

    # Dry run to see what would be executed
    batch_experiments 1 1 --limit 5 --dry-run

    # Execute 5 smells with strategy 1 and model 1
    batch_experiments 1 1 --limit 5

    # Execute all pending smells (skips already done)
    batch_experiments 1 1

    # Resume from smell ID 50
    batch_experiments 1 1 --start-from 50

    # Execute with verbose output
    batch_experiments 1 1 --limit 5 --verbose

STRATEGIES:
    1 - Zero-Shot
    2 - Few-Shot
    3 - Chain-of-Thought

MODELS:
    Use 'refactor models' to see available LLM models

NOTES:
    - By default, skips smells already executed for the strategy/model
    - Use --force to re-execute all smells (overwrite results)
    - Press Ctrl+C to interrupt (progress is saved)
    - Failed experiments are logged and written to summary file
"""
    
    def _get_study_smells(self) -> List[Tuple[int, str, str, str]]:
        """Get all study smells from database."""
        from llm_refactor.modules.database.models import StudySmells, File, Repository
        
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        session = self.db.get_session()
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
    
    def _get_pending_smells(self, strategy_id: int, model_id: int) -> List[Tuple[int, str, str, str]]:
        """Get smells that haven't been executed for this strategy/model combination."""
        from llm_refactor.modules.database.models import (
            StudySmells, File, Repository, Experiment
        )
        from sqlalchemy import and_
        
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        session = self.db.get_session()
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
    
    def _list_smells(self) -> str:
        """List all study smells."""
        smells = self._get_study_smells()
        
        output = [f"\n📋 Study Smells ({len(smells)} total)"]
        output.append("=" * 80)
        output.append(f"{'ID':<5} {'Repository':<25} {'File':<40} {'Smell Type':<25}")
        output.append("─" * 80)
        
        for smell_id, repo, file_path, smell_type in smells[:50]:  # Show first 50
            file_short = file_path if len(file_path) <= 40 else file_path[:37] + "..."
            output.append(f"{smell_id:<5} {repo:<25} {file_short:<40} {smell_type:<25}")
        
        if len(smells) > 50:
            output.append(f"\n... and {len(smells) - 50} more")
        
        output.append(f"\nTotal: {len(smells)}")
        
        return "\n".join(output)
    
    def _list_pending(self, strategy_id: int, model_id: int) -> str:
        """List pending smells for strategy/model."""
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        model_name = HuggingFaceModels.MODELS[model_id - 1]['name']
        
        smells = self._get_pending_smells(strategy_id, model_id)
        
        output = [f"\n📋 Pending Smells for {strategy_name} / {model_name}"]
        output.append("=" * 80)
        output.append(f"{'ID':<5} {'Repository':<25} {'File':<40} {'Smell Type':<25}")
        output.append("─" * 80)
        
        for smell_id, repo, file_path, smell_type in smells[:50]:  # Show first 50
            file_short = file_path if len(file_path) <= 40 else file_path[:37] + "..."
            output.append(f"{smell_id:<5} {repo:<25} {file_short:<40} {smell_type:<25}")
        
        if len(smells) > 50:
            output.append(f"\n... and {len(smells) - 50} more")
        
        output.append(f"\nTotal pending: {len(smells)}")
        
        return "\n".join(output)
    
    def _run_batch(self, strategy_id: int, model_id: int, 
                   start_from=None, limit=None, skip_executed=True, 
                   verbose=False, dry_run=False) -> str:
        """Run batch experiments."""
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        if not self.exp_module:
            self.exp_module = ExecuteExperimentModule()
        
        # Get strategy and model info
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        model_info = HuggingFaceModels.MODELS[model_id - 1]
        model_name = model_info['name']
        
        # Get smells to process
        if skip_executed:
            smells = self._get_pending_smells(strategy_id, model_id)
            mode = "Skip already executed (pending only)"
        else:
            smells = self._get_study_smells()
            mode = "Process all smells"
        
        # Apply filters
        if start_from:
            smells = [(sid, r, f, st) for sid, r, f, st in smells if sid >= start_from]
        
        if limit:
            smells = smells[:limit]
        
        total_smells = len(smells)
        
        if total_smells == 0:
            return "\n✅ No smells to process!"
        
        # Build output
        output = []
        output.append("\n" + "=" * 80)
        output.append("🚀 BATCH EXPERIMENT RUNNER")
        output.append("=" * 80)
        output.append(f"Strategy: {strategy_name} (ID: {strategy_id})")
        output.append(f"Model:    {model_name} (ID: {model_id})")
        output.append(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        output.append("=" * 80)
        output.append(f"\n📊 Mode: {mode}")
        
        if start_from:
            output.append(f"🔍 Filter: Starting from smell ID {start_from}")
        if limit:
            output.append(f"🔍 Filter: Limited to {limit} experiments")
        
        output.append(f"\n📋 Total to process: {total_smells}")
        
        if dry_run:
            output.append("\n🔍 DRY RUN MODE - No experiments will be executed")
            output.append("\nSmells that would be processed:")
            for idx, (sid, repo, fpath, stype) in enumerate(smells[:10], 1):
                output.append(f"  {idx}. Smell {sid}: {repo}/{fpath} ({stype})")
            if len(smells) > 10:
                output.append(f"  ... and {len(smells) - 10} more")
            output.append("\n✅ Dry run complete")
            return "\n".join(output)
        
        # Print header
        print("\n".join(output))
        
        # Track statistics
        stats = {
            'total': total_smells,
            'completed': 0,
            'failed': 0,
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
                # Run experiment
                result = self.exp_module.execute(f"{smell_id} {strategy_id} {model_id}")
                
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
                        error_lines = [line for line in result.split('\n') if '❌' in line]
                        error_msg = error_lines[0].replace('❌ ', '') if error_lines else "Experiment failed"
                        error_msg = error_msg[:100]
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
                break
                    
            except Exception as e:
                stats['failed'] += 1
                error_msg = str(e)[:100]
                failed_smells.append((smell_id, repo, file_path, smell_type, error_msg))
                print(f"❌ Exception: {error_msg}")
                
                # Ask if should continue after multiple failures
                if stats['failed'] >= 3 and stats['failed'] % 3 == 0:
                    print(f"\n⚠️  {stats['failed']} failures detected.")
            
            # Show progress
            elapsed = time.time() - stats['start_time']
            avg_time = elapsed / idx
            remaining = (total_smells - idx) * avg_time
            
            print(f"\n📊 Progress: {idx}/{total_smells} ({idx/total_smells*100:.1f}%)")
            print(f"⏱️  Elapsed: {elapsed/60:.1f}m | Est. remaining: {remaining/60:.1f}m")
        
        # Final summary
        elapsed_total = time.time() - stats['start_time']
        
        summary = []
        summary.append("\n\n" + "=" * 80)
        summary.append("📊 BATCH EXECUTION SUMMARY")
        summary.append("=" * 80)
        summary.append(f"Strategy:  {strategy_name}")
        summary.append(f"Model:     {model_name}")
        summary.append(f"Total:     {stats['total']}")
        summary.append(f"✅ Success: {stats['completed']}")
        summary.append(f"❌ Failed:  {stats['failed']}")
        summary.append(f"⏱️  Time:    {elapsed_total/60:.1f} minutes")
        summary.append(f"⚡ Avg:     {elapsed_total/max(1,idx):.1f}s per experiment")
        
        if failed_smells:
            summary.append(f"\n❌ Failed Smells ({len(failed_smells)}):")
            for smell_id, repo, fpath, stype, error in failed_smells[:10]:
                file_short = fpath if len(fpath) <= 40 else fpath[:37] + "..."
                error_short = error if len(error) <= 50 else error[:47] + "..."
                summary.append(f"  • ID {smell_id}: {repo} / {file_short} - {error_short}")
            if len(failed_smells) > 10:
                summary.append(f"  ... and {len(failed_smells) - 10} more")
        
        summary.append("=" * 80)
        
        # Write summary file with failed smells
        self._write_summary_file(
            strategy_id, model_id, strategy_name, model_name,
            stats, failed_smells, elapsed_total
        )
        
        return "\n".join(summary)
    
    def _write_summary_file(self, strategy_id: int, model_id: int,
                           strategy_name: str, model_name: str,
                           stats: dict, failed_smells: list,
                           elapsed_total: float) -> None:
        """Write batch execution summary to file."""
        from pathlib import Path
        
        # Create summary directory
        summary_dir = Path("batch_summaries")
        summary_dir.mkdir(exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"batch_summary_s{strategy_id}_m{model_id}_{timestamp}.txt"
        filepath = summary_dir / filename
        
        # Write summary file
        with open(filepath, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("📊 BATCH EXECUTION SUMMARY\n")
            f.write("=" * 80 + "\n")
            f.write(f"Timestamp:  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Strategy:   {strategy_name} (ID: {strategy_id})\n")
            f.write(f"Model:      {model_name} (ID: {model_id})\n")
            f.write(f"\n")
            f.write(f"Total:      {stats['total']} experiments\n")
            f.write(f"✅ Success:  {stats['completed']}\n")
            f.write(f"❌ Failed:   {stats['failed']}\n")
            f.write(f"⏱️  Duration: {elapsed_total/60:.1f} minutes\n")
            f.write(f"⚡ Average:  {elapsed_total/max(1,stats['total']):.1f}s per experiment\n")
            f.write("=" * 80 + "\n")
            
            if failed_smells:
                f.write(f"\n❌ FAILED EXPERIMENTS ({len(failed_smells)})\n")
                f.write("=" * 80 + "\n")
                f.write(f"{'ID':<8} {'Repository':<20} {'File':<50} {'Error'}\n")
                f.write("-" * 80 + "\n")
                
                for smell_id, repo, fpath, stype, error in failed_smells:
                    file_display = fpath if len(fpath) <= 50 else "..." + fpath[-47:]
                    repo_display = repo if len(repo) <= 20 else repo[:17] + "..."
                    f.write(f"{smell_id:<8} {repo_display:<20} {file_display:<50} {error}\n")
                
                f.write("\n" + "=" * 80 + "\n")
                f.write("\nFAILED SMELL IDs:\n")
                f.write(", ".join(str(sid) for sid, _, _, _, _ in failed_smells))
                f.write("\n")
            else:
                f.write("\n✅ All experiments completed successfully!\n")
            
            f.write("\n" + "=" * 80 + "\n")
        
        print(f"\n📝 Summary written to: {filepath}")


# Create module instance
batch_experiments_module = BatchExperimentsModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """Execute Batch Experiments module."""
    return batch_experiments_module.execute(args)
