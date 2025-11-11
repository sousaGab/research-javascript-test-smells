"""
Output rendering and formatting using Rich.

Provides beautiful terminal output with colors, tables, and formatting.
"""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from rich.syntax import Syntax
from typing import Any, Dict, List


class Renderer:
    """Handles all output formatting for the CLI."""

    def __init__(self):
        self.console = Console()

    def print(self, message: str, style: str = ""):
        """Print a simple message with optional style."""
        self.console.print(message, style=style)

    def print_success(self, message: str):
        """Print a success message."""
        self.console.print(f"✓ {message}", style="bold green")

    def print_error(self, message: str):
        """Print an error message."""
        self.console.print(f"✗ {message}", style="bold red")

    def print_warning(self, message: str):
        """Print a warning message."""
        self.console.print(f"⚠ {message}", style="bold yellow")

    def print_info(self, message: str):
        """Print an info message."""
        self.console.print(f"ℹ {message}", style="bold cyan")

    def print_header(self, title: str, subtitle: str = ""):
        """Print a fancy header."""
        content = f"[bold white]{title}[/bold white]"
        if subtitle:
            content += f"\n[dim]{subtitle}[/dim]"

        panel = Panel(
            content,
            border_style="cyan",
            padding=(1, 2),
        )
        self.console.print(panel)
        self.console.print()

    def print_welcome(self, version: str):
        """Print welcome message."""
        self.print_header(
            "LLM Refactor Pipeline",
            f"Interactive Code Refactoring Tool • v{version}"
        )
        self.console.print(
            "[dim]Type [bold]'help'[/bold] for available commands or "
            "[bold]'exit'[/bold] to quit[/dim]\n"
        )

    def print_goodbye(self):
        """Print goodbye message."""
        self.console.print("\n[yellow]Goodbye![/yellow] 👋\n")

    def print_help(self, commands: Dict[str, str]):
        """Print help message with available commands."""
        table = Table(title="Available Commands", border_style="cyan")
        table.add_column("Command", style="cyan bold", no_wrap=True)
        table.add_column("Description", style="white")

        for command, description in commands.items():
            table.add_row(command, description)

        self.console.print(table)
        self.console.print()

    def print_command_list(self, commands: List[str]):
        """Print a list of commands."""
        for command in commands:
            self.console.print(f"  • [cyan]{command}[/cyan]")
        self.console.print()

    def print_code(self, code: str, language: str = "python"):
        """Print syntax-highlighted code."""
        syntax = Syntax(code, language, theme="monokai", line_numbers=True)
        self.console.print(syntax)

    def print_markdown(self, markdown_text: str):
        """Print formatted markdown."""
        md = Markdown(markdown_text)
        self.console.print(md)

    def print_result(self, result: Any):
        """Print a command result."""
        if isinstance(result, str):
            self.console.print(result)
        elif isinstance(result, dict):
            self.console.print_json(data=result)
        else:
            self.console.print(result)

    def clear(self):
        """Clear the console."""
        self.console.clear()


# Global renderer instance
renderer = Renderer()
