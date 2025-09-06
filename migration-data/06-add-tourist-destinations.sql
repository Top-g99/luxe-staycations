-- Migration: Add Tourist Destinations
-- This SQL adds popular tourist destinations to the destinations table

-- First, ensure the destinations table exists
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    location VARCHAR(255),
    attractions JSONB DEFAULT '[]',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add destinations data
INSERT INTO destinations (id, name, description, image, location, attractions, featured, created_at, updated_at) VALUES
(
    'malpe-maharashtra',
    'Malpe, Maharashtra',
    'Pristine beaches and coastal charm await in this serene coastal town. Experience the perfect blend of tranquility and adventure with golden sands, clear waters, and stunning sunsets.',
    '/images/destinations/malpe-maharashtra.jpg',
    'Maharashtra, India',
    '["Malpe Beach","St. Mary's Island","Udupi Temple","Water Sports","Seafood Delicacies"]',
    true,
    '2025-08-31T17:57:16.445Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'lonavala-maharashtra',
    'Lonavala, Maharashtra',
    'Nestled in the Western Ghats, this hill station offers breathtaking views, ancient caves, and refreshing waterfalls. Perfect for nature lovers and adventure seekers.',
    '/images/destinations/lonavala-maharashtra.jpg',
    'Maharashtra, India',
    '["Tiger's Leap","Karla Caves","Bhaja Caves","Lonavala Lake","Trekking Trails"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'mahabaleshwar-maharashtra',
    'Mahabaleshwar, Maharashtra',
    'Queen of Hill Stations offers panoramic views, strawberry farms, and colonial charm. Experience the cool mountain air and scenic beauty of the Western Ghats.',
    '/images/destinations/mahabaleshwar-maharashtra.jpg',
    'Maharashtra, India',
    '["Wilson Point","Mapro Garden","Venna Lake","Strawberry Farms","Scenic Points"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'goa-beaches',
    'Goa Beaches',
    'Famous for its pristine beaches, vibrant culture, and Portuguese heritage. From party beaches to secluded coves, Goa offers something for every traveler.',
    '/images/destinations/goa-beaches.jpg',
    'Goa, India',
    '["Calangute Beach","Baga Beach","Anjuna Beach","Old Goa Churches","Portuguese Architecture"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'kerala-backwaters',
    'Kerala Backwaters',
    'Experience the serene beauty of Kerala''s backwaters with houseboat cruises, lush greenery, and traditional village life. A perfect escape into nature.',
    '/images/destinations/kerala-backwaters.jpg',
    'Kerala, India',
    '["Alleppey Backwaters","Kumarakom","Vembanad Lake","Houseboat Cruises","Ayurvedic Spas"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'udaipur-rajasthan',
    'Udaipur, Rajasthan',
    'The City of Lakes offers royal heritage, stunning palaces, and romantic boat rides. Experience the magic of Rajasthan''s most beautiful city.',
    '/images/destinations/udaipur-rajasthan.jpg',
    'Rajasthan, India',
    '["Lake Palace","City Palace","Jag Mandir","Fateh Sagar Lake","Royal Heritage"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'manali-himachal',
    'Manali, Himachal Pradesh',
    'Adventure capital of India with snow-capped mountains, apple orchards, and thrilling activities. Perfect for both relaxation and adventure.',
    '/images/destinations/manali-himachal.jpg',
    'Himachal Pradesh, India',
    '["Rohtang Pass","Solang Valley","Hadimba Temple","Apple Orchards","Adventure Sports"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'shimla-himachal',
    'Shimla, Himachal Pradesh',
    'Queen of Hills offers colonial architecture, scenic beauty, and pleasant weather. Experience the charm of British-era hill stations.',
    '/images/destinations/shimla-himachal.jpg',
    'Himachal Pradesh, India',
    '["The Ridge","Christ Church","Jakhu Temple","Mall Road","Colonial Architecture"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'darjeeling-west-bengal',
    'Darjeeling, West Bengal',
    'Famous for its tea gardens, toy train, and views of Kanchenjunga. Experience the charm of the Himalayan foothills.',
    '/images/destinations/darjeeling-west-bengal.jpg',
    'West Bengal, India',
    '["Tiger Hill","Darjeeling Toy Train","Tea Gardens","Kanchenjunga Views","Colonial Charm"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'varanasi-uttar-pradesh',
    'Varanasi, Uttar Pradesh',
    'Spiritual capital of India with ancient temples, Ganga ghats, and cultural heritage. Experience the essence of Indian spirituality.',
    '/images/destinations/varanasi-uttar-pradesh.jpg',
    'Uttar Pradesh, India',
    '["Ganga Ghats","Kashi Vishwanath Temple","Ganga Aarti","Ancient Temples","Spiritual Heritage"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'agra-uttar-pradesh',
    'Agra, Uttar Pradesh',
    'Home to the iconic Taj Mahal, a symbol of eternal love. Experience the grandeur of Mughal architecture and history.',
    '/images/destinations/agra-uttar-pradesh.jpg',
    'Uttar Pradesh, India',
    '["Taj Mahal","Agra Fort","Fatehpur Sikri","Itmad-ud-Daula","Mughal Architecture"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
),
(
    'jaisalmer-rajasthan',
    'Jaisalmer, Rajasthan',
    'Golden City in the Thar Desert offers stunning sand dunes, ancient forts, and camel safaris. Experience the magic of the desert.',
    '/images/destinations/jaisalmer-rajasthan.jpg',
    'Rajasthan, India',
    '["Jaisalmer Fort","Sam Sand Dunes","Camel Safari","Golden Architecture","Desert Culture"]',
    true,
    '2025-08-31T17:57:16.449Z',
    '2025-08-31T17:57:16.449Z'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON destinations(location);

-- Add RLS policies if needed
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to destinations
CREATE POLICY "Allow public read access to destinations" ON destinations
    FOR SELECT USING (true);

-- Allow authenticated users to manage destinations (for admin purposes)
CREATE POLICY "Allow authenticated users to manage destinations" ON destinations
    FOR ALL USING (auth.role() = 'authenticated');

-- Update the updated_at column trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to destinations table
DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
CREATE TRIGGER update_destinations_updated_at 
    BEFORE UPDATE ON destinations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the data
SELECT COUNT(*) as total_destinations FROM destinations;
SELECT name, location, featured FROM destinations ORDER BY name;
