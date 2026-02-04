#!/bin/bash

################################################################################
# Research JavaScript Test Smells - Unified Installation Script
################################################################################
# This script installs and configures the entire research environment:
# - LLM Refactor Pipeline (Python)
# - Smell Detection Tools (Steel + SNutsJS)
# - Smell Selector UI (FastAPI + React)
# - Database setup and migrations
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get script directory (repository root)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

# Log file
LOG_FILE="$REPO_ROOT/install.log"
echo "Installation started at $(date)" > "$LOG_FILE"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_command() {
    echo "Running: $1" >> "$LOG_FILE"
    eval "$1" >> "$LOG_FILE" 2>&1
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

################################################################################
# 1. PREREQUISITES CHECK
################################################################################

print_header "1. Checking Prerequisites"

# Check Python 3
print_step "Checking Python 3..."
if check_command python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
    PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python 3.8+ required, found $PYTHON_VERSION"
        exit 1
    fi
else
    print_error "Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check pip
print_step "Checking pip..."
if check_command pip3; then
    print_success "pip3 found"
else
    print_error "pip3 not found. Please install pip3"
    exit 1
fi

# Check Node.js
print_step "Checking Node.js..."
if check_command node; then
    NODE_VERSION=$(node --version 2>&1 | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js $NODE_VERSION found"
    else
        print_error "Node.js 18+ required, found $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
print_step "Checking npm..."
if check_command npm; then
    NPM_VERSION=$(npm --version 2>&1)
    print_success "npm $NPM_VERSION found"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

# Check for yarn (optional but preferred for some packages)
print_step "Checking yarn..."
if check_command yarn; then
    YARN_VERSION=$(yarn --version 2>&1)
    print_success "yarn $YARN_VERSION found (will use yarn for some packages)"
    USE_YARN=true
else
    print_warning "yarn not found (optional, will use npm instead)"
    USE_YARN=false
fi

# Check git
print_step "Checking git..."
if check_command git; then
    print_success "git found"
else
    print_warning "git not found (optional)"
fi

################################################################################
# 2. DATABASE SETUP
################################################################################

print_header "2. Setting Up Database"

# Create research_data directory
print_step "Creating research_data directory..."
mkdir -p "$REPO_ROOT/research_data"
print_success "research_data directory ready"

# Check if database exists
DB_PATH="$REPO_ROOT/research_data/research.db"
if [ -f "$DB_PATH" ]; then
    print_success "Database already exists at research_data/research.db"

    # Backup existing database
    print_step "Creating database backup..."
    BACKUP_PATH="$REPO_ROOT/research_data/research.db.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$DB_PATH" "$BACKUP_PATH"
    print_success "Backup created at $(basename $BACKUP_PATH)"
else
    print_step "Database will be created on first run"
fi

################################################################################
# 3. PYTHON ENVIRONMENT SETUP
################################################################################

print_header "3. Setting Up Python Environment"

# Create virtual environment
print_step "Creating Python virtual environment..."
if [ ! -d "$REPO_ROOT/.venv" ]; then
    log_command "python3 -m venv $REPO_ROOT/.venv"
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment
print_step "Activating virtual environment..."
source "$REPO_ROOT/.venv/bin/activate"
print_success "Virtual environment activated"

# Upgrade pip
print_step "Upgrading pip..."
log_command "pip install --upgrade pip"
print_success "pip upgraded"

# Install LLM Refactor Pipeline dependencies
print_step "Installing LLM Refactor Pipeline dependencies..."
if [ -f "$REPO_ROOT/llm-refactor-pipeline/requirements.txt" ]; then
    log_command "pip install -r $REPO_ROOT/llm-refactor-pipeline/requirements.txt"
    print_success "LLM Refactor Pipeline dependencies installed"
else
    print_warning "llm-refactor-pipeline/requirements.txt not found"
fi

# Install UI Backend dependencies
print_step "Installing UI Backend dependencies..."
if [ -f "$REPO_ROOT/smell-selector-ui/backend/requirements.txt" ]; then
    log_command "pip install -r $REPO_ROOT/smell-selector-ui/backend/requirements.txt"
    print_success "UI Backend dependencies installed"
else
    print_warning "smell-selector-ui/backend/requirements.txt not found"
fi

################################################################################
# 4. DATABASE MIGRATIONS
################################################################################

print_header "4. Running Database Migrations"

print_step "Running UI database migrations..."
if [ -f "$REPO_ROOT/smell-selector-ui/backend/migrate_database.py" ]; then
    cd "$REPO_ROOT/smell-selector-ui/backend"
    log_command "python migrate_database.py"
    cd "$REPO_ROOT"
    print_success "Database migrations completed"
else
    print_warning "Migration script not found (will run on first backend startup)"
fi

################################################################################
# 5. STEEL DETECTOR SETUP
################################################################################

print_header "5. Setting Up Steel Detector"

STEEL_DIR="$REPO_ROOT/smell_detection_tools/steel"

if [ -d "$STEEL_DIR" ]; then
    cd "$STEEL_DIR"

    # Install dependencies
    print_step "Installing Steel dependencies..."
    if [ "$USE_YARN" = true ]; then
        log_command "yarn install"
    else
        log_command "npm install"
    fi
    print_success "Steel dependencies installed"

    # Compile TypeScript
    print_step "Compiling Steel (TypeScript)..."
    if [ "$USE_YARN" = true ]; then
        log_command "yarn run compile"
    else
        log_command "npm run compile"
    fi
    print_success "Steel compiled successfully"

    cd "$REPO_ROOT"
else
    print_warning "Steel detector not found at smell_detection_tools/steel"
fi

################################################################################
# 6. SNUTSJS DETECTOR SETUP
################################################################################

print_header "6. Setting Up SNutsJS Detector"

SNUTSJS_DIR="$REPO_ROOT/smell_detection_tools/snutsjs"

if [ -d "$SNUTSJS_DIR" ]; then
    cd "$SNUTSJS_DIR"

    # Install dependencies
    print_step "Installing SNutsJS dependencies..."
    if [ "$USE_YARN" = true ]; then
        log_command "yarn install"
    else
        log_command "npm install"
    fi
    print_success "SNutsJS dependencies installed"

    cd "$REPO_ROOT"
else
    print_warning "SNutsJS detector not found at smell_detection_tools/snutsjs"
fi

################################################################################
# 7. UI FRONTEND SETUP
################################################################################

print_header "7. Setting Up UI Frontend"

UI_FRONTEND_DIR="$REPO_ROOT/smell-selector-ui/frontend"

if [ -d "$UI_FRONTEND_DIR" ]; then
    cd "$UI_FRONTEND_DIR"

    # Install dependencies
    print_step "Installing UI Frontend dependencies..."
    log_command "npm install"
    print_success "UI Frontend dependencies installed"

    cd "$REPO_ROOT"
else
    print_warning "UI Frontend not found at smell-selector-ui/frontend"
fi

################################################################################
# 8. VERIFICATION
################################################################################

print_header "8. Verifying Installation"

# Test database exists
print_step "Checking database..."
if [ -f "$DB_PATH" ] || [ -f "$REPO_ROOT/smell-selector-ui/backend/migrate_database.py" ]; then
    print_success "Database setup verified"
else
    print_warning "Database not found (will be created on first run)"
fi

# Test Steel
print_step "Testing Steel detector..."
if [ -f "$STEEL_DIR/dist/index.js" ]; then
    print_success "Steel is ready"
else
    print_warning "Steel may not be compiled correctly"
fi

# Test SNutsJS
print_step "Testing SNutsJS detector..."
if [ -d "$SNUTSJS_DIR/node_modules" ]; then
    print_success "SNutsJS is ready"
else
    print_warning "SNutsJS may not be installed correctly"
fi

# Test UI Frontend
print_step "Testing UI Frontend..."
if [ -d "$UI_FRONTEND_DIR/node_modules" ]; then
    print_success "UI Frontend is ready"
else
    print_warning "UI Frontend may not be installed correctly"
fi

# Test Python packages
print_step "Testing Python packages..."
if python3 -c "import sqlalchemy, pandas, fastapi" 2>/dev/null; then
    print_success "Python packages verified"
else
    print_warning "Some Python packages may be missing"
fi

################################################################################
# 9. CREATE MARKER FILE
################################################################################

print_step "Creating installation marker..."
echo "Installation completed at $(date)" > "$REPO_ROOT/.install_complete"
print_success "Installation marker created"

################################################################################
# 10. POST-INSTALL SUMMARY
################################################################################

print_header "Installation Complete!"

echo -e "${GREEN}${BOLD}✨ All components installed successfully!${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}📦 Installed Components:${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Python Virtual Environment (.venv)"
echo -e "  ${GREEN}✓${NC} LLM Refactor Pipeline"
echo -e "  ${GREEN}✓${NC} Steel Test Smell Detector"
echo -e "  ${GREEN}✓${NC} SNutsJS Test Smell Detector"
echo -e "  ${GREEN}✓${NC} Smell Selector UI (Backend + Frontend)"
echo -e "  ${GREEN}✓${NC} SQLite Database (research.db)"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}🚀 Quick Start Guide:${NC}"
echo ""
echo -e "${BOLD}1. Activate Python environment:${NC}"
echo -e "   ${YELLOW}source .venv/bin/activate${NC}"
echo ""
echo -e "${BOLD}2. Start Smell Selector UI:${NC}"
echo -e "   ${YELLOW}cd smell-selector-ui${NC}"
echo -e "   ${YELLOW}./start.sh${NC}"
echo -e "   UI will be available at: ${BLUE}http://localhost:5173${NC}"
echo -e "   API docs at: ${BLUE}http://localhost:8001/docs${NC}"
echo ""
echo -e "${BOLD}3. Run LLM Refactor Pipeline CLI:${NC}"
echo -e "   ${YELLOW}cd llm-refactor-pipeline${NC}"
echo -e "   ${YELLOW}python -m llm_refactor${NC}"
echo ""
echo -e "${BOLD}4. Analyze test smells:${NC}"
echo -e "   ${YELLOW}llm-refactor> /analyze-smells <repo-name>${NC}"
echo -e "   ${YELLOW}llm-refactor> /analyze-smells all${NC}"
echo ""
echo -e "${BOLD}5. View detection results:${NC}"
echo -e "   ${YELLOW}llm-refactor> /status${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}📁 Project Structure:${NC}"
echo ""
echo -e "  ${CYAN}llm-refactor-pipeline/${NC}    - Main CLI and refactoring logic"
echo -e "  ${CYAN}smell_detection_tools/${NC}    - Steel and SNutsJS detectors"
echo -e "  ${CYAN}smell-selector-ui/${NC}        - Web interface for smell selection"
echo -e "  ${CYAN}research_data/${NC}            - SQLite database and outputs"
echo -e "  ${CYAN}repositories/${NC}             - Test repositories for analysis"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}📚 Documentation:${NC}"
echo ""
echo -e "  Installation log: ${YELLOW}install.log${NC}"
echo -e "  Database cleanup: ${YELLOW}DATABASE_CLEANUP.md${NC}"
echo -e "  UI Documentation: ${YELLOW}smell-selector-ui/README.md${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}🔧 Troubleshooting:${NC}"
echo ""
echo -e "  If you encounter issues:"
echo -e "  1. Check the installation log: ${YELLOW}cat install.log${NC}"
echo -e "  2. Ensure virtual environment is activated: ${YELLOW}source .venv/bin/activate${NC}"
echo -e "  3. Re-run specific setup scripts in smell-selector-ui/"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}${BOLD}Happy researching! 🔬${NC}"
echo ""
