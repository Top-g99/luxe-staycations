#!/bin/bash

echo "🔧 FIXING CLOUDFLARE STRUCTURE"
echo "=============================="

# Go to parent directory
cd /Users/ishaankhan/Desktop/Luxe

# Copy all luxe-app files to root level
echo "📁 Moving files to root level..."
cp -r luxe-app/* ./
cp -r luxe-app/.* . 2>/dev/null || true

# Create new package.json at root
echo "📦 Creating root package.json..."
cat > package.json << 'EOF'
{
  "name": "luxe-staycations",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@ffmpeg/ffmpeg": "^0.12.15",
    "@ffmpeg/util": "^0.12.2",
    "@getbrevo/brevo": "^3.0.1",
    "@mui/icons-material": "^5.14.19",
    "@mui/lab": "^5.0.0-alpha.165",
    "@mui/material": "^5.14.20",
    "@mui/x-date-pickers": "^8.11.1",
    "@netlify/plugin-nextjs": "^5.13.0",
    "next-sitemap": "^4.2.3",
    "@prisma/client": "^5.7.1",
    "@supabase/supabase-js": "^2.56.0",
    "@tanstack/react-query": "^5.85.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/nodemailer": "^7.0.1",
    "autoprefixer": "^10.4.21",
    "bcryptjs": "^3.0.2",
    "browser-image-compression": "^2.0.2",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.1",
    "next": "15.5.0",
    "nodemailer": "^7.0.6",
    "postcss": "^8.5.6",
    "puppeteer": "^24.17.0",
    "razorpay": "^2.9.2",
    "react": "^18",
    "react-dom": "^18",
    "recharts": "^3.1.2",
    "styled-components": "^6.1.19",
    "tailwindcss": "^3.4.17"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/styled-components": "^5.1.34",
    "eslint": "^8",
    "eslint-config-next": "15.5.0",
    "prisma": "^5.7.1",
    "typescript": "^5"
  }
}
EOF

echo "✅ Structure fixed!"
echo "📋 Now update Cloudflare settings:"
echo "   - Root directory: . (empty)"
echo "   - Build command: npm run build"
echo "   - Build output: .next"
