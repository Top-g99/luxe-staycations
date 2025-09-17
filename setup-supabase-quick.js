#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Supabase Setup for Luxe Staycations\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('your-supabase-url') || envContent.includes('your-supabase-anon-key')) {
        console.log('⚠️  Found .env.local but it contains placeholder values.');
        console.log('Please update with your actual Supabase credentials.\n');
    } else {
        console.log('✅ .env.local already configured with Supabase credentials.\n');
    }
} else {
    console.log('📝 Creating .env.local file...');
    const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
NEXT_PUBLIC_STORAGE_BUCKET=property-images
NEXT_PUBLIC_PROPERTIES_BUCKET=property-images
NEXT_PUBLIC_DESTINATIONS_BUCKET=destination-images
NEXT_PUBLIC_BANNERS_BUCKET=banner-images

# Payment Configuration (Optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
`;

    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local with placeholder values.\n');
}

console.log('📋 Setup Steps:\n');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. Once created, go to Settings > API');
console.log('3. Copy the following values:');
console.log('   - Project URL (NEXT_PUBLIC_SUPABASE_URL)');
console.log('   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)');
console.log('   - service_role key (SUPABASE_SERVICE_ROLE_KEY)');
console.log('4. Update .env.local with these values');
console.log('5. Run the database schema setup');
console.log('6. Create storage buckets\n');

console.log('🔧 Database Schema Setup:');
console.log('After updating .env.local, run:');
console.log('node setup-database.js\n');

console.log('📦 Storage Buckets Setup:');
console.log('After database setup, run:');
console.log('node setup-storage.js\n');

console.log('🧪 Test Connection:');
console.log('Once everything is set up, visit:');
console.log('http://localhost:3000/test-supabase\n');

console.log('📚 Next Steps:');
console.log('- Update .env.local with your Supabase credentials');
console.log('- Run the database and storage setup scripts');
console.log('- Test the connection');
console.log('- Properties will automatically sync with Supabase\n');