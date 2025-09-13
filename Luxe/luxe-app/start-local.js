const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Luxe Staycations - Local Mode');
console.log('==========================================');

// Set environment variables for local development
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder_key_for_local_development';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder_service_role_key';
process.env.NODE_ENV = 'development';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE = 'true';

try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
        console.log('❌ Error: package.json not found. Make sure you\'re in the luxe directory.');
        process.exit(1);
    }

    console.log('✅ Found package.json');
    console.log('📦 Installing dependencies...');

    // Install dependencies
    const install = spawn('npm', ['install'], { stdio: 'inherit' });

    install.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed');
            console.log('🚀 Starting development server...');
            console.log('📍 Your site will be available at: http://localhost:3000');
            console.log('🛑 Press Ctrl+C to stop the server');
            console.log('==========================================');

            // Start the development server
            const dev = spawn('npm', ['run', 'dev'], {
                stdio: 'inherit',
                env: {...process.env }
            });

            dev.on('error', (error) => {
                console.error('❌ Failed to start server:', error.message);
                process.exit(1);
            });

            dev.on('close', (code) => {
                console.log(`\n🛑 Server stopped with code ${code}`);
                process.exit(code);
            });
        } else {
            console.error('❌ npm install failed');
            process.exit(1);
        }
    });

} catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n🔧 Try these steps manually:');
    console.log('1. Open Terminal');
    console.log('2. Run: cd /Users/ishaankhan/Desktop/Luxe/luxe');
    console.log('3. Run: npm install');
    console.log('4. Run: npm run dev');
    process.exit(1);
}