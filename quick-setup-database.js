const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Please ensure you have:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    console.log('🚀 Setting up database with sample data...');

    try {
        // Check if tables exist and create them if they don't
        console.log('📋 Creating tables...');

        // Create properties table
        await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS properties (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          rating DECIMAL(3,2) DEFAULT 0,
          reviews INTEGER DEFAULT 0,
          max_guests INTEGER NOT NULL,
          amenities TEXT[],
          image VARCHAR(500),
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        }).catch(() => console.log('Properties table already exists'));

        // Create destinations table
        await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS destinations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image VARCHAR(500),
          location VARCHAR(255),
          attractions TEXT[],
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        }).catch(() => console.log('Destinations table already exists'));

        // Create deal_banners table
        await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS deal_banners (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          button_text VARCHAR(255),
          button_link VARCHAR(500),
          video_url VARCHAR(500),
          fallback_image_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          start_date VARCHAR(50),
          end_date VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        }).catch(() => console.log('Deal banners table already exists'));

        // Create hero_backgrounds table
        await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS hero_backgrounds (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          image VARCHAR(500) NOT NULL,
          alt_text VARCHAR(255),
          active BOOLEAN DEFAULT true,
          priority INTEGER DEFAULT 1,
          link VARCHAR(500),
          link_text VARCHAR(255),
          start_date VARCHAR(50),
          end_date VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        }).catch(() => console.log('Hero backgrounds table already exists'));

        // Enable RLS
        console.log('🔒 Enabling RLS...');
        await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
        ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE deal_banners ENABLE ROW LEVEL SECURITY;
        ALTER TABLE hero_backgrounds ENABLE ROW LEVEL SECURITY;
      `
        }).catch(() => console.log('RLS already enabled'));

        // Create policies
        console.log('📜 Creating policies...');
        await supabase.rpc('exec_sql', {
            sql: `
        DROP POLICY IF EXISTS "Allow all operations" ON properties;
        DROP POLICY IF EXISTS "Allow all operations" ON destinations;
        DROP POLICY IF EXISTS "Allow all operations" ON deal_banners;
        DROP POLICY IF EXISTS "Allow all operations" ON hero_backgrounds;
        
        CREATE POLICY "Allow all operations" ON properties FOR ALL USING (true);
        CREATE POLICY "Allow all operations" ON destinations FOR ALL USING (true);
        CREATE POLICY "Allow all operations" ON deal_banners FOR ALL USING (true);
        CREATE POLICY "Allow all operations" ON hero_backgrounds FOR ALL USING (true);
      `
        }).catch(() => console.log('Policies already exist'));

        // Insert sample data
        console.log('📊 Inserting sample data...');

        // Check if properties exist
        const { data: existingProperties } = await supabase.from('properties').select('id').limit(1);
        if (!existingProperties || existingProperties.length === 0) {
            await supabase.from('properties').insert([]);
            console.log('✅ Properties table ready (no sample data)');
        }

        // Check if destinations exist
        const { data: existingDestinations } = await supabase.from('destinations').select('id').limit(1);
        if (!existingDestinations || existingDestinations.length === 0) {
            await supabase.from('destinations').insert([{
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
            ]);
            console.log('✅ Destinations added');
        }

        // Check if deal banners exist
        const { data: existingDealBanners } = await supabase.from('deal_banners').select('id').limit(1);
        if (!existingDealBanners || existingDealBanners.length === 0) {
            await supabase.from('deal_banners').insert([{
                title: 'Ready to Find a Great Villa Deal?',
                subtitle: 'Save up to 25% on your next luxury villa stay',
                button_text: 'Explore Deals',
                button_link: '/villas',
                video_url: '',
                fallback_image_url: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
                is_active: true
            }]);
            console.log('✅ Deal banners added');
        }

        // Check if hero backgrounds exist
        const { data: existingHeroBackgrounds } = await supabase.from('hero_backgrounds').select('id').limit(1);
        if (!existingHeroBackgrounds || existingHeroBackgrounds.length === 0) {
            await supabase.from('hero_backgrounds').insert([{
                title: 'Ready to Find a Great Villa Deal?',
                subtitle: 'Save up to 25% on your next luxury villa stay',
                image: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
                alt_text: 'Luxury villa with mountain view',
                active: true,
                priority: 1
            }]);
            console.log('✅ Hero backgrounds added');
        }

        console.log('🎉 Database setup completed successfully!');
        console.log('📱 You can now visit:');
        console.log('- http://localhost:3000 (Home page)');
        console.log('- http://localhost:3000/debug-data (Debug page)');
        console.log('- http://localhost:3000/admin/data-monitor (Data monitor)');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        console.log('💡 Try running the SQL manually in Supabase SQL Editor:');
        console.log('Copy the contents of supabase-schema-updated.sql and run it');
    }
}

setupDatabase();