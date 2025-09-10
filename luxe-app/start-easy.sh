#!/bin/bash

# 🚀 Luxe Staycations - Easy Server Startup
# Run this script to start your server

echo "🚀 Starting Luxe Staycations server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from your project directory"
    echo "   Expected: /Users/ishaankhan/Desktop/Luxe/luxe"
    exit 1
fi

echo "✅ Project directory confirmed"

# Check if build exists
if [ ! -f ".next/BUILD_ID" ]; then
    echo "🔨 Building project first..."
    npm run build
fi

echo "📡 Starting server on port 3001..."
echo "🌐 Your site will be available at: http://localhost:3001"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo ""

# Start the server using the project's own Next.js
./node_modules/.bin/next start --port 3001
