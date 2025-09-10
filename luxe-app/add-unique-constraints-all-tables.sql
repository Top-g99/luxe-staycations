-- Add unique constraints to ALL tables to prevent duplicates
-- Run this in your Supabase SQL Editor

-- 1. Destinations Table - Unique constraint on name
ALTER TABLE destinations ADD CONSTRAINT destinations_name_unique UNIQUE (name);

-- 2. Properties Table - Unique constraint on name + location combination
ALTER TABLE properties ADD CONSTRAINT properties_name_location_unique UNIQUE (name, location);

-- 3. Bookings Table - Unique constraint on guest_email + check_in + check_out + property_id
ALTER TABLE bookings ADD CONSTRAINT bookings_guest_dates_property_unique UNIQUE (guest_email, check_in, check_out, property_id);

-- 4. Deal Banner Table - Unique constraint on title (assuming only one active deal banner)
ALTER TABLE deal_banner ADD CONSTRAINT deal_banner_title_unique UNIQUE (title);

-- 5. Callback Requests Table - Unique constraint on phone + created_at (within 1 hour)
-- This prevents duplicate callback requests from the same phone number within a short time
CREATE UNIQUE INDEX callback_requests_phone_time_unique 
ON callback_requests (phone, DATE_TRUNC('hour', created_at));

-- 6. Special Requests Table - Unique constraint on booking_id + description
ALTER TABLE special_requests ADD CONSTRAINT special_requests_booking_description_unique UNIQUE (booking_id, description);

-- 7. Consultation Requests Table - Unique constraint on email + created_at (within 1 day)
CREATE UNIQUE INDEX consultation_requests_email_time_unique 
ON consultation_requests (email, DATE_TRUNC('day', created_at));

-- 8. Partner Applications Table - Unique constraint on email + company_name
ALTER TABLE partner_applications ADD CONSTRAINT partner_applications_email_company_unique UNIQUE (email, company_name);

-- Verify all constraints were added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name;

-- Test the constraints by trying to insert duplicates (these should all fail)
-- Uncomment the lines below to test:

-- Test destinations duplicate
-- INSERT INTO destinations (name, description, image, featured) 
-- VALUES ('Goa, India', 'Test duplicate', 'https://example.com/test.jpg', false);

-- Test properties duplicate
-- INSERT INTO properties (name, location, description, price, image) 
-- VALUES ('Test Villa', 'Goa, India', 'Test duplicate', 1000, 'https://example.com/test.jpg');

-- Test bookings duplicate
-- INSERT INTO bookings (guest_email, check_in, check_out, property_id, guest_info, booking_details, status) 
-- VALUES ('test@example.com', '2024-01-01', '2024-01-03', 'existing-property-id', '{}', '{}', 'confirmed');

-- Test deal banner duplicate
-- INSERT INTO deal_banner (title, description, image, video_url, active) 
-- VALUES ('Test Deal', 'Test duplicate', 'https://example.com/test.jpg', 'https://example.com/test.mp4', true);

-- Test callback requests duplicate (within same hour)
-- INSERT INTO callback_requests (name, phone, preferred_time, status) 
-- VALUES ('Test User', '+1234567890', 'morning', 'pending');

-- Test special requests duplicate
-- INSERT INTO special_requests (booking_id, title, description, status, priority) 
-- VALUES ('existing-booking-id', 'Test Request', 'Test duplicate', 'pending', 'medium');

-- Test consultation requests duplicate (within same day)
-- INSERT INTO consultation_requests (name, email, phone, message, status) 
-- VALUES ('Test User', 'test@example.com', '+1234567890', 'Test duplicate', 'pending');

-- Test partner applications duplicate
-- INSERT INTO partner_applications (name, email, company_name, message, status) 
-- VALUES ('Test User', 'test@example.com', 'Test Company', 'Test duplicate', 'pending');






