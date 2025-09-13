#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Replace Supabase Credentials');
console.log('==============================\n');

console.log('📋 Please get your credentials from your Supabase dashboard:');
console.log('1. Go to your Supabase dashboard in the browser');
console.log('2. Click on your project');
console.log('3. Go to Settings → API');
console.log('4. Copy the "Project URL" and "anon public" key\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function replaceCredentials() {
  try {
    console.log('🔗 Step 1: Enter your Project URL');
    console.log('   (e.g., https://abc123def456.supabase.co)');
    const projectUrl = await askQuestion('   Project URL: ');
    
    console.log('\n🔑 Step 2: Enter your anon key');
    console.log('   (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)');
    const anonKey = await askQuestion('   Anon Key: ');
    
    if (!projectUrl || !anonKey) {
      console.log('❌ Both Project URL and anon key are required!');
      rl.close();
      return;
    }

    // Create new .env.local content
    const envContent = `# Supabase Configuration
# Real credentials for your Supabase project
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Debug mode for development
NEXT_PUBLIC_DEBUG=true
`;

    // Write to .env.local
    const envPath = path.join(__dirname, '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Credentials updated successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Make sure your database schema is set up in Supabase');
    console.log('2. Restart your development server: npm run dev');
    console.log('3. Test connection at: http://localhost:3000/admin/enhanced-dashboard');
    console.log('4. Should show "🟢 Supabase: Connected"');
    
    console.log('\n🛡️ Your backup system will now work with:');
    console.log('✅ Cloud Storage (Supabase)');
    console.log('✅ Local Cache (IndexedDB)');
    console.log('✅ Auto Sync');
    console.log('✅ Health Monitoring');
    
  } catch (error) {
    console.error('❌ Error updating credentials:', error.message);
  } finally {
    rl.close();
  }
}

replaceCredentials();






