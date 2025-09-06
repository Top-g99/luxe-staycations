// Email Service for Luxe Staycations
// This service handles sending confirmation emails to guests

import { 
  EmailTemplate, 
  PartnerRequestData, 
  ConsultationRequestData, 
  SpecialRequestData,
  generateBookingConfirmationEmail,
  generatePartnerRequestEmail,
  generateConsultationRequestEmail,
  generateSpecialRequestEmail,
  generateAdminNotificationEmail
} from './emailTemplates';
import { emailTemplateManager } from './emailTemplateManager';
import { supabaseEmailManager } from './supabaseEmailManager';

export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableSSL: boolean;
}

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  propertyName: string;
  propertyLocation: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
}

export interface BookingCancellationData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  propertyName: string;
  propertyAddress: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  cancellationReason: string;
  refundAmount: number;
  refundMethod: string;
  refundTimeline: string;
  hostName: string;
  hostPhone: string;
  hostEmail: string;
}

export class EmailService {
  private config: EmailConfig | null = null;
  public isConfigured = false;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  // Initialize the email service with Supabase
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await supabaseEmailManager.initialize();
      await this.loadConfiguration();
      this.isInitialized = true;
      console.log('Email service initialized with Supabase');
    } catch (error) {
      console.error('Error initializing email service:', error);
    }
  }

  // Load configuration from Supabase
  private async loadConfiguration(): Promise<void> {
    try {
      const config = supabaseEmailManager.getConfiguration();
      if (config) {
        this.config = {
          fromEmail: config.fromEmail,
          fromName: config.fromName,
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpUser: config.smtpUser,
          smtpPassword: config.smtpPassword,
          enableSSL: config.enableSSL
        };
        this.isConfigured = true;
        console.log('Email service configuration loaded from Supabase');
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
    }
  }

  // Initialize email configuration
  async configure(config: EmailConfig): Promise<boolean> {
    try {
      const success = await supabaseEmailManager.saveConfiguration({
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPassword: config.smtpPassword,
        enableSSL: config.enableSSL,
        fromName: config.fromName,
        fromEmail: config.fromEmail
      });

      if (success) {
        this.config = config;
        this.isConfigured = true;
        console.log('Email configuration saved to Supabase');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving email configuration:', error);
      return false;
    }
  }

  // Check if email service is configured
  isEmailConfigured(): boolean {
    return this.isConfigured && this.config !== null;
  }

  // Get current configuration
  getConfig(): EmailConfig | null {
    return this.config;
  }

  // Send booking confirmation email
  async sendBookingConfirmation(data: BookingEmailData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      // Try to use Supabase template first
      const templates = supabaseEmailManager.getTemplatesByType('booking_confirmation');
      let template;

      if (templates.length > 0) {
        const templateData = templates[0];
        const variables = {
          guestName: data.guestName,
          bookingId: data.bookingId,
          propertyName: data.propertyName,
          propertyLocation: data.propertyLocation,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests.toString(),
          totalAmount: `₹${data.totalAmount.toLocaleString()}`
        };

        const processed = supabaseEmailManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }

      // Fallback to default template if Supabase template fails
      if (!template) {
        template = {
          subject: `🎉 Booking Confirmed - ${data.bookingId} | Luxe Staycations`,
          html: this.getDefaultBookingHTML(data),
          text: this.getDefaultBookingText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.guestEmail,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send booking confirmation email' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Booking confirmation email sent successfully' };
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, message: 'Network error: Could not send booking confirmation email' };
    }
  }

  // Send consultation confirmation email
  async sendConsultationConfirmation(data: {
    requestId: string;
    name: string;
    email: string;
    phone: string;
    propertyType: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    consultationType: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      // Try to use Supabase template first
      const templates = supabaseEmailManager.getTemplatesByType('consultation_request');
      let template;

      if (templates.length > 0) {
        const templateData = templates[0];
        const variables = {
          requestId: data.requestId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          propertyType: data.propertyType,
          location: data.location,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          consultationType: data.consultationType
        };

        const processed = supabaseEmailManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }

      // Fallback to default template if Supabase template fails
      if (!template) {
        template = {
          subject: `🏡 Host Partnership Consultation Confirmed - ${data.requestId} | Luxe Staycations`,
          html: this.getDefaultConsultationHTML(data),
          text: this.getDefaultConsultationText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.email,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send consultation confirmation email' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Consultation confirmation email sent successfully' };
    } catch (error) {
      console.error('Error sending consultation confirmation email:', error);
      return { success: false, message: 'Network error: Could not send consultation confirmation email' };
    }
  }

  // Default booking confirmation HTML template
  private getDefaultBookingHTML(data: BookingEmailData): string {
    return `
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
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Property:</strong> ${data.propertyName}</p>
      <p><strong>Location:</strong> ${data.propertyLocation}</p>
      <p><strong>Check-in:</strong> ${data.checkIn}</p>
      <p><strong>Check-out:</strong> ${data.checkOut}</p>
      <p><strong>Guests:</strong> ${data.guests}</p>
      <p><strong>Total Amount:</strong> ₹${data.totalAmount.toLocaleString()}</p>
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
</html>`;
  }

  // Default booking confirmation text template
  private getDefaultBookingText(data: BookingEmailData): string {
    return `Booking Confirmed - ${data.bookingId}

Dear ${data.guestName},

Thank you for choosing Luxe Staycations! Your booking has been confirmed.

Booking Details:
- Booking ID: ${data.bookingId}
- Property: ${data.propertyName}
- Location: ${data.propertyLocation}
- Check-in: ${data.checkIn}
- Check-out: ${data.checkOut}
- Guests: ${data.guests}
- Total Amount: ₹${data.totalAmount.toLocaleString()}

What's Next?
- You will receive a detailed itinerary 24 hours before your check-in
- Our team will contact you to confirm your arrival time
- Any special requests will be arranged prior to your stay

Contact us at info@luxestaycations.in or +91-8828279739

Best regards,
Luxe Staycations Team`;
  }

  // Default consultation confirmation HTML template
  private getDefaultConsultationHTML(data: {
    requestId: string;
    name: string;
    email: string;
    phone: string;
    propertyType: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    consultationType: string;
  }): string {
    return `
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
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Property Type:</strong> ${data.propertyType}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
      <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
      <p><strong>Consultation Type:</strong> ${data.consultationType}</p>
    </div>
    
    <h3 style="color: #8B4513;">Why Partner with Luxe Staycations?</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li><strong>Premium Brand Recognition:</strong> Leverage our established luxury brand to attract high-value guests</li>
      <li><strong>Expert Marketing:</strong> Professional photography, listing optimization, and digital marketing campaigns</li>
      <li><strong>Guest Management:</strong> 24/7 guest support, check-in/check-out assistance, and concierge services</li>
      <li><strong>Revenue Optimization:</strong> Dynamic pricing strategies and occupancy management to maximize your income</li>
      <li><strong>Property Maintenance:</strong> Regular inspections, cleaning services, and maintenance coordination</li>
      <li><strong>Legal & Compliance:</strong> Handle all legal requirements, insurance, and regulatory compliance</li>
    </ul>
    
    <h3 style="color: #8B4513;">What Happens Next?</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li>Our partnership specialist will contact you within 24 hours</li>
      <li>We will conduct a detailed property assessment and market analysis</li>
      <li>We will discuss partnership terms, commission structure, and revenue projections</li>
      <li>We will guide you through the onboarding process and property preparation</li>
      <li>We will create a customized marketing strategy for your property</li>
    </ul>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #8B4513; margin-top: 0;">💡 Partnership Benefits at a Glance:</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Competitive commission rates starting from 15%</li>
        <li>No upfront costs or hidden fees</li>
        <li>Dedicated property manager assigned to your listing</li>
        <li>Monthly performance reports and revenue analytics</li>
        <li>Priority support for property owners</li>
      </ul>
    </div>
    
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
</html>`;
  }

  // Default consultation confirmation text template
  private getDefaultConsultationText(data: {
    requestId: string;
    name: string;
    email: string;
    phone: string;
    propertyType: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    consultationType: string;
  }): string {
    return `Host Partnership Consultation Confirmed - ${data.requestId}

Dear ${data.name},

Welcome to the Luxe Staycations Host Family! Thank you for your interest in partnering with us as a property owner.

Partnership Consultation Details:
- Request ID: ${data.requestId}
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Property Type: ${data.propertyType}
- Location: ${data.location}
- Preferred Date: ${data.preferredDate}
- Preferred Time: ${data.preferredTime}
- Consultation Type: ${data.consultationType}

Why Partner with Luxe Staycations?
- Premium Brand Recognition: Leverage our established luxury brand to attract high-value guests
- Expert Marketing: Professional photography, listing optimization, and digital marketing campaigns
- Guest Management: 24/7 guest support, check-in/check-out assistance, and concierge services
- Revenue Optimization: Dynamic pricing strategies and occupancy management to maximize your income
- Property Maintenance: Regular inspections, cleaning services, and maintenance coordination
- Legal & Compliance: Handle all legal requirements, insurance, and regulatory compliance

What Happens Next?
- Our partnership specialist will contact you within 24 hours
- We will conduct a detailed property assessment and market analysis
- We will discuss partnership terms, commission structure, and revenue projections
- We will guide you through the onboarding process and property preparation
- We will create a customized marketing strategy for your property

Partnership Benefits at a Glance:
- Competitive commission rates starting from 15%
- No upfront costs or hidden fees
- Dedicated property manager assigned to your listing
- Monthly performance reports and revenue analytics
- Priority support for property owners

Contact our partnerships team at partnerships@luxestaycations.in
Visit our hosting page: https://luxestaycations.in/partner-with-us

Best regards,
Luxe Staycations Partnership Team`;
  }

  // Send contact form thank you email
  async sendContactFormThankYou(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      // Try to use Supabase template first
      const templates = supabaseEmailManager.getTemplatesByType('contact_form');
      let template;

      if (templates.length > 0) {
        const templateData = templates[0];
        const variables = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message
        };

        const processed = supabaseEmailManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }

      // Fallback to default template if Supabase template fails
      if (!template) {
        template = {
          subject: `🙏 Thank You for Contacting Us - ${data.subject} | Luxe Staycations`,
          html: this.getDefaultContactFormHTML(data),
          text: this.getDefaultContactFormText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.email,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send contact form thank you email' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Contact form thank you email sent successfully' };
    } catch (error) {
      console.error('Error sending contact form thank you email:', error);
      return { success: false, message: 'Network error: Could not send contact form thank you email' };
    }
  }

  // Default contact form thank you HTML template
  private getDefaultContactFormHTML(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): string {
    return `
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
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${data.message}</div>
    </div>
    
    <h3 style="color: #8B4513;">What Happens Next?</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li>Our travel specialists will review your inquiry within 24 hours</li>
      <li>We will contact you to discuss your travel preferences and villa requirements</li>
      <li>We will provide personalized recommendations based on your needs</li>
      <li>We will assist you in finding the perfect villa for your stay</li>
      <li>We will help you plan your entire travel experience</li>
    </ul>
    
    <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #8B4513; margin-top: 0;">💡 How We Can Help You:</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Villa Selection:</strong> Find the perfect villa that matches your preferences and budget</li>
        <li><strong>Travel Planning:</strong> Get expert advice on local attractions, dining, and activities</li>
        <li><strong>Booking Assistance:</strong> Secure your booking with our streamlined process</li>
        <li><strong>24/7 Support:</strong> Round-the-clock assistance during your stay</li>
        <li><strong>Special Requests:</strong> Customize your experience with special arrangements</li>
      </ul>
    </div>
    
    <h3 style="color: #8B4513;">Why Choose Luxe Staycations?</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li><strong>Curated Collection:</strong> Handpicked luxury villas in prime locations</li>
      <li><strong>Expert Local Knowledge:</strong> Deep understanding of destinations and local experiences</li>
      <li><strong>Personalized Service:</strong> Tailored recommendations for every guest</li>
      <li><strong>Quality Assurance:</strong> All properties meet our high standards</li>
      <li><strong>Competitive Pricing:</strong> Best rates with added value services</li>
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
</html>`;
  }

  // Default contact form thank you text template
  private getDefaultContactFormText(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): string {
    return `Thank You for Contacting Us - ${data.subject}

Dear ${data.name},

Thank you for reaching out to Luxe Staycations! We appreciate your interest in our luxury villa rentals and travel planning services.

Your Message Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Subject: ${data.subject}
- Message: ${data.message}

What Happens Next?
- Our travel specialists will review your inquiry within 24 hours
- We will contact you to discuss your travel preferences and villa requirements
- We will provide personalized recommendations based on your needs
- We will assist you in finding the perfect villa for your stay
- We will help you plan your entire travel experience

How We Can Help You:
- Villa Selection: Find the perfect villa that matches your preferences and budget
- Travel Planning: Get expert advice on local attractions, dining, and activities
- Booking Assistance: Secure your booking with our streamlined process
- 24/7 Support: Round-the-clock assistance during your stay
- Special Requests: Customize your experience with special arrangements

Why Choose Luxe Staycations?
- Curated Collection: Handpicked luxury villas in prime locations
- Expert Local Knowledge: Deep understanding of destinations and local experiences
- Personalized Service: Tailored recommendations for every guest
- Quality Assurance: All properties meet our high standards
- Competitive Pricing: Best rates with added value services

Contact our travel specialists at info@luxestaycations.in
Browse our villas at https://luxestaycations.in/villas

Best regards,
Luxe Staycations Travel Team

Email: info@luxestaycations.in | Phone: +91-8828279739`;
  }

  // Send consultation request confirmation email
  async sendConsultationRequestConfirmation(data: ConsultationRequestData): Promise<{ success: boolean; message: string }> {
    requestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    propertyName: string;
    bookingId: string;
    requestType: string;
    priority: string;
    requestDetails: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      // Try to use Supabase template first
      const templates = supabaseEmailManager.getTemplatesByType('special_request');
      let template;

      if (templates.length > 0) {
        const templateData = templates[0];
        const variables = {
          requestId: data.requestId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          propertyName: data.propertyName,
          bookingId: data.bookingId,
          requestType: data.requestType,
          priority: data.priority,
          requestDetails: data.requestDetails
        };

        const processed = supabaseEmailManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }

      // Fallback to default template if Supabase template fails
      if (!template) {
        template = {
          subject: `🚨 Special Request Received - ${data.propertyName} | Luxe Staycations`,
          html: this.getDefaultSpecialRequestHTML(data),
          text: this.getDefaultSpecialRequestText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.guestEmail,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send special request confirmation email' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Special request confirmation email sent successfully' };
    } catch (error) {
      console.error('Error sending special request confirmation email:', error);
      return { success: false, message: 'Network error: Could not send special request confirmation email' };
    }
  }

  // Default special request confirmation HTML template
  private getDefaultSpecialRequestHTML(data: {
    requestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    propertyName: string;
    bookingId: string;
    requestType: string;
    priority: string;
    requestDetails: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Special Request Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🚨 Special Request Received!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">We have received your special request</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #8B4513; margin-top: 0;">Request Details</h2>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Guest Name:</strong> ${data.guestName}</p>
      <p><strong>Email:</strong> ${data.guestEmail}</p>
      <p><strong>Phone:</strong> ${data.guestPhone}</p>
      <p><strong>Property:</strong> ${data.propertyName}</p>
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Request Type:</strong> ${data.requestType}</p>
      <p><strong>Priority:</strong> ${data.priority}</p>
      <p><strong>Request Details:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${data.requestDetails}</div>
    </div>
    
    <h3 style="color: #8B4513;">What Happens Next?</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li>Our concierge team will review your request within 2-4 hours</li>
      <li>We will contact you to discuss feasibility and any additional charges</li>
      <li>If approved, we will coordinate with local vendors and service providers</li>
      <li>We will provide regular updates on the progress of your request</li>
      <li>All arrangements will be confirmed before your arrival</li>
    </ul>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #8B4513; margin-top: 0;">💡 Popular Special Requests We Handle:</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Airport Transfers:</strong> Private car or luxury vehicle arrangements</li>
        <li><strong>Chef Services:</strong> Private chef for special meals or celebrations</li>
        <li><strong>Event Planning:</strong> Birthday parties, anniversaries, or corporate events</li>
        <li><strong>Adventure Activities:</strong> Water sports, hiking, or local excursions</li>
        <li><strong>Luxury Services:</strong> Spa treatments, butler service, or personal shopping</li>
        <li><strong>Special Occasions:</strong> Romantic setups, surprise celebrations, or proposals</li>
      </ul>
    </div>
    
    <h3 style="color: #8B4513;">Our Concierge Promise</h3>
    <ul style="margin: 20px 0; padding-left: 20px;">
      <li><strong>24/7 Availability:</strong> Round-the-clock support for all your needs</li>
      <li><strong>Local Expertise:</strong> Deep knowledge of the area and best service providers</li>
      <li><strong>Quality Assurance:</strong> All vendors are vetted for quality and reliability</li>
      <li><strong>Transparent Pricing:</strong> No hidden fees, all costs discussed upfront</li>
      <li><strong>Personalized Service:</strong> Tailored to your specific preferences and requirements</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:concierge@luxestaycations.in" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Contact Our Concierge Team</a>
      <a href="https://luxestaycations.in/guest/dashboard" style="background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">View Your Bookings</a>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
    <p>Luxe Staycations - Premium Villa Rentals & Concierge Services</p>
    <p>Email: info@luxestaycations.in | Phone: +91-8828279739</p>
  </div>
</body>
</html>`;
  }

  // Default special request confirmation text template
  private getDefaultSpecialRequestText(data: {
    requestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    propertyName: string;
    bookingId: string;
    requestType: string;
    priority: string;
    requestDetails: string;
  }): string {
    return `Special Request Received - ${data.propertyName}

Dear ${data.guestName},

Thank you for submitting your special request! We have received your request and our concierge team will review it promptly.

Request Details:
- Request ID: ${data.requestId}
- Guest Name: ${data.guestName}
- Email: ${data.guestEmail}
- Phone: ${data.guestPhone}
- Property: ${data.propertyName}
- Booking ID: ${data.bookingId}
- Request Type: ${data.requestType}
- Priority: ${data.priority}
- Request Details: ${data.requestDetails}

What Happens Next?
- Our concierge team will review your request within 2-4 hours
- We will contact you to discuss feasibility and any additional charges
- If approved, we will coordinate with local vendors and service providers
- We will provide regular updates on the progress of your request
- All arrangements will be confirmed before your arrival

Popular Special Requests We Handle:
- Airport Transfers: Private car or luxury vehicle arrangements
- Chef Services: Private chef for special meals or celebrations
- Event Planning: Birthday parties, anniversaries, or corporate events
- Adventure Activities: Water sports, hiking, or local excursions
- Luxury Services: Spa treatments, butler service, or personal shopping
- Special Occasions: Romantic setups, surprise celebrations, or proposals

Our Concierge Promise:
- 24/7 Availability: Round-the-clock support for all your needs
- Local Expertise: Deep knowledge of the area and best service providers
- Quality Assurance: All vendors are vetted for quality and reliability
- Transparent Pricing: No hidden fees, all costs discussed upfront
- Personalized Service: Tailored to your specific preferences and requirements

Contact our concierge team at concierge@luxestaycations.in
View your bookings at https://luxestaycations.in/guest/dashboard

Best regards,
Luxe Staycations Concierge Team

Email: info@luxestaycations.in | Phone: +91-8828279739`;
  }

  // Generate booking confirmation email content (legacy method)
  private generateBookingConfirmationEmail(data: BookingEmailData): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Luxe Staycations</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f3f4f6;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #5a3d35;
            margin-bottom: 10px;
        }
        .tagline {
            color: #d97706;
            font-size: 16px;
            font-style: italic;
        }
        .success-icon {
            font-size: 48px;
            color: #4caf50;
            margin-bottom: 20px;
        }
        .booking-id {
            background-color: #f8f9fa;
            border: 2px solid #4caf50;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .booking-id-label {
            color: #4caf50;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .booking-id-value {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #5a3d35;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .section-title {
            color: #d97706;
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-title::before {
            content: "📋";
            margin-right: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-label {
            font-weight: 600;
            color: #5a3d35;
        }
        .info-value {
            color: #333;
        }
        .payment-summary {
            background-color: #e8f5e8;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #4caf50;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f3f4f6;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(45deg, #5a3d35, #d97706);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover {
            background: linear-gradient(45deg, #4a332c, #b45309);
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">LUXE STAYCATIONS</div>
            <div class="tagline">Luxury Redefined</div>
        </div>

        <div style="text-align: center;">
            <div class="success-icon">✅</div>
            <h1 style="color: #5a3d35; margin-bottom: 10px;">Booking Confirmed!</h1>
            <p style="color: #666; font-size: 18px;">Thank you for choosing Luxe Staycations</p>
        </div>

        <div class="booking-id">
            <div class="booking-id-label">Your Booking ID</div>
            <div class="booking-id-value">${data.bookingId}</div>
        </div>

        <div class="section">
            <div class="section-title">Property Details</div>
            <div class="info-row">
                <span class="info-label">Property Name:</span>
                <span class="info-value">${data.propertyName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${data.propertyLocation}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Stay Details</div>
            <div class="info-row">
                <span class="info-label">Check-in Date:</span>
                <span class="info-value">${formatDate(data.checkIn)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Check-out Date:</span>
                <span class="info-value">${formatDate(data.checkOut)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Number of Guests:</span>
                <span class="info-value">${data.guests}</span>
            </div>
        </div>

        <div class="payment-summary">
            <div class="section-title">Payment Summary</div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${data.paymentMethod}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${data.transactionId}</span>
            </div>
            <div class="total-amount">
                Total Amount: ₹${data.totalAmount.toLocaleString()}
            </div>
        </div>

        <div class="contact-info">
            <div class="section-title">Important Information</div>
            <p><strong>Check-in Instructions:</strong></p>
            <ul>
                <li>Check-in time: 3:00 PM</li>
                <li>Please bring a valid government-issued ID</li>
                <li>Contact the host 1 hour before arrival</li>
                <li>Early check-in is subject to availability</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/guest/dashboard" class="btn">
                Manage My Booking
            </a>
            <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}" class="btn">
                Visit Our Website
            </a>
        </div>

        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>Email: support@luxestaycations.com</p>
            <p>Phone: +91-98765-43210</p>
            <p>Available 24/7 for urgent matters</p>
            <br>
            <p>© 2024 Luxe Staycations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    return emailContent;
  }

  // Simulate email sending (replace with actual email service integration)
  private async simulateEmailSending(toEmail: string, content: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📧 Email Simulation:');
    console.log(`To: ${toEmail}`);
    console.log('Subject: Booking Confirmation - Luxe Staycations');
    console.log('Content: HTML email with booking details');
    console.log('Status: Email sent successfully (simulated)');
  }

  // Test SMTP connection using API route
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      console.warn('Email service not configured');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: this.config }),
      });

      // Check if response is ok
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        
        // Try to get the error message from the response
        try {
          const errorResult = await response.json();
          console.error('SMTP Connection Error:', errorResult.message);
          console.error('Error details:', errorResult.details);
          return { success: false, message: errorResult.message || 'SMTP connection failed' };
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          return { success: false, message: 'Could not connect to SMTP server' };
        }
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return { success: false, message: 'Invalid response from server' };
      }

      const result = await response.json();
      console.log('SMTP Connection Result:', result.message);
      return { success: result.success, message: result.message || 'Connection test completed' };
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return { success: false, message: 'Network error: Could not test connection' };
    }
  }

  // Send test email to verify configuration using API route
  async sendTestEmail(toEmail: string): Promise<boolean> {
    if (!this.isConfigured || !this.config) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          config: this.config,
          testEmail: toEmail 
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        
        // Try to get the error message from the response
        try {
          const errorResult = await response.json();
          console.error('Test Email Error:', errorResult.message);
          console.error('Error details:', errorResult.details);
          return false;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          return false;
        }
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return false;
      }

      const result = await response.json();
      console.log('Test Email Result:', result.message);
      return result.success;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }


  // Send partner request confirmation email
  async sendPartnerRequestConfirmation(data: PartnerRequestData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const template = generatePartnerRequestEmail(data);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.email,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send partner request confirmation' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Partner request confirmation sent successfully' };
    } catch (error) {
      console.error('Error sending partner request confirmation:', error);
      return { success: false, message: 'Network error: Could not send partner request confirmation' };
    }
  }

  // Send consultation request confirmation email
  async sendConsultationRequestConfirmation(data: ConsultationRequestData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const template = generateConsultationRequestEmail(data);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.email,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send consultation request confirmation' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Consultation request confirmation sent successfully' };
    } catch (error) {
      console.error('Error sending consultation request confirmation:', error);
      return { success: false, message: 'Network error: Could not send consultation request confirmation' };
    }
  }

  // Send special request confirmation email
  async sendSpecialRequestConfirmation(data: SpecialRequestData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const template = generateSpecialRequestEmail(data);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.email,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send special request confirmation' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Special request confirmation sent successfully' };
    } catch (error) {
      console.error('Error sending special request confirmation:', error);
      return { success: false, message: 'Network error: Could not send special request confirmation' };
    }
  }

  // Send booking cancellation email
  async sendBookingCancellation(data: BookingCancellationData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      // Try to use template manager first
      const templates = emailTemplateManager.getTemplatesByType('booking_cancellation');
      let template;
      
      if (templates.length > 0) {
        const templateData = templates[0];
        const variables = {
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          bookingId: data.bookingId,
          propertyName: data.propertyName,
          propertyLocation: data.propertyLocation,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests.toString(),
          totalAmount: `₹${data.totalAmount.toLocaleString()}`,
          cancellationReason: data.cancellationReason,
          refundAmount: `₹${data.refundAmount.toLocaleString()}`,
          refundMethod: data.refundMethod,
          refundTimeline: data.refundTimeline,
          hostName: data.hostName,
          hostPhone: data.hostPhone,
          hostEmail: data.hostEmail
        };
        
        const processed = emailTemplateManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }
      
      // Fallback to default template if template manager fails
      if (!template) {
        template = {
          subject: `📋 Booking Cancellation Acknowledged - ${data.bookingId} | Luxe Staycations`,
          html: this.getDefaultCancellationHTML(data),
          text: this.getDefaultCancellationText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: data.guestEmail,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send booking cancellation email' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Booking cancellation email sent successfully' };
    } catch (error) {
      console.error('Error sending booking cancellation email:', error);
      return { success: false, message: 'Network error: Could not send booking cancellation email' };
    }
  }

  // Send admin notification email
  async sendAdminNotification(type: string, data: any, adminEmail: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const template = generateAdminNotificationEmail(type, data);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          to: adminEmail,
          template: template
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send admin notification' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Admin notification sent successfully' };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, message: 'Network error: Could not send admin notification' };
    }
  }

  // Default cancellation email templates (fallback)
  private getDefaultCancellationHTML(data: BookingCancellationData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancellation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .email-container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #8B4513; font-size: 24px; margin-bottom: 20px; }
        .cancellation-details { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .footer { background-color: #2C1810; color: white; padding: 30px 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>LUXE STAYCATIONS</h1>
            <p>Luxury Redefined • Premium Villa Experiences</p>
        </div>
        <div class="content">
            <h2>📋 Booking Cancellation Acknowledged</h2>
            <p>Dear <strong>${data.guestName}</strong>,</p>
            <p>We have received your cancellation request for booking <strong>${data.bookingId}</strong>.</p>
            <div class="cancellation-details">
                <h3>📋 Cancellation Details</h3>
                <p><strong>Property:</strong> ${data.propertyName}</p>
                <p><strong>Original Dates:</strong> ${data.checkIn} to ${data.checkOut}</p>
                <p><strong>Reason:</strong> ${data.cancellationReason}</p>
                <p><strong>Refund Amount:</strong> ₹${data.refundAmount.toLocaleString()}</p>
                <p><strong>Refund Method:</strong> ${data.refundMethod}</p>
                <p><strong>Expected Timeline:</strong> ${data.refundTimeline}</p>
            </div>
            <p>We understand that plans can change, and we're here to help make the process as smooth as possible.</p>
            <p>If you have any questions about your cancellation or refund, please don't hesitate to contact us.</p>
            <p>We hope to welcome you back to Luxe Staycations in the future!</p>
            <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
        </div>
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📞 +91-8828279739</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDefaultCancellationText(data: BookingCancellationData): string {
    return `Booking Cancellation Acknowledged for ${data.bookingId}. Property: ${data.propertyName}. Refund Amount: ₹${data.refundAmount.toLocaleString()}. Expected Timeline: ${data.refundTimeline}.`;
  }
}

// Create singleton instance
export const emailService = new EmailService();

// Default configuration (to be updated in production)
export const defaultEmailConfig: EmailConfig = {
  fromEmail: 'noreply@luxestaycations.com',
  fromName: 'Luxe Staycations',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'your-email@gmail.com',
  smtpPassword: 'your-app-password',
  enableSSL: true
};





