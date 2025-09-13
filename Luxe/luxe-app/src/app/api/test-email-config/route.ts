import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing email configuration...');
    
    // Check if email service is configured
    const isConfigured = emailService.isConfigured;
    const config = emailService.getConfig();
    
    console.log('Email service configured:', isConfigured);
    console.log('Email config:', config ? {
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      enableSSL: config.enableSSL
    } : 'No config');
    
    return NextResponse.json({
      success: true,
      isConfigured,
      hasConfig: !!config,
      config: config ? {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        enableSSL: config.enableSSL
      } : null
    });
  } catch (error: any) {
    console.error('Error testing email config:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

