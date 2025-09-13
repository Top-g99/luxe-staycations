#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating .env.local with demo Supabase credentials...');

const envPath = path.join(__dirname, '.env.local');
const envContent = `# Supabase Configuration
# Demo credentials for testing - Replace with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://demo-luxe-staycations.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tbHV4ZS1zdGF5Y2F0aW9ucyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM1MjM0NTY3LCJleHAiOjIwNTA4MTA1Njd9.demo_key_for_testing

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tbHV4ZS1zdGF5Y2F0aW9ucyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzUyMzQ1NjcsImV4cCI6MjA1MDgxMDU2N30.demo_service_key_for_testing

# Debug mode for development
NEXT_PUBLIC_DEBUG=true
`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Create your own Supabase project at https://supabase.com');
    console.log('2. Replace the demo credentials with your actual project credentials');
    console.log('3. Run the database schema in your Supabase SQL Editor');
    console.log('4. Test the connection at http://localhost:3000/admin/enhanced-dashboard');
} catch (error) {
    console.error('❌ Failed to update .env.local:', error.message);
}





