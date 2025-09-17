const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SIMPLE DEPLOYMENT SCRIPT');
console.log('===========================');

try {
    // Build the project
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Create a simple git commit
    console.log('📝 Creating git commit...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Update admin layout to match design"', { stdio: 'inherit' });

    console.log('✅ BUILD COMPLETE!');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Go to Vercel Dashboard: https://vercel.com/top-g99s-projects/luxe-staycations-9xr4');
    console.log('2. Click "Deployments" tab');
    console.log('3. Click "Redeploy" on the latest deployment');
    console.log('4. Or push to GitHub: git push origin main');
    console.log('');
    console.log('🌐 Your site will be updated at: https://luxe-staycations-9xr4.vercel.app/');

} catch (error) {
    console.error('❌ Error:', error.message);
}
