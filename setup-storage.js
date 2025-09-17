const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    try {
        console.log('Setting up Supabase storage buckets...');

        // Create property-images bucket
        const { data: bucketData, error: bucketError } = await supabase.storage
            .createBucket('property-images', {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                fileSizeLimit: 5242880 // 5MB
            });

        if (bucketError) {
            if (bucketError.message.includes('already exists')) {
                console.log('✅ property-images bucket already exists');
            } else {
                throw bucketError;
            }
        } else {
            console.log('✅ Created property-images bucket');
        }

        // Set up RLS policies for property-images bucket
        const { error: policyError } = await supabase.rpc('create_storage_policies');

        if (policyError) {
            console.log('⚠️  Could not create storage policies automatically. Please create them manually in Supabase dashboard.');
            console.log('Policy needed: Allow public read access to property-images bucket');
        } else {
            console.log('✅ Created storage policies');
        }

        console.log('🎉 Storage setup complete!');

    } catch (error) {
        console.error('❌ Error setting up storage:', error);
        process.exit(1);
    }
}

setupStorage();