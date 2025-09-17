const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDataDirect() {
    console.log('🚀 Adding data directly...');

    try {
        // Add deal banner
        console.log('🎯 Adding deal banner...');
        const { data: dealBanner, error: dealBannerError } = await supabase
            .from('deal_banners')
            .insert({
                title: 'Ready to Find a Great Villa Deal?',
                subtitle: 'Save up to 25% on your next luxury villa stay',
                button_text: 'Explore Deals',
                button_link: '/villas',
                video_url: '',
                fallback_image_url: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
                is_active: true
            })
            .select();

        if (dealBannerError) {
            console.log('⚠️ Deal banner error:', dealBannerError.message);
        } else {
            console.log('✅ Deal banner added:', dealBanner[0].id);
        }

        // Add hero background
        console.log('🖼️ Adding hero background...');
        const { data: heroBackground, error: heroBackgroundError } = await supabase
            .from('hero_backgrounds')
            .insert({
                title: 'Ready to Find a Great Villa Deal?',
                subtitle: 'Save up to 25% on your next luxury villa stay',
                image: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
                alt_text: 'Luxury villa with mountain view',
                active: true,
                priority: 1
            })
            .select();

        if (heroBackgroundError) {
            console.log('⚠️ Hero background error:', heroBackgroundError.message);
        } else {
            console.log('✅ Hero background added:', heroBackground[0].id);
        }

        console.log('🎉 Data added successfully!');
        console.log('📱 Your deal banner and destination images should now appear!');

    } catch (error) {
        console.error('❌ Error adding data:', error);
    }
}

addDataDirect();