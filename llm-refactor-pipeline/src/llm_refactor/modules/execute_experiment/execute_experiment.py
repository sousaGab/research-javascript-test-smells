"""
Execute Experiment Module.

Orchestrates complete refactoring experiments: refactor → backup → smell detection → 
test execution → restore → save results.
"""

import time
from pathlib import Path
from typing import Dict, Any, Optional

from llm_refactor.modules.base import SimpleModule
from llm_refactor.core.config import Config
from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import (
    get_study_smell,
    create_experiment,
    update_experiment,
    create_test_results,
    get_or_create_baseline_smell_from_study,
    create_repository_baseline_tests,
    repository_has_baseline_tests,
    reset_experiment_execution_data,
    get_repository_baseline_tests
)
from llm_refactor.modules.refactor.hf_client import (
    HuggingFaceRefactorClient,
    HuggingFaceModels,
    PromptStrategy,
    LLMProvider
)
from llm_refactor.modules.refactor.smell_catalog import TEST_SMELL_CATALOG
from llm_refactor.modules.refactor.utils import clean_code_fences
from llm_refactor.modules.backup_manager import (
    BackupManager,
    BackupFileNotFoundError,
    SnippetReplacementError,
    InvalidPathError
)
from llm_refactor.modules.run_tests.utils import (
    find_repositories_directory,
    execute_tests_for_repository,
    read_run_tests_command,
    extract_coverage_summary,
    extract_test_results
)
from llm_refactor.modules.detect_smells.utils import concatenate_smell_csvs
from llm_refactor.modules.detect_smells.snuts_runner import run_snuts
from llm_refactor.modules.detect_smells.steel_runner import run_steel
from llm_refactor.modules.smell_analysis import (
    SmellAnalyzer,
    save_analysis_json,
    update_experiment_analysis_flags,
    analyze_test_results
)
from llm_refactor.modules.smell_analysis.test_analyzer import (
    parse_coverage_from_summary,
    parse_test_counts_from_summary,
    load_test_summary
)


