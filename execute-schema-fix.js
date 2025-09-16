const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Schema Fix Instructions');
console.log('=====================================\n');

console.log('📋 Your Supabase Project Details:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'}\n`);

console.log('🚨 PROBLEM IDENTIFIED:');
console.log('   Your destinations table has an ID column that does NOT auto-generate UUIDs');
console.log('   This is causing the migration to fail with "null value in column id" errors\n');

console.log('🔧 SOLUTION: Update the database schema in Supabase\n');

console.log('📝 STEP-BY-STEP INSTRUCTIONS:');
console.log('1. Open your browser and go to: https://supabase.com/dashboard');
console.log('2. Sign in to your account');
console.log('3. Click on your project: okphwjvhzofxevtmlapn');
console.log('4. In the left sidebar, click "SQL Editor"');
console.log('5. Click "New query"');
console.log('6. Copy and paste the SQL script below');
console.log('7. Click "Run" to execute the script\n');

console.log('📋 COPY THIS SQL SCRIPT:');
console.log('=====================================');
console.log(`
-- Fix destinations table to auto-generate UUIDs
-- This will preserve your existing data

-- Step 1: Create a backup of existing data
CREATE TEMP TABLE destinations_backup AS SELECT * FROM destinations;

-- Step 2: Drop the existing table
DROP TABLE destinations CASCADE;

-- Step 3: Recreate the table with proper ID generation
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Restore the data with new UUIDs
INSERT INTO destinations (name, description, image, featured, created_at, updated_at)
SELECT name, description, image, featured, created_at, updated_at
FROM destinations_backup;

-- Step 5: Verify the data
SELECT * FROM destinations;

-- Step 6: Clean up
DROP TABLE destinations_backup;
`);
console.log('=====================================\n');

console.log('✅ AFTER RUNNING THE SQL:');
console.log('1. Go back to your Luxe admin dashboard: http://localhost:3000/admin/enhanced-dashboard');
console.log('2. Click "Start Migration" again');
console.log('3. The migration should now work successfully!\n');

console.log('🔍 WHAT THIS FIXES:');
console.log('   ✅ Auto-generating UUIDs for destination IDs');
console.log('   ✅ Proper default values for timestamps');
console.log('   ✅ Migration compatibility with your code');
console.log('   ✅ No more "null value in column id" errors\n');

console.log('💡 TROUBLESHOOTING:');
console.log('   - If you get permission errors, make sure you\'re signed in as the project owner');
console.log('   - If the table doesn\'t exist, the CREATE TABLE command will create it');
console.log('   - If you have other tables with similar issues, apply the same pattern\n');

// Test the connection to make sure credentials are working
async function testConnection() {
  try {
    console.log('🧪 Testing current connection...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.from('destinations').select('count');
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      console.log('💡 This confirms the schema needs to be fixed');
    } else {
      console.log(`✅ Connection successful - Found ${data[0]?.count || 0} destinations`);
      console.log('💡 The table exists but has the wrong structure');
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testConnection();





