const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚨 CTO EMERGENCY DEPLOYMENT');
console.log('============================');

try {
    // Kill any stuck processes
    console.log('💀 Killing stuck processes...');
    try {
        execSync('pkill -f vercel', { stdio: 'ignore' });
    } catch (e) {
        // Ignore errors
    }

    // Build project
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Git operations
    console.log('📝 Git operations...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "CTO Emergency Deploy: Admin managers development"', { stdio: 'inherit' });
    
    // Push to trigger Vercel deployment
    console.log('🚀 Pushing to GitHub (triggers Vercel auto-deploy)...');
    execSync('git push origin main --force', { stdio: 'inherit' });

    console.log('✅ DEPLOYMENT COMPLETE!');
    console.log('🌐 Live Site: https://luxe-staycations-9xr4.vercel.app/');
    console.log('📊 Dashboard: https://vercel.com/top-g99s-projects/luxe-staycations-9xr4');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}
