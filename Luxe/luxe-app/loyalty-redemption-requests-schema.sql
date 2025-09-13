-- Luxe Jewels Loyalty Program - Redemption Requests Schema
-- This table stores redemption requests that require admin approval

-- Create loyalty_redemption_requests table
CREATE TABLE IF NOT EXISTS loyalty_redemption_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    jewels_to_redeem INTEGER NOT NULL CHECK (jewels_to_redeem > 0),
    redemption_reason TEXT NOT NULL,
    contact_preference VARCHAR(20) DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'both')),
    special_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redemption_requests_guest_id ON loyalty_redemption_requests(guest_id);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_status ON loyalty_redemption_requests(status);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_created_at ON loyalty_redemption_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_processed_at ON loyalty_redemption_requests(processed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_redemption_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_redemption_requests_updated_at
    BEFORE UPDATE ON loyalty_redemption_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_redemption_requests_updated_at();

-- Create function to validate redemption request
CREATE OR REPLACE FUNCTION validate_redemption_request()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Check if guest has sufficient jewels
    SELECT active_jewels_balance INTO current_balance
    FROM user_loyalty_summary
    WHERE user_id = NEW.guest_id;
    
    IF current_balance IS NULL OR current_balance < NEW.jewels_to_redeem THEN
        RAISE EXCEPTION 'Insufficient jewels balance for redemption request';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate redemption requests before insertion
CREATE TRIGGER trigger_validate_redemption_request
    BEFORE INSERT ON loyalty_redemption_requests
    FOR EACH ROW
    EXECUTE FUNCTION validate_redemption_request();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_redemption_requests TO authenticated;
GRANT EXECUTE ON FUNCTION validate_redemption_request() TO authenticated;

-- Enable Row Level Security
ALTER TABLE loyalty_redemption_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Guests can view own redemption requests" ON loyalty_redemption_requests
    FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Guests can create own redemption requests" ON loyalty_redemption_requests
    FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Admins can view all redemption requests" ON loyalty_redemption_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert sample data for testing (optional)
INSERT INTO loyalty_redemption_requests (
    guest_id, 
    jewels_to_redeem, 
    redemption_reason, 
    contact_preference, 
    special_notes
) VALUES 
    ('00000000-0000-0000-0000-000000000001', 200, 'Discount on next villa booking', 'email', 'Prefer weekend stays'),
    ('00000000-0000-0000-0000-000000000002', 150, 'Special offer redemption', 'both', 'Available for any villa type');

-- Display success message
SELECT 'Loyalty Redemption Requests Schema Created Successfully!' as status;


