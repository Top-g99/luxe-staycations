const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addFreshData() {
    console.log('🚀 Adding fresh sample data...');

    try {
        // Add sample properties
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

        // Add sample destinations
        console.log('🌍 Adding destinations...');
        const { data: destinations, error: destinationsError } = await supabase
            .from('destinations')
            .insert([{
                    name: 'Lonavala',
                    description: 'Scenic hill station known for its caves, forts, and viewpoints',
                    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                    location: 'Maharashtra',
                    attractions: ['Weekend Getaways', 'Adventure', 'Nature'],
                    featured: true
                },
                {
                    name: 'Goa',
                    description: 'Tropical paradise with beaches, nightlife, and Portuguese heritage',
                    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
                    location: 'Goa',
                    attractions: ['Beaches', 'Nightlife', 'Culture'],
                    featured: true
                }
            ])
            .select();

        if (destinationsError) {
            console.log('⚠️ Destinations error:', destinationsError.message);
        } else {
            console.log('✅ Destinations added:', destinations.length);
        }

        // Add sample deal banners
        console.log('🎯 Adding deal banners...');
        const { data: dealBanners, error: dealBannersError } = await supabase
            .from('deal_banners')
            .insert([{
                title: 'Ready to Find a Great Villa Deal?',
                subtitle: 'Save up to 25% on your next luxury villa stay',
                button_text: 'Explore Deals',
                button_link: '/villas',
                video_url: '',
                fallback_image_url: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
                is_active: true
            }])
            .select();

        if (dealBannersError) {
            console.log('⚠️ Deal banners error:', dealBannersError.message);
        } else {
            console.log('✅ Deal banners added:', dealBanners.length);
        }

        // Add sample hero backgrounds
        console.log('🖼️ Adding hero backgrounds...');
        const { data: heroBackgrounds, error: heroBackgroundsError } = await supabase
            .from('hero_backgrounds')
            .insert([{
                title: 'Ready to Find a Great Villa Deal?',
                subtitle: 'Save up to 25% on your next luxury villa stay',
                image: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
                alt_text: 'Luxury villa with mountain view',
                active: true,
                priority: 1
            }])
            .select();

        if (heroBackgroundsError) {
            console.log('⚠️ Hero backgrounds error:', heroBackgroundsError.message);
        } else {
            console.log('✅ Hero backgrounds added:', heroBackgrounds.length);
        }

        console.log('🎉 Fresh sample data added successfully!');
        console.log('📱 You can now visit:');
        console.log('- http://localhost:3001 (Home page)');
        console.log('- http://localhost:3001/debug-data (Debug page)');
        console.log('- http://localhost:3001/check-database (Database check)');

    } catch (error) {
        console.error('❌ Error adding fresh data:', error);
    }
}

addFreshData();