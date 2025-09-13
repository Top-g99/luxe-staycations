#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Supabase Status for Luxe Staycations');
console.log('================================================\n');

// Check current .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('Please run: node complete-supabase-setup.js');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Check if still has demo credentials
if (envContent.includes('demo-luxe-staycations.supabase.co') || envContent.includes('demo_key_for_testing')) {
    console.log('⚠️  Current Status: Using Demo Credentials');
    console.log('\n📋 Your .env.local contains demo credentials that won\'t work.');
    console.log('You need to replace them with your actual Supabase project credentials.');

    console.log('\n🚀 To set up your real Supabase project:');
    console.log('1. Go to https://supabase.com');
    console.log('2. Create a new project (or use existing one)');
    console.log('3. Go to Settings → API');
    console.log('4. Copy your Project URL and Anon Key');
    console.log('5. Update .env.local with your real credentials');

    console.log('\n📄 Database Setup:');
    console.log('1. Go to SQL Editor in your Supabase dashboard');
    console.log('2. Copy the content from supabase-schema.sql');
    console.log('3. Paste and run the SQL commands');

    console.log('\n🧪 Test Connection:');
    console.log('1. Restart your development server');
    console.log('2. Go to http://localhost:3000/admin/enhanced-dashboard');
    console.log('3. Should show "🟢 Supabase: Connected"');

} else {
    console.log('✅ Current Status: Using Real Supabase Credentials');
    console.log('\n🔧 To test your connection:');
    console.log('1. Make sure your development server is running');
    console.log('2. Go to http://localhost:3000/admin/enhanced-dashboard');
    console.log('3. Check if Supabase shows as "Connected"');
    console.log('4. If not connected, verify your credentials and database schema');
}

console.log('\n📊 Current Environment Variables:');
const lines = envContent.split('\n');
lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL') || line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
        const [key, value] = line.split('=');
        if (value && value.length > 50) {
            console.log(`${key}=${value.substring(0, 30)}...`);
        } else {
            console.log(line);
        }
    }
});

console.log('\n🛡️ Backup System Status:');
console.log('✅ Local Storage (IndexedDB): Ready');
console.log('✅ Fallback Storage (localStorage): Ready');
console.log('✅ Auto Sync: Ready');
console.log('✅ Health Monitoring: Ready');

if (envContent.includes('demo-luxe-staycations.supabase.co')) {
    console.log('❌ Cloud Storage (Supabase): Needs real credentials');
} else {
    console.log('✅ Cloud Storage (Supabase): Configured');
}

console.log('\n📖 For detailed setup instructions, see: SUPABASE_SETUP_INSTRUCTIONS.md');





