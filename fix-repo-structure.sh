#!/bin/bash

echo "🔧 FIXING REPOSITORY STRUCTURE"
echo "=============================="

# Go to parent directory
cd /Users/ishaankhan/Desktop/Luxe

# Check current structure
echo "📁 Current repository structure:"
ls -la

# Copy luxe-app contents to root
echo "📦 Moving luxe-app contents to root..."
cp -r luxe-app/* ./
cp -r luxe-app/.* . 2>/dev/null || true

# Remove the luxe-app directory
echo "🗑️ Removing luxe-app directory..."
rm -rf luxe-app

# Check new structure
echo "📁 New repository structure:"
ls -la

echo "✅ Repository structure fixed!"
echo "📋 Now update Cloudflare settings:"
echo "   - Root directory: . (empty)"
echo "   - Build command: npm run build"
echo "   - Build output: .next"
