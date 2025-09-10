-- Supabase Database Schema for Luxe Staycations
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS special_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS callback_requests CASCADE;
DROP TABLE IF EXISTS deal_banners CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Properties Table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  max_guests INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, location)
);

-- Destinations Table
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guest_email, check_in, check_out, property_id)
);

-- Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Callback Requests Table
CREATE TABLE callback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT,
  number_of_guests INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone, DATE_TRUNC('hour', created_at))
);

-- Deal Banners Table
CREATE TABLE deal_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  button_text VARCHAR(100),
  button_url VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(title)
);

-- Settings Table
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special Requests Table
CREATE TABLE special_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  request TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id, request)
);

-- Create indexes for better performance
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_destinations_featured ON destinations(featured);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_callback_requests_status ON callback_requests(status);
CREATE INDEX idx_deal_banners_active ON deal_banners(active);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('email_config', '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "email": "noreply@luxestaycations.com"}'),
  ('razorpay_config', '{"key_id": "your_razorpay_key_id", "key_secret": "your_razorpay_key_secret"}'),
  ('site_config', '{"site_name": "Luxe Staycations", "currency": "INR", "timezone": "Asia/Kolkata"}');

-- Insert sample destinations
INSERT INTO destinations (id, name, description, image, featured) VALUES
  ('lonavala', 'Lonavala, Maharashtra', 'Scenic hill station with ancient forts and lush greenery', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', true),
  ('goa', 'Goa, India', 'Tropical paradise with pristine beaches and Portuguese heritage', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', true),
  ('manali', 'Manali, Himachal Pradesh', 'Mountain retreat with snow-capped peaks and adventure sports', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80', true),
  ('udaipur', 'Udaipur, Rajasthan', 'City of Lakes with royal palaces and romantic settings', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', false),
  ('kerala', 'Kerala, India', 'God''s Own Country with backwaters and Ayurvedic wellness', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', false),
  ('rishikesh', 'Rishikesh, Uttarakhand', 'Yoga capital with spiritual retreats and river adventures', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80', false);
