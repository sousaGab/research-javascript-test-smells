#!/bin/bash
# Quick Setup Script for Unified Virtual Environment
# This script sets up the unified virtual environment for the research project

set -e  # Exit on error

PROJECT_ROOT="/home/gabriel/Disk/Research/research-javascript-test-smells"
VENV_PATH="$PROJECT_ROOT/.venv"

echo "=========================================="
echo "Unified Virtual Environment Setup"
echo "=========================================="
echo ""

# Check if running from project root
if [ "$PWD" != "$PROJECT_ROOT" ]; then
    echo "⚠️  Warning: Not running from project root"
    echo "   Changing to: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
fi

# Check Python version
echo "📋 Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Found: Python $PYTHON_VERSION"

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found in project root"
    exit 1
fi

# Create or update virtual environment
if [ -d "$VENV_PATH" ]; then
    echo "✓ Virtual environment already exists at .venv"
    echo "  Would you like to:"
    echo "  1) Use existing .venv and update packages"
    echo "  2) Remove and recreate .venv"
    echo "  3) Exit without changes"
    read -p "  Enter choice (1/2/3): " choice
    
    case $choice in
        1)
            echo "📦 Using existing virtual environment..."
            ;;
        2)
            echo "🗑️  Removing existing .venv..."
            rm -rf "$VENV_PATH"
            echo "🔨 Creating new virtual environment..."
            python3 -m venv "$VENV_PATH"
            ;;
        3)
            echo "👋 Exiting without changes"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Exiting."
            exit 1
            ;;
    esac
else
    echo "🔨 Creating new virtual environment..."
    python3 -m venv "$VENV_PATH"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet

# Install requirements
echo "📦 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Install llm-refactor-pipeline in editable mode
if [ -d "llm-refactor-pipeline" ]; then
    echo "📦 Installing llm-refactor-pipeline in editable mode..."
    pip install -e llm-refactor-pipeline/
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To activate the virtual environment, run:"
echo "   source .venv/bin/activate"
echo ""
echo "Or add this alias to your shell profile:"
echo "   alias activate-research='source $VENV_PATH/bin/activate'"
echo ""
echo "Next steps:"
echo "  1. Review VENV_SETUP.md for detailed usage instructions"
echo "  2. Configure .env files if needed (see VENV_SETUP.md)"
echo "  3. Test your tools!"
echo ""
echo "Tool locations:"
echo "  - Smell Selector UI: ./smell-selector-ui/"
echo "  - LLM Refactor: Run 'llm-refactor' command"
echo "  - HuggingFace Tools: ./tools/hugging_face/"
echo "  - Analysis Scripts: ./scripts/"
echo ""

# Optional: Show installed packages
read -p "Show installed packages? (y/N): " show_packages
if [ "$show_packages" = "y" ] || [ "$show_packages" = "Y" ]; then
    echo ""
    echo "Installed packages:"
    pip list
fi

echo ""
echo "Happy coding! 🚀"
