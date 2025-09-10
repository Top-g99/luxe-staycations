-- Simple script to add missing columns to existing tables
-- This won't cause any policy conflicts

-- Add missing columns to properties table if they don't exist
DO $$ 
BEGIN
    -- Add image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'image') THEN
        ALTER TABLE properties ADD COLUMN image VARCHAR(500);
        RAISE NOTICE 'Added image column to properties table';
    ELSE
        RAISE NOTICE 'Image column already exists in properties table';
    END IF;
    
    -- Add max_guests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'max_guests') THEN
        ALTER TABLE properties ADD COLUMN max_guests INTEGER DEFAULT 4;
        RAISE NOTICE 'Added max_guests column to properties table';
    ELSE
        RAISE NOTICE 'Max_guests column already exists in properties table';
    END IF;
    
    -- Add amenities column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'amenities') THEN
        ALTER TABLE properties ADD COLUMN amenities TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added amenities column to properties table';
    ELSE
        RAISE NOTICE 'Amenities column already exists in properties table';
    END IF;
END $$;

-- Add missing columns to destinations table if they don't exist
DO $$ 
BEGIN
    -- Add attractions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'attractions') THEN
        ALTER TABLE destinations ADD COLUMN attractions TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added attractions column to destinations table';
    ELSE
        RAISE NOTICE 'Attractions column already exists in destinations table';
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'location') THEN
        ALTER TABLE destinations ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Added location column to destinations table';
    ELSE
        RAISE NOTICE 'Location column already exists in destinations table';
    END IF;
END $$;

-- Add missing columns to deal_banners table if they don't exist
DO $$ 
BEGIN
    -- Add button_link column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_banners' AND column_name = 'button_link') THEN
        ALTER TABLE deal_banners ADD COLUMN button_link VARCHAR(500);
        RAISE NOTICE 'Added button_link column to deal_banners table';
    ELSE
        RAISE NOTICE 'Button_link column already exists in deal_banners table';
    END IF;
    
    -- Add fallback_image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_banners' AND column_name = 'fallback_image_url') THEN
        ALTER TABLE deal_banners ADD COLUMN fallback_image_url VARCHAR(500);
        RAISE NOTICE 'Added fallback_image_url column to deal_banners table';
    ELSE
        RAISE NOTICE 'Fallback_image_url column already exists in deal_banners table';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_banners' AND column_name = 'is_active') THEN
        ALTER TABLE deal_banners ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to deal_banners table';
    ELSE
        RAISE NOTICE 'Is_active column already exists in deal_banners table';
    END IF;
END $$;

-- Create hero_backgrounds table if it doesn't exist
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

-- Enable RLS on hero_backgrounds if not already enabled
ALTER TABLE hero_backgrounds ENABLE ROW LEVEL SECURITY;

-- Create policy for hero_backgrounds if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hero_backgrounds' AND policyname = 'Allow all operations') THEN
        CREATE POLICY "Allow all operations" ON hero_backgrounds FOR ALL USING (true);
        RAISE NOTICE 'Created policy for hero_backgrounds table';
    ELSE
        RAISE NOTICE 'Policy already exists for hero_backgrounds table';
    END IF;
END $$;

-- Insert sample data only if tables are empty
INSERT INTO properties (name, location, description, price, rating, reviews, max_guests, amenities, image, featured)
SELECT 
    'Luxury Villa Casa Alphonso',
    'Lonavala, Maharashtra',
    'A stunning luxury villa with panoramic mountain views',
    15000,
    4.8,
    25,
    8,
    ARRAY['WiFi', 'Pool', 'Kitchen', 'Parking'],
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    true
WHERE NOT EXISTS (SELECT 1 FROM properties LIMIT 1);

INSERT INTO destinations (name, description, image, location, attractions, featured)
SELECT 
    'Lonavala',
    'Scenic hill station known for its caves, forts, and viewpoints',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'Maharashtra',
    ARRAY['Weekend Getaways', 'Adventure', 'Nature'],
    true
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Lonavala');

INSERT INTO deal_banners (title, subtitle, button_text, button_link, video_url, fallback_image_url, is_active)
SELECT 
    'Ready to Find a Great Villa Deal?',
    'Save up to 25% on your next luxury villa stay',
    'Explore Deals',
    '/villas',
    '',
    'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
    true
WHERE NOT EXISTS (SELECT 1 FROM deal_banners LIMIT 1);

INSERT INTO hero_backgrounds (title, subtitle, image, alt_text, active, priority)
SELECT 
    'Ready to Find a Great Villa Deal?',
    'Save up to 25% on your next luxury villa stay',
    'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
    'Luxury villa with mountain view',
    true,
    1
WHERE NOT EXISTS (SELECT 1 FROM hero_backgrounds LIMIT 1);

-- Success message
SELECT 'Missing columns added successfully! All tables now have the required columns.' as status;
