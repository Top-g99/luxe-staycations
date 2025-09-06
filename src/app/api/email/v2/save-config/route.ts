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
