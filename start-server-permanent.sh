#!/bin/bash

# 🚀 Luxe Staycations - Permanent Server Startup Script
# This script will keep your Next.js server running and restart it if it crashes

echo "🚀 Starting Luxe Staycations server permanently..."

# Function to start server
start_server() {
    echo "📡 Starting Next.js server on port 3001..."
    ./node_modules/.bin/next start --port 3001
}

# Function to check if server is running
check_server() {
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        return 0  # Server is running
    else
        return 1  # Server is not running
    fi
}

# Main loop
while true; do
    if ! check_server; then
        echo "⚠️  Server not responding, restarting..."
        start_server &
        sleep 10
    else
        echo "✅ Server is running on http://localhost:3001"
        sleep 30  # Check every 30 seconds
    fi
done
