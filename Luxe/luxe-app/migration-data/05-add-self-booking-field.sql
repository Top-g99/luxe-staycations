-- Migration: Add self-booking field to host_bookings table
-- This allows hosts to book their own properties for themselves or guests

-- Add the is_self_booking column to host_bookings table
ALTER TABLE host_bookings 
ADD COLUMN IF NOT EXISTS is_self_booking BOOLEAN DEFAULT FALSE;

-- Add a comment to explain the field
COMMENT ON COLUMN host_bookings.is_self_booking IS 'Indicates if this booking was created by the host for themselves or their guests';

-- Update existing records to set is_self_booking to false (assuming they were external bookings)
UPDATE host_bookings 
SET is_self_booking = FALSE 
WHERE is_self_booking IS NULL;

-- Create an index for better query performance on self-bookings
CREATE INDEX IF NOT EXISTS idx_host_bookings_self_booking 
ON host_bookings(is_self_booking);

-- Add a view for easy access to self-bookings
CREATE OR REPLACE VIEW host_self_bookings AS
SELECT 
    hb.*,
    hp.name as property_name,
    hp.location as property_location,
    h.name as host_name
FROM host_bookings hb
JOIN host_properties hp ON hb.property_id = hp.id
JOIN hosts h ON hb.host_id = h.id
WHERE hb.is_self_booking = TRUE
ORDER BY hb.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON host_self_bookings TO authenticated;

-- Add RLS policy for self-bookings
CREATE POLICY "Users can view their own self-bookings" ON host_bookings
    FOR SELECT USING (
        auth.uid()::text = host_id::text OR 
        is_self_booking = TRUE
    );

-- Add RLS policy for creating self-bookings
CREATE POLICY "Hosts can create self-bookings" ON host_bookings
    FOR INSERT WITH CHECK (
        auth.uid()::text = host_id::text AND 
        is_self_booking = TRUE
    );

-- Add RLS policy for updating self-bookings
CREATE POLICY "Hosts can update their own self-bookings" ON host_bookings
    FOR UPDATE USING (
        auth.uid()::text = host_id::text AND 
        is_self_booking = TRUE
    );

-- Add RLS policy for deleting self-bookings
CREATE POLICY "Hosts can delete their own self-bookings" ON host_bookings
    FOR DELETE USING (
        auth.uid()::text = host_id::text AND 
        is_self_booking = TRUE
    );
