"""
Interactive REPL (Read-Eval-Print Loop) using prompt_toolkit.

Provides an interactive shell with:
- Command history
- Auto-completion
- Multi-line input support
- Beautiful output
"""

from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.auto_suggest import AutoSuggestFromHistory
from prompt_toolkit.completion import WordCompleter
from typing import Optional

from llm_refactor.core.config import config
from llm_refactor.cli.renderer import renderer
from llm_refactor.cli.router import router


class InteractiveREPL:
    """Interactive REPL for the LLM Refactor Pipeline."""

    def __init__(self):
        self.session: Optional[PromptSession] = None
        self.should_exit = False

    def setup(self):
        """Setup the REPL session."""
        # Get available commands for autocomplete
        commands = list(router.get_commands().keys())

        # Create completer
        completer = WordCompleter(
            commands,
            ignore_case=True,
            sentence=True,
        )

        # Create session with history and autocomplete
        self.session = PromptSession(
            history=FileHistory(str(config.HISTORY_FILE)),
            auto_suggest=AutoSuggestFromHistory(),
            completer=completer,
            complete_while_typing=True,
        )

    def run(self):
        """Run the interactive REPL."""
        # Setup session
        self.setup()

        # Print welcome message
        renderer.print_welcome(config.VERSION)

        # Main loop
        while not self.should_exit:
            try:
                # Get user input
                user_input = self.session.prompt("llm-refactor> ")

                # Skip empty input
                if not user_input.strip():
                    continue

                # Process command
                self.process_command(user_input.strip())

            except KeyboardInterrupt:
                # Ctrl+C pressed - continue running
                renderer.print_warning("Press Ctrl+D or type 'exit' to quit")
                continue

            except EOFError:
                # Ctrl+D pressed - exit gracefully
                self.should_exit = True

        # Print goodbye message
        renderer.print_goodbye()

    def process_command(self, command_line: str):
        """
        Process a command from the user.

        Args:
            command_line: The full command line input
        """
        # Parse command
        command = command_line.split()[0].lower() if command_line else ""

        # Handle built-in commands
        if command == "help":
            self.show_help()
            return

        if command in ["exit", "quit"]:
            self.should_exit = True
            return

        if command == "clear":
            renderer.clear()
            return

        # Route to module handler
        success, result = router.route(command_line)

        # Display result
        if success:
            if result:
                renderer.print_result(result)
        else:
            renderer.print_error(result)

    def show_help(self):
        """Show help message with available commands."""
        commands = router.get_commands()
        renderer.print_help(commands)


def run_interactive():
    """Entry point for the interactive REPL."""
    repl = InteractiveREPL()
    repl.run()


if __name__ == "__main__":
    run_interactive()
