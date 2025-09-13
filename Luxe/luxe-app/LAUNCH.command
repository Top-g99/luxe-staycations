#!/bin/bash

echo "🚀 SENIOR DEV ENGINEER - Luxe Staycations Launcher"
echo "=================================================="

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

# Make the production startup script executable
chmod +x start-production.js

# Launch the production startup system
echo "🚀 Launching production startup system..."
node start-production.js

