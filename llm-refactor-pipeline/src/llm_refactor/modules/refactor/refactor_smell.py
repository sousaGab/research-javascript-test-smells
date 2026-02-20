"""
Refactor Smell Module.

Integrates HuggingFace LLM API with the research database to refactor test smells.
"""

import os
from pathlib import Path
from typing import Dict, Any, List

from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import get_study_smell
from .smell_catalog import TEST_SMELL_CATALOG
from .hf_client import (
    HuggingFaceRefactorClient,
    HuggingFaceModels,
    PromptStrategy
)
from llm_refactor.modules.backup_manager import (
    BackupManager,
    BackupFileNotFoundError,
    SnippetReplacementError,
    InvalidPathError
)


class RefactorSmellModule(SimpleModule):
    """ 
    Module for refactoring test smells using HuggingFace LLMs.
    
    Usage:
        refactor <smell_id> [prompt_strategy] [model_id] [--apply]
        
    Examples:
        refactor 42                    # Show refactored code only (dry-run)
        refactor 42 1                  # Zero-shot, default model, dry-run
        refactor 42 2 3                # Few-shot, model #3, dry-run
        refactor 42 3 1 --apply        # Apply changes with backup
        refactor help                  # Show detailed help
    """
    
    name = "refactor"
    description = "Refactor test smells using HuggingFace LLMs"
    
    def execute(self, args: str = "") -> str:
        """Execute the refactor command."""
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
        
        if len(parts) < 1:
            return "❌ Error: smell_id required. Usage: refactor <smell_id> [strategy] [model] [--apply]\nTry 'refactor help' for details."
        
        try:
            smell_id = int(parts[0])
        except ValueError:
            return f"❌ Error: Invalid smell_id '{parts[0]}'. Must be a number."
        
        # Parse optional prompt strategy (default: CoT = 3)
        strategy_id = 3
        if len(parts) >= 2 and parts[1] != '--apply':
            try:
                strategy_id = int(parts[1])
                if strategy_id not in [1, 2, 3]:
                    return f"❌ Error: Invalid strategy '{strategy_id}'. Must be 1, 2, or 3.\n\n{PromptStrategy.list_strategies()}"
            except ValueError:
                return f"❌ Error: Invalid strategy '{parts[1]}'. Must be a number (1-3)."
        
        # Parse optional model (default: 1)
        model_id = 1
        if len(parts) >= 3 and parts[2] != '--apply':
            try:
                model_id = int(parts[2])
                if not HuggingFaceModels.get_model_by_id(model_id):
                    return f"❌ Error: Invalid model ID '{model_id}'.\n\n{HuggingFaceModels.list_models()}"
            except ValueError:
                return f"❌ Error: Invalid model ID '{parts[2]}'. Must be a number."
        
        # Check for --apply flag
        apply_changes = '--apply' in parts
        
        # Execute refactoring
        return self._refactor_smell(smell_id, strategy_id, model_id, apply_changes)
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return f"""
╔══════════════════════════════════════════════════════════════════════════╗
║                    REFACTOR TEST SMELL - HELP                            ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Refactor a test smell from the database using HuggingFace LLMs.

USAGE:
    refactor <smell_id> [strategy] [model] [--apply]

ARGUMENTS:
    smell_id       : Database ID of the smell to refactor (required)
    strategy       : Prompt strategy ID (default: 3 - Chain-of-Thought)
                     [1] Zero-Shot
                     [2] Few-Shot
                     [3] Chain-of-Thought (recommended)
    model          : Model ID (default: 1 - Qwen 2.5 Coder 32B)
    --apply        : Apply changes to file with automatic backup (default: dry-run)

EXAMPLES:
    refactor 42                 # Dry-run: show refactored code only
    refactor 42 1               # Dry-run with zero-shot strategy
    refactor 42 2 3             # Dry-run with few-shot, model #3
    refactor 42 3 1 --apply     # Apply changes with backup (CoT, Qwen)
    refactor 42 --apply         # Apply with default strategy and model

ADDITIONAL COMMANDS:
    refactor help               # Show this help
    refactor models             # List available models
    refactor strategies         # List available prompt strategies

STRATEGIES:
{PromptStrategy.list_strategies()}

MODELS (abbreviated - use 'refactor models' for full list):
    [1] Qwen 2.5 Coder 32B (DEFAULT)
    [2] Qwen 2.5 Coder 32B (Together)
    [3] Qwen 2.5 Coder 32B (DeepInfra)
    [4] DeepSeek R1
    [5] DeepSeek R1 Distill Qwen 32B
    [6] Llama 3.1 70B

SETUP:
    Ensure HF_TOKEN environment variable is set with your HuggingFace API token.
    
    Add to your .env file:
        HF_TOKEN=your_huggingface_token_here

NOTE:
    The smell must exist in the database (study_smells table).
    Use 'db list_smells' to see available smells.
"""
    
    def _refactor_smell(
        self,
        smell_id: int,
        strategy_id: int,
        model_id: int,
        apply_changes: bool = False
    ) -> str:
        """
        Perform the actual refactoring.
        
        Args:
            smell_id: Database ID of the smell
            strategy_id: Prompt strategy ID (1-3)
            model_id: Model ID
            apply_changes: If True, create backup and apply changes to file (default: False)
        
        Returns:
            Formatted result message
        """
        # Validate and get configuration
        config = self._get_refactor_config(strategy_id, model_id)
        if isinstance(config, str):  # Error message
            return config
        
        # Fetch smell from database
        smell_data = self._fetch_smell_data(smell_id)
        if isinstance(smell_data, str):  # Error message
            return smell_data
        
        # Display header
        self._print_header(smell_id, smell_data, config, apply_changes)
        
        # Get LLM refactoring
        try:
            refactored_code = self._get_llm_refactoring(smell_data, config)
        except Exception as e:
            return self._format_error(e)
        
        # Format and return result
        return self._format_result(
            smell_data,
            refactored_code,
            config,
            apply_changes
        )
    
    def _get_refactor_config(self, strategy_id: int, model_id: int) -> Dict[str, Any]:
        """Get and validate refactoring configuration."""
        strategy = PromptStrategy.get_strategy(strategy_id)
        model_info = HuggingFaceModels.get_model_by_id(model_id)
        
        if not strategy or not model_info:
            return "❌ Error: Invalid strategy or model ID"
        
        return {
            'strategy': strategy,
            'model': model_info['model_id'],
            'strategy_id': strategy_id,
            'model_id': model_id,
            'strategy_name': PromptStrategy.STRATEGIES[strategy_id][1],
            'model_name': model_info['name']
        }
    
    def _fetch_smell_data(self, smell_id: int) -> Dict[str, Any]:
        """Fetch smell data from database."""
        try:
            db = ResearchDB()
            session = db.get_session()
            
            smell = get_study_smell(session, smell_id)
            
            if not smell:
                session.close()
                return f"❌ Error: Smell with ID {smell_id} not found in database.\nUse 'db list_smells' to see available smells."
            
            if not smell.code_snippet:
                session.close()
                return f"❌ Error: Smell #{smell_id} has no code snippet in database."
            
            # Extract data
            smell_catalog = TEST_SMELL_CATALOG.get(smell.smell_type, {})
            
            data = {
                'smell_id': smell_id,
                'file_id': smell.file_id,
                'smell_type': smell.smell_type,
                'code_snippet': smell.code_snippet,
                'file_path': smell.file.path if smell.file else None,
                'repo_name': smell.file.repository.name if smell.file and smell.file.repository else None,
                'smell_description': smell_catalog.get('definition', ''),
                'smell_detection': smell_catalog.get('detection', ''),
                'examples': smell_catalog.get('examples', []),
                'refactoring_strategies': smell_catalog.get('refactoring_strategies', [])
            }
            
            session.close()
            return data
                
        except (OSError, IOError) as e:
            return f"❌ Database error: {e}"
    
    def _print_header(self, smell_id: int, smell_data: Dict[str, Any], 
                     config: Dict[str, Any], apply_changes: bool) -> None:
        """Print refactoring header information."""
        mode = "APPLY MODE (with backup)" if apply_changes else "DRY-RUN MODE (preview only)"
        
        lines = [
            "╔══════════════════════════════════════════════════════════════════════════╗",
            "║                    REFACTORING TEST SMELL                                ║",
            "╚══════════════════════════════════════════════════════════════════════════╝",
            "",
            f"Mode:            {mode}",
            f"Smell ID:        {smell_id}",
            f"Smell Type:      {smell_data['smell_type']}",
            f"Strategy:        [{config['strategy_id']}] {config['strategy_name']}",
            f"Model:           [{config['model_id']}] {config['model_name']}",
            f"File ID:         {smell_data['file_id']}",
        ]
        
        if apply_changes and smell_data['file_path'] and smell_data['repo_name']:
            lines.extend([
                f"Repository:      {smell_data['repo_name']}",
                f"File Path:       {smell_data['file_path']}",
            ])
        
        lines.extend([
            "",
            "─" * 76,
            "ORIGINAL CODE:",
            "─" * 76,
            smell_data['code_snippet'],
            "",
            "─" * 76,
            "REFACTORING (please wait)...",
            "─" * 76,
            ""
        ])
        
        print("\n".join(lines))
    
    def _get_llm_refactoring(self, smell_data: Dict[str, Any], 
                            config: Dict[str, Any]) -> str:
        """Get refactored code from LLM."""
        client = HuggingFaceRefactorClient()
        
        result = client.refactor(
            smell_name=smell_data['smell_type'],
            smell_description=smell_data['smell_description'],
            smell_detection=smell_data.get('smell_detection', ''),
            test_code=smell_data['code_snippet'],
            prompt_strategy=config['strategy'],
            model=config['model'],
            examples=smell_data['examples'],
            refactoring_strategies=smell_data['refactoring_strategies'],
        )
        
        # Extract just the code from the result dict
        return result['code']
    
    def _format_result(self, smell_data: Dict[str, Any], refactored_code: str,
                      config: Dict[str, Any], apply_changes: bool) -> str:
        """Format the final result output."""
        lines = [
            "─" * 76,
            "REFACTORED CODE:",
            "─" * 76,
            refactored_code,
            "",
        ]
        
        if apply_changes:
            apply_result = self._apply_file_changes(smell_data, refactored_code)
            lines.extend(apply_result)
        else:
            lines.extend(self._format_dry_run_message(smell_data['smell_id'], config))
        
        lines.extend([
            f"Strategy: {config['strategy_name']}",
            f"Model: {config['model_name']}",
            ""
        ])
        
        return "\n".join(lines)
    
    def _apply_file_changes(self, smell_data: Dict[str, Any], 
                           refactored_code: str) -> List[str]:
        """Apply refactored code to file with backup using BackupManager."""
        file_path = smell_data['file_path']
        repo_name = smell_data['repo_name']
        
        if not file_path or not repo_name:
            return self._format_warning(
                "File path or repository name not found in database."
            )
        
        try:
            # Get repositories directory (parent of llm-refactor-pipeline)
            from llm_refactor.core.config import config
            repositories_dir = config.PROJECT_ROOT.parent / "repositories"
            
            # Initialize BackupManager with correct path
            backup_manager = BackupManager(repositories_dir=repositories_dir)
            
            # Clean file path (remove leading slash)
            clean_file_path = str(file_path).lstrip('/')
            
            # Clean markdown code fences from LLM output
            from .utils import clean_code_fences
            cleaned_code = clean_code_fences(refactored_code)
            
            # Use BackupManager's replace_snippet method
            # It handles: backup creation, file validation, snippet replacement
            backup_path, backup_created = backup_manager.replace_snippet(
                repo_name=repo_name,
                file_path=clean_file_path,
                original_snippet=smell_data['code_snippet'],
                refactored_snippet=cleaned_code,
                create_backup=True
            )
            
            return self._format_success(file_path, backup_path, repo_name)
            
        except BackupFileNotFoundError as e:
            return self._format_warning(f"File not found: {e}")
        except SnippetReplacementError as e:
            return self._format_apply_error(f"Snippet replacement failed: {e}")
        except InvalidPathError as e:
            return self._format_warning(f"Invalid path: {e}")
        except (OSError, IOError) as e:
            return self._format_apply_error(f"File operation failed: {e}")
    
    def _format_warning(self, message: str) -> List[str]:
        """Format a warning message."""
        return [
            "─" * 76,
            "⚠️  WARNING: Cannot apply changes",
            "─" * 76,
            "",
            message,
            "Changes displayed above but NOT applied to file.",
            ""
        ]
    
    def _format_success(self, file_path: str, backup_path: Path, 
                       repo_name: str) -> List[str]:
        """Format a success message."""
        return [
            "─" * 76,
            "✅ CHANGES APPLIED SUCCESSFULLY",
            "─" * 76,
            "",
            f"File:    {file_path}",
            f"Backup:  {backup_path}",
            "",
            f"To undo: backup restore {repo_name} {file_path.lstrip('/')}",
            ""
        ]
    
    def _format_apply_error(self, error: str) -> List[str]:
        """Format an error message for failed apply."""
        return [
            "─" * 76,
            "❌ ERROR APPLYING CHANGES",
            "─" * 76,
            "",
            f"Error: {error}",
            "Changes displayed above but NOT applied to file.",
            ""
        ]
    
    def _format_dry_run_message(self, smell_id: int, config: Dict[str, Any]) -> List[str]:
        """Format dry-run completion message."""
        return [
            "─" * 76,
            "✅ REFACTORING COMPLETE (DRY-RUN)",
            "─" * 76,
            "",
            "Changes NOT applied to file (dry-run mode).",
            "To apply changes, add --apply flag:",
            f"  refactor {smell_id} {config['strategy_id']} {config['model_id']} --apply",
            ""
        ]
    
    def _format_error(self, error: Exception) -> str:
        """Format error message based on exception type."""
        error_str = str(error)
        
        if isinstance(error, ValueError):
            if "HF_TOKEN" in error_str or "Configuration" in error_str:
                return f"\n❌ Configuration Error: {error}\n\nMake sure HF_TOKEN is set in your environment."
            return f"\n❌ Validation Error: {error}"
        
        if isinstance(error, RuntimeError):
            return f"\n❌ API Error: {error}"
        
        if isinstance(error, (OSError, IOError)):
            return f"\n❌ File Error: {error}"
        
        return f"\n❌ Unexpected Error: {error}"


# Create module instance
refactor_smell_module = RefactorSmellModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """
    Execute Refactor Smell module.
    
    This function is called by the CLI router.
    
    Args:
        args: Arguments from CLI
    
    Returns:
        Execution result
    """
    return refactor_smell_module.run(args)


# Example usage
if __name__ == "__main__":
    # Test with help
    print(execute("help"))
