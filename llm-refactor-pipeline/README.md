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

llm-refactor> hello
Hello World!

llm-refactor> check_repositories
Scanning repositories from: /path/to/repositories
Found 34 repositories
...
✓ Successfully processed: 34

llm-refactor> help
Available Commands:
  • hello              - Execute Hello World module
  • check_repositories - Setup smell detection structure
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
        │   ├── router.py   # Command routing
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
