console.log('Testing basic Node.js setup...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Test if we can read package.json
const fs = require('fs');
const path = require('path');

try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ Package.json loaded successfully');
    console.log('Project name:', packageJson.name);
    console.log('Next.js version:', packageJson.dependencies.next);
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
}