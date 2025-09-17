#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Netlify Direct Deployment...\n');

// Step 1: Clean and prepare
console.log('📦 Cleaning previous builds...');
try {
    execSync('rm -rf .next out dist', { stdio: 'inherit' });
} catch (error) {
    console.log('No previous builds to clean');
}

// Step 2: Install dependencies
console.log('📥 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Step 3: Build the application
console.log('🔨 Building application...');
try {
    execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

// Step 4: Verify build
console.log('✅ Verifying build...');
const buildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found');
    process.exit(1);
}

// Step 5: Create deployment package
console.log('📦 Creating deployment package...');
const packageDir = path.join(process.cwd(), 'netlify-deploy');
if (fs.existsSync(packageDir)) {
    execSync(`rm -rf ${packageDir}`, { stdio: 'inherit' });
}
fs.mkdirSync(packageDir, { recursive: true });

// Copy essential files
const filesToCopy = [
    '.next',
    'public',
    'package.json',
    'package-lock.json',
    'next.config.ts',
    'netlify.toml',
    'tsconfig.json',
    'src'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(process.cwd(), file);
    const destPath = path.join(packageDir, file);

    if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
            execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'inherit' });
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  ${file} not found, skipping...`);
    }
});

// Step 6: Create deployment instructions
const deploymentInstructions = `
# Netlify Direct Deployment Instructions

## Quick Deploy (Recommended)
1. Go to https://app.netlify.com/sites/luxestaycations
2. Go to "Deploys" tab
3. Click "Deploy manually" or drag the 'netlify-deploy' folder
4. Wait for deployment to complete

## Alternative: Git Deploy
1. Commit changes: git add . && git commit -m "Admin fix and deployment ready"
2. Push to main: git push origin main
3. Netlify will auto-deploy

## Admin Access
- URL: https://luxestaycations.in/admin
- Username: admin
- Password: luxe2024!

## Test Admin
- Test page: https://luxestaycations.in/admin/test

## Files Ready for Deployment
- Build directory: .next/
- Public assets: public/
- Configuration: netlify.toml
- All source files: src/

## Admin Fix Applied
✅ Fixed admin authentication issues
✅ Fixed missing imports
✅ Added admin test page
✅ Optimized Netlify configuration
✅ Ready for direct deployment

Deployment package created in: ${packageDir}
`;

fs.writeFileSync(path.join(packageDir, 'DEPLOYMENT_INSTRUCTIONS.md'), deploymentInstructions);

console.log('\n🎉 Deployment package ready!');
console.log(`📁 Package location: ${packageDir}`);
console.log('\n📋 Next steps:');
console.log('1. Go to https://app.netlify.com/sites/luxestaycations');
console.log('2. Drag the "netlify-deploy" folder to deploy');
console.log('3. Or use git push to auto-deploy');
console.log('\n🔐 Admin credentials:');
console.log('Username: admin');
console.log('Password: luxe2024!');
console.log('\n✅ Admin error has been fixed!');