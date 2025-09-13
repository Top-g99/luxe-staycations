import { supabase, TABLES } from './supabase';

export interface EmailDatabaseSetup {
  success: boolean;
  message: string;
  tablesCreated: string[];
  errors: string[];
}

export async function setupEmailDatabase(): Promise<EmailDatabaseSetup> {
  const result: EmailDatabaseSetup = {
    success: true,
    message: 'Email database setup completed',
    tablesCreated: [],
    errors: []
  };

  if (!supabase) {
    result.success = false;
    result.message = 'Supabase client not initialized';
    result.errors.push('Supabase client not available');
    return result;
  }

  try {
    // Check and create email_configurations table
    await createEmailConfigurationsTable();
    result.tablesCreated.push('email_configurations');

    // Check and create email_templates table
    await createEmailTemplatesTable();
    result.tablesCreated.push('email_templates');

    // Check and create email_triggers table
    await createEmailTriggersTable();
    result.tablesCreated.push('email_triggers');

    // Check and create email_logs table
    await createEmailLogsTable();
    result.tablesCreated.push('email_logs');

    console.log('Email database setup completed successfully');
  } catch (error) {
    result.success = false;
    result.message = 'Error setting up email database';
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error('Error setting up email database:', error);
  }

  return result;
}

async function createEmailConfigurationsTable(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('create_email_configurations_table');
  if (error) {
    console.log('Email configurations table may already exist or error occurred:', error.message);
  }
}

async function createEmailTemplatesTable(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('create_email_templates_table');
  if (error) {
    console.log('Email templates table may already exist or error occurred:', error.message);
  }
}

async function createEmailTriggersTable(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('create_email_triggers_table');
  if (error) {
    console.log('Email triggers table may already exist or error occurred:', error.message);
  }
}

async function createEmailLogsTable(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('create_email_logs_table');
  if (error) {
    console.log('Email logs table may already exist or error occurred:', error.message);
  }
}

// SQL for creating email tables (to be run in Supabase SQL editor)
export const EMAIL_DATABASE_SQL = `
-- Email Configurations Table
CREATE TABLE IF NOT EXISTS email_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_user TEXT NOT NULL,
  smtp_password TEXT NOT NULL,
  enable_ssl BOOLEAN NOT NULL DEFAULT false,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Triggers Table
CREATE TABLE IF NOT EXISTS email_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table (if not exists)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_triggers_event_type ON email_triggers(event_type);
CREATE INDEX IF NOT EXISTS idx_email_triggers_active ON email_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);

-- Enable Row Level Security (RLS)
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to email_templates" ON email_templates FOR SELECT USING (true);
CREATE POLICY "Allow public read access to email_configurations" ON email_configurations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to email_triggers" ON email_triggers FOR SELECT USING (true);
CREATE POLICY "Allow public read access to email_logs" ON email_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to email_templates" ON email_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access to email_configurations" ON email_configurations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access to email_triggers" ON email_triggers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access to email_logs" ON email_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to email_templates" ON email_templates FOR UPDATE USING (true);
CREATE POLICY "Allow public update access to email_configurations" ON email_configurations FOR UPDATE USING (true);
CREATE POLICY "Allow public update access to email_triggers" ON email_triggers FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to email_templates" ON email_templates FOR DELETE USING (true);
CREATE POLICY "Allow public delete access to email_configurations" ON email_configurations FOR DELETE USING (true);
CREATE POLICY "Allow public delete access to email_triggers" ON email_triggers FOR DELETE USING (true);
CREATE POLICY "Allow public delete access to email_logs" ON email_logs FOR DELETE USING (true);

-- Bookings policies
CREATE POLICY "Allow public read access to bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to bookings" ON bookings FOR DELETE USING (true);
`;

// Function to check if email tables exist
export async function checkEmailTablesExist(): Promise<{
  email_configurations: boolean;
  email_templates: boolean;
  email_triggers: boolean;
  email_logs: boolean;
  bookings: boolean;
}> {
  const result = {
    email_configurations: false,
    email_templates: false,
    email_triggers: false,
    email_logs: false,
    bookings: false
  };

  if (!supabase) return result;

  try {
    // Check each table
    const { data: configs } = await supabase.from(TABLES.EMAIL_CONFIGURATIONS).select('id').limit(1);
    result.email_configurations = !!configs;

    const { data: templates } = await supabase.from(TABLES.EMAIL_TEMPLATES).select('id').limit(1);
    result.email_templates = !!templates;

    const { data: triggers } = await supabase.from(TABLES.EMAIL_TRIGGERS).select('id').limit(1);
    result.email_triggers = !!triggers;

    const { data: logs } = await supabase.from(TABLES.EMAIL_LOGS).select('id').limit(1);
    result.email_logs = !!logs;

    const { data: bookings } = await supabase.from(TABLES.BOOKINGS).select('id').limit(1);
    result.bookings = !!bookings;
  } catch (error) {
    console.error('Error checking email tables:', error);
  }

  return result;
}
