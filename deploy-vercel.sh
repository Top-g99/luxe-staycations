#!/bin/bash

echo "🚀 Quick Vercel Deployment Script"
echo "================================="

# Kill any stuck vercel processes
pkill -f vercel 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to project directory
cd /Users/ishaankhan/Desktop/Luxe/luxe-app

# Build the project
echo "📦 Building project..."
npm run build

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git remote add origin https://github.com/Top-g99/luxe-staycations.git
fi

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy admin managers development - $(date)"

# Push to main branch
echo "🚀 Pushing to GitHub (this will trigger Vercel deployment)..."
git push origin main --force

echo "✅ Deployment initiated! Check Vercel dashboard for progress."
echo "🌐 Your site: https://luxe-staycations-9xr4.vercel.app/"
