-- Special Requests Management Migration
-- This migration creates the special_requests table for managing guest special requests

-- Create special_requests table
CREATE TABLE IF NOT EXISTS special_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_special_requests_booking_id ON special_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_special_requests_guest_email ON special_requests(guest_email);
CREATE INDEX IF NOT EXISTS idx_special_requests_status ON special_requests(status);
CREATE INDEX IF NOT EXISTS idx_special_requests_priority ON special_requests(priority);
CREATE INDEX IF NOT EXISTS idx_special_requests_created_at ON special_requests(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_special_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_special_requests_updated_at
    BEFORE UPDATE ON special_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_special_requests_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE special_requests ENABLE ROW LEVEL SECURITY;

-- Policy for guests to view their own requests
CREATE POLICY "Guests can view their own special requests" ON special_requests
    FOR SELECT USING (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy for guests to insert their own requests
CREATE POLICY "Guests can create their own special requests" ON special_requests
    FOR INSERT WITH CHECK (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy for guests to update their own requests (limited fields)
CREATE POLICY "Guests can update their own special requests" ON special_requests
    FOR UPDATE USING (guest_email = current_setting('request.jwt.claims', true)::json->>'email')
    WITH CHECK (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy for admins to view all requests
CREATE POLICY "Admins can view all special requests" ON special_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND is_active = true
        )
    );

-- Policy for admins to update all requests
CREATE POLICY "Admins can update all special requests" ON special_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND is_active = true
        )
    );

-- Policy for admins to delete all requests
CREATE POLICY "Admins can delete all special requests" ON special_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND is_active = true
        )
    );

-- Insert sample data (optional - for testing)
INSERT INTO special_requests (
    booking_id, 
    guest_email, 
    guest_name, 
    category, 
    title, 
    description, 
    priority, 
    status
) VALUES (
    'sample_booking_123',
    'guest@example.com',
    'John Doe',
    'food-preferences',
    'Vegetarian Meals',
    'Please provide vegetarian meal options for all meals during the stay',
    'medium',
    'pending'
) ON CONFLICT DO NOTHING;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW admin_special_requests_view AS
SELECT 
    sr.*,
    b.property_name,
    b.check_in_date,
    b.check_out_date,
    b.guest_name as booking_guest_name,
    b.guest_email as booking_guest_email
FROM special_requests sr
LEFT JOIN bookings b ON sr.booking_id = b.id
ORDER BY sr.created_at DESC;

-- Grant permissions
GRANT SELECT ON admin_special_requests_view TO authenticated;
GRANT ALL ON special_requests TO authenticated;

