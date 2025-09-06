// Email System Initialization Script
// Run this to set up the complete email system with default templates and triggers

import { getSupabaseClient } from '../supabase';
import { emailService } from './EmailService';
import { emailTemplateManager } from './EmailTemplateManager';
import { emailTriggerManager } from './EmailTriggerManager';

export async function initializeEmailSystem(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 Starting Email System Initialization...');

    // Step 1: Initialize core services
    console.log('📧 Initializing email services...');
    const emailInitialized = await emailService.initialize();
    if (!emailInitialized) {
      return { success: false, message: 'Failed to initialize email service' };
    }

    // Step 2: Run database migration
    console.log('🗄️ Running database migration...');
    await runEmailSystemMigration();

    // Step 3: Initialize default templates
    console.log('📝 Creating default email templates...');
    await emailTemplateManager.initializeDefaultTemplates();

    // Step 4: Initialize default triggers
    console.log('⚡ Setting up email triggers...');
    await emailTriggerManager.initializeDefaultTriggers();

    // Step 5: Test the system
    console.log('🧪 Testing email system...');
    const testResult = await emailService.testConnection();
    if (!testResult.success) {
      console.warn('⚠️ Email connection test failed:', testResult.message);
    }

    console.log('✅ Email System Initialization Complete!');
    return { 
      success: true, 
      message: 'Email system initialized successfully with templates and triggers' 
    };

  } catch (error) {
    console.error('❌ Email System Initialization Failed:', error);
    return { 
      success: false, 
      message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

async function runEmailSystemMigration(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // Read the migration SQL file
    const migrationSQL = `
      -- Create email_logs table
      CREATE TABLE IF NOT EXISTS email_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          to_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          template_id UUID REFERENCES email_templates(id),
          variables JSONB DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
          message_id TEXT,
          error_message TEXT,
          attempt_count INTEGER DEFAULT 0,
          sent_at TIMESTAMP WITH TIME ZONE,
          delivered_at TIMESTAMP WITH TIME ZONE,
          opened_at TIMESTAMP WITH TIME ZONE,
          clicked_at TIMESTAMP WITH TIME ZONE,
          bounced_at TIMESTAMP WITH TIME ZONE,
          failed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create email_triggers table
      CREATE TABLE IF NOT EXISTS email_triggers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          event TEXT NOT NULL,
          template_id UUID NOT NULL REFERENCES email_templates(id),
          conditions JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          delay INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create email_analytics table
      CREATE TABLE IF NOT EXISTS email_analytics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          date DATE NOT NULL,
          period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month', 'year')),
          total_sent INTEGER DEFAULT 0,
          total_delivered INTEGER DEFAULT 0,
          total_opened INTEGER DEFAULT 0,
          total_clicked INTEGER DEFAULT 0,
          total_bounced INTEGER DEFAULT 0,
          total_failed INTEGER DEFAULT 0,
          delivery_rate DECIMAL(5,2) DEFAULT 0,
          open_rate DECIMAL(5,2) DEFAULT 0,
          click_rate DECIMAL(5,2) DEFAULT 0,
          bounce_rate DECIMAL(5,2) DEFAULT 0,
          failure_rate DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(date, period)
      );

      -- Create email_queue table
      CREATE TABLE IF NOT EXISTS email_queue (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          to_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          html_content TEXT,
          text_content TEXT,
          template_id UUID REFERENCES email_templates(id),
          variables JSONB DEFAULT '{}',
          priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          max_retries INTEGER DEFAULT 3,
          retry_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
      CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);
      CREATE INDEX IF NOT EXISTS idx_email_triggers_event ON email_triggers(event);
      CREATE INDEX IF NOT EXISTS idx_email_triggers_active ON email_triggers(is_active);
      CREATE INDEX IF NOT EXISTS idx_email_triggers_priority ON email_triggers(priority);
      CREATE INDEX IF NOT EXISTS idx_email_analytics_date ON email_analytics(date);
      CREATE INDEX IF NOT EXISTS idx_email_analytics_period ON email_analytics(period);
      CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
      CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
      CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at);

      -- Enable RLS
      ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE email_triggers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
      ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON email_logs
          FOR ALL TO authenticated USING (true);
      CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON email_triggers
          FOR ALL TO authenticated USING (true);
      CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON email_analytics
          FOR ALL TO authenticated USING (true);
      CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users" ON email_queue
          FOR ALL TO authenticated USING (true);
    `;

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      // Try alternative approach - create tables individually
      await createTablesIndividually();
    }

    console.log('✅ Database migration completed');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}

async function createTablesIndividually(): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Create tables one by one
  const tables = [
    {
      name: 'email_logs',
      sql: `
        CREATE TABLE IF NOT EXISTS email_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            to_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            template_id UUID REFERENCES email_templates(id),
            variables JSONB DEFAULT '{}',
            status TEXT NOT NULL DEFAULT 'pending',
            message_id TEXT,
            error_message TEXT,
            attempt_count INTEGER DEFAULT 0,
            sent_at TIMESTAMP WITH TIME ZONE,
            delivered_at TIMESTAMP WITH TIME ZONE,
            opened_at TIMESTAMP WITH TIME ZONE,
            clicked_at TIMESTAMP WITH TIME ZONE,
            bounced_at TIMESTAMP WITH TIME ZONE,
            failed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'email_triggers',
      sql: `
        CREATE TABLE IF NOT EXISTS email_triggers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            event TEXT NOT NULL,
            template_id UUID NOT NULL REFERENCES email_templates(id),
            conditions JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            priority TEXT DEFAULT 'normal',
            delay INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'email_analytics',
      sql: `
        CREATE TABLE IF NOT EXISTS email_analytics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            date DATE NOT NULL,
            period TEXT NOT NULL,
            total_sent INTEGER DEFAULT 0,
            total_delivered INTEGER DEFAULT 0,
            total_opened INTEGER DEFAULT 0,
            total_clicked INTEGER DEFAULT 0,
            total_bounced INTEGER DEFAULT 0,
            total_failed INTEGER DEFAULT 0,
            delivery_rate DECIMAL(5,2) DEFAULT 0,
            open_rate DECIMAL(5,2) DEFAULT 0,
            click_rate DECIMAL(5,2) DEFAULT 0,
            bounce_rate DECIMAL(5,2) DEFAULT 0,
            failure_rate DECIMAL(5,2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(date, period)
        );
      `
    },
    {
      name: 'email_queue',
      sql: `
        CREATE TABLE IF NOT EXISTS email_queue (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            to_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            html_content TEXT,
            text_content TEXT,
            template_id UUID REFERENCES email_templates(id),
            variables JSONB DEFAULT '{}',
            priority TEXT DEFAULT 'normal',
            scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            max_retries INTEGER DEFAULT 3,
            retry_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.error(`Error creating table ${table.name}:`, error);
      } else {
        console.log(`✅ Created table: ${table.name}`);
      }
    } catch (error) {
      console.error(`Error creating table ${table.name}:`, error);
    }
  }
}

// Export the initialization function
export default initializeEmailSystem;
