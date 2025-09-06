const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from our earlier conversation)
const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg4NTg2MywiZXhwIjoyMDcxNDYxODYzfQ.N2HiHya_yuS3hsWt8GJsDK9P8nZ1jpaKlUxj6ST-SVw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDataFinal() {
    console.log('🚀 Final fix - Adding missing data...');

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
            console.log('✅ Deal banner added successfully!');
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
            console.log('✅ Hero background added successfully!');
        }

        console.log('🎉 All data added successfully!');
        console.log('📱 Your deal banner and destination images should now appear!');
        console.log('🌐 Visit: http://localhost:3001');

    } catch (error) {
        console.error('❌ Error adding data:', error);
    }
}

fixDataFinal();