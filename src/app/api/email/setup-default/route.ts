import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const results = {
      configurations: 0,
      templates: 0,
      errors: [] as string[]
    };

    // Setup 1: Create default email configuration
    try {
      // Check if configuration already exists
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
      }
      const { data: existingConfigs } = await supabase
        .from('email_configurations')
        .select('id')
        .limit(1);

      if (!existingConfigs || existingConfigs.length === 0) {
        const { error: configError } = await supabase
          .from('email_configurations')
          .insert([{
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            smtp_user: 'your-email@gmail.com',
            smtp_password: 'your-app-password',
            enable_ssl: false,
            from_name: 'Luxe Staycations',
            from_email: 'info@luxestaycations.in',
            is_active: false, // User must configure this
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (configError) {
          results.errors.push(`Configuration setup failed: ${configError.message}`);
        } else {
          results.configurations = 1;
        }
      }
    } catch (error) {
      results.errors.push(`Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Setup 2: Create default email templates
    try {
      // Check if templates already exist
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
      }
      const { data: existingTemplates } = await supabase
        .from('email_templates')
        .select('id')
        .limit(1);

      if (!existingTemplates || existingTemplates.length === 0) {
        const defaultTemplates = [
          {
            name: 'Booking Confirmation',
            type: 'booking_confirmation',
            subject: '🎉 Booking Confirmed - {{bookingId}} | Luxe Staycations',
            html_content: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Booking Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Luxe Staycations</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #8B4513; margin-top: 0;">Booking Details</h2>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Booking ID:</strong> {{bookingId}}</p>
                    <p><strong>Property:</strong> {{propertyName}}</p>
                    <p><strong>Location:</strong> {{propertyLocation}}</p>
                    <p><strong>Check-in:</strong> {{checkIn}}</p>
                    <p><strong>Check-out:</strong> {{checkOut}}</p>
                    <p><strong>Guests:</strong> {{guests}}</p>
                    <p><strong>Total Amount:</strong> {{totalAmount}}</p>
                  </div>
                  
                  <h3 style="color: #8B4513;">What's Next?</h3>
                  <ul>
                    <li>You will receive a detailed itinerary 24 hours before your check-in</li>
                    <li>Our team will contact you to confirm your arrival time</li>
                    <li>Any special requests will be arranged prior to your stay</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:info@luxestaycations.in" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Us</a>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                  <p>Luxe Staycations - Premium Villa Rentals</p>
                  <p>Email: info@luxestaycations.in | Phone: +91-8828279739</p>
                </div>
              </body>
              </html>
            `,
            text_content: `Booking Confirmed - {{bookingId}}

Dear {{guestName}},

Thank you for choosing Luxe Staycations! Your booking has been confirmed.

Booking Details:
- Booking ID: {{bookingId}}
- Property: {{propertyName}}
- Location: {{propertyLocation}}
- Check-in: {{checkIn}}
- Check-out: {{checkOut}}
- Guests: {{guests}}
- Total Amount: {{totalAmount}}

What's Next?
- You will receive a detailed itinerary 24 hours before your check-in
- Our team will contact you to confirm your arrival time
- Any special requests will be arranged prior to your stay

Contact us at info@luxestaycations.in or +91-8828279739

Best regards,
Luxe Staycations Team`,
            variables: ['guestName', 'bookingId', 'propertyName', 'propertyLocation', 'checkIn', 'checkOut', 'guests', 'totalAmount'],
            is_active: true,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            name: 'Contact Form Thank You',
            type: 'contact_form',
            subject: '🙏 Thank You for Contacting Us - {{subject}} | Luxe Staycations',
            html_content: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Thank You for Contacting Us</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">🙏 Thank You for Contacting Us!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px;">We appreciate your interest in Luxe Staycations</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #8B4513; margin-top: 0;">Your Message Details</h2>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> {{name}}</p>
                    <p><strong>Email:</strong> {{email}}</p>
                    <p><strong>Phone:</strong> {{phone}}</p>
                    <p><strong>Subject:</strong> {{subject}}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">{{message}}</div>
                  </div>
                  
                  <h3 style="color: #8B4513;">What Happens Next?</h3>
                  <ul style="margin: 20px 0; padding-left: 20px;">
                    <li>Our travel specialists will review your inquiry within 24 hours</li>
                    <li>We will contact you to discuss your travel preferences and villa requirements</li>
                    <li>We will provide personalized recommendations based on your needs</li>
                    <li>We will assist you in finding the perfect villa for your stay</li>
                    <li>We will help you plan your entire travel experience</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:info@luxestaycations.in" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Contact Our Travel Specialists</a>
                    <a href="https://luxestaycations.in/villas" style="background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Browse Our Villas</a>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                  <p>Luxe Staycations - Premium Villa Rentals & Travel Planning</p>
                  <p>Email: info@luxestaycations.in | Phone: +91-8828279739</p>
                </div>
              </body>
              </html>
            `,
            text_content: `Thank You for Contacting Us - {{subject}}

Dear {{name}},

Thank you for reaching out to Luxe Staycations! We appreciate your interest in our luxury villa rentals and travel planning services.

Your Message Details:
- Name: {{name}}
- Email: {{email}}
- Phone: {{phone}}
- Subject: {{subject}}
- Message: {{message}}

What Happens Next?
- Our travel specialists will review your inquiry within 24 hours
- We will contact you to discuss your travel preferences and villa requirements
- We will provide personalized recommendations based on your needs
- We will assist you in finding the perfect villa for your stay
- We will help you plan your entire travel experience

Contact our travel specialists at info@luxestaycations.in
Browse our villas at https://luxestaycations.in/villas

Best regards,
Luxe Staycations Travel Team

Email: info@luxestaycations.in | Phone: +91-8828279739`,
            variables: ['name', 'email', 'phone', 'subject', 'message'],
            is_active: true,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            name: 'Consultation Request',
            type: 'consultation_request',
            subject: '🏡 Host Partnership Consultation Confirmed - {{requestId}} | Luxe Staycations',
            html_content: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Host Partnership Consultation Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">🏡 Host Partnership Consultation Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px;">Welcome to the Luxe Staycations Host Family</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #8B4513; margin-top: 0;">Partnership Consultation Details</h2>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Request ID:</strong> {{requestId}}</p>
                    <p><strong>Name:</strong> {{name}}</p>
                    <p><strong>Email:</strong> {{email}}</p>
                    <p><strong>Phone:</strong> {{phone}}</p>
                    <p><strong>Property Type:</strong> {{propertyType}}</p>
                    <p><strong>Location:</strong> {{location}}</p>
                    <p><strong>Preferred Date:</strong> {{preferredDate}}</p>
                    <p><strong>Preferred Time:</strong> {{preferredTime}}</p>
                    <p><strong>Consultation Type:</strong> {{consultationType}}</p>
                  </div>
                  
                  <h3 style="color: #8B4513;">What Happens Next?</h3>
                  <ul style="margin: 20px 0; padding-left: 20px;">
                    <li>Our partnership specialist will contact you within 24 hours</li>
                    <li>We will conduct a detailed property assessment and market analysis</li>
                    <li>We will discuss partnership terms, commission structure, and revenue projections</li>
                    <li>We will guide you through the onboarding process and property preparation</li>
                    <li>We will create a customized marketing strategy for your property</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:partnerships@luxestaycations.in" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Contact Our Partnership Team</a>
                    <a href="https://luxestaycations.in/partner-with-us" style="background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Learn More About Hosting</a>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                  <p>Luxe Staycations - Premium Villa Rentals & Host Partnership Program</p>
                  <p>Email: info@luxestaycations.in | Phone: +91-8828279739</p>
                </div>
              </body>
              </html>
            `,
            text_content: `Host Partnership Consultation Confirmed - {{requestId}}

Dear {{name}},

Welcome to the Luxe Staycations Host Family! Thank you for your interest in partnering with us as a property owner.

Partnership Consultation Details:
- Request ID: {{requestId}}
- Name: {{name}}
- Email: {{email}}
- Phone: {{phone}}
- Property Type: {{propertyType}}
- Location: {{location}}
- Preferred Date: {{preferredDate}}
- Preferred Time: {{preferredTime}}
- Consultation Type: {{consultationType}}

What Happens Next?
- Our partnership specialist will contact you within 24 hours
- We will conduct a detailed property assessment and market analysis
- We will discuss partnership terms, commission structure, and revenue projections
- We will guide you through the onboarding process and property preparation
- We will create a customized marketing strategy for your property

Contact our partnerships team at partnerships@luxestaycations.in
Visit our hosting page: https://luxestaycations.in/partner-with-us

Best regards,
Luxe Staycations Partnership Team`,
            variables: ['requestId', 'name', 'email', 'phone', 'propertyType', 'location', 'preferredDate', 'preferredTime', 'consultationType'],
            is_active: true,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        const { error: templateError } = await supabase
          .from('email_templates')
          .insert(defaultTemplates);

        if (templateError) {
          results.errors.push(`Template setup failed: ${templateError.message}`);
        } else {
          results.templates = defaultTemplates.length;
        }
      }
    } catch (error) {
      results.errors.push(`Template error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      message: `Setup completed: ${results.configurations} configurations, ${results.templates} templates created`,
      results
    });

  } catch (error) {
    console.error('Email setup failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
