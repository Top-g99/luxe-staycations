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

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Create email_configurations_v2 table
    const { error: configError } = await supabase.rpc('exec_sql', {
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

    if (configError) {
      console.error('Error creating email_configurations_v2 table:', configError);
    }

    // Create email_templates_v2 table
    const { error: templatesError } = await supabase.rpc('exec_sql', {
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

    if (templatesError) {
      console.error('Error creating email_templates_v2 table:', templatesError);
    }

    // Insert default email configuration
    const { error: insertConfigError } = await supabase
      .from('email_configurations_v2')
      .upsert({
        smtp_host: 'smtp.hostinger.com',
        smtp_port: 587,
        smtp_user: 'info@luxestaycations.in',
        smtp_password: '',
        enable_ssl: false,
        from_name: 'Luxe Staycations',
        from_email: 'info@luxestaycations.in',
        is_active: false
      });

    if (insertConfigError) {
      console.error('Error inserting default configuration:', insertConfigError);
    }

    // Insert default email templates
    const defaultTemplates = [
      {
        name: 'Booking Confirmation',
        type: 'booking_confirmation',
        subject: 'Booking Confirmed - {{propertyName}}',
        html_content: '<h1>Booking Confirmed!</h1><p>Dear {{guestName}}, your booking for {{propertyName}} has been confirmed.</p>',
        text_content: 'Booking Confirmed! Dear {{guestName}}, your booking for {{propertyName}} has been confirmed.',
        is_active: true,
        is_default: true
      },
      {
        name: 'Booking Cancellation',
        type: 'booking_cancellation',
        subject: 'Booking Cancelled - {{propertyName}}',
        html_content: '<h1>Booking Cancelled</h1><p>Dear {{guestName}}, your booking for {{propertyName}} has been cancelled.</p>',
        text_content: 'Booking Cancelled. Dear {{guestName}}, your booking for {{propertyName}} has been cancelled.',
        is_active: true,
        is_default: true
      },
      {
        name: 'Partner Request Confirmation',
        type: 'partner_request',
        subject: 'Partnership Application Received',
        html_content: '<h1>Partnership Application Received</h1><p>Thank you {{contactName}} for your partnership application.</p>',
        text_content: 'Partnership Application Received. Thank you {{contactName}} for your partnership application.',
        is_active: true,
        is_default: true
      },
      {
        name: 'Consultation Request',
        type: 'consultation_request',
        subject: 'Consultation Request Received',
        html_content: '<h1>Consultation Request Received</h1><p>Thank you {{name}} for your consultation request.</p>',
        text_content: 'Consultation Request Received. Thank you {{name}} for your consultation request.',
        is_active: true,
        is_default: true
      },
      {
        name: 'Contact Form Thank You',
        type: 'contact_form',
        subject: 'Thank You for Your Message',
        html_content: '<h1>Thank You for Your Message</h1><p>Dear {{name}}, thank you for contacting us. We will get back to you soon.</p>',
        text_content: 'Thank You for Your Message. Dear {{name}}, thank you for contacting us. We will get back to you soon.',
        is_active: true,
        is_default: true
      },
      {
        name: 'Loyalty Points Earned',
        type: 'loyalty_points',
        subject: 'You Earned {{points}} Loyalty Points!',
        html_content: '<h1>You Earned {{points}} Loyalty Points!</h1><p>Dear {{userName}}, you have earned {{points}} loyalty points.</p>',
        text_content: 'You Earned {{points}} Loyalty Points! Dear {{userName}}, you have earned {{points}} loyalty points.',
        is_active: true,
        is_default: true
      }
    ];

    const { error: insertTemplatesError } = await supabase
      .from('email_templates_v2')
      .upsert(defaultTemplates);

    if (insertTemplatesError) {
      console.error('Error inserting default templates:', insertTemplatesError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email system tables created successfully',
      errors: {
        configError: configError?.message,
        templatesError: templatesError?.message,
        insertConfigError: insertConfigError?.message,
        insertTemplatesError: insertTemplatesError?.message
      }
    });

  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json({
      success: false,
      error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
