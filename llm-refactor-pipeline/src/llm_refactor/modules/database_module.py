"""
Database module for CLI integration.

This module provides the interface between the CLI router and database commands.
"""

from .database.cli_commands import execute_command


def execute(args: str = "") -> str:
    """
    Execute database commands.

    Args:
        args: Command and arguments (e.g., "init", "stats", "add-repository --name=dayjs")

    Returns:
        str: Command output

    Usage from CLI:
        llm-refactor> db init
        llm-refactor> db stats
        llm-refactor> db add-repository --name=dayjs
    """
    # Parse command and arguments
    parts = args.strip().split(maxsplit=1)

    if not parts:
        # No command given, show help
        from .database.cli_commands import cmd_help
        return cmd_help()

    command = parts[0]
    command_args = parts[1] if len(parts) > 1 else ""

    # Execute the command
    return execute_command(command, command_args)
