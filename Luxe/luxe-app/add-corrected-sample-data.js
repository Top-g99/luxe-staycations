const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCorrectedSampleData() {
    console.log('🚀 Adding corrected sample data to Supabase...');

    try {
        // Add sample properties (matching the actual schema)
        console.log('📊 Adding properties...');
        const { data: properties, error: propertiesError } = await supabase
            .from('properties')
            .insert([])
            .select();

        if (propertiesError) {
            console.log('⚠️ Properties error:', propertiesError.message);
        } else {
            console.log('✅ Properties added:', properties.length);
        }

        // Add sample destinations (matching the actual schema)
        console.log('🌍 Adding destinations...');
        const { data: destinations, error: destinationsError } = await supabase
            .from('destinations')
            .insert([{
                    id: 'lonavala',
                    name: 'Lonavala',
                    description: 'Scenic hill station known for its caves, forts, and viewpoints',
                    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                    featured: true
                },
                {
                    id: 'goa',
                    name: 'Goa',
                    description: 'Tropical paradise with beaches, nightlife, and Portuguese heritage',
                    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
                    featured: true
                },
                {
                    id: 'malpe',
                    name: 'Malpe, Maharashtra',
                    description: 'Beautiful coastal destination with pristine beaches and luxury accommodations',
                    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                    featured: true
                }
            ])
            .select();

        if (destinationsError) {
            console.log('⚠️ Destinations error:', destinationsError.message);
        } else {
            console.log('✅ Destinations added:', destinations.length);
        }

        // Add sample deal banners (matching the actual schema)
        console.log('🎯 Adding deal banners...');
        const { data: dealBanners, error: dealBannersError } = await supabase
            .from('deal_banners')
            .insert([{
                title: 'Ready to Find a Great Villa Deal?',
                description: 'Save up to 25% on your next luxury villa stay',
                button_text: 'Explore Deals',
                button_url: '/villas',
                video_url: '',
                active: true
            }])
            .select();

        if (dealBannersError) {
            console.log('⚠️ Deal banners error:', dealBannersError.message);
        } else {
            console.log('✅ Deal banners added:', dealBanners.length);
        }

        console.log('\n🎉 Corrected sample data added successfully!');
        console.log('📱 You can now visit:');
        console.log('- http://localhost:3000 (Home page)');
        console.log('- http://localhost:3000/villas (Villas page)');
        console.log('- http://localhost:3000/test-supabase (Test page)');

    } catch (error) {
        console.error('❌ Error adding sample data:', error);
    }
}

addCorrectedSampleData();