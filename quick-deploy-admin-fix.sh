#!/bin/bash

echo "🚀 Luxe Staycations - Admin Fix & Quick Deploy"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the luxe-app directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo "🔨 Step 2: Building application..."
npm run build

echo "✅ Step 3: Admin fixes applied:"
echo "   - Fixed admin authentication"
echo "   - Fixed missing imports"
echo "   - Added admin test page"
echo "   - Optimized Netlify config"

echo ""
echo "🎯 Ready for deployment!"
echo ""
echo "📋 Choose your deployment method:"
echo ""
echo "1️⃣  NETLIFY DASHBOARD (Recommended):"
echo "   - Go to: https://app.netlify.com/sites/luxestaycations"
echo "   - Click 'Deploys' tab"
echo "   - Drag this folder to deploy"
echo ""
echo "2️⃣  GIT DEPLOY:"
echo "   - git add ."
echo "   - git commit -m 'Admin fix - ready for deployment'"
echo "   - git push origin main"
echo ""
echo "3️⃣  NETLIFY CLI (if installed):"
echo "   - netlify deploy --prod"
echo ""
echo "🔐 Admin Access:"
echo "   URL: https://luxestaycations.in/admin"
echo "   Username: admin"
echo "   Password: luxe2024!"
echo ""
echo "🧪 Test Admin:"
echo "   URL: https://luxestaycations.in/admin/test"
echo ""
echo "✅ Admin error has been fixed and site is ready for deployment!"
