#!/bin/bash

# Start Frontend Only
# Usage: ./start-frontend.sh

echo "🚀 Starting Smell Selector Frontend..."

cd "$(dirname "$0")/frontend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "✓ Starting Vite dev server on http://localhost:5173"
npm run dev
