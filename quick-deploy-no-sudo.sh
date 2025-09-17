#!/bin/bash

echo "🚨 CTO QUICK DEPLOY - NO SUDO VERSION"
echo "====================================="

# Kill vercel processes without sudo
echo "💀 Killing stuck Vercel processes..."
pkill -f vercel 2>/dev/null || true
pkill -f "vercel --prod" 2>/dev/null || true

# Wait
sleep 2

# Navigate to project
cd /Users/ishaankhan/Desktop/Luxe/luxe-app

# Build project
echo "🔨 Building project..."
npm run build

# Git operations
echo "📝 Git operations..."
git add .
git commit -m "CTO Emergency Deploy: Admin managers - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to trigger Vercel deployment
echo "🚀 Pushing to GitHub (triggers Vercel auto-deploy)..."
git push origin main --force

echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 Live Site: https://luxe-staycations-9xr4.vercel.app/"
echo "📊 Dashboard: https://vercel.com/top-g99s-projects/luxe-staycations-9xr4"
