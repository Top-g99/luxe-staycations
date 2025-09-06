import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables for Supabase connection'
      }, { status: 500 });
    }

    const config = await request.json();
    
    // Validate required fields
    if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPassword) {
      return NextResponse.json({
        success: false,
        error: 'Missing required configuration fields'
      }, { status: 400 });
    }

    // Create Supabase client inside the function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // First, try to create the table if it doesn't exist
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
    } catch (tableError) {
      console.log('Table creation skipped (may already exist):', tableError);
    }

    // Save configuration to Supabase
    const { data, error } = await supabase
      .from('email_configurations_v2')
      .upsert({
        smtp_host: config.smtpHost,
        smtp_port: config.smtpPort,
        smtp_user: config.smtpUser,
        smtp_password: config.smtpPassword,
        enable_ssl: config.enableSSL,
        from_name: config.fromName,
        from_email: config.fromEmail,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving email configuration:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to save email configuration'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: data,
      message: 'Email configuration saved successfully'
    });

  } catch (error) {
    console.error('Error in save-config API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
