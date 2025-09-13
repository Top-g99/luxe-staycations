const http = require('http');

console.log('🔍 Testing if localhost:3000 is accessible...');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    console.log('✅ Server is running!');
    console.log('📍 Status:', res.statusCode);
    console.log('📍 Headers:', res.headers);
    console.log('🎉 You can now open http://localhost:3000 in your browser');
    process.exit(0);
});

req.on('error', (error) => {
    console.log('❌ Server is not running or not accessible');
    console.log('📍 Error:', error.message);
    console.log('\n🔧 Solutions:');
    console.log('1. Make sure the server is started: npm run dev');
    console.log('2. Check if port 3000 is available');
    console.log('3. Try a different port: PORT=3001 npm run dev');
    process.exit(1);
});

req.on('timeout', () => {
    console.log('⏰ Request timed out - server might be starting up');
    console.log('🔄 Try again in a few seconds');
    process.exit(1);
});

req.end();