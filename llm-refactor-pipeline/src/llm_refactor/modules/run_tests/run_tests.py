"""
Run tests module.

This module run tests on the acroos all repositories.
"""
from llm_refactor.modules.base import SimpleModule


class RunTestsModule(SimpleModule):

    name = "run_tests"
    description = "Execute tests for all repositories"

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
                all: Process all repositories
                <repo_name>: Process specific repository
                --force: Recreate existing folders/files
                --output-dir=PATH: Custom output directory

        Returns:
            Formatted results string
        """
        return f"Run Tests!"

# Create module instance
run_test_module = RunTestsModule()

def execute(args: str = "") -> str:
    """
    Execute the Hello World module.

    Args:
        args: Optional name to greet (default: "World")

    Returns:
        Greeting message
    """
    return run_test_module.run(args)


# Example: How to use this module programmatically
if __name__ == "__main__":
    # Direct usage
    result = execute()
    print(result)  # Output: Hello World!

    # With argument
    result = execute("Python")
    print(result)  # Output: Hello Python!

    # Using module instance
    result = run_test_module.execute("LLM Refactor")
    print(result)  # Output: Hello LLM Refactor!
