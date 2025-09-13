const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Luxe Staycations - Simple Mode');
console.log('📁 Current directory:', process.cwd());

// Function to clear cache directories
function clearCache() {
    const cacheDirs = [
        '.next',
        'node_modules/.cache',
        '.turbo'
    ];

    cacheDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            console.log(`🧹 Clearing cache: ${dir}`);
            try {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`✅ Cleared: ${dir}`);
            } catch (error) {
                console.log(`⚠️ Could not clear ${dir}:`, error.message);
            }
        }
    });
}

// Function to kill existing processes
function killExistingProcesses() {
    console.log('🔪 Killing existing Node.js processes...');

    const platforms = {
        win32: 'taskkill /f /im node.exe',
        darwin: 'pkill -f "next\\|node"',
        linux: 'pkill -f "next\\|node"'
    };

    const command = platforms[process.platform] || 'pkill -f "next\\|node"';

    try {
        require('child_process').execSync(command, { stdio: 'ignore' });
        console.log('✅ Killed existing processes');
    } catch (error) {
        console.log('ℹ️ No existing processes to kill');
    }
}

// Main startup function
async function startServer() {
    try {
        // Step 1: Kill existing processes
        killExistingProcesses();

        // Step 2: Clear cache
        clearCache();

        // Step 3: Install dependencies if needed
        console.log('📦 Checking dependencies...');
        if (!fs.existsSync('node_modules')) {
            console.log('📦 Installing dependencies...');
            await new Promise((resolve, reject) => {
                const install = spawn('npm', ['install'], { stdio: 'inherit' });
                install.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Dependencies installed');
                        resolve();
                    } else {
                        reject(new Error(`npm install failed with code ${code}`));
                    }
                });
            });
        } else {
            console.log('✅ Dependencies already installed');
        }

        // Step 4: Start the development server
        console.log('🚀 Starting development server...');
        console.log('📍 Server will be available at: http://localhost:3000');
        console.log('🛑 Press Ctrl+C to stop the server');
        console.log('─'.repeat(50));

        const dev = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            env: {...process.env, NODE_ENV: 'development' }
        });

        dev.on('error', (error) => {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        });

        dev.on('close', (code) => {
            console.log(`\n🛑 Server stopped with code ${code}`);
            process.exit(code);
        });

    } catch (error) {
        console.error('❌ Startup failed:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Make sure you have Node.js installed (version 16 or higher)');
        console.log('2. Try running: npm install');
        console.log('3. Try running: npm run dev');
        console.log('4. Check if port 3000 is already in use');
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();