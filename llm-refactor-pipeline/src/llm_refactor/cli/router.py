"""
Command routing and dispatching.

Routes user commands to appropriate module handlers.
This is the central hub that connects CLI input to module execution.
"""

from typing import Dict, Callable, Tuple, Optional
from llm_refactor.modules import hello_world
from llm_refactor.modules import check_repositories


class CommandRouter:
    """Routes commands to their handlers."""

    def __init__(self):
        self.commands: Dict[str, Tuple[Callable, str]] = {}
        self._register_default_commands()

    def _register_default_commands(self):
        """Register built-in commands."""
        # Register Hello World module
        self.register(
            command="hello",
            handler=hello_world.execute,
            description="Execute Hello World module"
        )

        self.register(
            command="check_repositories",
            handler=check_repositories.execute,
            description="Execute Check Repositories module"
        )

    def register(self, command: str, handler: Callable, description: str):
        """
        Register a new command.

        Args:
            command: Command name (what user types)
            handler: Function to execute
            description: Help text for the command
        """
        self.commands[command] = (handler, description)

    def route(self, command_line: str) -> Tuple[bool, str]:
        """
        Route a command to its handler.

        Args:
            command_line: Full command line input from user

        Returns:
            Tuple of (success: bool, result: str)
        """
        # Parse command and arguments
        parts = command_line.strip().split(maxsplit=1)
        if not parts:
            return True, ""

        command = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""

        # Check if command exists
        if command not in self.commands:
            return False, f"Unknown command: '{command}'. Type 'help' for available commands."

        # Execute command
        try:
            handler, _ = self.commands[command]
            result = handler(args) if args else handler()
            return True, result
        except Exception as e:
            return False, f"Error executing command '{command}': {str(e)}"

    def get_commands(self) -> Dict[str, str]:
        """
        Get all registered commands with descriptions.

        Returns:
            Dictionary of command -> description
        """
        commands = {cmd: desc for cmd, (_, desc) in self.commands.items()}

        # Add built-in commands
        commands["help"] = "Show this help message"
        commands["exit"] = "Exit the shell"
        commands["quit"] = "Exit the shell (alias for exit)"
        commands["clear"] = "Clear the screen"

        return commands

    def is_builtin(self, command: str) -> bool:
        """Check if a command is a built-in (help, exit, etc.)."""
        return command.lower() in ["help", "exit", "quit", "clear"]


# Global router instance
router = CommandRouter()
