"""
Run tests module.

This module runs tests across all repositories that have a .run_tests file.
It executes the test commands and saves outputs to text files.
"""

from pathlib import Path
from typing import Optional
from rich.console import Console

from llm_refactor.modules.base import SimpleModule
from . import utils


class RunTestsModule(SimpleModule):
    """
    Run tests module for executing tests across repositories.

    This module discovers repositories with .run_tests files, executes
    the test commands, and saves outputs to text files. All implementation
    details are handled by utility functions in utils.py.
    """

    name = "run_tests"
    description = "Execute tests for repositories with .run_tests files"

    def execute(self, args: str = "") -> str:
        """
        Execute the run tests module.

        This method orchestrates the entire process by delegating to
        utility functions. It handles:
        1. Argument parsing
        2. Repository discovery
        3. Test execution for each repository
        4. Output saving and formatting

        Args:
            args: Optional arguments:
                all: Process all repositories
                <repo_name>: Process specific repository
                --force: Overwrite existing output files
                --output-dir=PATH: Custom output directory

        Returns:
            Formatted results string
        """
        # Parse arguments
        force = "--force" in args
        custom_output = self._parse_output_dir_argument(args)

        # Extract mode (all, specific repo, or empty)
        args_parts = [p for p in args.split() if not p.startswith("--")]
        mode = args_parts[0] if args_parts else ""

        # Check if no repository specified
        if not mode:
            return (
                "Error: Please specify a repository name or use 'all'\n\n"
                "Usage:\n"
                "  run_tests all [--force] [--output-dir=PATH]\n"
                "  run_tests <repository_name> [--force] [--output-dir=PATH]\n\n"
                "Note: Only repositories with a .run_tests file will be processed."
            )

        console = Console()

        try:
            # Step 1: Find and list repositories
            with console.status("[cyan]🔍 Finding repositories...", spinner="dots"):
                repos_dir = utils.find_repositories_directory(Path(__file__))
                if repos_dir is None:
                    return (
                        "Error: 'repositories' directory not found.\n\n"
                        "Please ensure you have a 'repositories' folder in the project structure."
                    )

            console.print(f"✓ Found repositories directory: [dim]{repos_dir}[/dim]")

            # Step 2: List repositories
            with console.status("[cyan]📋 Listing repositories...", spinner="dots"):
                repos = utils.get_repository_list(repos_dir)
                if not repos:
                    return f"No repositories found in: {repos_dir}"

            console.print(f"✓ Found [bold cyan]{len(repos)}[/bold cyan] repositories")

            # Determine which repositories to process
            if mode == "all":
                repos_to_process = repos
                console.print(f"→ Processing [bold]all {len(repos)}[/bold] repositories\n")
            else:
                # Single repository mode - validate it exists
                is_valid, validation_msg = utils.validate_repository_exists(repos_dir, mode)
                if not is_valid:
                    return f"Error: {validation_msg}"
                repos_to_process = [mode]
                console.print(f"→ Processing single repository: [bold cyan]{mode}[/bold cyan]\n")

            # Step 3: Determine and setup output directory
            with console.status("[cyan]📂 Setting up output directory...", spinner="dots"):
                output_dir = self._determine_output_directory(repos_dir, custom_output)
                # Validate output directory
                is_valid, validation_msg = utils.validate_output_directory(output_dir)
                if not is_valid:
                    return f"Error: {validation_msg}"

            console.print(f"✓ Output directory: [dim]{output_dir}[/dim]\n")

            # Step 4: Process repositories
            console.print(f"[bold cyan]🚀 Processing {len(repos_to_process)} repository(ies)...[/bold cyan]\n")
            console.print("=" * 80)

            results = []
            for idx, repo_name in enumerate(repos_to_process, 1):
                console.print(f"\n[bold][[{idx}/{len(repos_to_process)}]][/bold] Processing: [bold cyan]{repo_name}[/bold cyan]")
                result = utils.process_single_repository(
                    repos_dir, output_dir, repo_name, force, verbose=True
                )
                results.append(result)
                console.print("─" * 80)

            # Step 5: Calculate statistics and format output
            console.print("\n" + "=" * 80)
            console.print("[bold cyan]📊 FINAL SUMMARY[/bold cyan]")
            console.print("=" * 80 + "\n")

            stats = utils.calculate_statistics(results)
            return utils.format_processing_results(stats, results, repos_dir, output_dir)

        except Exception as e:
            return f"Error: {str(e)}\n\nPlease check your project structure and try again."

    def _parse_output_dir_argument(self, args: str) -> Optional[Path]:
        """
        Parse the --output-dir argument from command line args.

        Args:
            args: Command line arguments string

        Returns:
            Path object if --output-dir specified, None otherwise
        """
        if "--output-dir=" not in args:
            return None

        output_args = [a for a in args.split() if a.startswith("--output-dir=")]
        if not output_args:
            return None

        output_path = output_args[0].split("=", 1)[1]
        return Path(output_path)

    def _determine_output_directory(
        self, repos_dir: Path, custom_output: Optional[Path]
    ) -> Path:
        """
        Determine the output directory path.

        Args:
            repos_dir: Path to repositories directory
            custom_output: Custom output path from arguments (if any)

        Returns:
            Path to use for output directory
        """
        if custom_output:
            return custom_output

        # Default: tests_output in parent of repositories
        return repos_dir.parent / "tests_output"


# Create module instance
run_test_module = RunTestsModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """
    Execute run tests module.

    This function is called by the CLI router.

    Args:
        args: Optional arguments from CLI
            all: Process all repositories
            <repo_name>: Process specific repository
            --force: Overwrite existing output files
            --output-dir=PATH: Custom output directory

    Returns:
        Execution result

    Examples:
        >>> execute("all")
        # Runs tests for all repositories with .run_tests files

        >>> execute("dayjs")
        # Runs tests for the dayjs repository only

        >>> execute("all --output-dir=/custom/path")
        # Uses custom output directory
    """
    return run_test_module.run(args)


# Allow direct execution for testing
if __name__ == "__main__":
    result = execute("all")
    print(result)
