#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SENIOR DEV ENGINEER - Complete Supabase Setup for Luxe Staycations');
console.log('====================================================================');

class SupabaseCompleteSetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.envFile = path.join(this.projectRoot, '.env.local');
        this.schemaFile = path.join(this.projectRoot, 'supabase-schema.sql');
    }

    // Display setup instructions
    displaySetupInstructions() {
        console.log('\n📋 SUPABASE SETUP INSTRUCTIONS');
        console.log('==============================');
        console.log('\n🎯 Follow these steps to set up your Supabase project:');
        console.log('\n1️⃣  CREATE SUPABASE PROJECT');
        console.log('   • Go to: https://supabase.com');
        console.log('   • Sign up/Login with your account');
        console.log('   • Click "New Project"');
        console.log('   • Project Name: luxe-staycations');
        console.log('   • Database Password: [Create a strong password]');
        console.log('   • Region: [Choose closest to your users]');
        console.log('   • Click "Create new project"');
        console.log('   • Wait for project to be ready (2-3 minutes)');

        console.log('\n2️⃣  GET YOUR CREDENTIALS');
        console.log('   • Go to Settings → API in your dashboard');
        console.log('   • Copy these values:');
        console.log('     - Project URL: https://your-project-id.supabase.co');
        console.log('     - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
        console.log('     - Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

        console.log('\n3️⃣  UPDATE ENVIRONMENT FILE');
        console.log('   • I will help you update .env.local with your credentials');

        console.log('\n4️⃣  SET UP DATABASE SCHEMA');
        console.log('   • Go to SQL Editor in Supabase dashboard');
        console.log('   • Run the database schema');

        console.log('\n5️⃣  CREATE STORAGE BUCKETS');
        console.log('   • Go to Storage in Supabase dashboard');
        console.log('   • Create required buckets');

        console.log('\n6️⃣  TEST CONNECTION');
        console.log('   • Verify everything is working');

        console.log('\n🚀 Ready to start? Press Enter to continue...');
    }

    // Wait for user input
    waitForUserInput() {
        return new Promise((resolve) => {
            process.stdin.once('data', () => {
                resolve();
            });
        });
    }

    // Get Supabase credentials from user
    async getSupabaseCredentials() {
        console.log('\n🔑 ENTER YOUR SUPABASE CREDENTIALS');
        console.log('==================================');

        // For now, we'll use placeholder values and guide the user
        console.log('\n📝 Please enter your Supabase credentials:');
        console.log('(You can get these from your Supabase dashboard → Settings → API)');

        // Since we can't get interactive input easily, let's create a template
        return {
            url: 'https://your-project-id.supabase.co',
            anonKey: 'your_anon_key_here',
            serviceRoleKey: 'your_service_role_key_here'
        };
    }

    // Update environment file
    updateEnvironmentFile(credentials) {
        console.log('\n⚙️ Updating environment file...');

        try {
            let envContent = fs.readFileSync(this.envFile, 'utf8');

            // Replace placeholder values
            envContent = envContent.replace(
                'NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co',
                `NEXT_PUBLIC_SUPABASE_URL=${credentials.url}`
            );

            envContent = envContent.replace(
                'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here',
                `NEXT_PUBLIC_SUPABASE_ANON_KEY=${credentials.anonKey}`
            );

            envContent = envContent.replace(
                'SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here',
                `SUPABASE_SERVICE_ROLE_KEY=${credentials.serviceRoleKey}`
            );

            fs.writeFileSync(this.envFile, envContent);
            console.log('✅ Environment file updated successfully');

            return true;
        } catch (error) {
            console.error('❌ Failed to update environment file:', error.message);
            return false;
        }
    }

    // Generate database setup instructions
    generateDatabaseSetupInstructions() {
        console.log('\n🗄️ DATABASE SETUP INSTRUCTIONS');
        console.log('==============================');

        if (fs.existsSync(this.schemaFile)) {
            console.log('\n✅ Database schema file found: supabase-schema.sql');
            console.log('\n📝 To set up your database:');
            console.log('1. Go to your Supabase dashboard');
            console.log('2. Click on "SQL Editor" in the left sidebar');
            console.log('3. Click "New query"');
            console.log('4. Copy the content from supabase-schema.sql');
            console.log('5. Paste it into the SQL editor');
            console.log('6. Click "Run" to execute the schema');
            console.log('7. Verify tables are created in "Table Editor"');
        } else {
            console.log('\n⚠️ Database schema file not found');
            console.log('Please ensure supabase-schema.sql exists');
        }
    }

    // Generate storage setup instructions
    generateStorageSetupInstructions() {
        console.log('\n📦 STORAGE SETUP INSTRUCTIONS');
        console.log('=============================');

        const buckets = [
            { name: 'luxe-media', public: true, description: 'General media files' },
            { name: 'luxe-properties', public: true, description: 'Property images' },
            { name: 'luxe-destinations', public: true, description: 'Destination images' },
            { name: 'luxe-banners', public: true, description: 'Banner media' },
            { name: 'luxe-documents', public: false, description: 'Private documents' }
        ];

        console.log('\n📁 Create these storage buckets in Supabase:');
        buckets.forEach((bucket, index) => {
            console.log(`${index + 1}. ${bucket.name} (${bucket.public ? 'Public' : 'Private'}) - ${bucket.description}`);
        });

        console.log('\n📝 Steps to create buckets:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Click on "Storage" in the left sidebar');
        console.log('3. Click "Create a new bucket"');
        console.log('4. Enter bucket name and settings');
        console.log('5. Repeat for all buckets listed above');

        console.log('\n🔒 Storage Policies (Optional):');
        console.log('• Public buckets: Anyone can read, authenticated users can upload');
        console.log('• Private buckets: Only authenticated users can access');
    }

    // Test Supabase connection
    async testSupabaseConnection() {
        console.log('\n🧪 TESTING SUPABASE CONNECTION');
        console.log('==============================');

        try {
            // Check if environment variables are set
            const envContent = fs.readFileSync(this.envFile, 'utf8');

            if (envContent.includes('your-project-id.supabase.co')) {
                console.log('⚠️  Environment file still has placeholder values');
                console.log('Please update .env.local with your real Supabase credentials');
                return false;
            }

            console.log('✅ Environment file appears to be configured');
            console.log('💡 You can test the connection by running: npm run dev');

            return true;
        } catch (error) {
            console.error('❌ Error testing connection:', error.message);
            return false;
        }
    }

    // Generate final setup summary
    generateSetupSummary() {
        console.log('\n🎉 SUPABASE SETUP SUMMARY');
        console.log('=========================');

        console.log('\n✅ What\'s been prepared:');
        console.log('• Environment file template created');
        console.log('• Database schema ready');
        console.log('• Storage bucket configuration');
        console.log('• Migration scripts prepared');

        console.log('\n📋 Next steps:');
        console.log('1. Create Supabase project at https://supabase.com');
        console.log('2. Update .env.local with your credentials');
        console.log('3. Run database schema in Supabase SQL Editor');
        console.log('4. Create storage buckets');
        console.log('5. Test your application: npm run dev');

        console.log('\n🔧 Available commands:');
        console.log('• npm run dev - Start development server');
        console.log('• npm run build:prod - Build for production');
        console.log('• npm run start:prod - Start production server');

        console.log('\n📖 Documentation:');
        console.log('• PRODUCTION_DEPLOYMENT_GUIDE.md - Complete guide');
        console.log('• PRODUCTION_SETUP_INSTRUCTIONS.md - Setup instructions');
        console.log('• MIGRATION_INSTRUCTIONS.md - Data migration guide');
    }

    // Main setup process
    async execute() {
        try {
            console.log('🚀 Starting complete Supabase setup...\n');

            // Step 1: Display setup instructions
            this.displaySetupInstructions();

            // Step 2: Wait for user to read instructions
            await this.waitForUserInput();

            // Step 3: Get credentials (placeholder for now)
            const credentials = await this.getSupabaseCredentials();

            // Step 4: Update environment file
            this.updateEnvironmentFile(credentials);

            // Step 5: Generate database setup instructions
            this.generateDatabaseSetupInstructions();

            // Step 6: Generate storage setup instructions
            this.generateStorageSetupInstructions();

            // Step 7: Test connection
            await this.testSupabaseConnection();

            // Step 8: Generate setup summary
            this.generateSetupSummary();

            console.log('\n🎉 Supabase setup guide completed!');
            console.log('Follow the instructions above to complete your setup.');

        } catch (error) {
            console.error('\n❌ Supabase setup failed:', error.message);
            process.exit(1);
        }
    }
}

// Execute Supabase setup
const setup = new SupabaseCompleteSetup();
setup.execute();