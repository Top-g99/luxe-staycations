const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CLOUDFLARE BUILD SCRIPT');
console.log('==========================');

try {
    // Clean everything
    console.log('🧹 Cleaning previous builds...');
    execSync('rm -rf .next cache node_modules/.cache', { stdio: 'inherit' });

    // Set environment variables to disable caching
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';

    // Build with no cache
    console.log('🔨 Building with no cache...');
    execSync('npm run build', { stdio: 'inherit' });

    // Aggressively remove large files
    console.log('🗑️ Removing large files...');

    // Remove webpack cache files
    execSync('find .next -name "*.pack" -delete', { stdio: 'inherit' });
    execSync('find .next -name "cache" -type d -exec rm -rf {} +', { stdio: 'inherit' });
    execSync('find .next -name "*.cache" -delete', { stdio: 'inherit' });

    // Remove any files larger than 5MB (more aggressive)
    execSync('find .next -type f -size +5M -delete', { stdio: 'inherit' });
    
    // Remove specific webpack cache files that cause issues
    execSync('find .next -name "*webpack*" -type f -delete', { stdio: 'inherit' });
    execSync('find .next -name "index.pack" -delete', { stdio: 'inherit' });

    // Check final size
    console.log('📊 Checking build size...');
    execSync('du -sh .next', { stdio: 'inherit' });

    console.log('✅ CLOUDFLARE BUILD COMPLETE!');
    console.log('📦 Build output is ready for Cloudflare Pages');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
