"""
Refactor Smell Module.

Integrates HuggingFace LLM API with the research database to refactor test smells.
"""

from typing import Optional
from sqlalchemy.orm import Session

from llm_refactor.modules.base import SimpleModule
from llm_refactor.modules.database.connection import ResearchDB
from llm_refactor.modules.database.crud import get_study_smell
from .smell_catalog import TEST_SMELL_CATALOG
from .hf_client import (
    HuggingFaceRefactorClient,
    HuggingFaceModels,
    PromptStrategy
)


class RefactorSmellModule(SimpleModule):
    """
    Module for refactoring test smells using HuggingFace LLMs.
    
    Usage:
        refactor <smell_id> [prompt_strategy] [model_id]
        
    Examples:
        refactor 42                    # Use defaults (CoT, Qwen)
        refactor 42 1                  # Zero-shot, default model
        refactor 42 2 3                # Few-shot, model #3
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
            return "❌ Error: smell_id required. Usage: refactor <smell_id> [strategy] [model]\nTry 'refactor help' for details."
        
        try:
            smell_id = int(parts[0])
        except ValueError:
            return f"❌ Error: Invalid smell_id '{parts[0]}'. Must be a number."
        
        # Parse optional prompt strategy (default: CoT = 3)
        strategy_id = 3
        if len(parts) >= 2:
            try:
                strategy_id = int(parts[1])
                if strategy_id not in [1, 2, 3]:
                    return f"❌ Error: Invalid strategy '{strategy_id}'. Must be 1, 2, or 3.\n\n{PromptStrategy.list_strategies()}"
            except ValueError:
                return f"❌ Error: Invalid strategy '{parts[1]}'. Must be a number (1-3)."
        
        # Parse optional model (default: 1)
        model_id = 1
        if len(parts) >= 3:
            try:
                model_id = int(parts[2])
                if not HuggingFaceModels.get_model_by_id(model_id):
                    return f"❌ Error: Invalid model ID '{model_id}'.\n\n{HuggingFaceModels.list_models()}"
            except ValueError:
                return f"❌ Error: Invalid model ID '{parts[2]}'. Must be a number."
        
        # Execute refactoring
        return self._refactor_smell(smell_id, strategy_id, model_id)
    
    def _show_help(self) -> str:
        """Show detailed help message."""
        return f"""
╔══════════════════════════════════════════════════════════════════════════╗
║                    REFACTOR TEST SMELL - HELP                            ║
╚══════════════════════════════════════════════════════════════════════════╝

DESCRIPTION:
    Refactor a test smell from the database using HuggingFace LLMs.

USAGE:
    refactor <smell_id> [strategy] [model]

ARGUMENTS:
    smell_id       : Database ID of the smell to refactor (required)
    strategy       : Prompt strategy ID (default: 3 - Chain-of-Thought)
                     [1] Zero-Shot
                     [2] Few-Shot
                     [3] Chain-of-Thought (recommended)
    model          : Model ID (default: 1 - Qwen 2.5 Coder 32B)

EXAMPLES:
    refactor 42                 # Refactor smell #42 (CoT, Qwen)
    refactor 42 1               # Use zero-shot strategy
    refactor 42 2 3             # Use few-shot with model #3
    refactor 42 3 4             # Use CoT with DeepSeek R1

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
        model_id: int
    ) -> str:
        """
        Perform the actual refactoring.
        
        Args:
            smell_id: Database ID of the smell
            strategy_id: Prompt strategy ID (1-3)
            model_id: Model ID
        
        Returns:
            Formatted result message
        """
        # Get strategy and model
        strategy = PromptStrategy.get_strategy(strategy_id)
        model = HuggingFaceModels.get_model_by_id(model_id)
        
        if not strategy or not model:
            return "❌ Error: Invalid strategy or model ID"
        
        # Get model name for display
        model_name = next(
            (m['name'] for m in HuggingFaceModels.MODELS if m['id'] == model_id),
            "Unknown"
        )
        strategy_name = PromptStrategy.STRATEGIES[strategy_id][1]
        
        # Fetch smell from database
        try:
            db = ResearchDB()
            session = db.get_session()
            
            smell = get_study_smell(session, smell_id)
            
            if not smell:
                session.close()
                return f"❌ Error: Smell with ID {smell_id} not found in database.\nUse 'db list_smells' to see available smells."
            
            # Get smell details
            smell_type = smell.smell_type
            code_snippet = smell.code_snippet
            
            if not code_snippet:
                session.close()
                return f"❌ Error: Smell #{smell_id} has no code snippet in database."
            
            # Get smell catalog information
            smell_catalog = TEST_SMELL_CATALOG.get(smell_type, {})
            smell_description = smell_catalog.get('definition', '')
            examples = smell_catalog.get('examples', [])
            refactoring_strategies = smell_catalog.get('refactoring_strategies', [])
            
            # Close the database session
            session.close()
                
        except Exception as e:
            return f"❌ Database error: {e}"
        
        # Display refactoring info
        output = [
            "╔══════════════════════════════════════════════════════════════════════════╗",
            "║                    REFACTORING TEST SMELL                                ║",
            "╚══════════════════════════════════════════════════════════════════════════╝",
            "",
            f"Smell ID:        {smell_id}",
            f"Smell Type:      {smell_type}",
            f"Strategy:        [{strategy_id}] {strategy_name}",
            f"Model:           [{model_id}] {model_name}",
            f"File ID:         {smell.file_id}",
            "",
            "─" * 76,
            "ORIGINAL CODE:",
            "─" * 76,
            code_snippet,
            "",
            "─" * 76,
            "REFACTORING (please wait)...",
            "─" * 76,
            ""
        ]
        
        print("\n".join(output))
        
        # Perform refactoring
        try:
            client = HuggingFaceRefactorClient()
            
            refactored_code = client.refactor(
                smell_name=smell_type,
                smell_description=smell_description,
                test_code=code_snippet,
                prompt_strategy=strategy,
                model=model,
                examples=examples,
                refactoring_strategies=refactoring_strategies,
            )
            
            # Display result
            result = [
                "─" * 76,
                "REFACTORED CODE:",
                "─" * 76,
                refactored_code,
                "",
                "─" * 76,
                "✅ REFACTORING COMPLETE",
                "─" * 76,
                "",
                f"Strategy: {strategy_name}",
                f"Model: {model_name}",
                ""
            ]
            
            return "\n".join(result)
            
        except ValueError as e:
            return f"\n❌ Configuration Error: {e}\n\nMake sure HF_TOKEN is set in your environment."
        except RuntimeError as e:
            return f"\n❌ API Error: {e}"
        except Exception as e:
            return f"\n❌ Unexpected Error: {e}"


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
