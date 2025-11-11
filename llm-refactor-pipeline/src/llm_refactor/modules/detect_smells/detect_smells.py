"""
Check repositories module.

This module orchestrates the setup of directory structure and CSV files
for smell detection across all repositories. Implementation details are
delegated to utils.py.
"""

from pathlib import Path
from typing import Optional

from llm_refactor.modules.base import SimpleModule
from . import utils


class CheckRepositoriesModule(SimpleModule):
    """
    Repository setup module for smell detection.

    This module orchestrates the discovery of repositories and creation
    of the output structure. All implementation details are handled by
    utility functions in utils.py.
    """

    name = "check_repositories"
    description = "Setup smell detection structure for all repositories"

    # CSV headers for smell detection results
    CSV_HEADERS = ["file", "type", "line", "description", "detected_at"]

    def execute(self, args: str = "") -> str:
        """
        Execute the check repositories module.

        This method orchestrates the entire process by delegating to
        utility functions. It handles:
        1. Argument parsing
        2. Repository discovery
        3. Output structure creation
        4. Results formatting

        Args:
            args: Optional arguments:
                --force: Recreate existing folders/files
                --output-dir=PATH: Custom output directory

        Returns:
            Formatted results string
        """
        # Parse arguments
        force = "--force" in args
        custom_output = self._parse_output_dir_argument(args)

        try:
            # Step 1: Find and list repositories
            repos_dir = utils.find_repositories_directory(Path(__file__))
            if repos_dir is None:
                return (
                    "Error: 'repositories' directory not found.\n\n"
                    "Please ensure you have a 'repositories' folder in the project structure."
                )

            repos = utils.get_repository_list(repos_dir)
            if not repos:
                return f"No repositories found in: {repos_dir}"

            # Step 2: Determine and setup output directory
            output_dir = self._determine_output_directory(repos_dir, custom_output)

            # Validate output directory
            is_valid, validation_msg = utils.validate_output_directory(output_dir)
            if not is_valid:
                return f"Error: {validation_msg}"

            # Step 3: Process all repositories
            results = []
            for repo_name in repos:
                result = utils.process_single_repository(
                    output_dir, repo_name, self.CSV_HEADERS, force
                )
                results.append(result)

            # Step 4: Calculate statistics and format output
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

        # Default: smell_detected in parent of repositories
        return repos_dir.parent / "smell_detected"


# Create module instance
check_repositories_module = CheckRepositoriesModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """
    Execute check repositories module.

    This function is called by the CLI router.

    Args:
        args: Optional arguments from CLI
            --force: Recreate existing folders/files
            --output-dir=PATH: Custom output directory

    Returns:
        Execution result

    Examples:
        >>> execute()
        # Creates smell_detected structure for all repos

        >>> execute("--force")
        # Recreates structure even if exists

        >>> execute("--output-dir=/custom/path")
        # Uses custom output directory
    """
    return check_repositories_module.run(args)


# Allow direct execution for testing
if __name__ == "__main__":
    result = execute()
    print(result)
