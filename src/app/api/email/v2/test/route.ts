import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/EmailService';

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Initialize the email service
    const initialized = await emailService.initialize();
    if (!initialized) {
      return NextResponse.json(
        { success: false, message: 'Failed to initialize email service' },
        { status: 500 }
      );
    }

    // Send test email
    const result = await emailService.sendTestEmail(testEmail);
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Enhanced test email sent successfully to ${testEmail}! Check your inbox.`
        : `Failed to send test email: ${result.error}`,
      messageId: result.messageId,
      logId: result.logId
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
