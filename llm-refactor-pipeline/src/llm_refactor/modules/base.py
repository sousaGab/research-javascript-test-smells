"""
Base module interface.

All feature modules should inherit from BaseModule to ensure
consistent structure and easy integration with the CLI.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional


class BaseModule(ABC):
    """
    Abstract base class for all modules.

    To create a new module:
    1. Inherit from this class
    2. Set the name and description attributes
    3. Implement the execute() method
    4. Register in cli/router.py
    """

    name: str = "base"
    description: str = "Base module"

    @abstractmethod
    def execute(self, args: str = "") -> Any:
        """
        Execute the module's main functionality.

        Args:
            args: Optional arguments passed from the CLI

        Returns:
            Result to be displayed (str, dict, or any printable type)
        """
        pass

    def validate_args(self, args: str) -> bool:
        """
        Validate arguments before execution.

        Override this method to add custom validation.

        Args:
            args: Arguments to validate

        Returns:
            True if valid, False otherwise
        """
        return True

    def before_execute(self, args: str = "") -> None:
        """
        Hook called before execute().

        Override to add setup logic.
        """
        pass

    def after_execute(self, result: Any) -> Any:
        """
        Hook called after execute().

        Override to add cleanup or post-processing logic.

        Args:
            result: The result from execute()

        Returns:
            Modified result or original result
        """
        return result

    def run(self, args: str = "") -> Any:
        """
        Main entry point that handles the full execution flow.

        This method orchestrates validation, execution, and hooks.

        Args:
            args: Arguments from CLI

        Returns:
            Execution result
        """
        # Validate
        if not self.validate_args(args):
            raise ValueError(f"Invalid arguments for {self.name}: {args}")

        # Before hook
        self.before_execute(args)

        # Execute
        result = self.execute(args)

        # After hook
        result = self.after_execute(result)

        return result


class SimpleModule(BaseModule):
    """
    Simplified base for modules that don't need hooks.

    Use this for simple modules that just need to implement execute().
    """

    def validate_args(self, args: str) -> bool:
        """Default: accept any args."""
        return True

    def before_execute(self, args: str = "") -> None:
        """Default: no setup needed."""
        pass

    def after_execute(self, result: Any) -> Any:
        """Default: return result as-is."""
        return result
