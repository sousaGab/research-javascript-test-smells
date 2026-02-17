# LLM Refactor Pipeline

An interactive CLI tool for LLM-based code refactoring research with automatic backup and database integration.

## Features

- **🤖 LLM Integration** - HuggingFace models for test smell refactoring
- **💾 Safe Refactoring** - Automatic backup before file modifications
- **🗄️ Database Integration** - Direct integration with research database
- **📊 Multiple Strategies** - Zero-Shot, Few-Shot, and Chain-of-Thought prompting
- **🖥️ Interactive REPL** - Conversational interface with command history
- **🎨 Beautiful Output** - Rich formatted terminal output
- **🔧 Modular Design** - Easy to add new modules and features

## Installation

### Prerequisites

- Python 3.8 or higher
- HuggingFace API token (get from https://huggingface.co/settings/tokens)

### Setup

1. Navigate to project directory:
```bash
cd llm-refactor-pipeline
```

2. Install dependencies:
```bash
pip install -e .
```

3. Configure environment:
```bash
# Create .env file with your HuggingFace token
echo "HF_TOKEN=your_token_here" > .env
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

## Project Structure

```
llm-refactor-pipeline/
├── README.md                   # This file
├── pyproject.toml              # Package configuration
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (HF_TOKEN)
│
├── src/                        # Source code
│   └── llm_refactor/
│       ├── cli/                # CLI components (REPL, router, renderer)
│       └── modules/            # Feature modules
│           ├── backup_manager/ # Safe file backup and restore
│           ├── refactor/       # LLM refactoring engine
│           ├── database/       # Database operations
│           └── ...
│
├── tests/                      # All test files
│   ├── test_backup_manager.py
│   ├── test_cli.py
│   ├── test_csv_structure.py
│   ├── test_refactor_integration.py
│   └── test_import.py
│
├── docs/                       # Documentation
│   ├── USER_GUIDE.md           # Complete user guide
│   ├── BACKUP_GUIDE.md         # Backup manager details
│   ├── DATABASE.md             # Database schema and operations
│   ├── examples/               # Code examples
│   │   └── backup_integration_example.py
│   └── archive/                # Implementation history
│       ├── PROJECT_SUMMARY.md
│       ├── REFACTORING_SUMMARY.md
│       └── ...
│
└── backup/                     # Backup storage (auto-created)
    └── {repo_name}/{file_path}
```

## Documentation

- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - Complete user guide with examples
- **[docs/BACKUP_GUIDE.md](docs/BACKUP_GUIDE.md)** - Backup manager API and usage
- **[docs/DATABASE.md](docs/DATABASE.md)** - Database schema and operations
- **[docs/examples/](docs/examples/)** - Code examples and integration guides
- **[docs/archive/](docs/archive/)** - Implementation history and technical summaries

## Testing

```bash
# Run all tests
cd tests/
python test_backup_manager.py        # 16 tests - Backup functionality
python test_cli.py                   # CLI component tests
python test_refactor_integration.py  # 5 tests - Refactor integration
python test_csv_structure.py         # CSV validation tests
```

## Quick Start

```bash
# 1. Install
cd llm-refactor-pipeline
pip install -e .

# 2. Configure (add your HuggingFace token)
echo "HF_TOKEN=your_token_here" > .env

# 3. Launch
llm-refactor

# 4. Refactor a smell (dry-run)
llm-refactor> refactor 42

# 5. Apply changes with backup
llm-refactor> refactor 42 --apply

# 6. Restore if needed
llm-refactor> backup restore luxon test/parse.test.js
```

## Key Features

### 🤖 Refactor Command
- **Dry-run mode** (default): Preview changes without modifying files
- **Apply mode** (`--apply`): Automatic backup + file modification
- **3 prompt strategies**: Zero-Shot, Few-Shot, Chain-of-Thought
- **6+ LLM models**: Qwen, DeepSeek, Llama
- **Database integrated**: Auto-fetch smells from research database

### 💾 Backup Manager
- Automatic backups before modifications
- Precise snippet replacement
- Full undo functionality
- Directory structure preservation
- CLI and programmatic API

### 🗄️ Database Integration
- Direct integration with study_smells table
- Auto-retrieves file paths and repository names
- Supports smell querying and filtering

## Future Roadmap

- [x] Interactive CLI with history and autocomplete
- [x] Repository discovery and setup
- [x] Backup and restore functionality
- [x] HuggingFace LLM integration
- [x] Database integration
- [x] Multiple prompting strategies
- [ ] Multi-LLM provider support
- [ ] Batch refactoring
- [ ] Web UI (Gradio)
- [ ] Experiment tracking
- [ ] Result visualization
- [ ] Performance metrics

## License

Research project - Internal use

This is a research tool. Contributions welcome!
