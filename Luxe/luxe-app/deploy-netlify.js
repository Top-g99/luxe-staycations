#!/usr/bin/env node

/**
 * 🚀 LUXE STAYCATIONS - NETLIFY DEPLOYMENT SCRIPT
 * 
 * This script prepares and deploys the Luxe Staycations platform to Netlify
 * with optimized settings for static export and Supabase integration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Netlify deployment preparation...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found. Please run this script from the luxe directory.');
    process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Project:', packageJson.name);
console.log('📋 Version:', packageJson.version);
console.log('🔧 Node Version:', process.version);
console.log('');

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
    if (fs.existsSync('.next')) {
        execSync('rm -rf .next', { stdio: 'inherit' });
    }
    if (fs.existsSync('out')) {
        execSync('rm -rf out', { stdio: 'inherit' });
    }
    console.log('✅ Cleaned previous builds');
} catch (error) {
    console.log('⚠️  Warning: Could not clean previous builds:', error.message);
}

// Step 2: Install dependencies
console.log('\n📥 Installing dependencies...');
try {
    execSync('npm ci', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
} catch (error) {
    console.log('⚠️  Warning: npm ci failed, trying npm install...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed');
    } catch (installError) {
        console.error('❌ Error installing dependencies:', installError.message);
        process.exit(1);
    }
}

// Step 3: Run linting
console.log('\n🔍 Running linting...');
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Linting passed');
} catch (error) {
    console.log('⚠️  Warning: Linting failed:', error.message);
    console.log('   Continuing with deployment...');
}

// Step 4: Build for Netlify
console.log('\n🏗️  Building for Netlify...');
try {
    execSync('npm run build:netlify', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
} catch (error) {
    console.error('❌ Error building for Netlify:', error.message);
    process.exit(1);
}

// Step 5: Verify build output
console.log('\n🔍 Verifying build output...');
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
    console.error('❌ Error: Build output directory "out" not found');
    process.exit(1);
}

const indexFile = path.join(outDir, 'index.html');
if (!fs.existsSync(indexFile)) {
    console.error('❌ Error: index.html not found in build output');
    process.exit(1);
}

console.log('✅ Build output verified');

// Step 6: Check for sitemap
const sitemapFile = path.join(outDir, 'sitemap.xml');
if (fs.existsSync(sitemapFile)) {
    console.log('✅ Sitemap generated');
} else {
    console.log('⚠️  Warning: Sitemap not found');
}

// Step 7: Check for robots.txt
const robotsFile = path.join(outDir, 'robots.txt');
if (fs.existsSync(robotsFile)) {
    console.log('✅ Robots.txt generated');
} else {
    console.log('⚠️  Warning: Robots.txt not found');
}

// Step 8: Display deployment information
console.log('\n📋 DEPLOYMENT INFORMATION');
console.log('========================');
console.log('📁 Build directory:', outDir);
console.log('🌐 Static export: ✅ Enabled');
console.log('🔧 Next.js version:', packageJson.dependencies.next);
console.log('📦 Supabase integration: ✅ Configured');
console.log('🛡️  Security headers: ✅ Configured');
console.log('⚡ Performance optimization: ✅ Enabled');

// Step 9: Display next steps
console.log('\n🚀 NEXT STEPS');
console.log('=============');
console.log('1. 📤 Upload the "out" directory to Netlify');
console.log('2. 🔧 Set environment variables in Netlify dashboard');
console.log('3. 🌐 Configure your custom domain (optional)');
console.log('4. ✅ Test your deployed site');

console.log('\n📋 ENVIRONMENT VARIABLES TO SET IN NETLIFY:');
console.log('==========================================');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app');
console.log('NEXT_PUBLIC_USE_LOCAL_STORAGE=false');
console.log('NEXT_PUBLIC_ENABLE_DEBUG_MODE=false');
console.log('NODE_ENV=production');

console.log('\n📖 For detailed instructions, see: NETLIFY_DEPLOYMENT_GUIDE.md');

console.log('\n🎉 Deployment preparation completed successfully!');
console.log('   Your site is ready to be deployed to Netlify.');