# Quick Start Guide

Get your research environment running in 5 minutes!

## Prerequisites

Make sure you have:
- **Python 3.8+** → Check: `python3 --version`
- **Node.js 18+** → Check: `node --version`
- **npm** → Check: `npm --version`

## Installation (1 minute)

```bash
# Navigate to the repository
cd research-javascript-test-smells

# Run the unified installer
./install.sh
```

The script will install everything automatically. Grab a coffee!

## Start the UI (30 seconds)

```bash
# Activate Python environment
source .venv/bin/activate

# Launch the Smell Selector UI
cd smell-selector-ui
./start.sh
```

Open your browser to **http://localhost:5173**

## Run Your First Smell Detection (2 minutes)

```bash
# Activate Python environment (if not already active)
source .venv/bin/activate

# Start the CLI
cd llm-refactor-pipeline
python -m llm_refactor

# In the CLI, run detection
llm-refactor> /analyze-smells redux-offline
```

Wait for the detection to complete, then refresh the UI to see results!

## What's Next?

### Explore the UI
- Filter smells by repository, type, or tool
- Click on a smell to see code context
- Add notes and select smells for study

### Try Different Commands
```bash
llm-refactor> /status              # See project overview
llm-refactor> /analyze-smells all  # Analyze all repos
llm-refactor> /run-tests redux-offline  # Run tests
llm-refactor> ui                   # Launch UI from CLI
```

### View API Documentation
Visit **http://localhost:8001/docs** for the complete API reference

## Common Issues

### "Permission denied" when running install.sh
```bash
chmod +x install.sh
./install.sh
```

### UI doesn't load
```bash
# Check logs
cat /tmp/smell-selector-backend.log
cat /tmp/smell-selector-frontend.log

# Restart services
cd smell-selector-ui
./start.sh
```

### "Module not found" errors
```bash
# Ensure virtual environment is active
source .venv/bin/activate

# Should show path to .venv/bin/python
which python
```

### No smells appear in UI
Run detection first:
```bash
cd llm-refactor-pipeline
python -m llm_refactor
llm-refactor> /analyze-smells redux-offline
```

## Need More Help?

- **Full Documentation**: See [README.md](README.md)
- **Installation Log**: Check `install.log` if installation fails
- **Database Guide**: See [DATABASE_CLEANUP.md](DATABASE_CLEANUP.md)
- **UI Guide**: See [smell-selector-ui/README.md](smell-selector-ui/README.md)

## Stopping Services

Press **Ctrl+C** in the terminal running `start.sh` to stop both frontend and backend.

---

**You're all set!** Start exploring test smells in your JavaScript projects! 🚀
