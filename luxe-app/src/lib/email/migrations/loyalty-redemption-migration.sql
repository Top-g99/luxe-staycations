-- Create loyalty redemption requests table
CREATE TABLE IF NOT EXISTS loyalty_redemption_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guest_accounts(id) ON DELETE CASCADE,
  jewels_to_redeem INTEGER NOT NULL CHECK (jewels_to_redeem > 0),
  redemption_reason TEXT NOT NULL,
  contact_preference VARCHAR(50) DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'whatsapp')),
  special_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_loyalty_redemption_requests_guest_id ON loyalty_redemption_requests(guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemption_requests_status ON loyalty_redemption_requests(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemption_requests_created_at ON loyalty_redemption_requests(created_at);

-- Create redemption options table for predefined redemption types
CREATE TABLE IF NOT EXISTS loyalty_redemption_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_name VARCHAR(100) NOT NULL,
  option_description TEXT NOT NULL,
  jewels_required INTEGER NOT NULL CHECK (jewels_required > 0),
  option_type VARCHAR(50) NOT NULL CHECK (option_type IN ('free_night', 'upgrade', 'discount', 'experience', 'amenity')),
  is_active BOOLEAN DEFAULT true,
  max_redemptions_per_guest INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default redemption options
INSERT INTO loyalty_redemption_options (option_name, option_description, jewels_required, option_type, max_redemptions_per_guest) VALUES
('Free Night Stay', 'Redeem for one free night at any property', 10000, 'free_night', 2),
('Room Upgrade', 'Upgrade to premium room category', 5000, 'upgrade', 3),
('Late Checkout', 'Extend checkout time to 2 PM', 1000, 'amenity', 5),
('Welcome Amenities', 'Complimentary welcome basket and amenities', 2000, 'amenity', 2),
('Spa Service', 'Complimentary spa service (60 minutes)', 3000, 'experience', 1),
('Airport Transfer', 'Complimentary airport pickup/drop', 2500, 'experience', 2),
('Dining Credit', '₹1000 dining credit at property restaurant', 1500, 'discount', 3),
('Exclusive Experience', 'Access to exclusive property experiences', 4000, 'experience', 1)
ON CONFLICT DO NOTHING;

-- Create redemption history table
CREATE TABLE IF NOT EXISTS loyalty_redemption_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guest_accounts(id) ON DELETE CASCADE,
  redemption_request_id UUID NOT NULL REFERENCES loyalty_redemption_requests(id) ON DELETE CASCADE,
  jewels_redeemed INTEGER NOT NULL,
  redemption_type VARCHAR(50) NOT NULL,
  redemption_details JSONB,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for redemption history
CREATE INDEX IF NOT EXISTS idx_loyalty_redemption_history_guest_id ON loyalty_redemption_history(guest_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemption_history_redemption_request_id ON loyalty_redemption_history(redemption_request_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loyalty_redemption_requests_updated_at 
    BEFORE UPDATE ON loyalty_redemption_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_redemption_options_updated_at 
    BEFORE UPDATE ON loyalty_redemption_options 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
