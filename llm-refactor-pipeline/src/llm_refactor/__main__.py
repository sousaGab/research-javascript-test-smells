"""
Entry point for the LLM Refactor Pipeline CLI.

Can be run as:
- python -m llm_refactor
- llm-refactor (after installation)
"""

import sys
from llm_refactor.cli.repl import run_interactive


def main():
    """Main entry point for the CLI."""
    try:
        run_interactive()
        return 0
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Goodbye!")
        return 130
    except Exception as e:
        print(f"\nError: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
