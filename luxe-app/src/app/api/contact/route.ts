import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { callbackManager } from '@/lib/dataManager';

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
        // Use delivery tracking service for better monitoring
        const { emailDeliveryService } = await import('@/lib/emailDeliveryService');
        const emailResult = await emailDeliveryService.sendContactFormThankYouWithTracking({
          name: body.name,
          email: body.email,
          phone: body.phone || '',
          subject: body.subject,
          message: body.message
        });

        if (emailResult.success) {
          console.log('Contact form thank you email sent successfully');
        } else {
          console.error('Failed to send contact form thank you email:', emailResult.error);
        }
      } else {
        console.log('Email service not configured, skipping contact form thank you email');
      }
    } catch (emailError) {
      console.error('Error sending contact form thank you email:', emailError);
      // Don't fail the contact form submission if email fails
    }

    // Save contact form submission to Supabase
    try {
      await callbackManager.initialize();
      await callbackManager.create({
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        message: `Contact Form: ${body.subject}\n\n${body.message}`,
        status: 'pending'
      });
      console.log('Contact form submission saved to Supabase successfully');
    } catch (saveError) {
      console.error('Error saving contact form submission to Supabase:', saveError);
      // Don't fail the request if saving fails
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
