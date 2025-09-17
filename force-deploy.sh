#!/bin/bash

echo "🚨 CTO EMERGENCY DEPLOYMENT FIX"
echo "================================"

# Force kill all vercel processes
echo "💀 Killing stuck Vercel processes..."
sudo pkill -9 -f vercel 2>/dev/null || true
sudo pkill -9 -f "vercel --prod" 2>/dev/null || true

# Wait for processes to die
sleep 3

# Navigate to project
cd /Users/ishaankhan/Desktop/Luxe/luxe-app

# Build project
echo "🔨 Building project..."
npm run build

# Git operations
echo "📝 Git operations..."
git add .
git commit -m "Emergency deploy: Admin managers development - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to trigger Vercel deployment
echo "🚀 Pushing to GitHub (triggers Vercel auto-deploy)..."
git push origin main --force

echo "✅ DEPLOYMENT INITIATED!"
echo "🌐 Check: https://luxe-staycations-9xr4.vercel.app/"
echo "📊 Vercel Dashboard: https://vercel.com/top-g99s-projects/luxe-staycations-9xr4"
