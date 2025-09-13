-- Brevo Workflows Migration
-- This migration creates the brevo_workflow_logs table for tracking automated email sequences

CREATE OR REPLACE FUNCTION create_brevo_workflow_logs_table()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Create brevo_workflow_logs table
  CREATE TABLE IF NOT EXISTS brevo_workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add constraints
  ALTER TABLE brevo_workflow_logs 
  ADD CONSTRAINT check_workflow_type 
  CHECK (workflow_type IN (
    'booking_confirmation', 
    'pre_arrival_reminder', 
    'post_stay_followup',
    'loyalty_welcome',
    'tier_upgrade',
    'newsletter_campaign',
    'abandoned_booking',
    'seasonal_promotion'
  ));

  ALTER TABLE brevo_workflow_logs 
  ADD CONSTRAINT check_recipient_email_format 
  CHECK (recipient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

  -- Add indexes for performance
  CREATE INDEX IF NOT EXISTS idx_brevo_workflow_logs_type ON brevo_workflow_logs (workflow_type);
  CREATE INDEX IF NOT EXISTS idx_brevo_workflow_logs_email ON brevo_workflow_logs (recipient_email);
  CREATE INDEX IF NOT EXISTS idx_brevo_workflow_logs_triggered_at ON brevo_workflow_logs (triggered_at DESC);
  CREATE INDEX IF NOT EXISTS idx_brevo_workflow_logs_success ON brevo_workflow_logs (success);

  -- Add RLS (Row Level Security) policies
  ALTER TABLE brevo_workflow_logs ENABLE ROW LEVEL SECURITY;

  -- Policy for authenticated users to read workflow logs
  CREATE POLICY "Allow authenticated users to read brevo workflow logs" ON brevo_workflow_logs
    FOR SELECT USING (auth.role() = 'authenticated');

  -- Policy for authenticated users to insert workflow logs
  CREATE POLICY "Allow authenticated users to insert brevo workflow logs" ON brevo_workflow_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

  -- Policy for authenticated users to update workflow logs
  CREATE POLICY "Allow authenticated users to update brevo workflow logs" ON brevo_workflow_logs
    FOR UPDATE USING (auth.role() = 'authenticated');

  -- Create trigger for created_at
  CREATE OR REPLACE FUNCTION update_brevo_workflow_logs_created_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trigger_update_brevo_workflow_logs_created_at
    BEFORE INSERT ON brevo_workflow_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_brevo_workflow_logs_created_at();

  RAISE NOTICE 'brevo_workflow_logs table created successfully';
END;
$$;

-- Execute the function
SELECT create_brevo_workflow_logs_table();

-- Grant necessary permissions
GRANT ALL ON brevo_workflow_logs TO authenticated;
GRANT ALL ON brevo_workflow_logs TO service_role;

