# LLM Refactor Pipeline

An interactive CLI tool for LLM-based code refactoring research. Built for experimentation and modularity.

## Features

- **Interactive REPL** - Conversational interface with command history
- **Modular Design** - Easy to add new modules and features
- **Beautiful Output** - Rich formatted terminal output
- **Research-Friendly** - Built for experimentation and iteration

## Installation

### Prerequisites

- Python 3.8 or higher
- pip

### Setup

1. Clone or navigate to the project directory:
```bash
cd llm-refactor-pipeline
```

2. Install in development mode:
```bash
pip install -e .
```

Or using requirements.txt:
```bash
pip install -r requirements.txt
pip install -e .
```

## Usage

### Start the Interactive Shell

```bash
llm-refactor
```

Or:
```bash
python -m llm_refactor
```

### Available Commands

Once inside the interactive shell:

- `hello` - Run the Hello World module
- `check_repositories` - Setup smell detection structure for all repositories
- `backup` - Manage file backups for safe refactoring
  - `backup list [repo]` - List all backups
  - `backup create <repo> <file>` - Create a backup
  - `backup restore <repo> <file>` - Restore from backup
  - `backup delete <repo> <file>` - Delete a backup
  - `backup check <repo> <file>` - Check if backup exists
- `refactor` - Refactor test smells using HuggingFace LLMs
  - `refactor <smell_id>` - Preview refactored code (dry-run)
  - `refactor <smell_id> --apply` - Apply changes with automatic backup
  - `refactor <smell_id> <strategy> <model> --apply` - Custom strategy/model + apply
- `db` - Database operations
- `ui` - Start the Smell Selector web UI
- `help` - Show available commands
- `exit` or `quit` - Exit the shell (or press Ctrl+D)

### Example Session

```
$ llm-refactor

╔══════════════════════════════════════════╗
║   LLM Refactor Pipeline v0.1.0           ║
║   Interactive Code Refactoring Tool      ║
╚══════════════════════════════════════════╝

Type 'help' for available commands or 'exit' to quit

llm-refactor> backup list
No backups found

llm-refactor> refactor 42
[Shows refactored code preview - no changes applied]

llm-refactor> refactor 42 --apply
✓ Backup created: backup/luxon/test/parse.test.js
✓ Changes applied successfully

llm-refactor> backup restore luxon test/parse.test.js
✓ File restored successfully from backup

llm-refactor> help
Available Commands:
  • hello              - Execute Hello World module
  • check_repositories - Setup smell detection structure
  • backup             - Manage file backups for safe refactoring
  • refactor           - Refactor test smells using HuggingFace LLMs
  • db                 - Database operations
  • ui                 - Start the Smell Selector web UI
  • help               - Show this help message
  • exit               - Exit the shell

llm-refactor> exit
Goodbye! 👋
```

## Project Structure

```
llm-refactor-pipeline/
├── pyproject.toml          # Project configuration
├── requirements.txt        # Dependencies
├── README.md               # This file
└── src/
    └── llm_refactor/
        ├── __init__.py
        ├── __main__.py     # Entry point
        ├── cli/            # CLI components
        │   ├── repl.py     # Interactive loop
        │   ├── check_repositories.py
            ├── backup_manager/    # Backup management
            │   ├── __init__.py
            │   ├── manager.py     # BackupManager class
            │   ├── exceptions.py  # Custom exceptions
            │   └── backup_module.py # CLI interface
            ├── refactor/          # LLM refactoring
            ├── database/          # Database operations
            └── run_tests/         # Test execution routing
        │   └── renderer.py # Output formatting
        ├── core/           # Core functionality
        │   └── config.py
        └── modules/        # Feature modules
            ├── base.py
            ├── hello_world.py
            └── check_repositories.py
```

## Development

### Adding New Modules

1. Create a new file in `src/llm_refactor/modules/`
2. Inherit from `BaseModule` in `base.py`
3. Implement the `execute()` method
4. Register the command in `cli/router.py`

Example:
```python
# src/llm_refactor/modules/my_module.py
from .base import BaseModule

class MyModule(BaseModule):
    name = "mycommand"
    description = "Description of what this does"

    def execute(self, args: str = "") -> str:
        return "Module output"
```

### Running Tests

```bash
pytest
```

## Modules

### Refactor Module

The `refactor` module leverages HuggingFace LLMs to automatically refactor test smells detected in your codebase.

**Key Features:**
- **Dry-run by default**: Preview refactored code without modifying files
- **Apply mode**: Use `--apply` flag to create backup and apply changes automatically
- **Multiple strategies**: Zero-shot, Few-shot, Chain-of-Thought prompting
- **Multiple models**: Qwen 2.5 Coder, DeepSeek R1, Llama 3.1, and more
- **Database integration**: Automatically retrieves file paths from study_smells table

