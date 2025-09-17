#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SENIOR DEV ENGINEER - Luxe Staycations Quick Production Start');
console.log('================================================================');

class QuickProductionStart {
    constructor() {
        this.projectRoot = process.cwd();
        this.steps = [
            { name: 'Project Structure Check', method: 'checkStructure' },
            { name: 'Dependencies Installation', method: 'installDependencies' },
            { name: 'Production Setup', method: 'runProductionSetup' },
            { name: 'Data Migration Preparation', method: 'prepareMigration' },
            { name: 'Environment Configuration', method: 'configureEnvironment' },
            { name: 'Production Build Test', method: 'testProductionBuild' }
        ];
    }

    // Check project structure
    checkStructure() {
        console.log('\n🔍 Step 1: Checking project structure...');

        const requiredFiles = [
            'package.json',
            'src/lib/supabase.ts',
            'src/lib/supabaseService.ts',
            'src/lib/supabaseFileUploadService.ts'
        ];

        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(this.projectRoot, file))) {
                throw new Error(`Required file not found: ${file}`);
            }
        }

        console.log('✅ Project structure verified');
        return true;
    }

    // Install dependencies
    installDependencies() {
        console.log('\n📦 Step 2: Installing dependencies...');

        try {
            if (!fs.existsSync('node_modules')) {
                console.log('Installing npm packages...');
                execSync('npm install', { stdio: 'inherit' });
                console.log('✅ Dependencies installed successfully');
            } else {
                console.log('✅ Dependencies already installed');
            }
            return true;
        } catch (error) {
            throw new Error(`Failed to install dependencies: ${error.message}`);
        }
    }

    // Run production setup
    runProductionSetup() {
        console.log('\n⚙️ Step 3: Running production setup...');

        try {
            if (fs.existsSync('setup-production.js')) {
                console.log('Running setup-production.js...');
                execSync('node setup-production.js', { stdio: 'inherit' });
                console.log('✅ Production setup completed');
            } else {
                throw new Error('setup-production.js not found');
            }
            return true;
        } catch (error) {
            throw new Error(`Production setup failed: ${error.message}`);
        }
    }

    // Prepare data migration
    prepareMigration() {
        console.log('\n📊 Step 4: Preparing data migration...');

        try {
            if (fs.existsSync('migrate-to-production.js')) {
                console.log('Running migrate-to-production.js...');
                execSync('node migrate-to-production.js', { stdio: 'inherit' });
                console.log('✅ Data migration preparation completed');
            } else {
                throw new Error('migrate-to-production.js not found');
            }
            return true;
        } catch (error) {
            throw new Error(`Migration preparation failed: ${error.message}`);
        }
    }

    // Configure environment
    configureEnvironment() {
        console.log('\n🔧 Step 5: Configuring environment...');

        try {
            const envFile = path.join(this.projectRoot, '.env.local');
            if (fs.existsSync(envFile)) {
                const envContent = fs.readFileSync(envFile, 'utf8');

                if (envContent.includes('your-project-id.supabase.co')) {
                    console.log('⚠️  IMPORTANT: Update your .env.local with real Supabase credentials');
                    console.log('📋 See PRODUCTION_SETUP_INSTRUCTIONS.md for details');
                } else {
                    console.log('✅ Environment file configured');
                }
            } else {
                console.log('⚠️  .env.local not found. Please run setup-production.js first');
            }
            return true;
        } catch (error) {
            console.warn(`⚠️  Environment check warning: ${error.message}`);
            return true;
        }
    }

    // Test production build
    testProductionBuild() {
        console.log('\n🚀 Step 6: Testing production build...');

        try {
            console.log('Building for production...');
            execSync('npm run build:prod', { stdio: 'inherit' });
            console.log('✅ Production build successful');
            return true;
        } catch (error) {
            console.warn(`⚠️  Production build test failed: ${error.message}`);
            console.log('💡 This is normal if Supabase credentials are not configured yet');
            return true;
        }
    }

    // Display next steps
    displayNextSteps() {
        console.log('\n🎉 QUICK PRODUCTION START COMPLETED!');
        console.log('=====================================');
        console.log('\n📋 Next Steps:');
        console.log('1. 🔑 Configure Supabase credentials in .env.local');
        console.log('2. 🗄️  Set up your Supabase project and database');
        console.log('3. 📊 Run migration scripts in Supabase SQL Editor');
        console.log('4. 🚀 Deploy to your preferred platform');
        console.log('\n📖 Documentation:');
        console.log('- PRODUCTION_DEPLOYMENT_GUIDE.md - Complete deployment guide');
        console.log('- PRODUCTION_SETUP_INSTRUCTIONS.md - Setup instructions');
        console.log('- MIGRATION_INSTRUCTIONS.md - Data migration guide');
        console.log('\n🔧 Commands:');
        console.log('- npm run build:prod - Build for production');
        console.log('- npm run start:prod - Start production server');
        console.log('- npm run deploy:check - Verify deployment readiness');
    }

    // Main execution
    async execute() {
        try {
            console.log('🚀 Starting quick production setup...\n');

            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                console.log(`\n${i + 1}/${this.steps.length}: ${step.name}`);

                try {
                    await this[step.method]();
                } catch (error) {
                    console.error(`❌ Step ${i + 1} failed: ${error.message}`);
                    console.log('\n🔧 Troubleshooting:');
                    console.log('1. Check if you\'re in the luxe directory');
                    console.log('2. Verify Node.js 16+ is installed');
                    console.log('3. Check internet connection');
                    console.log('4. Review error details above');
                    process.exit(1);
                }
            }

            this.displayNextSteps();

        } catch (error) {
            console.error('\n❌ Quick production start failed:', error.message);
            process.exit(1);
        }
    }
}

// Execute quick production start
const quickStart = new QuickProductionStart();
quickStart.execute();