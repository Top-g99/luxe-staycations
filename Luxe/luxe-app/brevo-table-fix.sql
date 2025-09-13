-- Brevo Table Fix - Run this in Supabase SQL Editor
-- This will create the table and refresh the schema cache

-- Drop table if it exists (to ensure clean creation)
DROP TABLE IF EXISTS brevo_configurations CASCADE;

-- Create the table
CREATE TABLE brevo_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  reply_to_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for active configurations
CREATE INDEX idx_brevo_configurations_active 
ON brevo_configurations(is_active) 
WHERE is_active = true;

-- Insert a sample configuration
INSERT INTO brevo_configurations (
  api_key, 
  sender_email, 
  sender_name, 
  reply_to_email, 
  is_active
) VALUES (
  'your-brevo-api-key-here',
  'info@luxestaycations.in',
  'Luxe Staycations',
  'info@luxestaycations.in',
  true
);

-- Verify the table was created and accessible
SELECT 
  'Table created successfully' as status,
  COUNT(*) as record_count 
FROM brevo_configurations;

-- This should show the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'brevo_configurations' 
ORDER BY ordinal_position;
