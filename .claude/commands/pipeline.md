---
description: Run the LLM refactor pipeline CLI
---

Launch the interactive LLM refactor pipeline CLI tool.

**Task:**
1. Navigate to the llm-refactor-pipeline directory
2. Check if the virtual environment is activated (look for .venv)
3. Launch the pipeline: `python -m llm_refactor`
4. Show available commands in the pipeline
5. Assist the user with any pipeline commands they want to run

**Pipeline Commands Reference:**
- `detect_smells all` - Detect smells in all repositories
- `detect_smells <repo>` - Detect smells in specific repository
- `run_tests <repo>` - Execute tests for a repository
- `check_repositories` - Setup directory structure
- `hello` - Test command
- `help` - Show help
- `exit` - Exit the pipeline

**Expected flow:**
```bash
cd llm-refactor-pipeline
source ../.venv/bin/activate  # if not activated
python -m llm_refactor
```

**Example interaction:**
```
╔══════════════════════════════════════════╗
║   LLM Refactor Pipeline v0.1.0           ║
║   Interactive Code Refactoring Tool      ║
╚══════════════════════════════════════════╝

Type 'help' for available commands or 'exit' to quit

llm-refactor> detect_smells dayjs
[Running smell detection on dayjs...]
✓ Detected 47 smells in dayjs

llm-refactor> run_tests dayjs
[Running tests for dayjs...]
✓ All tests passed (892/892)

llm-refactor> exit
Goodbye! 👋
```

**Notes:**
- The pipeline is a modular Python CLI tool
- It uses prompt-toolkit for interactive features
- Has command history and auto-completion
- Can be extended with new modules
- Acts as orchestration layer for research workflow
