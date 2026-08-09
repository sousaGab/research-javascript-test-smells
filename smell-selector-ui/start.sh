#!/bin/bash

# Smell Selector UI - Startup Script
# This script starts both backend and frontend servers

set -e  # Exit on error

echo "🚀 Starting Smell Selector UI..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# =============================================================================
# 1. CHECK PREREQUISITES
# =============================================================================

echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✓ Python 3 found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✓ Node.js found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✓ npm found"

echo ""

# =============================================================================
# 2. DATABASE MIGRATION
# =============================================================================

echo -e "${BLUE}🗄️  Checking database...${NC}"

if [ ! -f "../research_data/research.db" ]; then
    echo "❌ Database not found at ../research_data/research.db"
    echo "   Please run smell detection first:"
    echo "   cd ../llm-refactor-pipeline"
    echo "   python -m llm_refactor"
    echo "   llm-refactor> /analyze-smells <repo-name>"
    exit 1
fi

echo "✓ Database found"

# Run migration if needed (use Python instead of sqlite3 CLI, which may not be installed)
NEEDS_MIGRATION=true
if command -v sqlite3 &> /dev/null; then
    grep -q "smell_ui_metadata" <(sqlite3 ../research_data/research.db ".tables") 2>/dev/null && NEEDS_MIGRATION=false
elif [ -f "../.venv/bin/python" ]; then
    ../.venv/bin/python -c "import sqlite3; c=sqlite3.connect('../research_data/research.db'); t=[r[0] for r in c.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")]; exit(0 if 'smell_ui_metadata' in t else 1)" 2>/dev/null && NEEDS_MIGRATION=false
elif command -v python3 &> /dev/null; then
    python3 -c "import sqlite3; c=sqlite3.connect('../research_data/research.db'); t=[r[0] for r in c.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")]; exit(0 if 'smell_ui_metadata' in t else 1)" 2>/dev/null && NEEDS_MIGRATION=false
fi

if [ "$NEEDS_MIGRATION" = true ]; then
    echo "  Running database migration..."
    cd backend
    # Use virtual environment Python if available, otherwise system python3
    if [ -f "../../.venv/bin/python" ]; then
        ../../.venv/bin/python migrate_database.py
    else
        python3 migrate_database.py
    fi
    cd ..
else
    echo "✓ Database schema up-to-date"
fi

echo ""

# =============================================================================
# 3. INSTALL DEPENDENCIES
# =============================================================================

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Backend dependencies
if [ ! -f ".backend_dependencies_installed" ]; then
    echo "  Installing backend dependencies from root requirements.txt..."
    # Use virtual environment pip if available
    if [ -f "../.venv/bin/pip" ]; then
        ../.venv/bin/pip install -q fastapi uvicorn[standard] pydantic sqlalchemy python-multipart
    else
        pip3 install -q --user fastapi uvicorn[standard] pydantic sqlalchemy python-multipart
    fi
    touch .backend_dependencies_installed
else
    echo "✓ Backend dependencies installed"
fi

# Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "  Installing frontend dependencies..."
    cd frontend
    npm install --silent
    cd ..
else
    echo "✓ Frontend dependencies installed"
fi

echo ""

# =============================================================================
# 4. START SERVERS
# =============================================================================

echo -e "${GREEN}🎉 Starting servers...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}🔧 Starting backend (FastAPI)...${NC}"
cd backend
# Use virtual environment Python if available, otherwise system python3
if [ -f "../../.venv/bin/python" ]; then
    ../../.venv/bin/python main.py > /tmp/smell-selector-backend.log 2>&1 &
else
    python3 main.py > /tmp/smell-selector-backend.log 2>&1 &
fi
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "  Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8001/ > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Backend ready at http://localhost:8001${NC}"
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:8001/ > /dev/null 2>&1; then
    echo "  ❌ Backend failed to start. Check /tmp/smell-selector-backend.log"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""

# Start frontend
echo -e "${BLUE}🎨 Starting frontend (Vite)...${NC}"
cd frontend
npm run dev > /tmp/smell-selector-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "  Waiting for frontend to start..."
for i in {1..10}; do
    if curl -s http://localhost:5173/ > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Frontend ready at http://localhost:5173${NC}"
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:5173/ > /dev/null 2>&1; then
    echo "  ❌ Frontend failed to start. Check /tmp/smell-selector-frontend.log"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}✨ Smell Selector UI is running!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  🔌 API:       ${BLUE}http://localhost:8001${NC}"
echo -e "  📚 API Docs:  ${BLUE}http://localhost:8001/docs${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Logs:"
echo "  Backend:  /tmp/smell-selector-backend.log"
echo "  Frontend: /tmp/smell-selector-frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop servers${NC}"
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    sleep 2
    open http://localhost:5173
fi

# Keep script running
wait
