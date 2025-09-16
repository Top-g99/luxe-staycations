#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg4NTg2MywiZXhwIjoyMDcxNDYxODYzfQ.N2HiHya_yuS3hsWt8GJsDK9P8nZ1jpaKlUxj6ST-SV8';

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}

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

const envPath = path.join(__dirname, '.env.local');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Successfully updated .env.local with Supabase credentials!');
    console.log(`📋 Project URL: ${supabaseUrl}`);
    console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    console.log(`🔑 Service Role Key: ${supabaseServiceRoleKey.substring(0, 20)}...`);
    console.log('\n🚀 Ready to set up database and storage!');
} catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
}