const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 CLOUDFLARE FILE SIZE FIX');
console.log('===========================');

try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    execSync('rm -rf .next cache node_modules/.cache', { stdio: 'inherit' });

    // Build with clean cache
    console.log('🔨 Building with clean cache...');
    execSync('npm run build', { stdio: 'inherit' });

    // Remove large cache files
    console.log('🗑️ Removing large cache files...');
    execSync('find .next -name "*.pack" -size +10M -delete', { stdio: 'inherit' });
    execSync('find .next -name "cache" -type d -exec rm -rf {} +', { stdio: 'inherit' });

    // Git operations
    console.log('📝 Git operations...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Fix Cloudflare file size limit - remove webpack cache"', { stdio: 'inherit' });

    console.log('✅ FIX COMPLETE!');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Go to Cloudflare Pages dashboard');
    console.log('2. Click "Redeploy" on your project');
    console.log('3. The build should now work!');
    console.log('');
    console.log('🌐 Your site will be at: https://luxe-staycations.pages.dev');

} catch (error) {
    console.error('❌ Error:', error.message);
