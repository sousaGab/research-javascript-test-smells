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
        
        # Parse arguments: strategy_id model_id [options] OR --full-prompt model_id [options]
        parts = args.split()
        
        # Check for --full-prompt mode
        full_prompt_mode = False
        strategy_id = None
        model_id = None
        
        if len(parts) > 0 and parts[0] == "--full-prompt":
            full_prompt_mode = True
            if len(parts) < 2:
                return (
                    "❌ Error: --full-prompt requires model_id.\n\n"
                    "Usage: batch_experiments --full-prompt <model_id> [options]\n\n"
                    "Try 'batch_experiments help' for details."
                )
            try:
                model_id = int(parts[1])
            except ValueError:
                return "❌ Error: model_id must be a number"
            i = 2  # Start parsing flags from position 2
        else:
            # Traditional mode: strategy_id model_id
            if len(parts) < 2:
                return (
                    "❌ Error: Missing required arguments.\n\n"
                    "Usage: batch_experiments <strategy_id> <model_id> [options]\n"
                    "       batch_experiments --full-prompt <model_id> [options]\n\n"
                    "Try 'batch_experiments help' for details."
                )
            
            try:
                strategy_id = int(parts[0])
                model_id = int(parts[1])
            except ValueError:
                return "❌ Error: strategy_id and model_id must be numbers"
            i = 2  # Start parsing flags from position 2
        
        # Parse optional flags
        limit = None
        start_from = None
        verbose = False
        dry_run = False
        skip_executed = True
        redo = False  # force re-execution even if already executed
        phase = "all"  # default: full experiment (refactor + execute)
        manifest_path = None
        delay_seconds = 0  # delay after LLM refactoring (0 = no delay)
        while i < len(parts):
            if parts[i] == "--limit" and i + 1 < len(parts):
                limit = int(parts[i + 1])
                i += 2
            elif parts[i] == "--start-from" and i + 1 < len(parts):
                start_from = int(parts[i + 1])
                i += 2
            elif parts[i] == "--phase" and i + 1 < len(parts):
                phase = parts[i + 1]
                i += 2
            elif parts[i] == "--manifest" and i + 1 < len(parts):
                manifest_path = parts[i + 1]
                i += 2
            elif parts[i] == "--delay":
                delay_seconds = 5
                i += 1
            elif parts[i] == "--verbose" or parts[i] == "-v":
                verbose = True
                i += 1
            elif parts[i] == "--dry-run":
                dry_run = True
                i += 1
            elif parts[i] == "--force" or parts[i] == "--no-skip":
                skip_executed = False
                i += 1
            elif parts[i] == "--redo":
                redo = True
                i += 1
            elif parts[i] == "--list-pending":
                return self._show_pending_executions(strategy_id, model_id)
            elif parts[i] == "--show-pending":
                return self._show_pending_executions(strategy_id, model_id)
            elif parts[i] == "--show-failed":
                return self._show_failed_experiments(strategy_id, model_id)
            else:
                return f"❌ Unknown option: {parts[i]}"
        
        # Validate phase
        if phase not in ["refactor", "execute", "all"]:
            return f"❌ Invalid phase '{phase}'. Must be 'refactor', 'execute', or 'all'"
        
        # In full-prompt mode, ignore --phase flag (always runs both phases for all strategies)
        if full_prompt_mode and phase != "all":
            print("⚠️  Warning: --phase flag is ignored in --full-prompt mode (always runs both phases)")
            phase = "all"
        
        # Validate model
        if model_id < 1 or model_id > len(HuggingFaceModels.MODELS):
            return f"❌ Invalid model ID. Available: 1-{len(HuggingFaceModels.MODELS)}"
        
        # Execute full-prompt mode (all strategies sequentially)
        if full_prompt_mode:
            return self._run_full_prompt_batch(
                model_id=model_id,
                start_from=start_from,
                limit=limit,
                skip_executed=skip_executed,
                verbose=verbose,
                dry_run=dry_run
            )
        
        # Validate strategy for traditional mode
        if strategy_id not in PromptStrategy.STRATEGIES:
            return f"❌ Invalid strategy ID. Available: {list(PromptStrategy.STRATEGIES.keys())}"
        
        # Execute based on phase (traditional mode)
        if phase == "refactor":
            return self._run_batch_refactor_phase(
                strategy_id, model_id,
                start_from=start_from,
                limit=limit,
                skip_executed=skip_executed,
                verbose=verbose,
                dry_run=dry_run,
                delay_seconds=delay_seconds
            )
        elif phase == "execute":
            return self._run_batch_execution_phase(
                strategy_id, model_id,
                manifest_path=manifest_path,
                start_from=start_from,
                limit=limit,
                redo=redo,
                verbose=verbose,
                dry_run=dry_run
            )
        else:  # phase == "all"
            return self._run_batch(
                strategy_id, model_id, 
                start_from=start_from, 
                limit=limit,
                skip_executed=skip_executed,
                verbose=verbose,
                dry_run=dry_run,
                delay_seconds=delay_seconds
            )
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return """
╔══════════════════════════════════════════════════════════════════════════╗
║                      BATCH EXPERIMENTS COMMAND                            ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Execute refactoring experiments for multiple study smells in batch mode.
    Supports multiple execution modes:
    
    ┌─────────────────────────────────────────────────────────────────┐
    │ SINGLE-PHASE MODE (default):                                    │
    │   Refactor → Apply → Test → Detect → Restore (one at a time)   │
    │                                                                  │
    │ TWO-PHASE MODE:                                                  │
    │   Phase 1: Refactor all smells (batch LLM calls)                │
    │   Phase 2: Test & detect all experiments (sequential)           │
    │                                                                  │
    │ FULL-PROMPT MODE (new):                                          │
    │   Runs ALL strategies sequentially with both phases:            │
    │   Strategy 1 (refactor+execute) → Strategy 2 → Strategy 3       │
    │   Complete experimental coverage with single command!           │
    └─────────────────────────────────────────────────────────────────┘

USAGE:
    batch_experiments <strategy_id> <model_id> [options]
    batch_experiments --full-prompt <model_id> [options]

ARGUMENTS:
    strategy_id      Prompt strategy ID (1, 2, or 3) - not used with --full-prompt
    model_id         LLM model ID (use 'refactor models' to see available)
    --full-prompt    Run all 3 strategies sequentially (replaces strategy_id)

OPTIONS:
    --phase PHASE     Execution phase: refactor, execute, or all (default: all)
    --manifest FILE   Use manifest file for execution phase
    --limit N         Process at most N smells/experiments
    --start-from N    Start from smell/experiment ID N
    --delay           Add 5-second delay after LLM refactoring (useful for rate limits)
    --verbose         Show detailed output from each experiment
    --dry-run         Preview what would be executed
    --force           Re-run all (overwrite existing results, refactor phase only)
    --redo            Re-execute ALL experiments (execution phase only, even if already executed)
    --show-pending    Show experiments ready for execution
    --show-failed     Show failed experiments

EXAMPLES:
    # Traditional single-phase mode (backward compatible)
    batch_experiments 3 1                    # Execute all pending smells
    batch_experiments 3 1 --limit 10         # Execute 10 smells
    batch_experiments 3 1 --limit 10 --delay # With 5-second delay after each LLM call
    
    # Full-prompt mode (NEW - runs all 3 strategies automatically)
    batch_experiments --full-prompt 1                  # All strategies, all smells
    batch_experiments --full-prompt 1 --limit 5        # All strategies, 5 smells each
    batch_experiments --full-prompt 1 --start-from 10  # Start from smell ID 10
    
    # Two-phase mode (for time-based LLM pricing)
    batch_experiments 3 1 --phase refactor   # Phase 1: Refactor all
    batch_experiments 3 1 --phase execute    # Phase 2: Test all
    
    # Re-execute experiments from scratch (even if already executed)
    batch_experiments 2 2 --phase execute --redo
    
    # With manifest file
    batch_experiments 3 1 --phase refactor --limit 20
    batch_experiments 3 1 --phase execute --manifest batch_summaries/refactor_manifest_*.json
    
    # Management commands
    batch_experiments list                   # List all study smells
    batch_experiments 3 1 --show-pending     # Show experiments ready for execution
    batch_experiments 3 1 --show-failed      # Show failed experiments
    
    # Dry run
    batch_experiments 3 1 --phase refactor --dry-run --limit 5

MODES:
    --full-prompt  Full-Prompt mode: Execute all 3 strategies sequentially
                   - Runs strategy 1 (refactor+execute for all smells)
                   - Then strategy 2 (refactor+execute for all smells)
                   - Then strategy 3 (refactor+execute for all smells)
                   - Complete experimental coverage with single command
                   - Saves comprehensive summary and individual manifests
                   - Can be interrupted and resumed (skips completed)

PHASES (traditional mode):
    refactor   Phase 1: Call LLM to generate refactored code for all smells
               - Creates experiment records with refactored_code
               - Does NOT modify repository files
               - Saves manifest file for Phase 2
               - Optimizes LLM costs for time-based pricing
    
    execute    Phase 2: Test and analyze refactored experiments
               - Loads experiments from manifest or database
               - Applies changes, runs tests, detects smells
               - Restores original files after each experiment
               - Can re-run failed experiments
    
    all        Single-phase mode (default, backward compatible)
               - Executes both phases for each smell sequentially
               - Traditional workflow

STRATEGIES:
    1 - Zero-Shot
    2 - Few-Shot
    3 - Chain-of-Thought

MODELS:
    Use 'refactor models' to see available LLM models

NOTES:
    - By default, skips smells already executed for the strategy/model
    - Use --force with refactor phase to re-run all smells from scratch
    - Use --redo with execution phase to re-execute ALL experiments (even completed ones)
    - Execution phase can be re-run safely (uses backups)
    - Manifest files are saved to batch_summaries/
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
            # Get strategy and model names for exact matching
            strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
            model_name = HuggingFaceModels.MODELS[model_id - 1]['name']
            
            # Optimized single query with LEFT JOIN
            # Returns study smells that don't have an experiment for this strategy/model
            pending_smells = session.query(
                StudySmells.id,
                Repository.name,
                File.path,
                StudySmells.smell_type
            ).join(
                File, StudySmells.file_id == File.id
            ).join(
                Repository, File.repository_id == Repository.id
            ).outerjoin(
                Experiment,
                and_(
                    StudySmells.id == Experiment.study_smell_id,
                    Experiment.prompting_approach == strategy_name,
                    Experiment.ai_model_version == model_name
                )
            ).filter(
                Experiment.id.is_(None)  # Only smells without matching experiment
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
                   verbose=False, dry_run=False, delay_seconds=0) -> str:
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
                delay_flag = " --delay" if delay_seconds > 0 else ""
                result = self.exp_module.execute(f"{smell_id} {strategy_id} {model_id}{delay_flag}")
                
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
    
    def _run_full_prompt_batch(
        self,
        model_id: int,
        start_from=None,
        limit=None,
        skip_executed=True,
        verbose=False,
        dry_run=False
    ) -> str:
        """
        Execute Full-Prompt mode: Run all 3 strategies sequentially.
        
        For each strategy (1, 2, 3):
        1. Run refactor phase for all smells
        2. Run execute phase for all experiments
        
        This orchestrates complete coverage with automatic refactor+execute for all strategies.
        """
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        if not self.exp_module:
            self.exp_module = ExecuteExperimentModule()
        
        # Get model info
        model_info = HuggingFaceModels.MODELS[model_id - 1]
        model_name = model_info['name']
        
        # Overall tracking
        overall_start_time = time.time()
        overall_stats = {
            'strategies_completed': 0,
            'total_refactored': 0,
            'total_executed': 0,
            'total_failed': 0
        }
        
        all_manifests = []
        strategy_results = []
        
        # Print header
        print("\n" + "=" * 80)
        print("🚀 FULL-PROMPT BATCH EXECUTION")
        print("=" * 80)
        print(f"Model:         {model_name} (ID: {model_id})")
        print(f"Strategies:    All (1: Zero-Shot, 2: Few-Shot, 3: Chain-of-Thought)")
        print(f"Mode:          Sequential execution with both phases")
        print(f"Start Time:    {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        if start_from:
            print(f"🔍 Filter: Starting from smell ID {start_from}")
        if limit:
            print(f"🔍 Filter: Limited to {limit} smells per strategy")
        if skip_executed:
            print(f"📋 Mode: Skip already executed (pending only)")
        else:
            print(f"📋 Mode: Process all smells (may create duplicates)")
        
        if dry_run:
            print("\n🔍 DRY RUN MODE - No experiments will be executed")
            print("\n✅ Dry run complete")
            return "Dry run completed"
        
        print()
        
        # Execute each strategy sequentially
        for strategy_id in [1, 2, 3]:
            strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
            strategy_start_time = time.time()
            
            print("\n" + "#" * 80)
            print(f"📊 STRATEGY {strategy_id}/3: {strategy_name}")
            print("#" * 80)
            
            try:
                # Phase 1: Refactor
                print(f"\n🤖 [Phase 1/2] Refactoring with {strategy_name}...")
                print("─" * 80)
                
                refactor_result = self._run_batch_refactor_phase(
                    strategy_id=strategy_id,
                    model_id=model_id,
                    start_from=start_from,
                    limit=limit,
                    skip_executed=skip_executed,
                    verbose=verbose,
                    dry_run=False
                )
                
                # Extract manifest path from result
                manifest_path = None
                for line in refactor_result.split('\n'):
                    if 'Manifest:' in line and 'batch_summaries' in line:
                        # Extract path from line like "📝 Manifest:    batch_summaries/..."
                        manifest_path = line.split(':', 1)[1].strip()
                        all_manifests.append(manifest_path)
                        break
                
                # Extract stats from refactor result
                refactored_count = 0
                for line in refactor_result.split('\n'):
                    if '✅ Refactored:' in line:
                        try:
                            refactored_count = int(line.split(':')[1].strip())
                            overall_stats['total_refactored'] += refactored_count
                        except (ValueError, IndexError):
                            pass
                
                # Phase 2: Execute
                print(f"\n🧪 [Phase 2/2] Testing and detecting with {strategy_name}...")
                print("─" * 80)
                
                execute_result = self._run_batch_execution_phase(
                    strategy_id=strategy_id,
                    model_id=model_id,
                    manifest_path=manifest_path,
                    start_from=start_from,
                    limit=limit,
                    verbose=verbose,
                    dry_run=False
                )
                
                # Extract stats from execute result
                executed_count = 0
                failed_count = 0
                for line in execute_result.split('\n'):
                    if '✅ Executed:' in line:
                        try:
                            executed_count = int(line.split(':')[1].strip())
                            overall_stats['total_executed'] += executed_count
                        except (ValueError, IndexError):
                            pass
                    elif '❌ Failed:' in line:
                        try:
                            failed_count = int(line.split(':')[1].strip())
                            overall_stats['total_failed'] += failed_count
                        except (ValueError, IndexError):
                            pass
                
                strategy_elapsed = time.time() - strategy_start_time
                overall_stats['strategies_completed'] += 1
                
                strategy_results.append({
                    'strategy_id': strategy_id,
                    'strategy_name': strategy_name,
                    'refactored': refactored_count,
                    'executed': executed_count,
                    'failed': failed_count,
                    'time': strategy_elapsed
                })
                
                print(f"\n✅ Strategy {strategy_id} completed in {strategy_elapsed/60:.1f} minutes")
                print(f"   Refactored: {refactored_count}, Executed: {executed_count}, Failed: {failed_count}")
                
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user")
                print(f"Completed {overall_stats['strategies_completed']}/3 strategies")
                break
            except Exception as e:
                print(f"\n❌ Error in strategy {strategy_id}: {e}")
                overall_stats['total_failed'] += 1
                continue
        
        # Final summary
        overall_elapsed = time.time() - overall_start_time
        
        summary = []
        summary.append("\n\n" + "=" * 80)
        summary.append("📊 FULL-PROMPT EXECUTION SUMMARY")
        summary.append("=" * 80)
        summary.append(f"Model:              {model_name}")
        summary.append(f"Strategies:         {overall_stats['strategies_completed']}/3 completed")
        summary.append(f"Total Refactored:   {overall_stats['total_refactored']}")
        summary.append(f"Total Executed:     {overall_stats['total_executed']}")
        summary.append(f"Total Failed:       {overall_stats['total_failed']}")
        summary.append(f"⏱️  Total Time:       {overall_elapsed/60:.1f} minutes")
        summary.append("")
        summary.append("STRATEGY BREAKDOWN:")
        
        for result in strategy_results:
            summary.append(f"  [{result['strategy_id']}] {result['strategy_name']}:")
            summary.append(f"      Refactored: {result['refactored']}, Executed: {result['executed']}, Failed: {result['failed']}")
            summary.append(f"      Time: {result['time']/60:.1f} minutes")
        
        if all_manifests:
            summary.append("")
            summary.append("MANIFESTS CREATED:")
            for manifest in all_manifests:
                summary.append(f"  📝 {manifest}")
        
        summary.append("")
        summary.append("=" * 80)
        
        # Write comprehensive summary file
        self._write_full_prompt_summary_file(
            model_id, model_name, overall_stats, strategy_results, 
            overall_elapsed, all_manifests
        )
        
        return "\n".join(summary)
    
    def _write_full_prompt_summary_file(
        self, model_id: int, model_name: str, overall_stats: dict,
        strategy_results: list, elapsed_total: float, manifests: list
    ) -> None:
        """Write full-prompt batch execution summary to file."""
        from pathlib import Path
        
        # Create summary directory
        summary_dir = Path("batch_summaries")
        summary_dir.mkdir(exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"batch_summary_full_prompt_m{model_id}_{timestamp}.txt"
        filepath = summary_dir / filename
        
        # Write summary file
        with open(filepath, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("📊 FULL-PROMPT BATCH EXECUTION SUMMARY\n")
            f.write("=" * 80 + "\n")
            f.write(f"Timestamp:          {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Model:              {model_name} (ID: {model_id})\n")
            f.write(f"Execution Mode:     Full-Prompt (All Strategies Sequential)\n")
            f.write(f"\n")
            f.write(f"Strategies:         {overall_stats['strategies_completed']}/3 completed\n")
            f.write(f"Total Refactored:   {overall_stats['total_refactored']}\n")
            f.write(f"Total Executed:     {overall_stats['total_executed']}\n")
            f.write(f"Total Failed:       {overall_stats['total_failed']}\n")
            f.write(f"⏱️  Total Duration:   {elapsed_total/60:.1f} minutes\n")
            f.write(f"⚡ Avg per strategy: {elapsed_total/max(1,overall_stats['strategies_completed'])/60:.1f} minutes\n")
            f.write("=" * 80 + "\n")
            
            if strategy_results:
                f.write("\nSTRATEGY BREAKDOWN:\n")
                f.write("─" * 80 + "\n")
                for result in strategy_results:
                    f.write(f"\n[{result['strategy_id']}] {result['strategy_name']}:\n")
                    f.write(f"  Refactored:  {result['refactored']}\n")
                    f.write(f"  Executed:    {result['executed']}\n")
                    f.write(f"  Failed:      {result['failed']}\n")
                    f.write(f"  Time:        {result['time']/60:.1f} minutes\n")
                f.write("─" * 80 + "\n")
            
            if manifests:
                f.write("\nMANIFESTS CREATED:\n")
                for manifest in manifests:
                    f.write(f"  📝 {manifest}\n")
            
            f.write("\n" + "=" * 80 + "\n")
        
        print(f"\n📝 Full-prompt summary written to: {filepath}")
    
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
    
    def _run_batch_refactor_phase(
        self,
        strategy_id: int,
        model_id: int,
        start_from=None,
        limit=None,
        skip_executed=True,
        verbose=False,
        dry_run=False,
        delay_seconds=0
    ) -> str:
        """
        Execute Phase 1 (Refactor) for multiple smells in batch.
        
        Only calls LLM to generate refactored code, creates experiment records.
        Does NOT apply changes to repositories or run tests.
        
        Saves manifest file for later execution.
        """
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
            mode = "Skip smells with existing experiments"
        else:
            smells = self._get_study_smells()
            mode = "Process all smells (may create duplicates)"
        
        # Apply filters
        if start_from:
            smells = [(sid, r, f, st) for sid, r, f, st in smells if sid >= start_from]
        
        if limit:
            smells = smells[:limit]
        
        total_smells = len(smells)
        
        if total_smells == 0:
            return "\n✅ No smells to refactor!"
        
        # Build header
        output = []
        output.append("\n" + "=" * 80)
        output.append("🚀 BATCH REFACTOR PHASE (Phase 1)")
        output.append("=" * 80)
        output.append(f"Strategy: {strategy_name} (ID: {strategy_id})")
        output.append(f"Model:    {model_name} (ID: {model_id})")
        output.append(f"Mode:     {mode}")
        output.append(f"Total:    {total_smells} smells")
        output.append("=" * 80)
        
        if dry_run:
            output.append("\n🔍 DRY RUN MODE")
            output.append("\nSmells that would be refactored:")
            for idx, (sid, repo, fpath, stype) in enumerate(smells[:10], 1):
                output.append(f"  {idx}. Smell #{sid}: {stype} in {repo}/{fpath}")
            if len(smells) > 10:
                output.append(f"  ... and {len(smells) - 10} more")
            output.append("\n✅ Dry run complete")
            return "\n".join(output)
        
        # Print header
        print("\n".join(output))
        
        # Track results
        stats = {
            'total': total_smells,
            'refactored': 0,
            'failed': 0,
            'start_time': time.time()
        }
        
        manifest_experiments = []
        failed_smells = []
        
        print("\n" + "=" * 80)
        print("🤖 STARTING REFACTORING")
        print("=" * 80)
        
        # Refactor each smell
        for idx, (smell_id, repo, file_path, smell_type) in enumerate(smells, 1):
            print(f"\n{'─' * 80}")
            print(f"[{idx}/{total_smells}] Refactoring Smell ID: {smell_id}")
            print(f"  Repository: {repo}")
            print(f"  Smell: {smell_type}")
            print(f"{'─' * 80}")
            
            try:
                # Call execute_experiment with --phase refactor
                delay_flag = " --delay" if delay_seconds > 0 else ""
                result = self.exp_module.execute(
                    f"{smell_id} {strategy_id} {model_id} --phase refactor{delay_flag}"
                )
                
                if verbose:
                    print(result)
                
                if "❌" not in result and "Experiment ID:" in result:
                    stats['refactored'] += 1
                    
                    # Extract experiment ID from result
                    for line in result.split('\n'):
                        if "Experiment ID:" in line:
                            exp_id = int(line.split(':')[1].strip())
                            manifest_experiments.append({
                                'experiment_id': exp_id,
                                'smell_id': smell_id,
                                'repo': repo,
                                'file_path': file_path,
                                'smell_type': smell_type,
                                'status': 'refactored'
                            })
                            break
                    
                    print(f"✅ Refactored successfully (Experiment #{exp_id})")
                else:
                    stats['failed'] += 1
                    error_msg = result[:100] if len(result) > 100 else result
                    failed_smells.append((smell_id, repo, file_path, smell_type, error_msg))
                    print(f"❌ Refactoring failed: {error_msg}")
                    
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user!")
                break
            except Exception as e:
                stats['failed'] += 1
                error_msg = str(e)[:100]
                failed_smells.append((smell_id, repo, file_path, smell_type, error_msg))
                print(f"❌ Exception: {error_msg}")
            
            # Show progress
            elapsed = time.time() - stats['start_time']
            avg_time = elapsed / idx if idx > 0 else 0
            remaining = (total_smells - idx) * avg_time
            
            print(f"\n📊 Progress: {idx}/{total_smells} ({idx/total_smells*100:.1f}%)")
            print(f"⏱️  Elapsed: {elapsed/60:.1f}m | Est. remaining: {remaining/60:.1f}m")
        
        # Save manifest
        from pathlib import Path
        import json
        
        manifest_dir = Path("batch_summaries")
        manifest_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        manifest_filename = f"refactor_manifest_s{strategy_id}_m{model_id}_{timestamp}.json"
        manifest_path = manifest_dir / manifest_filename
        
        manifest_data = {
            'metadata': {
                'strategy_id': strategy_id,
                'model_id': model_id,
                'strategy_name': strategy_name,
                'model_name': model_name,
                'total': stats['total'],
                'refactored': stats['refactored'],
                'failed': stats['failed'],
                'timestamp': datetime.now().isoformat()
            },
            'experiments': manifest_experiments
        }
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest_data, f, indent=2)
        
        # Final summary
        elapsed_total = time.time() - stats['start_time']
        
        summary = []
        summary.append("\n\n" + "=" * 80)
        summary.append("📊 REFACTOR PHASE SUMMARY")
        summary.append("=" * 80)
        summary.append(f"Strategy:      {strategy_name}")
        summary.append(f"Model:         {model_name}")
        summary.append(f"Total:         {stats['total']}")
        summary.append(f"✅ Refactored:  {stats['refactored']}")
        summary.append(f"❌ Failed:      {stats['failed']}")
        summary.append(f"⏱️  Time:        {elapsed_total/60:.1f} minutes")
        summary.append(f"⚡ Avg:         {elapsed_total/max(1,idx):.1f}s per smell")
        summary.append("")
        summary.append(f"📝 Manifest:    {manifest_path}")
        summary.append("")
        summary.append("NEXT STEPS:")
        summary.append(f"  1. Review refactored code in dataset/ directory")
        summary.append(f"  2. Execute testing phase:")
        summary.append(f"     batch_experiments {strategy_id} {model_id} --phase execute")
        summary.append(f"     (or with manifest: --manifest {manifest_path})")
        summary.append("=" * 80)
        
        return "\n".join(summary)
    
    def _run_batch_execution_phase(
        self,
        strategy_id: int,
        model_id: int,
        manifest_path=None,
        start_from=None,
        limit=None,
        redo=False,
        verbose=False,
        dry_run=False
    ) -> str:
        """
        Execute Phase 2 (Test & Detect) for refactored experiments.
        
        Loads experiments from manifest or database, then executes testing phase.
        """
        from llm_refactor.modules.database.crud import get_refactored_pending_execution
        import json
        from pathlib import Path
        
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        if not self.exp_module:
            self.exp_module = ExecuteExperimentModule()
        
        # Get strategy and model info
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        model_info = HuggingFaceModels.MODELS[model_id - 1]
        model_name = model_info['name']
        
        # Load experiments to execute
        experiments_to_process = []
        
        if manifest_path:
            # Load from manifest file
            manifest_file = Path(manifest_path)
            if not manifest_file.exists():
                return f"❌ Manifest file not found: {manifest_path}"
            
            with open(manifest_file, 'r', encoding='utf-8') as f:
                manifest_data = json.load(f)
            
            for exp in manifest_data.get('experiments', []):
                if exp.get('status') == 'refactored':
                    experiments_to_process.append(exp['experiment_id'])
            
            source = f"manifest {manifest_file.name}"
        else:
            # Query database for pending or all executions
            session = self.db.get_session()
            try:
                if redo:
                    # Get ALL experiments for this strategy/model (including already executed)
                    from llm_refactor.modules.database.models import Experiment
                    experiments = session.query(Experiment).filter(
                        Experiment.prompting_approach == strategy_name,
                        Experiment.ai_model_version == model_name,
                        Experiment.refactored_code.isnot(None)  # Must have refactored code
                    ).all()
                    experiments_to_process = [exp.id for exp in experiments]
                    source = "database query (redo all)"
                else:
                    # Get only pending executions
                    experiments = get_refactored_pending_execution(
                        session, strategy_name, model_name
                    )
                    experiments_to_process = [exp.id for exp in experiments]
                    source = "database query (pending only)"
                session.close()
            finally:
                pass
        
        # Apply filters
        if start_from:
            experiments_to_process = [eid for eid in experiments_to_process if eid >= start_from]
        
        if limit:
            experiments_to_process = experiments_to_process[:limit]
        
        total_experiments = len(experiments_to_process)
        
        if total_experiments == 0:
            return "\n✅ No experiments pending execution!"
        
        # Build header
        output = []
        output.append("\n" + "=" * 80)
        output.append("🧪 BATCH EXECUTION PHASE (Phase 2)")
        output.append("=" * 80)
        output.append(f"Strategy: {strategy_name} (ID: {strategy_id})")
        output.append(f"Model:    {model_name} (ID: {model_id})")
        output.append(f"Source:   {source}")
        output.append(f"Mode:     {'REDO (re-execute all)' if redo else 'Execute pending only'}")
        output.append(f"Total:    {total_experiments} experiments")
        output.append("=" * 80)
        
        if dry_run:
            output.append("\n🔍 DRY RUN MODE")
            output.append("\nExperiments that would be executed:")
            for idx, exp_id in enumerate(experiments_to_process[:10], 1):
                output.append(f"  {idx}. Experiment #{exp_id}")
            if len(experiments_to_process) > 10:
                output.append(f"  ... and {len(experiments_to_process) - 10} more")
            output.append("\n✅ Dry run complete")
            return "\n".join(output)
        
        # Print header
        print("\n".join(output))
        
        # Track results
        stats = {
            'total': total_experiments,
            'executed': 0,
            'failed': 0,
            'start_time': time.time()
        }
        
        failed_experiments = []
        
        print("\n" + "=" * 80)
        print("🧪 STARTING EXECUTION")
        print("=" * 80)
        
        # Execute each experiment
        for idx, experiment_id in enumerate(experiments_to_process, 1):
            print(f"\n{'─' * 80}")
            print(f"[{idx}/{total_experiments}] Executing Experiment ID: {experiment_id}")
            print(f"{'─' * 80}")
            
            try:
                # Call execute_experiment with --experiment-id --phase execute
                result = self.exp_module.execute(
                    f"--experiment-id {experiment_id} --phase execute"
                )
                
                if verbose:
                    print(result)
                
                if "❌" not in result and "EXECUTION PHASE COMPLETED" in result:
                    stats['executed'] += 1
                    print(f"✅ Executed successfully")
                else:
                    stats['failed'] += 1
                    error_msg = result[:100] if len(result) > 100 else result
                    failed_experiments.append((experiment_id, error_msg))
                    print(f"❌ Execution failed: {error_msg}")
                    
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user!")
                break
            except Exception as e:
                stats['failed'] += 1
                error_msg = str(e)[:100]
                failed_experiments.append((experiment_id, error_msg))
                print(f"❌ Exception: {error_msg}")
            
            # Show progress
            elapsed = time.time() - stats['start_time']
            avg_time = elapsed / idx if idx > 0 else 0
            remaining = (total_experiments - idx) * avg_time
            
            print(f"\n📊 Progress: {idx}/{total_experiments} ({idx/total_experiments*100:.1f}%)")
            print(f"⏱️  Elapsed: {elapsed/60:.1f}m | Est. remaining: {remaining/60:.1f}m")
        
        # Final summary
        elapsed_total = time.time() - stats['start_time']
        
        summary = []
        summary.append("\n\n" + "=" * 80)
        summary.append("📊 EXECUTION PHASE SUMMARY")
        summary.append("=" * 80)
        summary.append(f"Strategy:    {strategy_name}")
        summary.append(f"Model:       {model_name}")
        summary.append(f"Total:       {stats['total']}")
        summary.append(f"✅ Executed:  {stats['executed']}")
        summary.append(f"❌ Failed:    {stats['failed']}")
        summary.append(f"⏱️  Time:      {elapsed_total/60:.1f} minutes")
        summary.append(f"⚡ Avg:       {elapsed_total/max(1,idx):.1f}s per experiment")
        
        if failed_experiments:
            summary.append(f"\n❌ Failed Experiments ({len(failed_experiments)}):")
            for exp_id, error in failed_experiments[:10]:
                summary.append(f"  • Experiment #{exp_id}: {error}")
            if len(failed_experiments) > 10:
                summary.append(f"  ... and {len(failed_experiments) - 10} more")
        
        summary.append("=" * 80)
        
        return "\n".join(summary)
    
    def _show_pending_executions(self, strategy_id: int, model_id: int) -> str:
        """Show experiments that have completed refactor but not execution."""
        from llm_refactor.modules.database.crud import get_refactored_pending_execution
        
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        model_info = HuggingFaceModels.MODELS[model_id - 1]
        model_name = model_info['name']
        
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        session = self.db.get_session()
        try:
            experiments = get_refactored_pending_execution(session, strategy_name, model_name)
            
            if not experiments:
                return f"\n✅ No pending executions for {strategy_name} / {model_name}"
            
            output = [
                f"\n📋 Pending Executions: {strategy_name} / {model_name}",
                "=" * 80,
                f"{'Exp ID':<8} {'Smell ID':<10} {'Smell Type':<30} {'Created At':<20}",
                "─" * 80
            ]
            
            for exp in experiments[:50]:
                created = exp.created_at.strftime('%Y-%m-%d %H:%M') if exp.created_at else 'N/A'
                smell_type = exp.study_smell.smell_type if exp.study_smell else 'N/A'
                output.append(
                    f"{exp.id:<8} {exp.study_smell_id:<10} {smell_type:<30} {created:<20}"
                )
            
            if len(experiments) > 50:
                output.append(f"\n... and {len(experiments) - 50} more")
            
            output.extend([
                "",
                f"Total: {len(experiments)} pending executions",
                "",
                "EXECUTE:",
                f"  batch_experiments {strategy_id} {model_id} --phase execute",
                ""
            ])
            
            return "\n".join(output)
        finally:
            session.close()
    
    def _show_failed_experiments(self, strategy_id: int, model_id: int) -> str:
        """Show experiments that failed during refactor or execution."""
        from llm_refactor.modules.database.crud import get_failed_experiments
        
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        model_info = HuggingFaceModels.MODELS[model_id - 1]
        model_name = model_info['name']
        
        if not self.db:
            self.db = ResearchDB()
            self.db.init_database()
        
        session = self.db.get_session()
        try:
            experiments = get_failed_experiments(session, strategy_name, model_name)
            
            if not experiments:
                return f"\n✅ No failed experiments for {strategy_name} / {model_name}"
            
            output = [
                f"\n❌ Failed Experiments: {strategy_name} / {model_name}",
                "=" * 80,
                f"{'Exp ID':<8} {'Smell ID':<10} {'Refactor':<10} {'Execute':<10} {'Notes':<40}",
                "─" * 80
            ]
            
            for exp in experiments[:50]:
                refactor_ok = "✓" if exp.refactor_phase_completed else "✗"
                execute_ok = "✓" if exp.execution_phase_completed else "✗"
                notes = (exp.notes or "")[:38]
                output.append(
                    f"{exp.id:<8} {exp.study_smell_id:<10} {refactor_ok:<10} {execute_ok:<10} {notes:<40}"
                )
            
            if len(experiments) > 50:
                output.append(f"\n... and {len(experiments) - 50} more")
            
            output.extend([
                "",
                f"Total: {len(experiments)} failed experiments",
                "",
                "RE-RUN:",
                f"  # Re-run refactor phase (if refactor failed):",
                f"  batch_experiments {strategy_id} {model_id} --phase refactor --force",
                f"  # Re-run execution phase (if execution failed):",
                f"  batch_experiments {strategy_id} {model_id} --phase execute",
                ""
            ])
            
            return "\n".join(output)
        finally:
            session.close()


# Create module instance
batch_experiments_module = BatchExperimentsModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """Execute Batch Experiments module."""
    return batch_experiments_module.execute(args)
