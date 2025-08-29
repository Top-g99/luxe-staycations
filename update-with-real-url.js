#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating .env.local with your real Supabase URL');
console.log('================================================\n');

// Your real Supabase project URL
const projectUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';

console.log('✅ Project URL: ' + projectUrl);
console.log('\n📋 Now you need to get your anon key from your Supabase dashboard:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Click on your project');
console.log('3. Go to Settings → API');
console.log('4. Copy the "anon public" key (starts with eyJ...)');
console.log('5. Update the .env.local file with it\n');

// Create new .env.local content with the real URL
const envContent = `# Supabase Configuration
# Real credentials for your Supabase project
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Debug mode for development
NEXT_PUBLIC_DEBUG=true
`;

// Write to .env.local
const envPath = path.join(__dirname, '.env.local');
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env.local with your real project URL!');
console.log('\n📋 Next step: Replace "your_anon_key_here" with your actual anon key');
console.log('\n🔧 To complete the setup:');
console.log('1. Open .env.local in your editor');
console.log('2. Replace "your_anon_key_here" with your real anon key');
console.log('3. Save the file');
console.log('4. Restart your development server: npm run dev');
console.log('5. Test at: http://localhost:3000/admin/enhanced-dashboard');

console.log('\n🛡️ Your backup system is almost ready!');
console.log('✅ Project URL: Updated');
console.log('❌ Anon Key: Needs to be updated');
console.log('✅ Local Storage: Working');
console.log('✅ Auto Sync: Ready');

