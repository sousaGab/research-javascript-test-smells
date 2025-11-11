#!/usr/bin/env python3
"""
Quick test script to verify CLI components work correctly.
"""

from llm_refactor.cli.router import router
from llm_refactor.cli.renderer import renderer
from llm_refactor.modules.hello_world import execute

print("=" * 50)
print("Testing LLM Refactor Pipeline Components")
print("=" * 50)
print()

# Test 1: Hello World module directly
print("Test 1: Hello World Module (direct)")
result = execute()
print(f"  Result: {result}")
assert result == "Hello World!", f"Expected 'Hello World!', got '{result}'"
print("  ✓ PASSED")
print()

# Test 2: Hello World with argument
print("Test 2: Hello World Module (with argument)")
result = execute("Python")
print(f"  Result: {result}")
assert result == "Hello Python!", f"Expected 'Hello Python!', got '{result}'"
print("  ✓ PASSED")
print()

# Test 3: Router - hello command
print("Test 3: Router (hello command)")
success, result = router.route("hello")
print(f"  Success: {success}")
print(f"  Result: {result}")
assert success, "Command should succeed"
assert result == "Hello World!", f"Expected 'Hello World!', got '{result}'"
print("  ✓ PASSED")
print()

# Test 4: Router - hello with argument
print("Test 4: Router (hello command with argument)")
success, result = router.route("hello LLM")
print(f"  Success: {success}")
print(f"  Result: {result}")
assert success, "Command should succeed"
assert result == "Hello LLM!", f"Expected 'Hello LLM!', got '{result}'"
print("  ✓ PASSED")
print()

# Test 5: Router - unknown command
print("Test 5: Router (unknown command)")
success, result = router.route("unknown")
print(f"  Success: {success}")
print(f"  Result: {result}")
assert not success, "Unknown command should fail"
assert "Unknown command" in result, "Should indicate unknown command"
print("  ✓ PASSED")
print()

# Test 6: Get available commands
print("Test 6: Get Available Commands")
commands = router.get_commands()
print(f"  Commands: {list(commands.keys())}")
assert "hello" in commands, "hello command should be available"
assert "help" in commands, "help command should be available"
assert "exit" in commands, "exit command should be available"
print("  ✓ PASSED")
print()

# Test 7: Renderer
print("Test 7: Renderer (basic output)")
renderer.print_success("Success message test")
renderer.print_error("Error message test")
renderer.print_warning("Warning message test")
renderer.print_info("Info message test")
print("  ✓ PASSED")
print()

print("=" * 50)
print("All tests PASSED! ✓")
print("=" * 50)
print()
print("To run the interactive CLI, use:")
print("  llm-refactor")
print("  or")
#!/usr/bin/env python3
"""
Quick test script to verify CLI components work correctly.

This file doubles as a small script (when executed) and as pytest test
module (when imported by pytest). Top-level script behavior is placed
under `main()` so imports don't execute side-effects during test runs.
"""

from llm_refactor.cli.router import router
from llm_refactor.cli.renderer import renderer
from llm_refactor.modules.hello_world import execute


def main() -> None:
	print("=" * 50)
	print("Testing LLM Refactor Pipeline Components")
	print("=" * 50)
	print()

	# Test 1: Hello World module directly
	print("Test 1: Hello World Module (direct)")
	result = execute()
	print(f"  Result: {result}")
	assert result == "Hello World!", f"Expected 'Hello World!', got '{result}'"
	print("  ✓ PASSED")
	print()

	# Test 2: Hello World with argument
	print("Test 2: Hello World Module (with argument)")
	result = execute("Python")
	print(f"  Result: {result}")
	assert result == "Hello Python!", f"Expected 'Hello Python!', got '{result}'"
	print("  ✓ PASSED")
	print()

	# Test 3: Router - hello command
	print("Test 3: Router (hello command)")
	success, result = router.route("hello")
	print(f"  Success: {success}")
	print(f"  Result: {result}")
	assert success, "Command should succeed"
	assert result == "Hello World!", f"Expected 'Hello World!', got '{result}'"
	print("  ✓ PASSED")
	print()

	# Test 4: Router - hello with argument
	print("Test 4: Router (hello command with argument)")
	success, result = router.route("hello LLM")
	print(f"  Success: {success}")
	print(f"  Result: {result}")
	assert success, "Command should succeed"
	assert result == "Hello LLM!", f"Expected 'Hello LLM!', got '{result}'"
	print("  ✓ PASSED")
	print()

	# Test 5: Router - unknown command
	print("Test 5: Router (unknown command)")
	success, result = router.route("unknown")
	print(f"  Success: {success}")
	print(f"  Result: {result}")
	assert not success, "Unknown command should fail"
	assert "Unknown command" in result, "Should indicate unknown command"
	print("  ✓ PASSED")
	print()

	# Test 6: Get available commands
	print("Test 6: Get Available Commands")
	commands = router.get_commands()
	print(f"  Commands: {list(commands.keys())}")
	assert "hello" in commands, "hello command should be available"
	assert "help" in commands, "help command should be available"
	assert "exit" in commands, "exit command should be available"
	print("  ✓ PASSED")
	print()

	# Test 7: Renderer
	print("Test 7: Renderer (basic output)")
	renderer.print_success("Success message test")
	renderer.print_error("Error message test")
	renderer.print_warning("Warning message test")
	renderer.print_info("Info message test")
	print("  ✓ PASSED")
	print()

	print("=" * 50)
	print("All tests PASSED! ✓")
	print("=" * 50)
	print()

	print("To run the interactive CLI, use:")
	print("  llm-refactor")
	print("  or")
	print("  python -m llm_refactor")


if __name__ == "__main__":
	main()


# ----------------------
# Pytest tests for CI
# ----------------------
def test_check_repositories_module_returns_repos_or_message():
	"""Verify `check_repositories.execute()` returns a sensible result.

	This test is intentionally permissive:
	- It verifies the function returns a string and not an unexpected error.
	- It asserts at least one known repository name from this workspace is present.
	"""
	from llm_refactor.modules.detect_smells import execute as check_execute

	result = check_execute()
	assert isinstance(result, str)
	# If an error occurred, fail the test to surface environment issues
	assert not result.startswith("Error:"), f"Unexpected error from module: {result}"

	# Expect at least one known repository folder (workspace-dependent)
	expected_names = ["chart.js", "codecombat", "create-react-app"]
	assert any(name in result for name in expected_names), (
		"Expected at least one known repository name in result; got: " + result
	)
