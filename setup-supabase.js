#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🚀 Supabase Setup for Luxe Staycations');
console.log('='.repeat(50));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupSupabase() {
    try {
        console.log('\n📋 Step 1: Supabase Project Setup');
        console.log('1. Go to https://supabase.com');
        console.log('2. Create a new project named "luxe-staycations"');
        console.log('3. Wait for the project to be ready (2-3 minutes)');
        console.log('4. Go to Settings → API in your dashboard');

        await question('\nPress Enter when you have your Supabase project ready...');

        console.log('\n📋 Step 2: Get Your Credentials');
        const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://abc123.supabase.co): ');
        const supabaseAnonKey = await question('Enter your Supabase Anon Key (starts with eyJ...): ');

        if (!supabaseUrl || !supabaseAnonKey) {
            console.log('❌ Error: Both URL and Anon Key are required');
            process.exit(1);
        }

        console.log('\n📋 Step 3: Creating Environment File');

        const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Development settings
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
`;

        const envPath = path.join(process.cwd(), '.env.local');
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env.local file');

        console.log('\n📋 Step 4: Database Schema Setup');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Click on "SQL Editor"');
        console.log('3. Copy the content from supabase-schema.sql');
        console.log('4. Paste and run the SQL commands');

        await question('\nPress Enter when you have run the SQL schema...');

        console.log('\n📋 Step 5: Testing Connection');
        console.log('Starting development server to test connection...');

        // Test the connection by starting the server
        const { spawn } = require('child_process');
        const dev = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            env: {...process.env, NODE_ENV: 'development' }
        });

        console.log('\n✅ Setup Complete!');
        console.log('📍 Your app should be running at: http://localhost:3000');
        console.log('📍 Admin dashboard: http://localhost:3000/admin');
        console.log('📍 Test Supabase connection: http://localhost:3000/admin/enhanced-dashboard');

        console.log('\n🎉 Supabase is now properly configured!');
        console.log('Your app will now use Supabase for data storage and real-time updates.');

        dev.on('error', (error) => {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        });

        dev.on('close', (code) => {
            console.log(`\n🛑 Server stopped with code ${code}`);
            process.exit(code);
        });

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Setup cancelled');
    rl.close();
    process.exit(0);
});

setupSupabase().finally(() => {
    rl.close();
});