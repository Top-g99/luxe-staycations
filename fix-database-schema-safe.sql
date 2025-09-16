-- Safe database schema fix that handles existing tables and policies
-- This will only create what's missing and won't cause conflicts

-- Check and create properties table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
        CREATE TABLE properties (
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
        RAISE NOTICE 'Properties table created successfully';
    ELSE
        RAISE NOTICE 'Properties table already exists';
    END IF;
END $$;

-- Check and create destinations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'destinations') THEN
        CREATE TABLE destinations (
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
        RAISE NOTICE 'Destinations table created successfully';
    ELSE
        RAISE NOTICE 'Destinations table already exists';
    END IF;
END $$;

-- Check and create deal_banners table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deal_banners') THEN
        CREATE TABLE deal_banners (
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
        RAISE NOTICE 'Deal banners table created successfully';
    ELSE
        RAISE NOTICE 'Deal banners table already exists';
    END IF;
END $$;

-- Check and create hero_backgrounds table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hero_backgrounds') THEN
        CREATE TABLE hero_backgrounds (
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
        RAISE NOTICE 'Hero backgrounds table created successfully';
    ELSE
        RAISE NOTICE 'Hero backgrounds table already exists';
    END IF;
END $$;

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_backgrounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all operations" ON properties;
DROP POLICY IF EXISTS "Allow all operations" ON destinations;
DROP POLICY IF EXISTS "Allow all operations" ON deal_banners;
DROP POLICY IF EXISTS "Allow all operations" ON hero_backgrounds;

-- Create new policies
CREATE POLICY "Allow all operations" ON properties FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON destinations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON deal_banners FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON hero_backgrounds FOR ALL USING (true);

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

INSERT INTO properties (name, location, description, price, rating, reviews, max_guests, amenities, image, featured)
SELECT 
    'Mountain View Cottage',
    'Khandala, Maharashtra',
    'Cozy cottage with breathtaking mountain vistas',
    8000,
    4.5,
    18,
    4,
    ARRAY['WiFi', 'Garden', 'Kitchen'],
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
    true
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Mountain View Cottage');

INSERT INTO destinations (name, description, image, location, attractions, featured)
SELECT 
    'Lonavala',
    'Scenic hill station known for its caves, forts, and viewpoints',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'Maharashtra',
    ARRAY['Weekend Getaways', 'Adventure', 'Nature'],
    true
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Lonavala');

INSERT INTO destinations (name, description, image, location, attractions, featured)
SELECT 
    'Goa',
    'Tropical paradise with beaches, nightlife, and Portuguese heritage',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    'Goa',
    ARRAY['Beaches', 'Nightlife', 'Culture'],
    true
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Goa');

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
SELECT 'Database schema updated safely! All tables are ready with correct column names.' as status;
