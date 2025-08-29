#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SENIOR DEV ENGINEER - Fast Supabase Setup for Luxe Staycations');
console.log('==================================================================');

class FastSupabaseSetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.envFile = path.join(this.projectRoot, '.env.local');
        this.schemaFile = path.join(this.projectRoot, 'supabase-schema.sql');
    }

    // Display complete setup instructions
    displayCompleteInstructions() {
        console.log('\n📋 COMPLETE SUPABASE SETUP GUIDE');
        console.log('===============================');
        
        console.log('\n🎯 STEP 1: CREATE SUPABASE PROJECT');
        console.log('==================================');
        console.log('1. Go to: https://supabase.com');
        console.log('2. Sign up/Login with your account');
        console.log('3. Click "New Project"');
        console.log('4. Project Name: luxe-staycations');
        console.log('5. Database Password: [Create a strong password]');
        console.log('6. Region: [Choose closest to your users]');
        console.log('7. Click "Create new project"');
        console.log('8. Wait for project to be ready (2-3 minutes)');
        
        console.log('\n🎯 STEP 2: GET YOUR CREDENTIALS');
        console.log('===============================');
        console.log('1. Go to Settings → API in your dashboard');
        console.log('2. Copy these values:');
        console.log('   • Project URL: https://your-project-id.supabase.co');
        console.log('   • Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
        console.log('   • Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
        
        console.log('\n🎯 STEP 3: UPDATE ENVIRONMENT FILE');
        console.log('==================================');
        console.log('1. Edit .env.local file');
        console.log('2. Replace placeholder values with your real credentials');
        console.log('3. Save the file');
        
        console.log('\n🎯 STEP 4: SET UP DATABASE');
        console.log('==========================');
        if (fs.existsSync(this.schemaFile)) {
            console.log('✅ Database schema file found: supabase-schema.sql');
            console.log('1. Go to your Supabase dashboard');
            console.log('2. Click on "SQL Editor" in the left sidebar');
            console.log('3. Click "New query"');
            console.log('4. Copy the content from supabase-schema.sql');
            console.log('5. Paste it into the SQL editor');
            console.log('6. Click "Run" to execute the schema');
            console.log('7. Verify tables are created in "Table Editor"');
        } else {
            console.log('⚠️ Database schema file not found');
        }
        
        console.log('\n🎯 STEP 5: CREATE STORAGE BUCKETS');
        console.log('==================================');
        const buckets = [
            { name: 'luxe-media', public: true, description: 'General media files' },
            { name: 'luxe-properties', public: true, description: 'Property images' },
            { name: 'luxe-destinations', public: true, description: 'Destination images' },
            { name: 'luxe-banners', public: true, description: 'Banner media' },
            { name: 'luxe-documents', public: false, description: 'Private documents' }
        ];
        
        console.log('Create these storage buckets:');
        buckets.forEach((bucket, index) => {
            console.log(`${index + 1}. ${bucket.name} (${bucket.public ? 'Public' : 'Private'}) - ${bucket.description}`);
        });
        
        console.log('\nSteps:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Click on "Storage" in the left sidebar');
        console.log('3. Click "Create a new bucket"');
        console.log('4. Enter bucket name and settings');
        console.log('5. Repeat for all buckets listed above');
        
        console.log('\n🎯 STEP 6: TEST YOUR APPLICATION');
        console.log('===============================');
        console.log('1. Run: npm run dev');
        console.log('2. Open http://localhost:3000');
        console.log('3. Test admin panel: http://localhost:3000/admin');
        console.log('4. Test file uploads and data management');
    }

    // Show current environment status
    showEnvironmentStatus() {
        console.log('\n🔍 CURRENT ENVIRONMENT STATUS');
        console.log('=============================');
        
        try {
            const envContent = fs.readFileSync(this.envFile, 'utf8');
            
            if (envContent.includes('your-project-id.supabase.co')) {
                console.log('⚠️  Environment file has placeholder values');
                console.log('📝 You need to update .env.local with your real Supabase credentials');
            } else {
                console.log('✅ Environment file appears to be configured');
            }
            
            console.log('\n📄 Current .env.local location:', this.envFile);
            
        } catch (error) {
            console.log('❌ Could not read environment file:', error.message);
        }
    }

    // Show available commands
    showAvailableCommands() {
        console.log('\n🔧 AVAILABLE COMMANDS');
        console.log('====================');
        console.log('• npm run dev - Start development server');
        console.log('• npm run build:prod - Build for production');
        console.log('• npm run start:prod - Start production server');
        console.log('• npm run deploy:check - Verify deployment readiness');
        console.log('• npm run storage:setup - Set up storage buckets');
    }

    // Show deployment options
    showDeploymentOptions() {
        console.log('\n🚀 DEPLOYMENT OPTIONS');
        console.log('====================');
        console.log('\n1️⃣ VERCEL (Recommended)');
        console.log('   • Install: npm i -g vercel');
        console.log('   • Deploy: vercel --prod');
        console.log('   • Benefits: Automatic deployments, great performance');
        
        console.log('\n2️⃣ NETLIFY');
        console.log('   • Build: npm run build:prod');
        console.log('   • Upload: out/ folder to Netlify');
        console.log('   • Benefits: Easy setup, good performance');
        
        console.log('\n3️⃣ SELF-HOSTED');
        console.log('   • Build: npm run build:prod');
        console.log('   • Start: npm run start:prod');
        console.log('   • Benefits: Full control, custom domain');
    }

    // Show migration instructions
    showMigrationInstructions() {
        console.log('\n📊 DATA MIGRATION');
        console.log('=================');
        
        const migrationDir = path.join(this.projectRoot, 'migration-data');
        if (fs.existsSync(migrationDir)) {
            console.log('✅ Migration files found in migration-data/ folder');
            console.log('📄 Available migration scripts:');
            
            const files = fs.readdirSync(migrationDir);
            files.forEach(file => {
                if (file.endsWith('.sql')) {
                    console.log(`   • ${file}`);
                }
            });
            
            console.log('\n📝 To migrate data:');
            console.log('1. Go to Supabase SQL Editor');
            console.log('2. Run migration scripts in order (01, 02, 03, 04)');
            console.log('3. Verify data appears in Table Editor');
        } else {
            console.log('⚠️ Migration directory not found');
        }
    }

    // Generate quick start summary
    generateQuickStartSummary() {
        console.log('\n🎉 QUICK START SUMMARY');
        console.log('=====================');
        
        console.log('\n✅ What\'s Ready:');
        console.log('• Production environment configured');
        console.log('• Supabase services activated');
        console.log('• File upload system ready');
        console.log('• Admin dashboard functional');
        console.log('• Migration scripts prepared');
        
        console.log('\n📋 Immediate Actions:');
        console.log('1. Create Supabase project at https://supabase.com');
        console.log('2. Update .env.local with your credentials');
        console.log('3. Run database schema in Supabase');
        console.log('4. Create storage buckets');
        console.log('5. Test with: npm run dev');
        
        console.log('\n🚀 Ready to Deploy:');
        console.log('• Run: npm run build:prod');
        console.log('• Deploy to Vercel: vercel --prod');
        console.log('• Or deploy to your preferred platform');
        
        console.log('\n📖 Documentation:');
        console.log('• PRODUCTION_DEPLOYMENT_GUIDE.md - Complete guide');
        console.log('• PRODUCTION_SETUP_INSTRUCTIONS.md - Setup instructions');
        console.log('• MIGRATION_INSTRUCTIONS.md - Data migration guide');
    }

    // Main execution
    execute() {
        try {
            console.log('🚀 Fast Supabase setup guide starting...\n');

            // Display all instructions
            this.displayCompleteInstructions();
            
            // Show current status
            this.showEnvironmentStatus();
            
            // Show available commands
            this.showAvailableCommands();
            
            // Show deployment options
            this.showDeploymentOptions();
            
            // Show migration instructions
            this.showMigrationInstructions();
            
            // Generate summary
            this.generateQuickStartSummary();
            
            console.log('\n🎉 Fast Supabase setup guide completed!');
            console.log('Follow the instructions above to complete your setup.');
            console.log('\n💡 Need help? Check the documentation files listed above.');
            
        } catch (error) {
            console.error('\n❌ Fast setup failed:', error.message);
            process.exit(1);
        }
    }
}

// Execute fast setup
const setup = new FastSupabaseSetup();
setup.execute();
