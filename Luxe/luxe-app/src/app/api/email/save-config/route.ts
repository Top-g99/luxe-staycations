import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration is required' 
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'fromEmail'];
    for (const field of requiredFields) {
      if (!config[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} is required` 
          },
          { status: 400 }
        );
      }
    }

    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection not available' 
        },
        { status: 500 }
      );
    }

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from(TABLES.EMAIL_CONFIGURATIONS)
      .select('id')
      .limit(1);

    const configData = {
      smtp_host: config.smtpHost,
      smtp_port: config.smtpPort,
      smtp_user: config.smtpUser,
      smtp_password: config.smtpPassword, // In production, this should be encrypted
      enable_ssl: config.enableSSL,
      from_name: config.fromName,
      from_email: config.fromEmail,
      is_active: config.isActive,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingConfig && existingConfig.length > 0) {
      // Update existing configuration
      result = await supabase
        .from(TABLES.EMAIL_CONFIGURATIONS)
        .update(configData)
        .eq('id', existingConfig[0].id)
        .select();
    } else {
      // Create new configuration
      result = await supabase
        .from(TABLES.EMAIL_CONFIGURATIONS)
        .insert([{
          ...configData,
          created_at: new Date().toISOString()
        }])
        .select();
    }

    if (result.error) {
      console.error('Error saving email configuration:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save email configuration' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data[0],
      message: 'Email configuration saved successfully'
    });

  } catch (error) {
    console.error('Error saving email configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save email configuration' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection not available' 
        },
        { status: 500 }
      );
    }

    // Get the latest email configuration
    const { data, error } = await supabase
      .from(TABLES.EMAIL_CONFIGURATIONS)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching email configuration:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch email configuration' 
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No email configuration found'
      });
    }

    // Convert database format to frontend format
    const config = data[0];
    const frontendConfig = {
      smtpHost: config.smtp_host,
      smtpPort: config.smtp_port,
      smtpUser: config.smtp_user,
      smtpPassword: config.smtp_password,
      enableSSL: config.enable_ssl,
      fromName: config.from_name,
      fromEmail: config.from_email,
      isActive: config.is_active,
      createdAt: config.created_at,
      updatedAt: config.updated_at
    };

    return NextResponse.json({
      success: true,
      data: frontendConfig
    });

  } catch (error) {
    console.error('Error fetching email configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch email configuration' 
      },
      { status: 500 }
    );
  }
}
