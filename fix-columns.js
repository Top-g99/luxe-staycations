const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixColumns() {
    console.log('🔧 Fixing missing columns...');

    try {
        // Add missing columns to properties table
        console.log('📊 Adding missing columns to properties table...');

        // Add image column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS image VARCHAR(500);'
            });
            console.log('✅ Added image column to properties');
        } catch (error) {
            console.log('⚠️ Image column might already exist:', error.message);
        }

        // Add max_guests column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 4;'
            });
            console.log('✅ Added max_guests column to properties');
        } catch (error) {
            console.log('⚠️ Max_guests column might already exist:', error.message);
        }

        // Add amenities column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT \'{}\';'
            });
            console.log('✅ Added amenities column to properties');
        } catch (error) {
            console.log('⚠️ Amenities column might already exist:', error.message);
        }

        // Add missing columns to destinations table
        console.log('🌍 Adding missing columns to destinations table...');

        // Add attractions column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE destinations ADD COLUMN IF NOT EXISTS attractions TEXT[] DEFAULT \'{}\';'
            });
            console.log('✅ Added attractions column to destinations');
        } catch (error) {
            console.log('⚠️ Attractions column might already exist:', error.message);
        }

        // Add location column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE destinations ADD COLUMN IF NOT EXISTS location VARCHAR(255);'
            });
            console.log('✅ Added location column to destinations');
        } catch (error) {
            console.log('⚠️ Location column might already exist:', error.message);
        }

        // Add missing columns to deal_banners table
        console.log('🎯 Adding missing columns to deal_banners table...');

        // Add button_link column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE deal_banners ADD COLUMN IF NOT EXISTS button_link VARCHAR(500);'
            });
            console.log('✅ Added button_link column to deal_banners');
        } catch (error) {
            console.log('⚠️ Button_link column might already exist:', error.message);
        }

        // Add fallback_image_url column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE deal_banners ADD COLUMN IF NOT EXISTS fallback_image_url VARCHAR(500);'
            });
            console.log('✅ Added fallback_image_url column to deal_banners');
        } catch (error) {
            console.log('⚠️ Fallback_image_url column might already exist:', error.message);
        }

        // Add is_active column if it doesn't exist
        try {
            await supabase.rpc('exec_sql', {
                sql: 'ALTER TABLE deal_banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;'
            });
            console.log('✅ Added is_active column to deal_banners');
        } catch (error) {
            console.log('⚠️ Is_active column might already exist:', error.message);
        }

        // Create hero_backgrounds table if it doesn't exist
        console.log('🖼️ Creating hero_backgrounds table...');
        try {
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
            });
            console.log('✅ Created hero_backgrounds table');
        } catch (error) {
            console.log('⚠️ Hero_backgrounds table might already exist:', error.message);
        }

        // Enable RLS and create policies
        console.log('🔒 Setting up RLS and policies...');
        try {
            await supabase.rpc('exec_sql', {
                sql: `
          ALTER TABLE hero_backgrounds ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "Allow all operations" ON hero_backgrounds;
          CREATE POLICY "Allow all operations" ON hero_backgrounds FOR ALL USING (true);
        `
            });
            console.log('✅ Set up RLS and policies for hero_backgrounds');
        } catch (error) {
            console.log('⚠️ RLS setup might already be done:', error.message);
        }

        console.log('🎉 Column fixes completed!');
        console.log('📱 Now run: node add-sample-data.js');

    } catch (error) {
        console.error('❌ Error fixing columns:', error);
    }
}

fixColumns();