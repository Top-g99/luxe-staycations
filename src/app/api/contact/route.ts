import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Send contact form thank you email
    try {
      // Ensure email service is initialized
      await emailService.initialize();
      
      if (emailService.isConfigured) {
        const emailResult = await emailService.sendContactFormThankYou({
          name: body.name,
          email: body.email,
          phone: body.phone || '',
          subject: body.subject,
          message: body.message
        });

        if (emailResult.success) {
          console.log('Contact form thank you email sent successfully');
        } else {
          console.error('Failed to send contact form thank you email:', emailResult.message);
        }
      } else {
        console.log('Email service not configured, skipping contact form thank you email');
      }
    } catch (emailError) {
      console.error('Error sending contact form thank you email:', emailError);
      // Don't fail the contact form submission if email fails
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for contacting us! We will get back to you soon.' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
