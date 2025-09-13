-- Add unique constraint to destinations table to prevent duplicates
-- Run this in your Supabase SQL Editor

-- Add unique constraint on destination name
ALTER TABLE destinations ADD CONSTRAINT destinations_name_unique UNIQUE (name);

-- Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_type
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'destinations' 
    AND tc.constraint_type = 'UNIQUE';

-- Test the constraint by trying to insert a duplicate (this should fail)
-- INSERT INTO destinations (name, description, image, featured) 
-- VALUES ('Goa, India', 'Test duplicate', 'https://example.com/test.jpg', false);






