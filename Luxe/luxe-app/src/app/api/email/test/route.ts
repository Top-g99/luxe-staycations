import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Test email request received:', data);

    // Validate required fields
    if (!data.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required field: email' 
      }, { status: 400 });
    }

    // Send test email
    const emailResult = await emailService.sendTestEmail(data.email);

    if (emailResult.success) {
      console.log('Test email sent successfully:', emailResult.messageId);
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      console.error('Failed to send test email:', emailResult.error);
      return NextResponse.json({ 
        success: false, 
        message: `Test email failed: ${emailResult.error}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in test email API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
