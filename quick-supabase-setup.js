#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Quick Supabase Setup - Since you\'re already logged in!');
console.log('========================================================\n');

console.log('📋 Steps to get your credentials:');
console.log('1. In your Supabase dashboard, click on your project');
console.log('2. Go to Settings → API');
console.log('3. Copy the "Project URL" and "anon public" key');
console.log('4. Paste them below when prompted\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function quickSetup() {
  try {
    console.log('🔗 Step 1: Project URL');
    console.log('   Copy from: Settings → API → Project URL');
    const projectUrl = await askQuestion('   Paste your Project URL here: ');
    
    console.log('\n🔑 Step 2: Anon Key');
    console.log('   Copy from: Settings → API → anon public');
    const anonKey = await askQuestion('   Paste your anon key here: ');
    
    if (!projectUrl || !anonKey) {
      console.log('❌ Both Project URL and anon key are required!');
      rl.close();
      return;
    }

    // Update .env.local
    const envPath = path.join(__dirname, '.env.local');
    const envContent = `# Supabase Configuration
# Real credentials for your Supabase project
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Debug mode for development
NEXT_PUBLIC_DEBUG=true
`;

    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Credentials updated successfully!');
    
    // Check if schema needs to be set up
    console.log('\n📄 Step 3: Database Schema');
    console.log('1. Go to SQL Editor in your Supabase dashboard');
    console.log('2. Copy the content from supabase-schema.sql');
    console.log('3. Paste and run the SQL commands');
    
    const setupSchema = await askQuestion('\n   Have you set up the database schema? (y/n): ');
    
    if (setupSchema.toLowerCase() === 'y' || setupSchema.toLowerCase() === 'yes') {
      console.log('\n🎉 Perfect! Your Supabase is ready!');
      console.log('\n🧪 Testing your setup:');
      console.log('1. Restart your development server: npm run dev');
      console.log('2. Go to: http://localhost:3000/admin/enhanced-dashboard');
      console.log('3. Should show "🟢 Supabase: Connected"');
      console.log('4. Click "Migrate to Supabase" to move your local data');
    } else {
      console.log('\n📋 Schema Setup Instructions:');
      console.log('1. Go to SQL Editor in your Supabase dashboard');
      console.log('2. Copy the entire content from supabase-schema.sql');
      console.log('3. Paste and run the SQL commands');
      console.log('4. Then restart your server and test the connection');
    }
    
    console.log('\n🛡️ Your backup system will now work with:');
    console.log('✅ Cloud Storage (Supabase)');
    console.log('✅ Local Cache (IndexedDB)');
    console.log('✅ Auto Sync');
    console.log('✅ Health Monitoring');
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

quickSetup();