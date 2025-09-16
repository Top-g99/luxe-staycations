import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Contact form email request received:', data);

    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Send contact form notification to admin
    const emailResult = await emailService.sendEmail({
      to: 'info@luxestaycations.in',
      subject: `Contact Form: ${data.subject}`,
      content: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nSubject: ${data.subject}\nMessage: ${data.message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `
    });

    if (emailResult) {
      console.log('Contact form notification sent successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Contact form submitted successfully'
      });
    } else {
      console.error('Failed to send contact form notification');
      return NextResponse.json({ 
        success: false, 
        message: 'Contact form submission failed' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in contact form API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
