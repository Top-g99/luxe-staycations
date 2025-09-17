#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 Update Real Supabase Credentials');
console.log('===================================\n');

console.log('📋 Please provide your actual Supabase project credentials:');
console.log('(You can find these in your Supabase dashboard → Settings → API)\n');

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function updateCredentials() {
    try {
        const projectUrl = await askQuestion('🔗 Enter your Supabase Project URL (e.g., https://abc123.supabase.co): ');
        const anonKey = await askQuestion('🔑 Enter your Supabase Anon Key (starts with eyJ...): ');

        if (!projectUrl || !anonKey) {
            console.log('❌ Both Project URL and Anon Key are required!');
            rl.close();
            return;
        }

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

updateCredentials();





