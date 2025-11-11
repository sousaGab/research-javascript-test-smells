# Usage Examples

## Starting the Interactive CLI

```bash
# Method 1: Using the installed command
llm-refactor

# Method 2: Using Python module
python -m llm_refactor
```

## Interactive Session Example

```
$ llm-refactor

╔══════════════════════════════════════════╗
║   LLM Refactor Pipeline                  ║
║   Interactive Code Refactoring Tool • v0.1.0 ║
╚══════════════════════════════════════════╝

Type 'help' for available commands or 'exit' to quit

llm-refactor> hello
Hello World!

llm-refactor> hello Python
Hello Python!

llm-refactor> hello Research Team
Hello Research Team!

llm-refactor> help
┏━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Command┃ Description                ┃
┡━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ hello  │ Execute Hello World module │
│ help   │ Show this help message     │
│ exit   │ Exit the shell             │
│ quit   │ Exit the shell (alias)     │
│ clear  │ Clear the screen           │
└────────┴────────────────────────────┘

llm-refactor> clear
[screen clears]

llm-refactor> exit
Goodbye! 👋
```

## Command History

The CLI saves your command history to `~/.llm_refactor_history`. You can:
- Use ↑/↓ arrow keys to navigate through previous commands
- Press Ctrl+R to search through history
- Auto-complete commands by pressing Tab

## Keyboard Shortcuts

- **Ctrl+C**: Cancel current command (doesn't exit)
- **Ctrl+D**: Exit the shell
- **↑/↓**: Navigate command history
- **Tab**: Auto-complete commands
- **Ctrl+R**: Search command history

## Programmatic Usage

You can also use the modules programmatically:

```python
# Import module
from llm_refactor.modules.hello_world import execute

# Use directly
result = execute()
print(result)  # Output: Hello World!

# With arguments
result = execute("Python")
print(result)  # Output: Hello Python!
```

## Testing

Run the test script to verify installation:

```bash
python test_cli.py
```

## Adding New Commands

See `src/llm_refactor/modules/hello_world.py` for an example of how to create new modules.

Basic steps:
1. Create a new file in `src/llm_refactor/modules/`
2. Inherit from `SimpleModule` or `BaseModule`
3. Implement the `execute()` method
4. Register in `src/llm_refactor/cli/router.py`

Example:

```python
# src/llm_refactor/modules/my_feature.py
from llm_refactor.modules.base import SimpleModule

class MyFeatureModule(SimpleModule):
    name = "myfeature"
    description = "Does something cool"

    def execute(self, args: str = "") -> str:
        return f"Executing my feature with: {args}"

my_feature = MyFeatureModule()

def execute(args: str = "") -> str:
    return my_feature.run(args)
```

Then register in `router.py`:

```python
from llm_refactor.modules import my_feature

# In _register_default_commands():
self.register("myfeature", my_feature.execute, "Does something cool")
```

## Next Steps

- Add Hugging Face integration for LLM calls
- Create code parsing modules
- Build refactoring pipelines
- Add web UI with Gradio
- Implement experiment tracking
