#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log(`
🚀 QUICK SUPABASE SETUP FOR LUXE STAYCATIONS
============================================

📋 STEP-BY-STEP GUIDE:
======================

1️⃣ CREATE SUPABASE PROJECT
   • Go to: https://supabase.com
   • Sign up/Login
   • Click "New Project"
   • Name: luxe-staycations
   • Choose region
   • Create project

2️⃣ GET YOUR CREDENTIALS
   • Go to Settings → API
   • Copy Project URL and Anon Key

3️⃣ UPDATE .env.local
   • Edit .env.local file
   • Replace placeholder values with your real credentials

4️⃣ SET UP DATABASE
   • Go to SQL Editor in Supabase
   • Run the schema from supabase-schema.sql

5️⃣ CREATE STORAGE BUCKETS
   • Go to Storage in Supabase
   • Create these buckets:
     - luxe-media (Public)
     - luxe-properties (Public)
     - luxe-destinations (Public)
     - luxe-banners (Public)

6️⃣ TEST CONNECTION
   • Run: npm run dev
   • Visit: http://localhost:3000/test-supabase
   • Test the connection

🔧 COMMANDS TO RUN:
==================
• npm run dev - Start development server
• Visit http://localhost:3000/test-supabase - Test Supabase
• Visit http://localhost:3000/admin - Admin dashboard

📄 FILES TO CHECK:
==================
• .env.local - Your Supabase credentials
• supabase-schema.sql - Database schema
• src/lib/supabase.ts - Supabase client

🎯 NEXT STEPS:
==============
1. Set up Supabase project
2. Update .env.local with credentials
3. Run database schema
4. Test connection
5. Continue development!

💡 Need help? Check the documentation files in your project.
`);

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('your_supabase_project_url_here')) {
        console.log(`
⚠️  ACTION REQUIRED:
===================
Your .env.local file still has placeholder values.
Please update it with your real Supabase credentials:

1. Edit .env.local
2. Replace placeholder values
3. Save the file
4. Restart the development server
`);
    } else {
        console.log(`
✅ ENVIRONMENT CONFIGURED:
=========================
Your .env.local file appears to be configured.
You can now test the Supabase connection!
`);
    }
} else {
    console.log(`
❌ MISSING .env.local:
=====================
Please create .env.local file with your Supabase credentials.
Copy from env.example and update with your real values.
`);
}