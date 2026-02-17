"""
Execute Experiment Module.

Orchestrates complete refactoring experiments: refactor → backup → smell detection → 
test execution → restore → save results.
"""

import time
from pathlib import Path
from typing import Dict, Any

from llm_refactor.modules.base import SimpleModule
from llm_refactor.core.config import Config
from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import (
    get_study_smell,
    create_experiment,
    update_experiment,
    create_test_results,
    get_or_create_baseline_smell_from_study
)
from llm_refactor.modules.refactor.hf_client import (
    HuggingFaceRefactorClient,
    HuggingFaceModels,
    PromptStrategy
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
    
    def __init__(self):
        super().__init__()
        # Repositories are at project root (parent of llm-refactor-pipeline)
        project_root = Config.PROJECT_ROOT.parent
        self.backup_manager = BackupManager(
            repositories_dir=project_root / "repositories",
            backup_dir=Config.PROJECT_ROOT / "backup",
            allow_backup_overwrite=True
        )
    
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
        
        # Parse arguments
        parts = args.split()
        
        if len(parts) < 3:
            return (
                "❌ Error: Missing required arguments.\n\n"
                "Usage: execute_experiment <smell_id> <strategy_id> <model_id>\n\n"
                "Example: execute_experiment 42 3 1\n"
                "Try 'execute_experiment help' for details."
            )
        
        try:
            smell_id = int(parts[0])
            strategy_id = int(parts[1])
            model_id = int(parts[2])
        except ValueError:
            return "❌ Error: All arguments must be numbers. Usage: execute_experiment <smell_id> <strategy_id> <model_id>"
        
        # Validate strategy and model
        if strategy_id not in [1, 2, 3]:
            return f"❌ Error: Invalid strategy '{strategy_id}'. Must be 1, 2, or 3.\n\n{PromptStrategy.list_strategies()}"
        
        if not HuggingFaceModels.get_model_by_id(model_id):
            return f"❌ Error: Invalid model ID '{model_id}'.\n\n{HuggingFaceModels.list_models()}"
        
        # Execute experiment
        return self._run_experiment(smell_id, strategy_id, model_id)
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return """
╔══════════════════════════════════════════════════════════════════════════╗
║                      EXECUTE EXPERIMENT COMMAND                           ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Executes a complete refactoring experiment workflow:
    
    1. Refactor smell using specified LLM and strategy
    2. Apply changes to repository (with automatic backup)
    3. Run smell detection tools on modified code
    4. Execute repository test suite
    5. Restore original file (cleanup)
    6. Save all results to database and dataset directory

USAGE:
    execute_experiment <smell_id> <strategy_id> <model_id>

ARGUMENTS:
    smell_id      ID of smell from study_smells table
    strategy_id   Prompting strategy: 1=Zero-Shot, 2=Few-Shot, 3=CoT
    model_id      LLM model: 1=Qwen, 2=Qwen/Together, 3=Qwen/DeepInfra, etc.

EXAMPLES:
    execute_experiment 42 3 1    # Smell #42, Chain-of-Thought, Qwen 2.5
    execute_experiment 5 1 2     # Smell #5, Zero-Shot, Qwen via Together
    execute_experiment 10 2 4    # Smell #10, Few-Shot, DeepSeek R1

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
    execute_experiment models       # List available LLM models
    execute_experiment strategies   # List prompting strategies
    db list_smells                  # List available smells for experiments

NOTES:
    - Original files are ALWAYS restored after experiment
    - Existing output files are overwritten
    - Requires HuggingFace API token (HUGGINGFACE_TOKEN env var)
"""
    
    def _run_experiment(self, smell_id: int, strategy_id: int, model_id: int) -> str:
        """
        Run complete experiment workflow.
        
        Args:
            smell_id: Study smell ID from database
            strategy_id: Prompting strategy (1-3)
            model_id: LLM model ID
            
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
            
            # Step 2: Setup output directories
            print("📁 [2/7] Setting up output directories...")
            output_dir = self._setup_output_directory(strategy_id, model_id, smell_id)
            print(f"   → {output_dir}")
            
            # Step 3: Refactor code
            print("🤖 [3/7] Refactoring code with LLM...")
            refactor_result = self._refactor_smell(smell_data, strategy_id, model_id)
            if isinstance(refactor_result, str) and refactor_result.startswith("❌"):
                return refactor_result
            
            refactored_code = refactor_result['refactored_code']
            prompt_text = refactor_result.get('prompt_text', '')
            
            # Clean markdown code fences from LLM output
            refactored_code = clean_code_fences(refactored_code)
            
            # Save refactored code to dataset
            refactored_file = output_dir / "refactored_code.js"
            refactored_file.write_text(refactored_code, encoding='utf-8')
            print(f"   ✓ Saved to: {refactored_file.relative_to(Config.PROJECT_ROOT)}")
            
            # Step 4: Apply changes (with backup)
            print("💾 [4/7] Applying refactored code to repository (with backup)...")
            try:
                backup_path, backup_created = self.backup_manager.replace_snippet(
                    repo_name=repo_name,
                    file_path=file_path,
                    original_snippet=smell_data['code_snippet'],
                    refactored_snippet=refactored_code,
                    create_backup=True
                )
                file_was_modified = True
                print(f"   ✓ Modified: repositories/{repo_name}/{file_path}")
                print("   ✓ Backup created")
            except (SnippetReplacementError, BackupFileNotFoundError, InvalidPathError) as e:
                return f"❌ Error applying changes: {e}"
            
            # Create experiment record in database
            print("💾 Creating experiment record in database...")
            experiment_id = self._create_experiment_record(
                session, smell_data, strategy_id, model_id,
                refactored_code, prompt_text
            )
            
            # Step 5: Run smell detection
            print("🔬 [5/7] Running smell detection on refactored code...")
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
            print("🧪 [6/7] Running test suite...")
            test_results = self._run_tests(repo_name, output_dir)
            
            if test_results['success']:
                print(f"   ✓ Tests executed successfully")
                print(f"   → Summary: {output_dir.relative_to(Config.PROJECT_ROOT)}/test_summary.txt")
                print(f"   → Full output: {output_dir.relative_to(Config.PROJECT_ROOT)}/test_output.txt")
                print(f"   → Exit code: {test_results.get('exit_code', 'N/A')}")
            else:
                print(f"   ⚠ Tests failed or timed out: {test_results.get('error', 'Unknown')}")
            
            # Update experiment with results
            self._update_experiment_results(
                session, experiment_id, test_results, smell_detection_success
            )
            
            # Step 7: Restore original file
            print("♻️  [7/7] Restoring original file...")
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
            session.commit()
            
            # Print summary
            return self._format_summary(
                smell_id, smell_data, strategy_id, model_id,
                output_dir, execution_time, test_results, experiment_id
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
        
        return {
            'smell_id': smell_id,
            'file_id': smell.file_id,
            'smell_type': smell.smell_type,
            'code_snippet': smell.code_snippet,
            'file_path': smell.file.path,
            'repo_name': smell.file.repository.name,
            'smell_description': smell_catalog.get('definition', ''),
            'examples': smell_catalog.get('examples', []),
            'refactoring_strategies': smell_catalog.get('refactoring_strategies', [])
        }
    
    def _setup_output_directory(self, strategy_id: int, model_id: int, smell_id: int) -> Path:
        """
        Create output directory structure for experiment.
        
        Returns:
            Path to output directory (e.g., dataset/chain-of-thought/qwen-2.5-coder/smell_42/)
        """
        strategy_name = self._get_strategy_name(strategy_id)
        model_name = self._get_model_name(model_id)
        
        output_dir = Config.PROJECT_ROOT / "dataset" / strategy_name / model_name / f"smell_{smell_id}"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        return output_dir
    
    def _get_strategy_name(self, strategy_id: int) -> str:
        """Map strategy ID to directory name."""
        mapping = {
            1: "zero-shot",
            2: "few-shot",
            3: "chain-of-thought"
        }
        return mapping.get(strategy_id, f"strategy_{strategy_id}")
    
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
                       strategy_id: int, model_id: int) -> Dict[str, Any]:
        """
        Refactor smell using LLM.
        
        Returns:
            Dict with 'refactored_code' and 'prompt_text' keys, or error string
        """
        try:
            # Get configuration
            strategy = PromptStrategy.get_strategy(strategy_id)
            model = HuggingFaceModels.get_model_by_id(model_id)
            
            # Create client
            client = HuggingFaceRefactorClient()
            
            # Call LLM
            refactored_code = client.refactor(
                smell_name=smell_data['smell_type'],
                smell_description=smell_data['smell_description'],
                test_code=smell_data['code_snippet'],
                prompt_strategy=strategy,
                model=model,
                examples=smell_data.get('examples', []),
                refactoring_strategies=smell_data.get('refactoring_strategies', [])
            )
            
            if not refactored_code:
                return "❌ Error: LLM did not return refactored code"
            
            return {
                'refactored_code': refactored_code,
                'prompt_text': ''  # Could capture the prompt if needed
            }
            
        except (RuntimeError, ValueError) as e:
            return f"❌ Error during refactoring: {e}"
    
    def _run_smell_detection(self, repo_name: str, output_dir: Path) -> bool:
        """
        Run smell detection tools on repository.
        
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
            
            snuts_success = False
            steel_success = False
            
            # Run SNUTS detector
            try:
                print("   → Running SNUTS detector...")
                snuts_success, snuts_msg = run_snuts(
                    repo_name=repo_name,
                    repo_path=str(repo_path),
                    output_dir=str(output_dir)
                )
                if snuts_success:
                    print("   ✓ SNUTS detection complete")
                else:
                    print(f"   ⚠ SNUTS detection failed: {snuts_msg}")
            except Exception as e:
                print(f"   ⚠ SNUTS detection error: {e}")
            
            # Run Steel detector
            try:
                print("   → Running Steel detector...")
                steel_success, steel_msg = run_steel(
                    repo_name=repo_name,
                    repo_path=str(repo_path),
                    output_dir=str(output_dir)
                )
                if steel_success:
                    print("   ✓ Steel detection complete")
                else:
                    print(f"   ⚠ Steel detection failed: {steel_msg}")
            except Exception as e:
                print(f"   ⚠ Steel detection error: {e}")
            
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
                        print(f"   ✓ Concatenated CSV created: smells.csv")
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
            auto_install, test_command = read_run_tests_command(repos_dir / repo_name)
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
                                  refactored_code: str, prompt_text: str) -> int:
        """Create experiment record in database."""
        model_info = next(
            (m for m in HuggingFaceModels.MODELS if m['id'] == model_id),
            {'name': 'Unknown'}
        )
        
        strategy_info = PromptStrategy.STRATEGIES.get(strategy_id, (None, 'Unknown', None))
        
        # Get study smell object to create or find baseline smell
        study_smell = get_study_smell(session, smell_data['smell_id'])
        if not study_smell:
            raise ValueError(f"Study smell {smell_data['smell_id']} not found")
        
        # Get or create baseline smell from study smell
        baseline_smell = get_or_create_baseline_smell_from_study(session, study_smell)
        
        # Create experiment with both baseline_smell_id and study_smell_id
        experiment = create_experiment(
            session=session,
            baseline_smell_id=baseline_smell.id,
            file_id=smell_data['file_id'],
            ai_tool="HuggingFace",
            original_code=smell_data['code_snippet'],
            study_smell_id=smell_data['smell_id'],
            ai_model_version=model_info['name'],
            prompting_approach=strategy_info[1],
            prompt_text=prompt_text,
            refactored_code=refactored_code,
            refactoring_completed=True
        )
        
        session.commit()
        return experiment.id
    
    def _update_experiment_results(self, session, experiment_id: int,
                                   test_results: Dict[str, Any],
                                   smell_detection_success: bool):  # noqa: ARG002
        """Update experiment with test results and outcomes."""
        tests_passed = test_results.get('success', False) and test_results.get('exit_code') == 0
        
        # Update experiment
        update_experiment(
            session=session,
            experiment_id=experiment_id,
            tests_still_passing=tests_passed,
            smell_removed=None,  # Would need to parse smell detection results
            introduced_new_smells=None  # Would need to compare before/after
        )
        
        # Create test results record (after phase)
        if test_results.get('success'):
            create_test_results(
                session=session,
                experiment_id=experiment_id,
                phase='after',
                all_tests_passed=tests_passed
            )
        
        session.commit()
    
    def _format_summary(self, smell_id: int, smell_data: Dict[str, Any],
                       strategy_id: int, model_id: int,
                       output_dir: Path, execution_time: float,
                       test_results: Dict[str, Any], experiment_id: int) -> str:
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
            "",
            "OUTPUT LOCATION:",
            f"  {output_dir.relative_to(Config.PROJECT_ROOT)}/",
            "    ├── refactored_code.js",
            "    ├── test_summary.txt",
            "    ├── test_output.txt",
            "    └── smell_detection/",
            "",
            "DATABASE:",
            f"  Experiment record created (ID: {experiment_id})",
            "",
            "═" * 76,
            ""
        ]
        
        return "\n".join(lines)


# Create module instance
execute_experiment_module = ExecuteExperimentModule()


# Export execute function for CLI
def execute(args: str = "") -> str:
    """Execute the experiment command."""
    return execute_experiment_module.run(args)