**Quick Start:**
```bash
llm-refactor> refactor 42                 # Preview only (dry-run)
llm-refactor> refactor 42 --apply         # Apply with backup
llm-refactor> refactor 42 3 1 --apply     # CoT strategy, Qwen model, apply
```

**Usage:**
```
refactor <smell_id> [strategy] [model] [--apply]

Arguments:
  smell_id  : Database ID of the smell to refactor (required)
  strategy  : Prompt strategy (1=Zero-shot, 2=Few-shot, 3=CoT) [default: 3]
  model     : Model ID (1=Qwen, 2=DeepSeek, etc.) [default: 1]
  --apply   : Apply changes to file with automatic backup [default: dry-run]
```

**Example Workflow:**
```bash
# 1. Preview the refactoring
llm-refactor> refactor 42
# [Shows original and refactored code]

# 2. Apply if satisfied
llm-refactor> refactor 42 --apply
# ✓ Backup created: backup/luxon/test/parse.test.js
# ✓ Changes applied successfully

# 3. Undo if needed
llm-refactor> backup restore luxon test/parse.test.js
# ✓ File restored successfully
```

**Available Commands:**
```bash
llm-refactor> refactor help          # Show detailed help
llm-refactor> refactor models        # List available LLM models
llm-refactor> refactor strategies    # List prompting strategies
```

**Setup:**
Ensure `HF_TOKEN` is set in your `.env` file:
```bash
HF_TOKEN=your_huggingface_token_here
```

### Backup Manager

The `backup_manager` module provides safe file handling for the refactoring pipeline:

- **Automatic backups** before file modifications
- **Precise snippet replacement** (only targeted code)
- **Full undo functionality** to restore from backups
- **Directory structure preservation** in backups
- **Comprehensive error handling** with meaningful exceptions

**Quick Start:**
```python
from llm_refactor.modules.refactor import BackupManager

manager = BackupManager()

# Backup a file
backup_path = manager.backup_file("luxon", "test/parse.test.js")

# Replace a snippet
file_path, backup_created = manager.replace_snippet(
    "luxon", "test/parse.test.js",
    original_snippet="expect(x).toBe(5)",
    refactored_snippet="expect(x).toEqual(5)"
)BACKUP_CLI_REFERENCE.md](BACKUP_CLI_REFERENCE.md) for CLI command reference
- See [backup_integration_example.py](backup_integration_example.py) for integration examples
- See [BACKUP_IMPLEMENTATION_SUMMARY.md](BACKUP_IMPLEMENTATION_SUMMARY.md) for technical details

**CLI Usage:**
```bash
llm-refactor> backup help              # Show help
llm-refactor> backup list              # List all backups
llm-refactor> backup create luxon test/parse.test.js
llm-refactor> backup restore luxon test/parse.test.js
llm-refactor> backup delete luxon test/parse.test.js
```
# Undo if needed
manager.undo_refactor("luxon", "test/parse.test.js")
```

**Documentation:** 
- See [BACKUP_MANAGER_USAGE.md](BACKUP_MANAGER_USAGE.md) for complete usage guide
- See [backup_integration_example.py](backup_integration_example.py) for integration examples
- See [BACKUP_IMPLEMENTATION_SUMMARY.md](BACKUP_IMPLEMENTATION_SUMMARY.md) for technical details

**Testing:**
```bash
python test_backup_manager.py  # 16/16 tests passing
```

### Check Repositories

The `check_repositories` module prepares the directory structure for smell detection research:

- Discovers all repositories in `../repositories/`
- Creates output structure in `../smell_detected/`
- Prepares CSV files for each repository with proper headers
- Reports progress and statistics

**Quick Start:**
```bash
llm-refactor> check_repositories
```

**Documentation:** See [CHECK_REPOSITORIES_GUIDE.md](CHECK_REPOSITORIES_GUIDE.md) for detailed usage, examples, and integration guide.

**Output Structure:**
```
smell_detected/
├── chart.js/
│   └── smells.csv
├── codecombat/
│   └── smells.csv
└── ...
```

## Future Roadmap

- [x] Interactive CLI with history and autocomplete
- [x] Repository discovery and setup
- [x] Backup and restore functionality for safe refactoring
- [ ] Hugging Face integration
- [ ] Multi-LLM provider support
- [ ] Code parsing and analysis
- [ ] Refactoring pipeline
- [ ] Web UI (Gradio)
- [ ] Experiment tracking
- [ ] Result visualization

## License

Research project - Internal use

## Contributing

This is a research tool. Contributions welcome!
