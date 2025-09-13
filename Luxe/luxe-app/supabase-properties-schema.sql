-- Supabase Properties Table Schema
-- Run this in your Supabase SQL Editor

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    type VARCHAR(100) DEFAULT 'Villa',
    amenities TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    max_guests INTEGER DEFAULT 4,
    bedrooms INTEGER DEFAULT 2,
    bathrooms INTEGER DEFAULT 2,
    host_name VARCHAR(255) DEFAULT '',
    host_image TEXT DEFAULT '',
    property_size VARCHAR(100) DEFAULT '',
    year_built VARCHAR(10) DEFAULT '',
    floor_level VARCHAR(50) DEFAULT '',
    total_floors INTEGER DEFAULT 1,
    parking_spaces INTEGER DEFAULT 2,
    pet_friendly BOOLEAN DEFAULT false,
    smoking_allowed BOOLEAN DEFAULT false,
    wheelchair_accessible BOOLEAN DEFAULT false,
    neighborhood TEXT DEFAULT '',
    distance_from_airport VARCHAR(100) DEFAULT '',
    distance_from_city_center VARCHAR(100) DEFAULT '',
    distance_from_beach VARCHAR(100) DEFAULT '',
    public_transport TEXT DEFAULT '',
    check_in_time VARCHAR(10) DEFAULT '15:00',
    check_out_time VARCHAR(10) DEFAULT '11:00',
    early_check_in BOOLEAN DEFAULT false,
    late_check_out BOOLEAN DEFAULT false,
    cancellation_policy VARCHAR(100) DEFAULT 'Flexible',
    cleaning_fee INTEGER DEFAULT 0,
    service_fee INTEGER DEFAULT 0,
    security_deposit INTEGER DEFAULT 0,
    weekly_discount INTEGER DEFAULT 0,
    monthly_discount INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to properties" ON properties
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to properties" ON properties
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to properties" ON properties
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to properties" ON properties
    FOR DELETE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO properties (name, location, description, price, type, amenities, featured) VALUES
('Luxury Beach Villa', 'Goa', 'Stunning beachfront villa with private pool and ocean views', 15000, 'Luxury Villa', ARRAY['WiFi', 'Pool', 'Beach Access', 'Parking'], true),
('Mountain Retreat', 'Manali', 'Cozy mountain villa with fireplace and mountain views', 8000, 'Villa', ARRAY['WiFi', 'Fireplace', 'Mountain View', 'Parking'], false),
('City Center Apartment', 'Mumbai', 'Modern apartment in the heart of the city', 12000, 'Apartment', ARRAY['WiFi', 'Gym', 'City View', 'Parking'], false)
ON CONFLICT (id) DO NOTHING;
