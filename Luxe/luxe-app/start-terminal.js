const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Luxe Staycations - Terminal Configuration & Startup');
console.log('═'.repeat(60));

// Configuration
const CONFIG = {
    port: process.env.PORT || 3000,
    nodeVersion: '16.0.0',
    projectDir: process.cwd(),
    timeout: 30000
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
}

function checkNodeVersion() {
    try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        log(`Node.js version: ${version}`, 'info');

        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        if (majorVersion < 16) {
            log(`Node.js version ${version} is too old. Please install Node.js 16 or higher.`, 'error');
            return false;
        }
        return true;
    } catch (error) {
        log('Node.js not found. Please install Node.js 16 or higher.', 'error');
        return false;
    }
}

function checkNpmVersion() {
    try {
        const version = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`npm version: ${version}`, 'info');
        return true;
    } catch (error) {
        log('npm not found. Please install npm.', 'error');
        return false;
    }
}

function checkPortAvailability() {
    try {
        execSync(`lsof -ti:${CONFIG.port}`, { stdio: 'ignore' });
        log(`Port ${CONFIG.port} is in use. Killing existing processes...`, 'warning');
        execSync(`lsof -ti:${CONFIG.port} | xargs kill -9`, { stdio: 'ignore' });
        log(`Killed processes on port ${CONFIG.port}`, 'success');
    } catch (error) {
        log(`Port ${CONFIG.port} is available`, 'success');
    }
}

function clearCache() {
    const cacheDirs = ['.next', 'node_modules/.cache', '.turbo'];

    cacheDirs.forEach(dir => {
        const fullPath = path.join(CONFIG.projectDir, dir);
        if (fs.existsSync(fullPath)) {
            try {
                fs.rmSync(fullPath, { recursive: true, force: true });
                log(`Cleared cache: ${dir}`, 'success');
            } catch (error) {
                log(`Could not clear ${dir}: ${error.message}`, 'warning');
            }
        }
    });
}

function installDependencies() {
    if (!fs.existsSync('node_modules')) {
        log('Installing dependencies...', 'info');
        try {
            execSync('npm install', { stdio: 'inherit' });
            log('Dependencies installed successfully', 'success');
        } catch (error) {
            log('Failed to install dependencies', 'error');
            return false;
        }
    } else {
        log('Dependencies already installed', 'success');
    }
    return true;
}

function startDevelopmentServer() {
    log('Starting development server...', 'info');
    log(`Server will be available at: http://localhost:${CONFIG.port}`, 'info');
    log('Press Ctrl+C to stop the server', 'info');
    console.log('─'.repeat(60));

    const env = {
        ...process.env,
        NODE_ENV: 'development',
        PORT: CONFIG.port.toString(),
        NODE_OPTIONS: '--max-old-space-size=4096'
    };

    const child = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        env: env,
        shell: true
    });

    child.on('error', (error) => {
        log(`Failed to start server: ${error.message}`, 'error');
        process.exit(1);
    });

    child.on('close', (code) => {
        log(`Server stopped with code ${code}`, 'info');
        process.exit(code);
    });

    return child;
}

// Main startup function
async function main() {
    try {
        log('Starting terminal configuration...', 'info');

        // Step 1: Check Node.js and npm
        if (!checkNodeVersion() || !checkNpmVersion()) {
            process.exit(1);
        }

        // Step 2: Check if we're in the right directory
        if (!fs.existsSync('package.json')) {
            log('package.json not found. Please run this script from the luxe directory.', 'error');
            process.exit(1);
        }

        // Step 3: Check port availability
        checkPortAvailability();

        // Step 4: Clear cache
        clearCache();

        // Step 5: Install dependencies
        if (!installDependencies()) {
            process.exit(1);
        }

        // Step 6: Start development server
        const server = startDevelopmentServer();

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            log('Received SIGINT, shutting down gracefully...', 'info');
            server.kill('SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            log('Received SIGTERM, shutting down gracefully...', 'info');
            server.kill('SIGTERM');
            process.exit(0);
        });

    } catch (error) {
        log(`Startup failed: ${error.message}`, 'error');
        log('Troubleshooting steps:', 'info');
        log('1. Make sure you have Node.js 16+ installed', 'info');
        log('2. Try: npm install', 'info');
        log('3. Try: npm run dev', 'info');
        log('4. Check if port 3000 is available', 'info');
        process.exit(1);
    }
}

// Start the application
main();