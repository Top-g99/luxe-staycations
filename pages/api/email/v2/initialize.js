import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting email system initialization...');
    
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return res.status(500).json({
        success: false,
        message: 'Missing required environment variables for Supabase connection',
        timestamp: new Date().toISOString()
      });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // First, try to create the tables if they don't exist
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS email_configurations_v2 (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            smtp_host TEXT NOT NULL,
            smtp_port INTEGER NOT NULL,
            smtp_user TEXT NOT NULL,
            smtp_password TEXT NOT NULL,
            enable_ssl BOOLEAN DEFAULT false,
            from_name TEXT NOT NULL,
            from_email TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS email_templates_v2 (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            subject TEXT NOT NULL,
            html_content TEXT NOT NULL,
            text_content TEXT,
            variables JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT true,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
    } catch (tableError) {
      console.log('Table creation skipped (may already exist):', tableError);
    }
    
    // Check if email system is already initialized
    const { data: configData, error: configError } = await supabase
      .from('email_configurations_v2')
      .select('*')
      .eq('is_active', true)
      .single();

    const { data: templatesData, error: templatesError } = await supabase
      .from('email_templates_v2')
      .select('*')
      .eq('is_active', true);

    const { data: triggersData, error: triggersError } = await supabase
      .from('email_triggers')
      .select('*')
      .eq('is_active', true);

    if (configError && configError.code !== 'PGRST116') {
      console.error('Error fetching email configuration:', configError);
    }

    if (templatesError) {
      console.error('Error fetching email templates:', templatesError);
    }

    if (triggersError) {
      console.error('Error fetching email triggers:', triggersError);
    }

    return res.status(200).json({
      success: true,
      message: 'Email system initialized successfully',
      config: configData,
      templates: templatesData || [],
      triggers: triggersData || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email system initialization failed:', error);
    return res.status(500).json({
      success: false,
      message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
}
