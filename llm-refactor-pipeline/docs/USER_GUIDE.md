# LLM Refactor Pipeline - User Guide

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Refactor Command](#refactor-command)
3. [Backup Manager](#backup-manager)
4. [Interactive CLI](#interactive-cli)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

```bash
cd llm-refactor-pipeline
pip install -e .
```

### Configuration

Create a `.env` file with your HuggingFace token:

```bash
HF_TOKEN=your_huggingface_token_here
```

Get your token from: https://huggingface.co/settings/tokens

### Launch

```bash
llm-refactor
```

---

## Refactor Command

Automatically refactor JavaScript test smells using LLMs.

### Basic Usage

```bash
# Dry-run mode (preview only, default)
refactor 42                    # Uses CoT strategy + Qwen model

# Apply mode (creates backup + modifies file)
refactor 42 --apply            # Applies refactoring with backup

# Custom strategy and model
refactor 42 1 4 --apply        # Zero-Shot + DeepSeek R1
```

### Command Syntax

```
refactor <smell_id> [strategy] [model] [--apply]
```

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `smell_id` | ✅ Yes | - | Database ID of the smell |
| `strategy` | ❌ No | 3 (CoT) | Prompt strategy (1-3) |
| `model` | ❌ No | 1 (Qwen) | Model ID (1-6) |
| `--apply` | ❌ No | False | Apply changes (creates backup) |

### Prompt Strategies

| ID | Strategy | Best For |
|----|----------|----------|
| 1 | Zero-Shot | Simple, well-defined smells |
| 2 | Few-Shot | Complex patterns with examples |
| 3 | Chain-of-Thought ⭐ | Accurate, step-by-step reasoning |

### Available Models

| ID | Model | Description |
|----|-------|-------------|
| 1 | Qwen 2.5 Coder 32B ⭐ | Code generation (DEFAULT) |
| 2 | Qwen 2.5 Coder (Together) | Via Together AI |
| 3 | Qwen 2.5 Coder (DeepInfra) | Via DeepInfra |
| 4 | DeepSeek R1 | Advanced reasoning |
| 5 | DeepSeek R1 Distill | Faster version |
| 6 | Llama 3.1 70B | Meta's LLM |

### Utility Commands

```bash
refactor help           # Show help
refactor models         # List available models
refactor strategies     # List prompt strategies
```

### Examples

```bash
# Example 1: Preview with defaults (CoT + Qwen)
refactor 42

# Example 2: Apply with Zero-Shot + DeepSeek
refactor 42 1 4 --apply

# Example 3: Few-Shot with Llama (dry-run)
refactor 42 2 6
```

---

## Backup Manager

Safe file backup and restore for refactoring operations.

### Commands

#### List Backups

```bash
backup list              # All backups
backup list luxon        # Specific repository
```

#### Create Backup

```bash
backup create <repo> <file_path>

# Example:
backup create luxon test/parse.test.js
```

#### Restore from Backup

```bash
backup restore <repo> <file_path>

# Example:
backup restore luxon test/parse.test.js
```

#### Delete Backup

```bash
backup delete <repo> <file_path>

# Example:
backup delete luxon test/parse.test.js
```

#### Check if Backup Exists

```bash
backup check <repo> <file_path>
```

### Workflow Example

```bash
# 1. Refactor with automatic backup
refactor 42 --apply

# 2. Test the changes
cd ../repositories/luxon && npm test

# 3a. If tests pass - delete backup
backup delete luxon test/parse.test.js

# 3b. If tests fail - restore from backup
backup restore luxon test/parse.test.js
```

### Backup Location

Backups are stored in:
```
llm-refactor-pipeline/backup/{repo_name}/{file_path}
```

---

## Interactive CLI

### Starting a Session

```bash
$ llm-refactor

╔══════════════════════════════════════════╗
║   LLM Refactor Pipeline                  ║
║   Interactive Code Refactoring Tool      ║
╚══════════════════════════════════════════╝

llm-refactor> 
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑/↓` | Navigate command history |
| `Tab` | Auto-complete commands |
| `Ctrl+R` | Search command history |
| `Ctrl+C` | Cancel current command |
| `Ctrl+D` or `exit` | Exit the shell |
| `clear` | Clear the screen |

### Command History

History is saved to `~/.llm_refactor_history`.

### Available Commands

```bash
help                    # Show all commands
refactor <id>           # Refactor smell
backup <command>        # Manage backups
db <command>            # Database operations
exit / quit             # Exit CLI
clear                   # Clear screen
```

---

## Troubleshooting

### Common Issues

#### 1. Missing HuggingFace Token

**Error:** `HuggingFace API token not found`

**Solution:**
```bash
echo "HF_TOKEN=your_token_here" >> .env
```

#### 2. Smell Not Found

**Error:** `Smell with ID X not found`

**Solution:** Check available smells:
```bash
db list_smells
```

#### 3. Invalid Path Error

**Error:** `Repositories directory does not exist`

**Solution:** This is automatically fixed. Repositories should be in:
```
/path/to/research-javascript-test-smells/repositories/
```

#### 4. Backup Already Exists

**Error:** `Backup already exists for this file`

**Solution:** Delete or restore the existing backup first:
```bash
backup restore <repo> <file_path>    # Restore
# OR
backup delete <repo> <file_path>     # Delete
```

#### 5. Code Fence Issues

If refactored code has ` ```javascript ` wrappers, they are automatically removed before applying changes.

### Best Practices

1. **Always start with dry-run mode** (without `--apply`)
2. **Review refactored code** before applying
3. **Test after applying** changes
4. **Use Chain-of-Thought strategy** for best results
5. **Keep backups** until tests pass

---

## Next Steps

- Check [DATABASE.md](DATABASE.md) for database operations
- See [BACKUP_GUIDE.md](BACKUP_GUIDE.md) for detailed backup documentation
- Review [docs/archive/](archive/) for implementation history

---

**Version:** 1.0.0  
**Last Updated:** February 17, 2026
