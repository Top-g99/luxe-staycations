-- Guest Signup and Loyalty System Migration for Luxe Staycations
-- Run this in your Supabase SQL Editor

-- Create guest_accounts table
CREATE TABLE IF NOT EXISTS guest_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Using existing user_loyalty_summary table instead of creating new loyalty_accounts
-- The guest_accounts will be linked to user_loyalty_summary via user_id = guest_id

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Create guest_booking_links table (to link booking IDs with guest accounts)
CREATE TABLE IF NOT EXISTS guest_booking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guest_accounts(id) ON DELETE CASCADE,
  booking_id TEXT NOT NULL,
  property_name TEXT,
  check_in_date DATE,
  check_out_date DATE,
  total_amount DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE guest_accounts
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE guest_accounts
ADD CONSTRAINT check_phone_format
CHECK (phone ~* '^\+?[1-9]\d{1,14}$');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_accounts_email ON guest_accounts (email);
CREATE INDEX IF NOT EXISTS idx_guest_accounts_verification_token ON guest_accounts (verification_token);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_guest_id ON loyalty_accounts (guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON loyalty_accounts (tier);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_guest_booking_links_guest_id ON guest_booking_links (guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_booking_links_booking_id ON guest_booking_links (booking_id);

-- Enable RLS (Row Level Security)
ALTER TABLE guest_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_booking_links ENABLE ROW LEVEL SECURITY;

-- Create policies for guest_accounts
CREATE POLICY "Allow guests to read their own account" ON guest_accounts
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Allow guests to update their own account" ON guest_accounts
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow service role to manage guest accounts" ON guest_accounts
  FOR ALL USING (auth.role() = 'service_role');

-- Note: Using existing user_loyalty_summary policies

-- Create policies for newsletter_subscribers
CREATE POLICY "Allow service role to manage newsletter subscribers" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for guest_booking_links
CREATE POLICY "Allow guests to read their own booking links" ON guest_booking_links
  FOR SELECT USING (auth.uid()::text = guest_id::text);

CREATE POLICY "Allow service role to manage booking links" ON guest_booking_links
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON guest_accounts TO authenticated;
GRANT ALL ON guest_accounts TO service_role;
GRANT ALL ON newsletter_subscribers TO service_role;
GRANT ALL ON guest_booking_links TO authenticated;
GRANT ALL ON guest_booking_links TO service_role;

-- Create function to automatically create loyalty account when guest signs up
CREATE OR REPLACE FUNCTION create_loyalty_account_for_guest()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_loyalty_summary (user_id, total_jewels_balance, total_jewels_earned, total_jewels_redeemed, active_jewels_balance, tier)
  VALUES (NEW.id, 0, 0, 0, 0, 'bronze');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create loyalty account
CREATE TRIGGER trigger_create_loyalty_account
  AFTER INSERT ON guest_accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_loyalty_account_for_guest();

-- Create function to update loyalty tier based on points
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tier based on active jewels balance
  NEW.tier := CASE
    WHEN NEW.active_jewels_balance >= 50000 THEN 'platinum'
    WHEN NEW.active_jewels_balance >= 15000 THEN 'gold'
    WHEN NEW.active_jewels_balance >= 5000 THEN 'silver'
    ELSE 'bronze'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update tier when points change
CREATE TRIGGER trigger_update_loyalty_tier
  BEFORE UPDATE ON user_loyalty_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- Create guest_booking_links table to link bookings with guest accounts
CREATE TABLE IF NOT EXISTS guest_booking_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guest_accounts(id) ON DELETE CASCADE,
  booking_id VARCHAR(255) NOT NULL,
  property_name VARCHAR(255),
  total_amount DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_booking_links_guest_id ON guest_booking_links(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_booking_links_booking_id ON guest_booking_links(booking_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_guest_booking_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER trigger_update_guest_booking_links_updated_at
  BEFORE UPDATE ON guest_booking_links
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_booking_links_updated_at();

-- Success message
SELECT 'Guest signup and loyalty system tables created successfully!' as message;
