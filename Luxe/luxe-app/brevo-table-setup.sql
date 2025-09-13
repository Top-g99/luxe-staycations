-- Brevo Configurations Table Setup
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS brevo_configurations (
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
CREATE INDEX IF NOT EXISTS idx_brevo_configurations_active 
ON brevo_configurations(is_active) 
WHERE is_active = true;

-- Insert a sample configuration (replace with your actual values)
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
) ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT * FROM brevo_configurations;