class ExecuteExperimentModule(SimpleModule):
    """
    Module for executing complete refactoring experiments.
    
    Usage:
        execute_experiment <smell_id> <strategy_id> <model_id>
        
    Examples:
        execute_experiment 42 3 1        # Smell #42, CoT, Qwen 2.5
        execute_experiment 5 1 2         # Smell #5, Zero-shot, Qwen Together
        execute_experiment help          # Show help
    """
    
    name = "execute_experiment"
    description = "Execute complete refactoring experiment with smell detection and testing"
    
    # Provider enum to database ai_tool mapping
    PROVIDER_TO_AI_TOOL = {
        LLMProvider.HUGGINGFACE: "HuggingFace",
        LLMProvider.OPENAI: "OpenAI",
        LLMProvider.ANTHROPIC: "Anthropic",
        LLMProvider.GOOGLE: "Google"
    }
    
    def __init__(self):
        super().__init__()
        # Repositories are at project root (parent of llm-refactor-pipeline)
        project_root = Config.PROJECT_ROOT.parent
        self.backup_manager = BackupManager(
            repositories_dir=project_root / "repositories",
            backup_dir=Config.PROJECT_ROOT / "backup",
            # Preserve original backups during re-execution (--redo)
            # This ensures backup files are never overwritten, only reused
            allow_backup_overwrite=False
        )
        # Performance optimization: cache baseline data during batch processing
        self._baseline_smell_cache = {}  # key: repo_name -> DataFrame
        self._baseline_test_cache = {}   # key: repository_id -> test summary dict
    
    def execute(self, args: str = "") -> str:
        """Execute the experiment command."""
        args = args.strip()
        
        # Handle help
        if args in ["help", "--help", "-h", ""]:
            return self._show_help()
        
        # Handle list models
        if args in ["models", "list-models"]:
            return HuggingFaceModels.list_models()
        
        # Handle list strategies
        if args in ["strategies", "list-strategies"]:
            return PromptStrategy.list_strategies()
        
        # Handle list pending executions
        if "list-pending" in args:
            return self._list_pending_executions(args)
        
        # Parse arguments
        parts = args.split()
        
        # Extract flags
        phase = "all"  # default: both phases
        experiment_id = None
        smell_id = None
        strategy_id = None
        model_id = None
        delay_seconds = 0  # default: no delay
        
        # Parse flags and positional arguments
        i = 0
        while i < len(parts):
            if parts[i] == "--delay":
                delay_seconds = 5  # 5-second delay when flag is present
                i += 1
            elif parts[i] == "--phase" and i + 1 < len(parts):
                phase = parts[i + 1]
                i += 2
            elif parts[i] == "--experiment-id" and i + 1 < len(parts):
                try:
                    experiment_id = int(parts[i + 1])
                except ValueError:
                    return "❌ Error: --experiment-id must be a number"
                i += 2
            else:
                # Positional arguments: smell_id, strategy_id, model_id
                if smell_id is None:
                    try:
                        smell_id = int(parts[i])
                    except ValueError:
                        return f"❌ Error: Invalid smell_id '{parts[i]}'. Must be a number."
                elif strategy_id is None:
                    try:
                        strategy_id = int(parts[i])
                    except ValueError:
                        return f"❌ Error: Invalid strategy_id '{parts[i]}'. Must be a number."
                elif model_id is None:
                    try:
                        model_id = int(parts[i])
                    except ValueError:
                        return f"❌ Error: Invalid model_id '{parts[i]}'. Must be a number."
                else:
                    return f"❌ Error: Unexpected argument '{parts[i]}'"
                i += 1
        
        # Validate phase
        if phase not in ["refactor", "execute", "all"]:
            return f"❌ Error: Invalid phase '{phase}'. Must be 'refactor', 'execute', or 'all'"
        
        # Validate arguments based on phase
        if phase == "execute" and experiment_id is None and smell_id is None:
            return "❌ Error: Execution phase requires either --experiment-id or smell_id+strategy+model"
        
        if phase in ["refactor", "all"] and smell_id is None:
            return "❌ Error: Refactor phase requires smell_id, strategy_id, and model_id"
        
        if smell_id is not None and (strategy_id is None or model_id is None):
            return "❌ Error: When specifying smell_id, also provide strategy_id and model_id"
        
        # Validate strategy and model if provided
        if strategy_id is not None and strategy_id not in [1, 2, 3]:
            return f"❌ Error: Invalid strategy '{strategy_id}'. Must be 1, 2, or 3.\n\n{PromptStrategy.list_strategies()}"
        
        if model_id is not None and not HuggingFaceModels.get_model_by_id(model_id):
            return f"❌ Error: Invalid model ID '{model_id}'.\n\n{HuggingFaceModels.list_models()}"
        
        # Execute based on phase
        if phase == "refactor":
            return self._run_refactor_phase_only(smell_id, strategy_id, model_id, delay_seconds)
        elif phase == "execute":
            if experiment_id:
                return self._run_execution_phase_only(experiment_id=experiment_id)
            else:
                return self._run_execution_phase_only(
                    smell_id=smell_id,
                    strategy_id=strategy_id,
                    model_id=model_id
                )
        else:  # phase == "all"
            return self._run_experiment(smell_id, strategy_id, model_id, delay_seconds)
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return """
╔══════════════════════════════════════════════════════════════════════════╗
║                      EXECUTE EXPERIMENT COMMAND                           ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Executes refactoring experiments in one or two phases:
    
    SINGLE-PHASE MODE (default):
    1. Refactor smell using specified LLM and strategy
    2. Apply changes to repository (with automatic backup)
    3. Run smell detection tools on modified code
    4. Execute repository test suite
    5. Restore original file (cleanup)
    6. Save all results to database and dataset directory
    
    TWO-PHASE MODE:
    Phase 1 (--phase refactor): Refactor with LLM, save code, create experiment
    Phase 2 (--phase execute): Load refactored code, test, detect, save results

USAGE:
    # Single-phase (default - backward compatible)
    execute_experiment <smell_id> <strategy_id> <model_id>
    
    # Two-phase mode
    execute_experiment <smell_id> <strategy_id> <model_id> --phase refactor
    execute_experiment --experiment-id <id> --phase execute
    execute_experiment <smell_id> <strategy_id> <model_id> --phase execute

ARGUMENTS:
    smell_id         ID of smell from study_smells table
    strategy_id      Prompting strategy: 1=Zero-Shot, 2=Few-Shot, 3=CoT
    model_id         LLM model (use 'execute_experiment models' to see list)
    --phase          Phase to execute: refactor, execute, or all (default: all)
    --experiment-id  Experiment ID for execution phase (alternative to smell_id)
    --delay          Add 5-second delay after LLM refactoring (useful for rate limits)

EXAMPLES:
    # Traditional usage (single-phase)
    execute_experiment 42 3 1           # Smell #42, Chain-of-Thought, Qwen 2.5
    execute_experiment 42 3 1 --delay   # With 5-second delay after LLM call
    
    # Two-phase usage (for time-based LLM pricing)
    execute_experiment 42 3 1 --phase refactor      # Phase 1: Refactor only
    execute_experiment --experiment-id 123 --phase execute  # Phase 2: Execute
    
    # Re-execute failed experiment
    execute_experiment --experiment-id 456 --phase execute
    
    # Execute by smell (finds existing experiment)
    execute_experiment 42 3 1 --phase execute

OUTPUT:
    All results saved to:
    dataset/<strategy>/<model>/smell_<id>/
        ├── refactored_code.js
        ├── test_summary.txt      (coverage + test results summary)
        ├── test_output.txt        (full test execution report)
        └── smell_detection/
            ├── steel_smells.csv
            └── snuts_smells.csv

DATABASE:
    Creates experiment record with:
    - Original and refactored code
    - Test results (before/after phases)
    - Smell detection results
    - Execution metrics

OTHER COMMANDS:
    execute_experiment models          # List available LLM models
    execute_experiment strategies      # List prompting strategies
    execute_experiment list-pending    # List experiments ready for execution
    db list_smells                     # List available smells for experiments

NOTES:
    - Original files are ALWAYS restored after experiment
    - Existing output files are overwritten
    - Requires HuggingFace API token (HUGGINGFACE_TOKEN env var)
"""
    
    def _run_experiment(self, smell_id: int, strategy_id: int, model_id: int, delay_seconds: int = 0) -> str:
        """
        Run complete experiment workflow.
        
        Args:
            smell_id: Study smell ID from database
            strategy_id: Prompting strategy (1-3)
            model_id: LLM model ID
            delay_seconds: Seconds to wait after LLM refactoring (default: 0)
            
        Returns:
            Formatted results message
        """
        start_time = time.time()
        experiment_id = None
        db = None
        session = None
        file_was_modified = False
        repo_name = None
        file_path = None
        
        try:
            # Initialize database
            db = ResearchDB()
            session = db.get_session()
            
            # Step 1: Fetch smell data
            print("\n🔍 [1/7] Fetching smell data from database...")
            smell_data = self._fetch_smell_data(session, smell_id)
            if isinstance(smell_data, str):  # Error message
                return smell_data
            
            repo_name = smell_data['repo_name']
            file_path = smell_data['file_path']
            file_id = smell_data['file_id']
            
            # Get repository_id for baseline test results
            from llm_refactor.modules.database.models import File
            file_obj = session.query(File).filter_by(id=file_id).first()
            repository_id = file_obj.repository_id if file_obj else None
            
            # Step 2: Setup output directories
            print("📁 [2/7] Setting up output directories...")
            output_dir = self._setup_output_directory(strategy_id, model_id, smell_id)
            print(f"   → {output_dir}")
            
            # Step 3: Refactor code
            print("🤖 [3/7] Refactoring code with LLM...")
            refactor_result = self._refactor_smell(smell_data, strategy_id, model_id, delay_seconds)
            if isinstance(refactor_result, str) and refactor_result.startswith("❌"):
                return refactor_result
            
            refactored_code = refactor_result['refactored_code']
            prompt_text = refactor_result.get('prompt_text', '')
            tokens_used = refactor_result.get('tokens_used', 0)
            llm_latency = refactor_result.get('llm_latency', 0.0)
            
            # Clean markdown code fences from LLM output
            refactored_code = clean_code_fences(refactored_code)
            
            # Save refactored code to dataset
            refactored_file = output_dir / "refactored_code.js"
            refactored_file.write_text(refactored_code, encoding='utf-8')
            print(f"   ✓ Saved to: {refactored_file.relative_to(Config.PROJECT_ROOT)}")
            
            # Step 4: Apply changes (with backup)
            print("💾 [4/7] Applying refactored code to repository (with backup)...")
            try:
                # Use line number to disambiguate if snippet appears multiple times
                line_number = smell_data.get('line_number')
                if line_number:
                    print(f"   ℹ️  Using line {line_number} to locate snippet")
                
                self.backup_manager.replace_snippet(
                    repo_name=repo_name,
                    file_path=file_path,
                    original_snippet=smell_data['code_snippet'],
                    refactored_snippet=refactored_code,
                    create_backup=True,
                    expected_line=line_number
                )
                file_was_modified = True
                print(f"   ✓ Modified: repositories/{repo_name}/{file_path}")
                print("   ✓ Backup created (or reused if exists)")
            except (SnippetReplacementError, BackupFileNotFoundError, InvalidPathError) as e:
                return f"❌ Error applying changes: {e}"
            
            # Create experiment record in database
            print("💾 Creating experiment record in database...")
            experiment_id = self._create_experiment_record(
                session, smell_data, strategy_id, model_id,
                refactored_code, prompt_text, tokens_used, llm_latency
            )
            
            # COMMIT 1: Persist experiment ID before potentially failing steps
            session.commit()
            print(f"   ✓ Experiment #{experiment_id} created and committed")
            
            # Step 5: Run smell detection
            print("🔬 [5/8] Running smell detection on refactored code...")
            smell_output_dir = output_dir / "smell_detection"
            smell_output_dir.mkdir(exist_ok=True)
            
            smell_detection_success = self._run_smell_detection(
                repo_name, smell_output_dir
            )
            
            if smell_detection_success:
                print(f"   ✓ Smell detection results saved to: {smell_output_dir.relative_to(Config.PROJECT_ROOT)}")
            else:
                print("   ⚠ Smell detection encountered issues (check logs)")
            
            # Step 6: Run tests
            print("🧪 [6/8] Running test suite...")
            test_results = self._run_tests(repo_name, output_dir)
            
            if test_results['success']:
                print("   ✓ Tests executed successfully")
                print(f"   → Summary: {output_dir.relative_to(Config.PROJECT_ROOT)}/test_summary.txt")
                print(f"   → Full output: {output_dir.relative_to(Config.PROJECT_ROOT)}/test_output.txt")
                print(f"   → Exit code: {test_results.get('exit_code', 'N/A')}")
            else:
                print(f"   ⚠ Tests failed or timed out: {test_results.get('error', 'Unknown')}")
            
            # Step 7: Analyze smell changes
            print("📊 [7/8] Analyzing smell changes...")
            analysis_results = self._analyze_smells(
                session, experiment_id, repo_name, smell_data, output_dir
            )
            
            if analysis_results:
                print(f"   ✓ Target smell removed: {analysis_results['target_smell_removed']}")
                print(f"   ✓ New smells introduced: {analysis_results['new_smells_introduced']}")
                if analysis_results.get('net_change') is not None:
                    net_change = analysis_results['net_change']
                    print(f"   → Net smell change: {net_change:+d}")
            else:
                print("   ⚠ Analysis skipped (baseline not found or error occurred)")
            
            # Step 7.5: Analyze test results changes
            print("🧪 [7.5/8] Analyzing test results changes...")
            test_analysis_results = self._analyze_test_results(
                session, experiment_id, repo_name, output_dir, repository_id
            )
            
            if test_analysis_results:
                cov_changed = test_analysis_results.get('coverage_changed')
                test_changed = test_analysis_results.get('tests_changed')
                
                if cov_changed is not None:
                    print(f"   ✓ Coverage changed: {cov_changed}")
                if test_changed is not None:
                    print(f"   ✓ Test counts changed: {test_changed}")
                    
                # Show coverage improvements/regressions if available
                cov_comp = test_analysis_results.get('coverage_comparison')
                if cov_comp and cov_comp.get('improvements'):
                    print(f"   → Coverage improvements: {', '.join(cov_comp['improvements'])}")
                if cov_comp and cov_comp.get('regressions'):
                    print(f"   → Coverage regressions: {', '.join(cov_comp['regressions'])}")
            else:
                print("   ⚠ Test analysis skipped (baseline not found or error occurred)")
            
            # Update experiment with test results
            self._update_experiment_results(
                session, experiment_id, test_results, smell_detection_success, output_dir, repository_id
            )
            
            # Step 8: Restore original file
            print("♻️  [8/8] Restoring original file...")
            try:
                self.backup_manager.undo_refactor(repo_name, file_path)
                file_was_modified = False
                print(f"   ✓ Restored: repositories/{repo_name}/{file_path}")
            except (OSError, IOError) as e:
                print(f"   ⚠ Warning: Could not restore file: {e}")
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Update execution time in database
            update_experiment(session, experiment_id, execution_time_seconds=execution_time)
            
            # COMMIT 2: Batch commit all updates (analysis flags, test results, execution time)
            session.commit()
            print("   ✓ All experiment results committed to database")
            
            # Print summary
            return self._format_summary(
                smell_id, smell_data, strategy_id, model_id,
                output_dir, execution_time, test_results, experiment_id,
                analysis_results
            )
            
        except (OSError, IOError, RuntimeError) as e:
            error_msg = f"❌ Experiment failed: {e}"
            print(f"\n{error_msg}")
            
            # Try to save error to database
            if session and experiment_id:
                try:
                    update_experiment(
                        session, experiment_id,
                        notes=f"ERROR: {str(e)}",
                        refactoring_completed=False
                    )
                    session.commit()
                except (OSError, IOError):
                    pass
            
            return error_msg
            
        finally:
            # ALWAYS restore file if it was modified
            if file_was_modified and repo_name and file_path:
                try:
                    print("\n♻️  Cleanup: Restoring original file...")
                    self.backup_manager.undo_refactor(repo_name, file_path)
                    print("   ✓ Restored successfully")
                except (OSError, IOError) as e:
                    print(f"   ⚠ WARNING: Could not restore file: {e}")
                    print(f"   → Manual restore may be needed for: repositories/{repo_name}/{file_path}")
            
            # Close database session
            if session:
                session.close()
    
    def _run_refactor_phase_only(self, smell_id: int, strategy_id: int, model_id: int, delay_seconds: int = 0) -> str:
        """
        Execute only Phase 1: Refactor with LLM and save code.
        
        Does NOT apply changes to repository or run tests.
        Creates experiment record with refactored_code populated.
        
        Args:
            smell_id: Study smell ID
            strategy_id: Prompting strategy (1-3)
            model_id: LLM model ID
            delay_seconds: Seconds to wait after LLM refactoring (default: 0)
            
        Returns:
            Formatted result message with experiment ID
        """
        start_time = time.time()
        db = None
        session = None
        
        try:
            # Initialize database
            db = ResearchDB()
            session = db.get_session()
            
            # Step 1: Fetch smell data
            print("\n🔍 [Phase 1] Fetching smell data from database...")
            smell_data = self._fetch_smell_data(session, smell_id)
            if isinstance(smell_data, str):  # Error message
                return smell_data
            
            # Step 2: Setup output directories
            print("📁 Setting up output directories...")
            output_dir = self._setup_output_directory(strategy_id, model_id, smell_id)
            print(f"   → {output_dir}")
            
            # Step 3: Refactor code with LLM
            print("🤖 Refactoring code with LLM...")
            refactor_result = self._refactor_smell(smell_data, strategy_id, model_id, delay_seconds)
            if isinstance(refactor_result, str) and refactor_result.startswith("❌"):
                return refactor_result
            
            refactored_code = refactor_result['refactored_code']
            prompt_text = refactor_result.get('prompt_text', '')
            tokens_used = refactor_result.get('tokens_used', 0)
            llm_latency = refactor_result.get('llm_latency', 0.0)
            
            # Clean markdown code fences from LLM output
            refactored_code = clean_code_fences(refactored_code)
            
            # Save refactored code to dataset
            refactored_file = output_dir / "refactored_code.js"
            refactored_file.write_text(refactored_code, encoding='utf-8')
            print(f"   ✓ Saved to: {refactored_file.relative_to(Config.PROJECT_ROOT)}")
            
            # Step 4: Create experiment record
            print("💾 Creating experiment record in database...")
            experiment_id = self._create_experiment_record(
                session, smell_data, strategy_id, model_id,
                refactored_code, prompt_text, tokens_used, llm_latency
            )
            
            # Mark refactor phase as completed
            update_experiment(
                session, experiment_id,
                refactor_phase_completed=True,
                execution_phase_completed=False
            )
            
            execution_time = time.time() - start_time
            update_experiment(session, experiment_id, execution_time_seconds=execution_time)
            
            # SINGLE COMMIT: Batch all operations (create experiment + flags + execution_time)
            session.commit()
            print(f"   ✓ Experiment #{experiment_id} committed to database")
            
            # Format result
            strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
            model_name = next(
                (m['name'] for m in HuggingFaceModels.MODELS if m['id'] == model_id),
                'Unknown'
            )
            
            result = [
                "\n" + "=" * 80,
                "✅ REFACTORING PHASE COMPLETED",
                "=" * 80,
                f"Experiment ID:    {experiment_id}",
                f"Smell ID:         {smell_id}",
                f"Smell Type:       {smell_data['smell_type']}",
                f"Strategy:         {strategy_name}",
                f"Model:            {model_name}",
                f"Execution Time:   {execution_time:.2f}s",
                "",
                f"Output Directory: {output_dir.relative_to(Config.PROJECT_ROOT)}",
                f"Refactored Code:  {refactored_file.relative_to(Config.PROJECT_ROOT)}",
                "",
                "⚠️  NOTE: Changes NOT applied to repository (refactor phase only)",
                "",
                "NEXT STEPS:",
                f"  1. Review refactored code at: {refactored_file}",
                "  2. Execute testing phase:",
                f"     execute_experiment --experiment-id {experiment_id} --phase execute",
                "",
                "=" * 80
            ]
            
            return "\n".join(result)
            
        except (OSError, IOError, RuntimeError) as e:
            return f"❌ Refactoring phase failed: {e}"
            
        finally:
            if session:
                session.close()
    
    def _run_execution_phase_only(
        self,
        experiment_id: Optional[int] = None,
        smell_id: Optional[int] = None,
        strategy_id: Optional[int] = None,
        model_id: Optional[int] = None
    ) -> str:
        """
        Execute only Phase 2: Apply refactored code, test, detect, restore.
        
        Loads refactored code from existing experiment or finds experiment by smell+strategy+model.
        
        Args:
            experiment_id: Experiment ID to execute (optional)
            smell_id: Smell ID to find experiment (alternative to experiment_id)
            strategy_id: Strategy ID (with smell_id)
            model_id: Model ID (with smell_id)
            
        Returns:
            Formatted result message
        """
        start_time = time.time()
        db = None
        session = None
        file_was_modified = False
        repo_name = None
        file_path = None
        
        try:
            # Initialize database
            db = ResearchDB()
            session = db.get_session()
            
            # Find experiment
            if experiment_id:
                print(f"\n🔍 [Phase 2] Loading experiment #{experiment_id}...")
                from llm_refactor.modules.database.crud import get_experiment_with_relations
                experiment = get_experiment_with_relations(session, experiment_id)
                if not experiment:
                    return f"❌ Error: Experiment #{experiment_id} not found"
            else:
                # Find by smell + strategy + model
                print(f"\n🔍 [Phase 2] Finding experiment for smell #{smell_id}...")
                from llm_refactor.modules.database.crud import find_experiment_by_smell_strategy_model
                
                strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
                model_name = next(
                    (m['name'] for m in HuggingFaceModels.MODELS if m['id'] == model_id),
                    None
                )
                
                if not model_name:
                    return f"❌ Error: Invalid model ID {model_id}"
                
                experiment = find_experiment_by_smell_strategy_model(
                    session, smell_id, strategy_name, model_name
                )
                
                if not experiment:
                    return (
                        f"❌ Error: No experiment found for smell #{smell_id}, "
                        f"strategy '{strategy_name}', model '{model_name}'\n"
                        "Tip: Run refactor phase first or use --experiment-id"
                    )
                
                experiment_id = experiment.id
                print(f"   ✓ Found experiment #{experiment_id}")
            
            # Check if refactor phase was completed
            if not experiment.refactor_phase_completed:
                return (
                    f"❌ Error: Experiment #{experiment_id} has not completed refactor phase.\n"
                    "Tip: Run refactor phase first"
                )
            
            # Check if already executed - if so, clean previous execution data
            if experiment.execution_phase_completed:
                print(f"   ⚠️  Warning: Experiment #{experiment_id} already executed. Cleaning previous data...")
                try:
                    reset_experiment_execution_data(session, experiment_id)
                    session.commit()
                    print("   ✓ Previous execution data cleaned successfully")
                except Exception as e:
                    session.rollback()
                    return f"❌ Error: Failed to clean previous execution data: {e}"
            
            # Get refactored code
            refactored_code = experiment.refactored_code
            if not refactored_code:
                return f"❌ Error: Experiment #{experiment_id} has no refactored code"
            
            # Get smell data from experiment
            if not experiment.study_smell:
                return f"❌ Error: Experiment #{experiment_id} has no associated study smell"
            
            smell_data = self._fetch_smell_data(session, experiment.study_smell_id)
            if isinstance(smell_data, str):  # Error message
                return smell_data
            
            repo_name = smell_data['repo_name']
            file_path = smell_data['file_path']
            file_id = smell_data['file_id']
            
            # Get repository_id for baseline test results
            from llm_refactor.modules.database.models import File
            file_obj = session.query(File).filter_by(id=file_id).first()
            repository_id = file_obj.repository_id if file_obj else None
            
            # Reconstruct output directory
            # Extract strategy and model from experiment
            strategy_name_lower = experiment.prompting_approach.lower().replace("-", "_").replace(" ", "_")
            model_name_lower = experiment.ai_model_version.lower().replace(" ", "-").replace("(", "").replace(")", "")
            
            output_dir = Config.PROJECT_ROOT / "dataset" / strategy_name_lower / model_name_lower / f"smell_{experiment.study_smell_id}"
            output_dir.mkdir(parents=True, exist_ok=True)
            
            print(f"   ✓ Output directory: {output_dir.relative_to(Config.PROJECT_ROOT)}")
            print(f"   ✓ Refactored code loaded ({len(refactored_code)} chars)")
            
            # Step 1: Apply changes (with backup)
            print("💾 [1/5] Applying refactored code to repository (with backup)...")
            try:
                line_number = smell_data.get('line_number')
                if line_number:
                    print(f"   ℹ️  Using line {line_number} to locate snippet")
                
                self.backup_manager.replace_snippet(
                    repo_name=repo_name,
                    file_path=file_path,
                    original_snippet=smell_data['code_snippet'],
                    refactored_snippet=refactored_code,
                    create_backup=True,
                    expected_line=line_number
                )
                file_was_modified = True
                print(f"   ✓ Modified: repositories/{repo_name}/{file_path}")
                print("   ✓ Backup created (or reused if exists)")
            except (SnippetReplacementError, BackupFileNotFoundError, InvalidPathError) as e:
                return f"❌ Error applying changes: {e}"
            
            # Step 2: Run smell detection
            print("🔬 [2/5] Running smell detection on refactored code...")
            smell_output_dir = output_dir / "smell_detection"
            smell_output_dir.mkdir(exist_ok=True)
            
            smell_detection_success = self._run_smell_detection(
                repo_name, smell_output_dir
            )
            
            if smell_detection_success:
                print(f"   ✓ Smell detection results saved to: {smell_output_dir.relative_to(Config.PROJECT_ROOT)}")
            else:
                print("   ⚠ Smell detection encountered issues (check logs)")
            
            # Step 3: Run tests
            print("🧪 [3/5] Running test suite...")
            test_results = self._run_tests(repo_name, output_dir)
            
            if test_results['success']:
                print("   ✓ Tests executed successfully")
                print(f"   → Summary: {output_dir.relative_to(Config.PROJECT_ROOT)}/test_summary.txt")
                print(f"   → Full output: {output_dir.relative_to(Config.PROJECT_ROOT)}/test_output.txt")
                print(f"   → Exit code: {test_results.get('exit_code', 'N/A')}")
            else:
                print(f"   ⚠ Tests failed or timed out: {test_results.get('error', 'Unknown')}")
            
            # Step 4: Analyze results
            print("📊 [4/5] Analyzing smell changes...")
            analysis_results = self._analyze_smells(
                session, experiment_id, repo_name, smell_data, output_dir
            )
            
            if analysis_results:
                print(f"   ✓ Target smell removed: {analysis_results['target_smell_removed']}")
                print(f"   ✓ New smells introduced: {analysis_results['new_smells_introduced']}")
                if analysis_results.get('net_change') is not None:
                    net_change = analysis_results['net_change']
                    print(f"   → Net smell change: {net_change:+d}")
            else:
                print("   ⚠ Analysis skipped (baseline not found or error occurred)")
            
            print("🧪 Analyzing test results changes...")
            test_analysis_results = self._analyze_test_results(
                session, experiment_id, repo_name, output_dir, repository_id
            )
            
            if test_analysis_results:
                cov_changed = test_analysis_results.get('coverage_changed')
                test_changed = test_analysis_results.get('tests_changed')
                
                if cov_changed is not None:
                    print(f"   ✓ Coverage changed: {cov_changed}")
                if test_changed is not None:
                    print(f"   ✓ Test counts changed: {test_changed}")
            
            # Update experiment with results
            self._update_experiment_results(
                session, experiment_id, test_results, smell_detection_success, output_dir, repository_id
            )
            
            # Mark execution phase as completed
            update_experiment(
                session, experiment_id,
                execution_phase_completed=True
            )
            
            # Step 5: Restore original file
            print("♻️  [5/5] Restoring original file...")
            try:
                self.backup_manager.undo_refactor(repo_name, file_path)
                file_was_modified = False
                print(f"   ✓ Restored: repositories/{repo_name}/{file_path}")
            except (OSError, IOError) as e:
                print(f"   ⚠ Warning: Could not restore file: {e}")
            
            # Calculate execution time (phase 2 only)
            execution_time = time.time() - start_time
            
            # SINGLE COMMIT: Batch all operations (analysis flags, test results, execution phase flag)
            session.commit()
            print("   ✓ All execution phase results committed to database")
            
            # Format summary
            result = [
                "\n" + "=" * 80,
                "✅ EXECUTION PHASE COMPLETED",
                "=" * 80,
                f"Experiment ID:    {experiment_id}",
                f"Smell ID:         {experiment.study_smell_id}",
                f"Smell Type:       {smell_data['smell_type']}",
                f"Phase 2 Time:     {execution_time:.2f}s",
                "",
                f"Tests Passed:     {test_results.get('success') and test_results.get('exit_code') == 0}",
                f"Smell Removed:    {analysis_results.get('target_smell_removed') if analysis_results else 'N/A'}",
                "",
                f"Output Directory: {output_dir.relative_to(Config.PROJECT_ROOT)}",
                "",
                "=" * 80
            ]
            
            return "\n".join(result)
            
        except (OSError, IOError, RuntimeError) as e:
            error_msg = f"❌ Execution phase failed: {e}"
            print(f"\n{error_msg}")
            return error_msg
            
        finally:
            # ALWAYS restore file if it was modified
            if file_was_modified and repo_name and file_path:
                try:
                    print("\n♻️  Cleanup: Restoring original file...")
                    self.backup_manager.undo_refactor(repo_name, file_path)
                    print("   ✓ Restored successfully")
                except (OSError, IOError) as e:
                    print(f"   ⚠ WARNING: Could not restore file: {e}")
            
            if session:
                session.close()
    
    def _list_pending_executions(self, args: str) -> str:
        """List experiments that have completed refactor phase but not execution phase."""
        from llm_refactor.modules.database.crud import get_refactored_pending_execution
        
        # Parse optional strategy/model filters
        parts = args.replace("list-pending", "").strip().split()
        strategy = None
        model = None
        
        i = 0
        while i < len(parts):
            if parts[i] == "--strategy" and i + 1 < len(parts):
                strategy = parts[i + 1]
                i += 2
            elif parts[i] == "--model" and i + 1 < len(parts):
                model = parts[i + 1]
                i += 2
            else:
                i += 1
        
        db = ResearchDB()
        session = db.get_session()
        
        try:
            experiments = get_refactored_pending_execution(session, strategy, model)
            
            if not experiments:
                return "\n✅ No pending executions found (all experiments are complete)"
            
            output = [
                f"\n📋 Pending Executions ({len(experiments)} total)",
                "=" * 80,
                f"{'ID':<6} {'Smell':<6} {'Smell Type':<25} {'Strategy':<20} {'Model':<30}",
                "─" * 80
            ]
            
            for exp in experiments[:50]:  # Show first 50
                output.append(
                    f"{exp.id:<6} {exp.study_smell_id:<6} "
                    f"{exp.study_smell.smell_type if exp.study_smell else 'N/A':<25} "
                    f"{exp.prompting_approach:<20} "
                    f"{exp.ai_model_version[:28]:<30}"
                )
            
            if len(experiments) > 50:
                output.append(f"\n... and {len(experiments) - 50} more")
            
            output.extend([
                "",
                f"Total: {len(experiments)}",
                "",
                "EXECUTE:",
                "  execute_experiment --experiment-id <id> --phase execute",
                ""
            ])
            
            return "\n".join(output)
            
        finally:
            session.close()
    
    def _fetch_smell_data(self, session, smell_id: int) -> Dict[str, Any]:
        """Fetch smell data from database."""
        smell = get_study_smell(session, smell_id)
        
        if not smell:
            return f"❌ Error: Smell #{smell_id} not found in study_smells table.\nUse 'db list_smells' to see available smells."
        
        if not smell.code_snippet:
            return f"❌ Error: Smell #{smell_id} has no code snippet."
        
        if not smell.file:
            return f"❌ Error: Smell #{smell_id} has no associated file."
        
        if not smell.file.repository:
            return f"❌ Error: Smell #{smell_id} file has no associated repository."
        
        # Get smell catalog info
        smell_catalog = TEST_SMELL_CATALOG.get(smell.smell_type, {})
        
        # Extract line number from line_numbers JSON
        import json
        line_number = None
        if smell.line_numbers:
            try:
                line_info = json.loads(smell.line_numbers) if isinstance(smell.line_numbers, str) else smell.line_numbers
                line_number = line_info.get('line')
            except (json.JSONDecodeError, AttributeError):
                pass
        
        return {
            'smell_id': smell_id,
            'file_id': smell.file_id,
            'smell_type': smell.smell_type,
            'code_snippet': smell.code_snippet,
            'file_path': smell.file.path,
            'repo_name': smell.file.repository.name,
            'line_number': line_number,
            'smell_description': smell_catalog.get('definition', ''),
            'smell_detection': smell_catalog.get('detection', ''),
            'examples': smell_catalog.get('examples', []),
            'refactoring_strategies': smell_catalog.get('refactoring_strategies', [])
        }
    
    def _setup_output_directory(self, strategy_id: int, model_id: int, smell_id: int) -> Path:
        """
        Create output directory structure for experiment.
        
        Returns:
            Path to output directory (e.g., dataset/cot/qwen-2.5-coder/smell_42/)
        """
        strategy_name = self._get_strategy_name(strategy_id)
        model_name = self._get_model_name(model_id)
        
        output_dir = Config.PROJECT_ROOT / "dataset" / strategy_name / model_name / f"smell_{smell_id}"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        return output_dir
    
    def _get_strategy_name(self, strategy_id: int) -> str:
        """Map strategy ID to directory name using PromptStrategy standard."""
        strategy_key = PromptStrategy.get_strategy(strategy_id)
        return strategy_key if strategy_key else f"strategy_{strategy_id}"
    
    def _get_model_name(self, model_id: int) -> str:
        """Map model ID to directory name (sanitized)."""
        model = next(
            (m for m in HuggingFaceModels.MODELS if m['id'] == model_id),
            None
        )
        
        if not model:
            return f"model_{model_id}"
        
        # Sanitize name for filesystem
        name = model['name'].lower()
        name = name.replace(' ', '-')
        name = name.replace('(', '').replace(')', '')
        name = name.replace('/', '-')
        
        return name
    
    def _refactor_smell(self, smell_data: Dict[str, Any], 
                       strategy_id: int, model_id: int, delay_seconds: int = 0) -> Dict[str, Any]:
        """
        Refactor smell using LLM.
        
        Args:
            smell_data: Dictionary containing smell information
            strategy_id: Prompting strategy (1-3)
            model_id: LLM model ID
            delay_seconds: Seconds to wait after LLM refactoring (default: 0)
        
        Returns:
            Dict with 'refactored_code', 'prompt_text', 'tokens_used', 'llm_latency' keys,
            or error string
        """
        try:
            # Get configuration
            strategy = PromptStrategy.get_strategy(strategy_id)
            model_info = HuggingFaceModels.get_model_by_id(model_id)
            
            if not model_info:
                return f"❌ Error: Invalid model ID {model_id}"
            
            # Create client
            client = HuggingFaceRefactorClient()
            
            # Call LLM (returns dict with 'code', 'tokens', 'latency')
            result = client.refactor(
                smell_name=smell_data['smell_type'],
                smell_description=smell_data['smell_description'],
                smell_detection=smell_data.get('smell_detection', ''),
                test_code=smell_data['code_snippet'],
                prompt_strategy=strategy,
                model=model_info['model_id'],
                examples=smell_data.get('examples', []),
                refactoring_strategies=smell_data.get('refactoring_strategies', [])
            )
            
            # Apply delay if requested (for rate limiting)
            if delay_seconds > 0:
                time.sleep(delay_seconds)
            
            if not result or not result.get('code'):
                return "❌ Error: LLM did not return refactored code"
            
            return {
                'refactored_code': result['code'],
                'prompt_text': '',  # Could capture the prompt if needed
                'tokens_used': result.get('tokens', 0),
                'llm_latency': result.get('latency', 0.0)
            }
            
        except (RuntimeError, ValueError) as e:
            return f"❌ Error during refactoring: {e}"
    
    def _run_smell_detection(self, repo_name: str, output_dir: Path) -> bool:
        """
        Run smell detection tools on repository in parallel.
        
        Executes:
        1. Steel detector → saves to output_dir/steel_output/
        2. SNUTS detector → saves to output_dir/snutsjs_output/
        3. Concatenates both results → output_dir/smells.csv
        
        Args:
            repo_name: Repository name
            output_dir: Directory to save results (e.g., dataset/.../smell_detection/)
            
        Returns:
            True if at least one tool succeeded, False otherwise
        """
        try:
            repos_dir = find_repositories_directory(Path(__file__))
            if not repos_dir:
                print("   ⚠ Could not find repositories directory")
                return False
            
            repo_path = repos_dir / repo_name
            if not repo_path.exists():
                print(f"   ⚠ Repository not found: {repo_path}")
                return False
            
            # Run both detectors in parallel using asyncio
            import asyncio
            
            async def run_detectors_parallel():
                async def run_snuts_async():
                    try:
                        success, msg = run_snuts(
                            repo_name=repo_name,
                            repo_path=str(repo_path),
                            output_dir=str(output_dir)
                        )
                        return ('snuts', success, msg)
                    except Exception as e:
                        return ('snuts', False, str(e))
                
                async def run_steel_async():
                    try:
                        success, msg = run_steel(
                            repo_name=repo_name,
                            repo_path=str(repo_path),
                            output_dir=str(output_dir)
                        )
                        return ('steel', success, msg)
                    except Exception as e:
                        return ('steel', False, str(e))
                
                # Run both detectors concurrently
                print("   → Running SNUTS and Steel detectors in parallel...")
                results = await asyncio.gather(
                    run_snuts_async(),
                    run_steel_async(),
                    return_exceptions=True
                )
                return results
            
            # Execute async detection
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            results = loop.run_until_complete(run_detectors_parallel())
            
            # Process results
            snuts_success = False
            steel_success = False
            
            for result in results:
                if isinstance(result, Exception):
                    print(f"   ⚠ Detector error: {result}")
                    continue
                
                tool_name, success, msg = result
                if tool_name == 'snuts':
                    snuts_success = success
                    if success:
                        print("   ✓ SNUTS detection complete")
                    else:
                        print(f"   ⚠ SNUTS detection failed: {msg}")
                elif tool_name == 'steel':
                    steel_success = success
                    if success:
                        print("   ✓ Steel detection complete")
                    else:
                        print(f"   ⚠ Steel detection failed: {msg}")
            
            # Concatenate CSV files from both tools
            if snuts_success or steel_success:
                try:
                    print("   → Concatenating smell detection results...")
                    csv_success, csv_msg = concatenate_smell_csvs(
                        output_dir=output_dir,
                        repo_name=repo_name,
                        repos_dir=repos_dir
                    )
                    if csv_success:
                        print("   ✓ Concatenated CSV created: smells.csv")
                        return True
                    else:
                        print(f"   ⚠ CSV concatenation warning: {csv_msg}")
                        return True  # At least one detector worked
                except Exception as e:
                    print(f"   ⚠ CSV concatenation error: {e}")
                    return True  # At least one detector worked
            
            return False
            
        except Exception as e:
            print(f"   ❌ Smell detection error: {e}")
            return False
    
    def _run_tests(self, repo_name: str, output_dir: Path) -> Dict[str, Any]:
        """
        Run test suite for repository and save both summary and full output.
        
        Creates:
        - test_summary.txt: Coverage + test results summary
        - test_output.txt: Full test execution report
        
        Args:
            repo_name: Repository name
            output_dir: Directory to save test files (e.g., dataset/.../smell_1/)
            
        Returns:
            Dict with test results
        """
        try:
            repos_dir = find_repositories_directory(Path(__file__))
            if not repos_dir:
                return {'success': False, 'error': 'Could not find repositories directory'}
            
            # Read test command
            _, test_command = read_run_tests_command(repos_dir / repo_name)
            if not test_command:
                return {'success': False, 'error': f'No .run_tests file found for {repo_name}'}
            
            # Execute tests
            print(f"   → Running: {test_command}")
            success, stdout, stderr = execute_tests_for_repository(
                repo_path=repos_dir / repo_name,
                command=test_command,
                timeout=300
            )
            
            # Combine stdout and stderr
            combined_output = ""
            if stdout:
                combined_output += stdout
            if stderr:
                if combined_output:
                    combined_output += "\n"
                combined_output += stderr
            
            if not combined_output:
                combined_output = "(no output)"
            
            # Extract coverage and test results using existing functions
            coverage_summary = extract_coverage_summary(combined_output)
            test_results_summary = extract_test_results(combined_output)
            
            # Build summary content
            summary_lines = []
            
            if coverage_summary:
                summary_lines.extend([
                    coverage_summary,
                    "",
                ])
            else:
                summary_lines.extend([
                    "(Coverage information not available)",
                    "",
                ])
            
            if test_results_summary:
                summary_lines.extend([
                    test_results_summary,
                ])
            else:
                summary_lines.extend([
                    "(Test results not available)",
                ])
            
            # Build full output content
            from datetime import datetime
            full_output_lines = [
                "=" * 80,
                f"Test Execution Report: {repo_name}",
                "=" * 80,
                f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                f"Command: {test_command}",
                f"Status: {'SUCCESS' if success else 'FAILED'}",
                "=" * 80,
                "",
                "OUTPUT:",
                "-" * 80,
                combined_output,
                "-" * 80,
                "",
                "=" * 80,
            ]
            
            # Save both files directly to output_dir
            summary_file = output_dir / "test_summary.txt"
            full_output_file = output_dir / "test_output.txt"
            
            summary_file.write_text("\n".join(summary_lines), encoding='utf-8')
            full_output_file.write_text("\n".join(full_output_lines), encoding='utf-8')
            
            return {
                'success': success,
                'exit_code': 0 if success else 1,
                'output': combined_output,
                'error': stderr if not success else None
            }
            
        except (OSError, IOError) as e:
            return {'success': False, 'error': str(e)}
    
    def _create_experiment_record(self, session, smell_data: Dict[str, Any],
                                  strategy_id: int, model_id: int,
                                  refactored_code: str, prompt_text: str,
                                  tokens_used: int = 0, 
                                  llm_latency_seconds: float = 0.0) -> int:
        """Create experiment record in database with LLM performance metrics."""
        model_info = next(
            (m for m in HuggingFaceModels.MODELS if m['id'] == model_id),
            {'name': 'Unknown', 'provider': LLMProvider.HUGGINGFACE}
        )
        
        # Map provider enum to database ai_tool string
        provider = model_info.get('provider', LLMProvider.HUGGINGFACE)
        ai_tool = self.PROVIDER_TO_AI_TOOL.get(provider, "HuggingFace")
        
        strategy_info = PromptStrategy.STRATEGIES.get(strategy_id, (None, 'Unknown', None))
        
        # Get study smell object to create or find baseline smell
        study_smell = get_study_smell(session, smell_data['smell_id'])
        if not study_smell:
            raise ValueError(f"Study smell {smell_data['smell_id']} not found")
        
        # Get or create baseline smell from study smell
        baseline_smell = get_or_create_baseline_smell_from_study(session, study_smell)
        
        # Create experiment with correct provider-specific ai_tool
        experiment = create_experiment(
            session=session,
            baseline_smell_id=baseline_smell.id,
            file_id=smell_data['file_id'],
            ai_tool=ai_tool,
            original_code=smell_data['code_snippet'],
            study_smell_id=smell_data['smell_id'],
            ai_model_version=model_info['name'],
            prompting_approach=strategy_info[1],
            prompt_text=prompt_text,
            refactored_code=refactored_code,
            refactoring_completed=True,
            tokens_used=tokens_used,
            llm_latency_seconds=llm_latency_seconds
        )
        
        # Flush to generate ID without committing - caller decides when to commit
        session.flush()
        return experiment.id
    
    def _analyze_smells(self, session, experiment_id: int, repo_name: str,
                       smell_data: Dict[str, Any], output_dir: Path) -> Dict:
        """
        Analyze smell changes between baseline and refactored versions.
        
        Compares baseline smell CSV (from smells_detected/) with refactored CSV,
        saves results to database and JSON file.
        
        Args:
            session: Database session
            experiment_id: Experiment ID
            repo_name: Repository name
            smell_data: Dict with smell info (file_path, smell_type, etc.)
            output_dir: Experiment output directory
            
        Returns:
            Dict with analysis summary or None if analysis failed/skipped
        """
        try:
            # Get baseline CSV path (already exists from previous detection)
            project_root = Config.PROJECT_ROOT.parent
            baseline_csv = project_root / "smells_detected" / repo_name / "smells.csv"
            
            # Get refactored CSV path
            refactored_csv = output_dir / "smell_detection" / "smells.csv"
            
            # Validate files exist
            if not baseline_csv.exists():
                print(f"   ⚠ Baseline CSV not found: {baseline_csv}")
                return None
            
            if not refactored_csv.exists():
                print(f"   ⚠ Refactored CSV not found: {refactored_csv}")
                return None
            
            # Load CSVs with caching for batch performance
            analyzer = SmellAnalyzer()
            
            # Check cache first (batch optimization)
            if repo_name in self._baseline_smell_cache:
                print(f"   → Using cached baseline smells for {repo_name}")
                baseline_df = self._baseline_smell_cache[repo_name]
            else:
                baseline_df = analyzer.load_smell_csv(baseline_csv)
                if baseline_df is not None:
                    self._baseline_smell_cache[repo_name] = baseline_df
                    print(f"   → Cached baseline smells for {repo_name}")
            
            refactored_df = analyzer.load_smell_csv(refactored_csv)
            
            if baseline_df is None or refactored_df is None:
                print("   ⚠ Failed to load smell CSVs")
                return None
            
            # Run analysis
            from llm_refactor.modules.smell_analysis.analyzer import normalize_smell_name
            target_smell_normalized = normalize_smell_name(smell_data['smell_type'])
            print(f"   → Target smell normalized: '{smell_data['smell_type']}' → '{target_smell_normalized}'")
            
            analysis = analyzer.compare_repositories(
                baseline_df=baseline_df,
                refactored_df=refactored_df,
                target_file=smell_data['file_path'],
                target_smell=smell_data['smell_type']
            )
            
            # Create analysis directory
            analysis_dir = output_dir / "analysis"
            analysis_dir.mkdir(exist_ok=True)
            
            # Save JSON report
            experiment_metadata = {
                'experiment_id': experiment_id,
                'repository': repo_name,
                'target_file': smell_data['file_path'],
                'target_smell': smell_data['smell_type']
            }
            
            save_success = save_analysis_json(
                analysis_data=analysis,
                output_path=analysis_dir / "smell_analysis.json",
                experiment_metadata=experiment_metadata
            )
            
            if save_success:
                print(f"   ✓ Analysis saved: {analysis_dir.relative_to(Config.PROJECT_ROOT)}/smell_analysis.json")
            
            # Update experiment flags (no smell details saved to DB, only analysis flags)
            target_removed = analysis['summary']['target_smell_removed']
            new_introduced = analysis['summary']['introduced_new_smells']
            
            update_success = update_experiment_analysis_flags(
                session=session,
                experiment_id=experiment_id,
                target_removed=target_removed,
                new_introduced=new_introduced
            )
            
            if update_success:
                print("   ✓ Updated experiment analysis flags in database")
            
            # Return summary for display
            return {
                'target_smell_removed': target_removed,
                'new_smells_introduced': new_introduced,
                'net_change': analysis['summary'].get('net_change'),
                'types_increased': analysis['summary'].get('types_increased', 0),
                'increased_details': analysis['repository_wide_changes'].get('smells_increased', [])[:3],
                'analysis_data': analysis
            }
            
        except Exception as e:
            print(f"   ⚠ Error during smell analysis: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _analyze_test_results(self, session, experiment_id: int, 
                              repo_name: str, output_dir: Path, repository_id: int = None) -> Dict:
        """
        Analyze test results changes between baseline and refactored versions.
        
        Compares baseline test_summary.txt (from tests_output/) with refactored 
        test_summary.txt (from experiment output), updates database flags.
        Also saves repository baseline test results if not already saved.
        
        Args:
            session: Database session
            experiment_id: Experiment ID
            repo_name: Repository name
            output_dir: Experiment output directory
            repository_id: Repository ID (optional, for saving baseline tests)
            
        Returns:
            Dict with analysis summary or None if analysis failed/skipped
        """
        try:
            # Get baseline test summary path (from tests_output/)
            project_root = Config.PROJECT_ROOT.parent
            baseline_summary = project_root / "tests_output" / repo_name / "test_summary.txt"
            
            # Get refactored test summary path (from experiment output)
            refactored_summary = output_dir / "test_summary.txt"
            
            # Validate files exist
            if not baseline_summary.exists():
                print(f"   ⚠ Baseline test summary not found: {baseline_summary}")
                return None
            
            # Check cache first for baseline test results (batch optimization)
            baseline_cached = False
            if repository_id and repository_id in self._baseline_test_cache:
                print(f"   → Using cached baseline test results for repository {repository_id}")
                baseline_cached = True
            
            # Save baseline test results to database if not already saved
            if repository_id and not baseline_cached and not repository_has_baseline_tests(session, repository_id):
                print("   Saving baseline test results for repository...")
                baseline_text = load_test_summary(baseline_summary)
                
                if baseline_text:
                    # Parse baseline test metrics
                    baseline_test_counts = parse_test_counts_from_summary(baseline_text)
                    baseline_coverage = parse_coverage_from_summary(baseline_text)
                    
                    # Determine if all tests passed (if data available)
                    all_passed = None
                    if baseline_test_counts:
                        failed = baseline_test_counts.get('tests_failed', 0) or 0
                        all_passed = failed == 0
                    
                    # Save to database
                    create_repository_baseline_tests(
                        session=session,
                        repository_id=repository_id,
                        test_suites_passed=baseline_test_counts.get('test_suites_passed') if baseline_test_counts else None,
                        test_suites_failed=baseline_test_counts.get('test_suites_failed') if baseline_test_counts else None,
                        test_suites_total=baseline_test_counts.get('test_suites_total') if baseline_test_counts else None,
                        tests_passed=baseline_test_counts.get('tests_passed') if baseline_test_counts else None,
                        tests_failed=baseline_test_counts.get('tests_failed') if baseline_test_counts else None,
                        tests_total=baseline_test_counts.get('tests_total') if baseline_test_counts else None,
                        coverage_statements=baseline_coverage.get('statements') if baseline_coverage else None,
                        coverage_branches=baseline_coverage.get('branches') if baseline_coverage else None,
                        coverage_functions=baseline_coverage.get('functions') if baseline_coverage else None,
                        coverage_lines=baseline_coverage.get('lines') if baseline_coverage else None,
                        all_tests_passed=all_passed
                    )
                    # Note: commit deferred to caller for batch optimization
                    
                    # Cache the baseline
                    self._baseline_test_cache[repository_id] = True
                    print("   [OK] Baseline test results saved to database (commit pending)")
                else:
                    print("   [WARN] Could not parse baseline test summary")
            elif repository_id and (baseline_cached or repository_has_baseline_tests(session, repository_id)):
                if not baseline_cached:
                    self._baseline_test_cache[repository_id] = True
                print("   [OK] Baseline test results already saved for this repository")
            
            if not refactored_summary.exists():
                print(f"   ⚠ Refactored test summary not found: {refactored_summary}")
                return None
            
            # Run analysis
            analysis = analyze_test_results(
                baseline_path=baseline_summary,
                refactored_path=refactored_summary
            )
            
            if not analysis or not analysis.get('baseline_available') or not analysis.get('refactored_available'):
                print("   ⚠ Test analysis failed: files not available")
                return None
            
            # Extract binary flags
            coverage_changed = analysis.get('coverage_changed')
            coverage_decreased = analysis.get('coverage_decreased')
            tests_changed = analysis.get('tests_changed')
            tests_pass_rate_decreased = analysis.get('tests_pass_rate_decreased')
            
            # Save analysis JSON
            analysis_dir = output_dir / "analysis"
            analysis_dir.mkdir(exist_ok=True)
            
            import json
            analysis_json_path = analysis_dir / "test_analysis.json"
            with open(analysis_json_path, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, indent=2, default=str)
            
            print(f"   ✓ Test analysis saved: {analysis_dir.relative_to(Config.PROJECT_ROOT)}/test_analysis.json")
            
            # Update experiment flags in database
            update_data = {}
            if coverage_changed is not None:
                update_data['coverage_changed'] = coverage_changed
            if coverage_decreased is not None:
                update_data['coverage_decreased'] = coverage_decreased
            if tests_changed is not None:
                update_data['tests_changed'] = tests_changed
            if tests_pass_rate_decreased is not None:
                update_data['tests_pass_rate_decreased'] = tests_pass_rate_decreased
            
            if update_data:
                update_experiment(session, experiment_id, **update_data)
                # Note: commit deferred to caller for batch optimization
                print("   ✓ Updated experiment test analysis flags (commit pending)")
            
            return analysis
            
        except Exception as e:
            print(f"   ⚠ Error during test analysis: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _update_experiment_results(self, session, experiment_id: int,
                                   test_results: Dict[str, Any],
                                   smell_detection_success: bool,
                                   output_dir: Path,
                                   repository_id: int):  # noqa: ARG002
        """
        Update experiment with test results.
        
        Args:
            session: Database session
            experiment_id: Experiment ID
            test_results: Test execution results (contains success and exit_code)
            smell_detection_success: Whether smell detection succeeded (unused)
            output_dir: Path to experiment output directory (contains test_summary.txt)
            repository_id: Repository ID (for baseline test results)
        """
        # Check if tests passed (exit code 0)
        tests_passed = test_results.get('success', False) and test_results.get('exit_code') == 0
        
        # Update experiment with test results
        # Note: smell_removed and introduced_new_smells are updated in _analyze_smells()
        # Note: coverage_changed and tests_changed are updated in _analyze_test_results()
        update_experiment(
            session=session,
            experiment_id=experiment_id,
            tests_still_passing=tests_passed
        )
        
        # Parse and save detailed test results (after phase only)
        test_summary_path = output_dir / "test_summary.txt"
        test_output_path = output_dir / "test_output.txt"
        after_suites_failed = None
        
        if test_summary_path.exists():
            summary_text = load_test_summary(test_summary_path)
            
            if summary_text:
                # Parse test counts and coverage from summary
                test_counts = parse_test_counts_from_summary(summary_text)
                coverage_data = parse_coverage_from_summary(summary_text)
                after_suites_failed = test_counts.get('test_suites_failed') if test_counts else None
                
                # Create test results record with all metrics (after phase)
                create_test_results(
                    session=session,
                    experiment_id=experiment_id,
                    phase='after',
                    test_suites_passed=test_counts.get('test_suites_passed') if test_counts else None,
                    test_suites_failed=after_suites_failed,
                    test_suites_total=test_counts.get('test_suites_total') if test_counts else None,
                    tests_passed=test_counts.get('tests_passed') if test_counts else None,
                    tests_failed=test_counts.get('tests_failed') if test_counts else None,
                    tests_skipped=test_counts.get('tests_skipped') if test_counts else None,
                    tests_total=test_counts.get('tests_total') if test_counts else None,
                    coverage_statements=coverage_data.get('statements') if coverage_data else None,
                    coverage_branches=coverage_data.get('branches') if coverage_data else None,
                    coverage_functions=coverage_data.get('functions') if coverage_data else None,
                    coverage_lines=coverage_data.get('lines') if coverage_data else None,
                    all_tests_passed=tests_passed
                )
            else:
                # Fallback: create test results with only boolean flag
                create_test_results(
                    session=session,
                    experiment_id=experiment_id,
                    phase='after',
                    all_tests_passed=tests_passed
                )
        elif test_results.get('success'):
            # Fallback: test_summary.txt not found, create minimal record
            create_test_results(
                session=session,
                experiment_id=experiment_id,
                phase='after',
                all_tests_passed=tests_passed
            )
        
        # Classify and save tests_failed / tests_failed_type
        test_output_text = None
        if test_output_path.exists():
            try:
                test_output_text = test_output_path.read_text(encoding='utf-8', errors='replace')
            except Exception:
                pass
        baseline = get_repository_baseline_tests(session, repository_id)
        baseline_suites_failed = baseline.test_suites_failed if baseline else 0
        tf, tf_type = self._classify_tests_failed(after_suites_failed, baseline_suites_failed, test_output_text)
        update_experiment(session=session, experiment_id=experiment_id,
                          tests_failed=tf, tests_failed_type=tf_type)
        
        # Note: commit deferred to caller for batch optimization
    
    @staticmethod
    def _classify_tests_failed(after_suites_failed, baseline_suites_failed, test_output_text):
        """
        Classify whether the refactored experiment introduced test failures.

        Returns:
            (tests_failed: int, tests_failed_type: str|None)
              0, None                     → no new failures
              1, 'suites_failed_increase' → more failed suites than baseline
              1, 'syntax_error'           → JS syntax error in generated code
              1, 'module_resolution_error'→ missing module at runtime
        """
        af = after_suites_failed or 0
        bl = baseline_suites_failed or 0
        if af > bl:
            return 1, 'suites_failed_increase'
        if test_output_text:
            lo = test_output_text.lower()
            if 'syntaxerror' in lo or 'unexpected token' in lo:
                return 1, 'syntax_error'
            if 'cannot find module' in lo or 'module not found' in lo:
                return 1, 'module_resolution_error'
        return 0, None

    def _format_summary(self, smell_id: int, smell_data: Dict[str, Any],
                       strategy_id: int, model_id: int,
                       output_dir: Path, execution_time: float,
                       test_results: Dict[str, Any], experiment_id: int,
                       analysis_results: Dict = None) -> str:
        """Format experiment summary."""
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        model_name = next(
            (m['name'] for m in HuggingFaceModels.MODELS if m['id'] == model_id),
            'Unknown'
        )
        
        tests_status = "✓ PASSED" if test_results.get('success') and test_results.get('exit_code') == 0 else "✗ FAILED"
        
        lines = [
            "",
            "╔══════════════════════════════════════════════════════════════════════════╗",
            "║                    EXPERIMENT COMPLETED                                  ║",
            "╚══════════════════════════════════════════════════════════════════════════╝",
            "",
            f"Experiment ID:    {experiment_id}",
            f"Smell ID:         {smell_id}",
            f"Smell Type:       {smell_data['smell_type']}",
            f"Repository:       {smell_data['repo_name']}",
            f"File:             {smell_data['file_path']}",
            f"Strategy:         [{strategy_id}] {strategy_name}",
            f"Model:            [{model_id}] {model_name}",
            "",
            "RESULTS:",
            f"  Tests:          {tests_status}",
            f"  Execution Time: {execution_time:.2f}s",
        ]
        
        # Add smell analysis results
        if analysis_results:
            lines.append("")
            lines.append("SMELL ANALYSIS:")
            
            target_removed = "✓ Yes" if analysis_results.get('target_smell_removed') else "✗ No"
            lines.append(f"  Target Smell:   {smell_data['smell_type']} → Removed: {target_removed}")
            
            new_introduced = analysis_results.get('new_smells_introduced', False)
            types_increased = analysis_results.get('types_increased', 0)
            
            if new_introduced:
                lines.append(f"  New Smells:     {types_increased} types introduced")
                # Show top introduced smells
                increased_details = analysis_results.get('increased_details', [])
                if increased_details:
                    for smell in increased_details:
                        lines.append(f"                  - {smell['type']}: +{smell['diff']}")
            else:
                lines.append("  New Smells:     None")
            
            net_change = analysis_results.get('net_change')
            if net_change is not None:
                lines.append(f"  Net Change:     {net_change:+d} total smells")
        else:
            lines.append("")
            lines.append("SMELL ANALYSIS:")
            lines.append("  Status:         Skipped (baseline not available)")
        
        lines.extend([
            "",
            "OUTPUT LOCATION:",
            f"  {output_dir.relative_to(Config.PROJECT_ROOT)}/",
            "    ├── refactored_code.js",
            "    ├── test_summary.txt",
            "    ├── test_output.txt",
        ])
        
        if analysis_results:
            lines.extend([
                "    ├── smell_detection/",
                "    └── analysis/",
                "        └── smell_analysis.json",
            ])
        else:
            lines.append("    └── smell_detection/")
        
        lines.extend([
            "",
            "DATABASE:",
            f"  Experiment record created (ID: {experiment_id})",
            "",
            "═" * 76,
            ""
        ])
        
        return "\n".join(lines)


# Create module instance
execute_experiment_module = ExecuteExperimentModule()


# Export execute function for CLI
def execute(args: str = "") -> str:
    """Execute the experiment command."""
    return execute_experiment_module.run(args)
