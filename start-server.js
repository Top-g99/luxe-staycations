const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Luxe Staycations Development Server...');
console.log('📁 Current directory:', process.cwd());

// Check if we're in the right directory
if (!require('fs').existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the luxe directory.');
    process.exit(1);
}

// Read package.json to get the correct command
const packageJson = require('./package.json');
console.log('📦 Project:', packageJson.name);
console.log('⚡ Next.js version:', packageJson.dependencies.next);

// Start the development server
console.log('🔄 Starting Next.js development server...');

const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        PORT: process.env.PORT || '3000'
    }
});

child.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure you have Node.js installed (version 16 or higher)');
    console.log('2. Run: npm install');
    console.log('3. Try: npm run dev');
    process.exit(1);
});

child.on('close', (code) => {
    console.log(`\n🛑 Server stopped with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    child.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
            console.log('\n🛑 Stopping server...');
            child.kill('SIGTERM');
            process.exit(0);