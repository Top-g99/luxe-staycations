#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Luxe Staycations - Data Migration to Supabase');
console.log('================================================\n');

// Check if .env.local exists and has proper Supabase configuration
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
    console.log('❌ .env.local file not found');
    console.log('Please run setup-supabase.js first to create the environment file');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

if (envContent.includes('your-project-id')) {
    console.log('❌ Supabase credentials not configured');
    console.log('Please update .env.local with your actual Supabase project credentials');
    console.log('\nSteps:');
    console.log('1. Go to https://supabase.com and create a project');
    console.log('2. Get your Project URL and anon key from Settings > API');
    console.log('3. Update .env.local with the actual values');
    console.log('4. Run this script again');
    process.exit(1);
}

console.log('✅ Supabase configuration found');
console.log('✅ Ready to migrate data\n');

console.log('📋 Migration Steps:');
console.log('1. Start your development server: npm run dev');
console.log('2. Go to http://localhost:3000/admin/enhanced-dashboard');
console.log('3. Click "Migrate to Supabase" button');
console.log('4. Wait for migration to complete');
console.log('5. Verify data in your Supabase dashboard');

console.log('\n📊 What will be migrated:');
console.log('- Properties (villas, apartments, etc.)');
console.log('- Destinations (locations, images)');
console.log('- Bookings (guest information, dates)');
console.log('- Callback requests');
console.log('- Settings and configurations');
console.log('- Deal banners');

console.log('\n⚠️  Important Notes:');
console.log('- Make sure your Supabase database schema is set up');
console.log('- Run the SQL from supabase-schema.sql in your Supabase SQL Editor');
console.log('- Migration will preserve your existing local data');
console.log('- You can continue using the app during migration');

console.log('\n🔧 Database Schema Setup:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy the contents of supabase-schema.sql');
console.log('4. Paste and run the SQL commands');
console.log('5. This creates all necessary tables and sample data');

console.log('\n🎉 After Migration:');
console.log('- Your app will automatically use Supabase when available');
console.log('- Local storage will serve as offline backup');
console.log('- Real-time updates will be enabled');
console.log('- Data will be accessible from any device');

console.log('\n🚀 Ready to scale your Luxe Staycations platform!');





