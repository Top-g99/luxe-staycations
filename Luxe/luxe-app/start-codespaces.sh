#!/bin/bash

echo "🚀 Starting Luxe Staycations in GitHub Codespaces"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "📍 Current directory: $(pwd)"
    exit 1
fi

echo "✅ Found package.json"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Set environment variables for Codespaces
export NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder_key_for_codespaces"
export NODE_ENV="development"
export NEXT_PUBLIC_APP_URL="https://$CODESPACE_NAME-3000.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"

echo "🚀 Starting development server..."
echo "📍 Your site will be available at: https://$CODESPACE_NAME-3000.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"
echo "🛑 Press Ctrl+C to stop the server"
echo "=================================================="

# Start the development server
npm run dev

