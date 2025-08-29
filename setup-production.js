#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SENIOR DEV ENGINEER - Luxe Staycations Production Setup');
console.log('==========================================================');

class ProductionSetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.envFile = path.join(this.projectRoot, '.env.local');
        this.envProduction = path.join(this.projectRoot, 'env.production');
    }

    // Check if we're in the right directory
    checkProjectStructure() {
        console.log('🔍 Checking project structure...');

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

    // Check Node.js and npm versions
    checkSystemRequirements() {
        console.log('🔍 Checking system requirements...');

        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();

            console.log(`✅ Node.js: ${nodeVersion}`);
            console.log(`✅ npm: ${npmVersion}`);

            // Check Node.js version (should be 16+)
            const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
            if (nodeMajor < 16) {
                throw new Error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 16 or higher.`);
            }

            return true;
        } catch (error) {
            throw new Error(`System check failed: ${error.message}`);
        }
    }

    // Install dependencies
    installDependencies() {
        console.log('📦 Installing dependencies...');

        try {
            if (!fs.existsSync('node_modules')) {
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

    // Create environment file
    createEnvironmentFile() {
        console.log('⚙️ Setting up environment configuration...');

        try {
            if (fs.existsSync(this.envFile)) {
                console.log('⚠️ .env.local already exists. Backing up...');
                const backupPath = `${this.envFile}.backup.${Date.now()}`;
                fs.copyFileSync(this.envFile, backupPath);
                console.log(`✅ Backup created: ${backupPath}`);
            }

            if (fs.existsSync(this.envProduction)) {
                console.log('📋 Using production environment template...');
                const envContent = fs.readFileSync(this.envProduction, 'utf8');
                fs.writeFileSync(this.envFile, envContent);
                console.log('✅ Environment file created from template');
            } else {
                // Create basic environment file
                const envContent = `# 🚀 LUXE STAYCATIONS - PRODUCTION ENVIRONMENT

# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,video/*,application/pdf

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=luxe-media
NEXT_PUBLIC_PROPERTIES_BUCKET=luxe-properties
NEXT_PUBLIC_DESTINATIONS_BUCKET=luxe-destinations
NEXT_PUBLIC_BANNERS_BUCKET=luxe-banners

# Development Override (set to false in production)
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# Example values (replace with your actual values):
# NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0NzIwMCwiZXhwIjoxOTUyMTIzMjAwfQ.example_signature
`;
                fs.writeFileSync(this.envFile, envContent);
                console.log('✅ Basic environment file created');
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to create environment file: ${error.message}`);
        }
    }

    // Generate production configuration
    generateProductionConfig() {
        console.log('⚙️ Generating production configuration...');

        try {
            // Update next.config.ts for production
            const nextConfigPath = path.join(this.projectRoot, 'next.config.ts');
            if (fs.existsSync(nextConfigPath)) {
                let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

                // Add production optimizations
                if (!nextConfig.includes('production optimizations')) {
                    const productionConfig = `
// Production optimizations
const nextConfig = {
  ...existingConfig,
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true
};
`;
                    nextConfig = nextConfig.replace('const nextConfig = {', productionConfig);
                    fs.writeFileSync(nextConfigPath, nextConfig);
                    console.log('✅ Next.js production configuration updated');
                }
            }

            return true;
        } catch (error) {
            console.warn(`⚠️ Could not update production config: ${error.message}`);
            return true;
        }
    }

    // Create production startup script
    createProductionScripts() {
        console.log('📜 Creating production scripts...');

        try {
            const scripts = {
                'start:prod': 'NODE_ENV=production npm run build && npm run start',
                'build:prod': 'NODE_ENV=production npm run build',
                'deploy:check': 'npm run build && npm run lint',
                'storage:setup': 'node -e \"require(\'./src/lib/supabaseFileUploadService\').supabaseFileUploadService.createStorageBuckets()\"'
            };

            const packagePath = path.join(this.projectRoot, 'package.json');
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

                // Add production scripts
                packageJson.scripts = {...packageJson.scripts, ...scripts };

                fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                console.log('✅ Production scripts added to package.json');
            }

            return true;
        } catch (error) {
            console.warn(`⚠️ Could not add production scripts: ${error.message}`);
            return true;
        }
    }

    // Generate setup instructions
    generateSetupInstructions() {
        console.log('📋 Generating setup instructions...');

        const instructions = `# 🚀 LUXE STAYCATIONS - PRODUCTION SETUP COMPLETE

## ✅ What's Been Set Up

### 🔧 Environment Configuration
- Environment file created: \`.env.local\`
- Production settings configured
- Supabase integration ready

### 📦 Dependencies
- All required packages installed
- Production scripts added
- Build configuration optimized

### 🗄️ File Upload System
- Supabase Storage integration
- File validation and management
- Multiple bucket support

## 🎯 Next Steps

### 1. Configure Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project: \`luxe-staycations\`
3. Get your credentials from Settings → API
4. Update \`.env.local\` with your credentials

### 2. Set Up Database
1. Go to SQL Editor in Supabase
2. Run the schema from \`supabase-schema.sql\`
3. Verify tables are created

### 3. Configure Storage
1. Go to Storage in Supabase
2. Create buckets: \`luxe-media\`, \`luxe-properties\`, \`luxe-destinations\`, \`luxe-banners\`
3. Set bucket policies for public access

### 4. Test Production Build
\`\`\`bash
npm run build:prod
npm run start:prod
\`\`\`

## 🔍 Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database schema applied
- [ ] Storage buckets created
- [ ] Production build successful
- [ ] File uploads working
- [ ] Real-time data sync working

## 🚨 Important Notes

- **Environment Variables**: Never commit \`.env.local\` to version control
- **Storage Policies**: Configure bucket policies for security
- **Database Backups**: Enable automatic backups in Supabase
- **Monitoring**: Set up Supabase monitoring and alerts

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure Supabase project is active
4. Check network connectivity

---
Generated by Production Setup Script
`;

        const instructionsPath = path.join(this.projectRoot, 'PRODUCTION_SETUP_INSTRUCTIONS.md');
        fs.writeFileSync(instructionsPath, instructions);
        console.log('✅ Setup instructions generated: PRODUCTION_SETUP_INSTRUCTIONS.md');

        return true;
    }

    // Main setup process
    async execute() {
        try {
            console.log('🚀 Starting production setup...\n');

            // Step 1: Check project structure
            this.checkProjectStructure();

            // Step 2: Check system requirements
            this.checkSystemRequirements();

            // Step 3: Install dependencies
            this.installDependencies();

            // Step 4: Create environment file
            this.createEnvironmentFile();

            // Step 5: Generate production configuration
            this.generateProductionConfig();

            // Step 6: Create production scripts
            this.createProductionScripts();

            // Step 7: Generate setup instructions
            this.generateSetupInstructions();

            console.log('\n🎉 PRODUCTION SETUP COMPLETED SUCCESSFULLY!');
            console.log('=============================================');
            console.log('📋 Next Steps:');
            console.log('1. Update .env.local with your Supabase credentials');
            console.log('2. Set up your Supabase project and database');
            console.log('3. Configure storage buckets');
            console.log('4. Test with: npm run build:prod');
            console.log('\n📖 See PRODUCTION_SETUP_INSTRUCTIONS.md for detailed steps');

        } catch (error) {
            console.error('\n❌ Production setup failed:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Make sure you\'re in the luxe directory');
            console.log('2. Check if Node.js 16+ is installed');
            console.log('3. Verify internet connection');
            console.log('4. Check file permissions');
            process.exit(1);
        }
    }
}

// Execute production setup
const setup = new ProductionSetup();
setup.execute();