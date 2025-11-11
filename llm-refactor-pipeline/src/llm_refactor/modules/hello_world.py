"""
Hello World module.

A simple example module that demonstrates:
- How to create a new module
- How to implement the module interface
- How to register with the CLI

This serves as a template for future modules.
"""

from llm_refactor.modules.base import SimpleModule


class HelloWorldModule(SimpleModule):
    """
    Simple Hello World module.

    Prints a greeting message to demonstrate module functionality.
    """

    name = "hello"
    description = "Execute Hello World module"

    def execute(self, args: str = "") -> str:
        """
        Execute the Hello World module.

        Args:
            args: Optional name to greet (default: "World")

        Returns:
            Greeting message
        """
        # Use provided name or default to "World"
        name = args.strip() if args.strip() else "World"

        # Return greeting
        return f"Hello {name}!"


# Create module instance
hello_module = HelloWorldModule()


# Convenience function for CLI integration
def execute(args: str = "") -> str:
    """
    Execute Hello World module.

    This function is called by the CLI router.

    Args:
        args: Optional arguments from CLI

    Returns:
        Execution result
    """
    return hello_module.run(args)


# Example: How to use this module programmatically
if __name__ == "__main__":
    # Direct usage
    result = execute()
    print(result)  # Output: Hello World!

    # With argument
    result = execute("Python")
    print(result)  # Output: Hello Python!

    # Using module instance
    result = hello_module.execute("LLM Refactor")
    print(result)  # Output: Hello LLM Refactor!
