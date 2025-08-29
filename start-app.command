#!/bin/bash

echo "🚀 Starting Luxe Staycations..."
echo "================================"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Kill any existing processes on port 3000
echo "🔪 Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Clear cache
echo "🧹 Clearing cache..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Start the development server
echo "🚀 Starting development server..."
echo "📍 Your application will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo "================================"

npm run dev

