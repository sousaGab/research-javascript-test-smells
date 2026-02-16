# Hugging Face Tools - Setup Notice

## ⚠️ Virtual Environment Migration

This directory previously used its own `.venv` virtual environment. 

**The project has now migrated to a unified virtual environment at the root level.**

## Setup Instructions

1. **Use the root virtual environment:**
   ```bash
   cd /home/gabriel/Disk/Research/research-javascript-test-smells
   source .venv/bin/activate
   ```

2. **Run scripts from this directory:**
   ```bash
   cd tools/hugging_face
   python test_refactor_cot.py
   ```

## Dependencies

This tool requires:
- `openai` - OpenAI API client
- `python-dotenv` - Environment variable management

These are now installed via the root `requirements.txt`.

## Environment Variables

Create a `.env` file in this directory with:
```
OPENAI_API_KEY=your_api_key_here
```

Or use a project-wide `.env` in the root directory.

## Documentation

See the root-level documentation:
- `VENV_SETUP.md` - Complete setup guide
- `VENV_MIGRATION_PLAN.md` - Migration details
- `requirements.txt` - All project dependencies

## Quick Start

```bash
# From project root
source .venv/bin/activate
cd tools/hugging_face
python test_refactor_cot.py
```
