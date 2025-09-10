-- Brevo Configuration Migration
-- This migration creates the brevo_configurations table for storing Brevo API settings

CREATE OR REPLACE FUNCTION create_brevo_configurations_table()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Create brevo_configurations table
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

  -- Add constraints
  ALTER TABLE brevo_configurations 
  ADD CONSTRAINT check_sender_email_format 
  CHECK (sender_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

  ALTER TABLE brevo_configurations 
  ADD CONSTRAINT check_reply_to_email_format 
  CHECK (reply_to_email IS NULL OR reply_to_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

  ALTER TABLE brevo_configurations 
  ADD CONSTRAINT check_api_key_format 
  CHECK (api_key ~* '^xkeys-[a-zA-Z0-9]{32,}$');

  -- Add indexes for performance
  CREATE INDEX IF NOT EXISTS idx_brevo_configurations_active ON brevo_configurations (is_active);
  CREATE INDEX IF NOT EXISTS idx_brevo_configurations_created_at ON brevo_configurations (created_at DESC);

  -- Add RLS (Row Level Security) policies
  ALTER TABLE brevo_configurations ENABLE ROW LEVEL SECURITY;

  -- Policy for authenticated users to read configurations
  CREATE POLICY "Allow authenticated users to read brevo configurations" ON brevo_configurations
    FOR SELECT USING (auth.role() = 'authenticated');

  -- Policy for authenticated users to insert configurations
  CREATE POLICY "Allow authenticated users to insert brevo configurations" ON brevo_configurations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

  -- Policy for authenticated users to update configurations
  CREATE POLICY "Allow authenticated users to update brevo configurations" ON brevo_configurations
    FOR UPDATE USING (auth.role() = 'authenticated');

  -- Policy for authenticated users to delete configurations
  CREATE POLICY "Allow authenticated users to delete brevo configurations" ON brevo_configurations
    FOR DELETE USING (auth.role() = 'authenticated');

  -- Create trigger for updated_at
  CREATE OR REPLACE FUNCTION update_brevo_configurations_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trigger_update_brevo_configurations_updated_at
    BEFORE UPDATE ON brevo_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_brevo_configurations_updated_at();

  -- Insert default configuration (inactive)
  INSERT INTO brevo_configurations (
    api_key,
    sender_email,
    sender_name,
    reply_to_email,
    is_active
  ) VALUES (
    'xkeys-placeholder-key-replace-with-actual-key',
    'noreply@luxestaycations.in',
    'Luxe Staycations',
    'support@luxestaycations.in',
    false
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'brevo_configurations table created successfully';
END;
$$;

-- Execute the function
SELECT create_brevo_configurations_table();

-- Grant necessary permissions
GRANT ALL ON brevo_configurations TO authenticated;
GRANT ALL ON brevo_configurations TO service_role;
