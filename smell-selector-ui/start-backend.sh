#!/bin/bash

# Start Backend Only
# Usage: ./start-backend.sh

echo "🚀 Starting Smell Selector Backend..."

cd "$(dirname "$0")/backend"

# Check if dependencies are installed
if [ ! -f ".dependencies_installed" ]; then
    echo "📦 Installing backend dependencies..."
    pip3 install -q -r requirements.txt
    touch .dependencies_installed
fi

echo "✓ Starting FastAPI server on http://localhost:8001"
python3 main.py
