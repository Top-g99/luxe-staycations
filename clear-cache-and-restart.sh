#!/bin/bash

echo "🧹 Clearing all caches..."

# Kill any running Next.js processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Clear Next.js cache
rm -rf .next 2>/dev/null || true

# Clear node modules cache
rm -rf node_modules/.cache 2>/dev/null || true

# Clear npm cache
npm cache clean --force 2>/dev/null || true

# Clear browser cache files
find . -name "*.cache" -delete 2>/dev/null || true

echo "✅ Caches cleared"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
npm run dev

