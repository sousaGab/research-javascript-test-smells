# Unified Virtual Environment Setup Guide

## Overview

This guide describes the migration from multiple virtual environments to a single unified virtual environment at the project root level.

## Previous Structure (Multiple VENVs)

Previously, the project had separate virtual environments:
- `smell-selector-ui/backend/.venv` (if it existed)
- `llm-refactor-pipeline/.venv` (if it existed)
- `tools/hugging_face/.venv` (exists)
- Root level `.venv` (exists)

## New Structure (Unified VENV)

All Python tools now share a single virtual environment at the project root:
```
/home/gabriel/Disk/Research/research-javascript-test-smells/
├── .venv/                    # Single unified virtual environment
├── requirements.txt          # Consolidated dependencies
├── smell-selector-ui/
│   └── backend/
│       └── requirements.txt  # [DEPRECATED] Use root requirements.txt
├── llm-refactor-pipeline/
│   └── requirements.txt      # [DEPRECATED] Use root requirements.txt
└── tools/
    └── hugging_face/
        └── .venv/            # [DEPRECATED] Use root .venv
```

## Setup Instructions

### Option 1: Fresh Installation (Recommended)

1. **Navigate to project root:**
   ```bash
   cd /home/gabriel/Disk/Research/research-javascript-test-smells
   ```

2. **Remove old virtual environments (optional, for cleanup):**
   ```bash
   # Backup if needed, then remove
   rm -rf tools/hugging_face/.venv
   rm -rf llm-refactor-pipeline/.venv 2>/dev/null || true
   rm -rf smell-selector-ui/backend/.venv 2>/dev/null || true
   ```

3. **Create/reuse root virtual environment:**
   ```bash
   # If .venv doesn't exist:
   python3 -m venv .venv
   
   # Activate the virtual environment
   source .venv/bin/activate
   ```

4. **Install all dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Install llm-refactor-pipeline in editable mode:**
   ```bash
   pip install -e llm-refactor-pipeline/
   ```

### Option 2: Using Existing .venv

If you already have a `.venv` at the root level:

1. **Activate the existing environment:**
   ```bash
   source .venv/bin/activate
   ```

2. **Update dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install -e llm-refactor-pipeline/
   ```

## Running Different Tools

All tools now use the same virtual environment. Always activate from the root:

### 1. Smell Selector UI (Backend)

```bash
# From project root
source .venv/bin/activate
cd smell-selector-ui/backend
python -m uvicorn main:app --reload
```

Or use the start script:
```bash
source .venv/bin/activate
./smell-selector-ui/start-backend.sh
```

### 2. LLM Refactor Pipeline

```bash
# From project root
source .venv/bin/activate
llm-refactor
# or
python -m llm_refactor
```

### 3. Hugging Face Tools

```bash
# From project root
source .venv/bin/activate
cd tools/hugging_face
python test_refactor_cot.py
```

### 4. Analysis Scripts

```bash
# From project root
source .venv/bin/activate
python scripts/check_smells.py

# Or repository filtering
cd repositories_list
python filter_script.py
```

## Environment Variables

Some tools require environment variables. Create a `.env` file at the project root:

```bash
# .env file at project root
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

Or maintain separate `.env` files in subdirectories as needed.

## Development Workflow

### Activating the Environment

Add this to your shell profile (`.bashrc`, `.zshrc`, etc.) for convenience:

```bash
alias activate-research='source /home/gabriel/Disk/Research/research-javascript-test-smells/.venv/bin/activate'
```

### Adding New Dependencies

When you need to add a new Python package:

1. Install it:
   ```bash
   source .venv/bin/activate
   pip install package-name
   ```

2. Update requirements.txt:
   ```bash
   pip freeze | grep package-name >> requirements.txt
   # Or manually add it to the appropriate section
   ```

3. Keep requirements.txt organized by category (as shown in the file).

### Development Dependencies

For development work, uncomment the development section in `requirements.txt`:

```python
# Development & Testing
pytest>=7.0.0
black>=23.0.0
ruff>=0.1.0
pytest-cov>=4.0.0
pytest-asyncio>=0.21.0
```

Then reinstall:
```bash
pip install -r requirements.txt
```

## Verification

Verify your setup is working:

```bash
source .venv/bin/activate
python -c "import fastapi, sqlalchemy, pandas, openai, rich; print('✓ All core dependencies loaded')"
```

## Troubleshooting

### Python Version Issues

Check your Python version:
```bash
python --version
# Should be Python 3.8 or higher
```

If you have multiple Python versions:
```bash
python3.10 -m venv .venv  # Use specific version
```

### Permission Issues

If you encounter permission errors:
```bash
chmod +x .venv/bin/activate
```

### Module Not Found Errors

If you get "Module not found" errors:
1. Ensure the virtual environment is activated (prompt should show `(.venv)`)
2. Reinstall requirements: `pip install -r requirements.txt`
3. For llm-refactor: `pip install -e llm-refactor-pipeline/`

### Import Errors in Subdirectories

Some scripts import from local modules. Run them from their directory:
```bash
cd tools/hugging_face
python test_refactor_cot.py  # This imports from local constants.py
```

## Benefits of Unified VENV

1. **Simplified Management**: One place to manage all Python dependencies
2. **Disk Space**: Reduce duplication of common packages
3. **Consistency**: Same package versions across all tools
4. **Easier Updates**: Update dependencies once for all tools
5. **Better IDE Integration**: Single interpreter for the entire project

## Migration Checklist

- [x] Create consolidated `requirements.txt`
- [ ] Activate root `.venv`
- [ ] Install all dependencies
- [ ] Test smell-selector-ui backend
- [ ] Test llm-refactor-pipeline
- [ ] Test hugging_face tools
- [ ] Test analysis scripts
- [ ] Remove old `.venv` directories (optional)
- [ ] Update CI/CD pipelines if any
- [ ] Update documentation

## Rollback Plan

If you need to revert to separate environments:

1. The original `requirements.txt` files are still in subdirectories
2. Recreate individual `.venv` in each subdirectory
3. Install from their respective requirements files

## Additional Notes

- The `smell-selector-ui/frontend` uses Node.js/npm (not affected by this change)
- JavaScript repositories in `/repositories/` are not affected
- Smell detection tools (`snutsjs`, `steel`) use Node.js (not affected)
