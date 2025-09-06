-- Updated Supabase Schema for Luxe Staycations
-- Run this in your Supabase SQL Editor

-- Create properties table (simplified)
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

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  location VARCHAR(255) NOT NULL,
  attractions TEXT[],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in VARCHAR(50) NOT NULL,
  check_out VARCHAR(50) NOT NULL,
  guests INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create callback_requests table
CREATE TABLE IF NOT EXISTS callback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal_banners table
CREATE TABLE IF NOT EXISTS deal_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  link VARCHAR(500),
  active BOOLEAN DEFAULT true,
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hero_backgrounds table
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

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  avatar_url VARCHAR(500),
  bio TEXT,
  phone VARCHAR(50),
  address TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create host_payouts table
CREATE TABLE IF NOT EXISTS host_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  host_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create special_requests table
CREATE TABLE IF NOT EXISTS special_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  request_type VARCHAR(100) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_requests ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for development (allows all operations)
CREATE POLICY "Allow all operations" ON properties FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON destinations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON callback_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON deal_banners FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON hero_backgrounds FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON host_payouts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON coupons FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON special_requests FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO properties (name, location, description, price, rating, reviews, max_guests, amenities, image, featured) VALUES
('Luxury Villa Casa Alphonso', 'Lonavala, Maharashtra', 'A stunning luxury villa with panoramic mountain views', 15000, 4.8, 25, 8, ARRAY['WiFi', 'Pool', 'Kitchen', 'Parking'], 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', true),
('Mountain View Cottage', 'Khandala, Maharashtra', 'Cozy cottage with breathtaking mountain vistas', 8000, 4.5, 18, 4, ARRAY['WiFi', 'Garden', 'Kitchen'], 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', true),
('Beachfront Paradise', 'Goa, India', 'Direct beach access with private pool', 12000, 4.9, 32, 6, ARRAY['WiFi', 'Pool', 'Beach Access', 'Kitchen'], 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', false);

INSERT INTO destinations (name, description, image, location, attractions, featured) VALUES
('Lonavala', 'Scenic hill station known for its caves, forts, and viewpoints', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Maharashtra', ARRAY['Weekend Getaways', 'Adventure', 'Nature'], true),
('Goa', 'Tropical paradise with beaches, nightlife, and Portuguese heritage', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'Goa', ARRAY['Beaches', 'Nightlife', 'Culture'], true),
('Alibaug', 'Coastal town with pristine beaches and historic forts', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', 'Maharashtra', ARRAY['Beaches', 'History', 'Seafood'], false),
('Karjat', 'Peaceful retreat surrounded by Sahyadri mountains', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Maharashtra', ARRAY['Trekking', 'Nature', 'Peace'], false);

INSERT INTO deal_banners (title, subtitle, button_text, button_link, video_url, fallback_image_url, is_active, start_date, end_date) VALUES
('Ready to Find a Great Villa Deal?', 'Save up to 25% on your next luxury villa stay', 'Explore Deals', '/villas', '', 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg', true, '', ''),
('Summer Special Offer', 'Book now and get 30% off on all beachfront properties', 'Book Now', '/villas?featured=true', '', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', true, '', '');

INSERT INTO hero_backgrounds (title, subtitle, image, alt_text, active, priority) VALUES
('Ready to Find a Great Villa Deal?', 'Save up to 25% on your next luxury villa stay', 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg', 'Luxury villa with mountain view', true, 1),
('Luxury Villa Experiences', 'Discover exclusive villas with premium amenities', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', 'Luxury villa exterior', true, 2),
('Perfect Staycations', 'Create unforgettable memories with family and friends', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', 'Family vacation villa', true, 3);

-- Success message
SELECT 'Database schema created successfully! All tables are ready for use.' as status;
