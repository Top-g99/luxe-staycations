const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Start - Luxe Staycations');
console.log('==================================');

try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
        console.log('❌ Error: package.json not found. Make sure you\'re in the luxe directory.');
        process.exit(1);
    }

    console.log('✅ Found package.json');
    console.log('📦 Installing dependencies...');

    // Install dependencies
    execSync('npm install', { stdio: 'inherit' });

    console.log('✅ Dependencies installed');
    console.log('🚀 Starting development server...');
    console.log('📍 Your site will be available at: http://localhost:3000');
    console.log('🛑 Press Ctrl+C to stop the server');
    console.log('==================================');

    // Start the development server
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n🔧 Try these steps manually:');
    console.log('1. Open Terminal');
    console.log('2. Run: cd /Users/ishaankhan/Desktop/Luxe/luxe');
    console.log('3. Run: npm install');
    console.log('4. Run: npm run dev');
    process.exit(1);