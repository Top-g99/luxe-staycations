#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🚀 SENIOR DEV ENGINEER - Luxe Staycations Production Startup');
console.log('============================================================');

class ProductionStartup {
    constructor() {
        this.port = 3000;
        this.server = null;
        this.processes = [];
    }

    // Check system requirements
    checkSystemRequirements() {
        console.log('🔍 Checking system requirements...');

        try {
            // Check Node.js version
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            console.log(`✅ Node.js: ${nodeVersion}`);

            // Check npm version
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            console.log(`✅ npm: ${npmVersion}`);

            // Check if we're in the right directory
            if (!fs.existsSync('package.json')) {
                throw new Error('package.json not found. Make sure you\'re in the luxe directory.');
            }
            console.log('✅ Project structure verified');

            return true;
        } catch (error) {
            console.log(`❌ System check failed: ${error.message}`);
            return false;
        }
    }

    // Kill any existing processes on port 3000
    killExistingProcesses() {
        console.log('🔪 Checking for existing processes...');

        try {
            const portCheck = execSync(`lsof -ti:${this.port}`, { encoding: 'utf8' }).trim();
            if (portCheck) {
                console.log(`⚠️ Port ${this.port} is in use by process: ${portCheck}`);
                execSync(`kill -9 ${portCheck}`);
                console.log('✅ Killed existing process');
            } else {
                console.log(`✅ Port ${this.port} is available`);
            }
        } catch (error) {
            console.log(`✅ Port ${this.port} is available`);
        }
    }

    // Clear cache and build artifacts
    clearCache() {
        console.log('🧹 Clearing cache and build artifacts...');

        const cacheDirs = ['.next', 'node_modules/.cache', 'out'];
        cacheDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                try {
                    fs.rmSync(dir, { recursive: true, force: true });
                    console.log(`✅ Cleared: ${dir}`);
                } catch (error) {
                    console.log(`⚠️ Could not clear ${dir}: ${error.message}`);
                }
            }
        });
    }

    // Install dependencies
    async installDependencies() {
        console.log('📦 Installing dependencies...');

        return new Promise((resolve, reject) => {
            if (!fs.existsSync('node_modules')) {
                const install = spawn('npm', ['install'], {
                    stdio: 'inherit',
                    env: {...process.env, NODE_ENV: 'development' }
                });

                install.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Dependencies installed successfully');
                        resolve();
                    } else {
                        reject(new Error(`npm install failed with code ${code}`));
                    }
                });

                install.on('error', (error) => {
                    reject(error);
                });
            } else {
                console.log('✅ Dependencies already installed');
                resolve();
            }
        });
    }

    // Set environment variables
    setEnvironmentVariables() {
        console.log('⚙️ Setting environment variables...');

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder_key_for_development';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder_service_role_key';
        process.env.NODE_ENV = 'development';
        process.env.NEXT_PUBLIC_APP_URL = `http://localhost:${this.port}`;
        process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE = 'true';

        console.log('✅ Environment variables set');
    }

    // Start the development server
    startDevelopmentServer() {
        console.log('🚀 Starting development server...');
        console.log(`📍 Your application will be available at: http://localhost:${this.port}`);
        console.log('🛑 Press Ctrl+C to stop the server');
        console.log('============================================================');

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

        // Store process reference
        this.processes.push(dev);
    }

    // Health check
    async healthCheck() {
        console.log('🏥 Performing health check...');

        return new Promise((resolve) => {
            setTimeout(() => {
                const req = http.request({
                    hostname: 'localhost',
                    port: this.port,
                    path: '/',
                    method: 'GET',
                    timeout: 5000
                }, (res) => {
                    console.log('✅ Health check passed - Server is running!');
                    console.log(`📍 Status: ${res.statusCode}`);
                    console.log('🎉 You can now open http://localhost:3000 in your browser');
                    resolve();
                });

                req.on('error', () => {
                    console.log('⚠️ Health check failed - Server might still be starting');
                    resolve();
                });

                req.on('timeout', () => {
                    console.log('⏰ Health check timed out - Server might still be starting');
                    resolve();
                });

                req.end();
            }, 3000); // Wait 3 seconds for server to start
        });
    }

    // Main startup sequence
    async start() {
        try {
            console.log('🚀 Starting production startup sequence...\n');

            // Step 1: Check system requirements
            if (!this.checkSystemRequirements()) {
                throw new Error('System requirements not met');
            }

            // Step 2: Kill existing processes
            this.killExistingProcesses();

            // Step 3: Clear cache
            this.clearCache();

            // Step 4: Install dependencies
            await this.installDependencies();

            // Step 5: Set environment variables
            this.setEnvironmentVariables();

            // Step 6: Start development server
            this.startDevelopmentServer();

            // Step 7: Perform health check
            await this.healthCheck();

        } catch (error) {
            console.error('\n❌ Production startup failed:', error.message);
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Make sure you\'re in the luxe directory');
            console.log('2. Check if Node.js is installed: node --version');
            console.log('3. Try clearing cache: rm -rf node_modules .next');
            console.log('4. Reinstall dependencies: npm install');
            process.exit(1);
        }
    }

    // Cleanup on exit
    cleanup() {
        console.log('\n🧹 Cleaning up processes...');
        this.processes.forEach(process => {
            try {
                process.kill();
            } catch (error) {
                // Ignore cleanup errors
            }
        });
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

// Start the production startup
const startup = new ProductionStartup();
startup.start();

// Cleanup on exit
process.on('exit', () => {
    startup.cleanup();
});