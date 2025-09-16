#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupStorage() {
    console.log('📦 Setting up Supabase Storage Buckets...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing Supabase credentials in .env.local');
        console.log('Please update .env.local with your Supabase URL and service role key\n');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const buckets = [{
            name: 'property-images',
            public: true,
            description: 'Property images and photos'
        },
        {
            name: 'destination-images',
            public: true,
            description: 'Destination images and photos'
        },
        {
            name: 'banner-images',
            public: true,
            description: 'Banner and promotional images'
        },
        {
            name: 'luxe-media',
            public: true,
            description: 'General media files'
        }
    ];

    try {
        for (const bucket of buckets) {
            console.log(`📋 Creating bucket: ${bucket.name}...`);

            const { error } = await supabase.storage.createBucket(bucket.name, {
                public: bucket.public,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                fileSizeLimit: 5242880 // 5MB
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    console.log(`✅ Bucket "${bucket.name}" already exists`);
                } else {
                    console.log(`⚠️  Error creating bucket "${bucket.name}":`, error.message);
                }
            } else {
                console.log(`✅ Bucket "${bucket.name}" created successfully`);
            }
        }

        console.log('\n🎉 Storage buckets setup completed!');
        console.log('\n🧪 Next step: Test the connection at http://localhost:3000/test-supabase');

    } catch (error) {
        console.log('❌ Error setting up storage:', error.message);
        console.log('\n💡 Alternative: You can manually create the buckets in the Supabase Dashboard');
    }
}

setupStorage();