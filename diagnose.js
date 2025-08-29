const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Diagnosing Localhost Issues');
console.log('==============================');

try {
    // Check if we're in the right directory
    console.log('1. Checking directory...');
    if (!fs.existsSync('package.json')) {
        console.log('❌ Error: package.json not found');
        console.log('📍 Current directory:', process.cwd());
        console.log('🔧 Solution: Make sure you\'re in the luxe directory');
        process.exit(1);
    }
    console.log('✅ Found package.json');

    // Check Node.js version
    console.log('\n2. Checking Node.js...');
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log('✅ Node.js version:', nodeVersion);

    // Check npm version
    console.log('\n3. Checking npm...');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log('✅ npm version:', npmVersion);

    // Check if port 3000 is in use
    console.log('\n4. Checking port 3000...');
    try {
        const portCheck = execSync('lsof -ti:3000', { encoding: 'utf8' }).trim();
        if (portCheck) {
            console.log('⚠️ Port 3000 is in use by process:', portCheck);
            console.log('🔧 Solution: Kill the process or use a different port');
            console.log('   Run: lsof -ti:3000 | xargs kill -9');
        } else {
            console.log('✅ Port 3000 is available');
        }
    } catch (error) {
        console.log('✅ Port 3000 is available');
    }

    // Check if node_modules exists
    console.log('\n5. Checking dependencies...');
    if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules exists');
    } else {
        console.log('⚠️ node_modules not found');
        console.log('🔧 Solution: Run npm install');
    }

    // Check package.json scripts
    console.log('\n6. Checking package.json scripts...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.dev) {
        console.log('✅ dev script found:', packageJson.scripts.dev);
    } else {
        console.log('❌ dev script not found in package.json');
    }

    // Try to start the server
    console.log('\n7. Attempting to start server...');
    console.log('🚀 Starting development server...');
    console.log('📍 Expected URL: http://localhost:3000');
    console.log('🛑 Press Ctrl+C to stop');
    console.log('==============================');

    // Set environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder_key';
    process.env.NODE_ENV = 'development';

    // Start the server
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.log('\n❌ Error:', error.message);

    if (error.message.includes('ENOENT')) {
        console.log('\n🔧 Solutions:');
        console.log('1. Make sure you\'re in the correct directory');
        console.log('2. Run: cd /Users/ishaankhan/Desktop/Luxe/luxe');
        console.log('3. Run: npm install');
        console.log('4. Run: npm run dev');
    } else if (error.message.includes('EADDRINUSE')) {
        console.log('\n🔧 Port 3000 is in use. Solutions:');
        console.log('1. Kill existing process: lsof -ti:3000 | xargs kill -9');
        console.log('2. Or use different port: PORT=3001 npm run dev');
    } else {
        console.log('\n🔧 General solutions:');
        console.log('1. Check if Node.js is installed: node --version');
        console.log('2. Install dependencies: npm install');
        console.log('3. Clear cache: rm -rf .next node_modules/.cache');
        console.log('4. Try again: npm run dev');
    }
}