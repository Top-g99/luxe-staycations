import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/EmailService';

export async function POST(request: NextRequest) {
  try {
    // Initialize the email service
    const initialized = await emailService.initialize();
    if (!initialized) {
      return NextResponse.json(
        { success: false, message: 'Failed to initialize email service' },
        { status: 500 }
      );
    }

    // Test connection
    const result = await emailService.testConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      config: emailService.getConfig() ? {
        smtpHost: emailService.getConfig()?.smtpHost,
        smtpPort: emailService.getConfig()?.smtpPort,
        enableSSL: emailService.getConfig()?.enableSSL,
        fromEmail: emailService.getConfig()?.fromEmail
      } : null
    });

  } catch (error) {
    console.error('Error testing email connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
