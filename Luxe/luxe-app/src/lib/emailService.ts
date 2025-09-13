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
import { supabaseEmailDeliveryService } from './supabaseEmailDeliveryService';

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
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  specialRequests?: string;
  amenities?: string[];
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
      // Ensure Supabase email manager is initialized
      await supabaseEmailManager.initialize();
      
      const config = supabaseEmailManager.getConfiguration();
      console.log('Loaded config from Supabase:', config ? 'Found' : 'Not found');
      
      if (config && config.smtpHost && config.smtpUser && config.smtpPassword) {
        this.config = {
          fromEmail: config.fromEmail || 'info@luxestaycations.in',
          fromName: config.fromName || 'Luxe Staycations',
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort || 587,
          smtpUser: config.smtpUser,
          smtpPassword: config.smtpPassword,
          enableSSL: config.enableSSL || false
        };
        this.isConfigured = true;
        console.log('Email service configuration loaded from Supabase:', {
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpUser: config.smtpUser,
          enableSSL: config.enableSSL
        });
      } else {
        this.config = null;
        this.isConfigured = false;
        console.log('No valid email configuration found in Supabase');
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
      this.isConfigured = false;
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

  // Reload configuration from Supabase
  async reloadConfiguration(): Promise<void> {
    await this.loadConfiguration();
  }

  // Check if email service is configured
  isEmailConfigured(): boolean {
    return this.isConfigured && this.config !== null && 
           Boolean(this.config.smtpHost) && Boolean(this.config.smtpUser) && Boolean(this.config.smtpPassword);
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
      // Try to use template manager first
      const templates = emailTemplateManager.getTemplatesByType('booking_confirmation');
      let template;

      if (templates.length > 0) {
        const templateData = templates[0];
        const variables = {
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          bookingId: data.bookingId,
          propertyName: data.propertyName,
          propertyAddress: data.propertyLocation,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests.toString(),
          totalAmount: `₹${data.totalAmount.toLocaleString()}`,
          hostName: data.hostName || 'Property Host',
          hostPhone: data.hostPhone || '+91-8828279739',
          hostEmail: data.hostEmail || 'host@luxestaycations.in',
          specialRequests: data.specialRequests || '',
          amenities: data.amenities?.join(', ') || '',
          transactionId: data.transactionId,
          paymentMethod: data.paymentMethod
        };

        const processed = emailTemplateManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }

      // Fallback to default template if template manager fails
      if (!template) {
        template = {
          subject: `🎉 Booking Confirmed - ${data.bookingId} | Luxe Staycations`,
          html: this.getDefaultBookingHTML(data),
          text: this.getDefaultBookingText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: data.guestEmail,
          subject: template.subject,
          html: template.html
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send booking confirmation email' };
      }

      const result = await response.json();
      
      // Log email delivery
      try {
        await supabaseEmailDeliveryService.initialize();
        await supabaseEmailDeliveryService.logEmailDelivery(
          'booking_confirmation',
          data.guestEmail,
          template.subject,
          data,
          {
            success: result.success,
            messageId: result.messageId,
            error: result.success ? undefined : result.message,
            timestamp: new Date().toISOString(),
            recipient: data.guestEmail,
            subject: template.subject,
            deliveryAttempts: 1
          }
        );
      } catch (logError) {
        console.error('Error logging email delivery:', logError);
      }
      
      return { success: result.success, message: result.message || 'Booking confirmation email sent successfully' };
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, message: 'Network error: Could not send booking confirmation email' };
    }
  }

  // Send partner request confirmation email
  async sendPartnerRequestConfirmation(data: PartnerRequestData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const template = {
        subject: `🤝 Partner Application Received - ${data.businessName} | Luxe Staycations`,
        html: this.getDefaultPartnerRequestHTML(data),
        text: this.getDefaultPartnerRequestText(data)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: data.email,
          subject: template.subject,
          html: template.html
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

  // Test email connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/test-connection-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Connection test failed' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Connection test successful' };
    } catch (error) {
      console.error('Error testing email connection:', error);
      return { success: false, message: 'Network error: Could not test connection' };
    }
  }

  // Send test email
  async sendTestEmail(testEmail: string): Promise<boolean> {
    if (!this.isConfigured || !this.config) {
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: testEmail,
          subject: 'Test Email from Luxe Staycations',
          html: '<h1>Test Email</h1><p>This is a test email from Luxe Staycations.</p>'
        }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
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
      // Try to use template manager first
      const templates = emailTemplateManager.getTemplatesByType('consultation_request');
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

        const processed = emailTemplateManager.processTemplate(templateData.id, variables);
        if (processed) {
          template = processed;
        }
      }

      // Fallback to default template if template manager fails
      if (!template) {
        template = {
          subject: `🏡 Host Partnership Consultation Confirmed - ${data.requestId} | Luxe Staycations`,
          html: this.getDefaultConsultationHTML(data),
          text: this.getDefaultConsultationText(data)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: data.email,
          subject: template.subject,
          html: template.html
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send consultation confirmation email' };
      }

      const result = await response.json();
      
      // Log email delivery
      try {
        await supabaseEmailDeliveryService.initialize();
        await supabaseEmailDeliveryService.logEmailDelivery(
          'consultation_request',
          data.email,
          template.subject,
          data,
          {
            success: result.success,
            messageId: result.messageId,
            error: result.success ? undefined : result.message,
            timestamp: new Date().toISOString(),
            recipient: data.email,
            subject: template.subject,
            deliveryAttempts: 1
          }
        );
      } catch (logError) {
        console.error('Error logging email delivery:', logError);
      }
      
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: data.email,
          subject: template.subject,
          html: template.html
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send contact form thank you email' };
      }

      const result = await response.json();
      
      // Log email delivery
      try {
        await supabaseEmailDeliveryService.initialize();
        await supabaseEmailDeliveryService.logEmailDelivery(
          'contact_form',
          data.email,
          template.subject,
          data,
          {
            success: result.success,
            messageId: result.messageId,
            error: result.success ? undefined : result.message,
            timestamp: new Date().toISOString(),
            recipient: data.email,
            subject: template.subject,
            deliveryAttempts: 1
          }
        );
      } catch (logError) {
        console.error('Error logging email delivery:', logError);
      }
      
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

  // Send special request confirmation email
  async sendSpecialRequestConfirmation(data: SpecialRequestData): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const template = generateSpecialRequestEmail(data);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: data.email,
          subject: template.subject,
          html: template.html
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
          propertyAddress: data.propertyAddress,
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: data.guestEmail,
          subject: template.subject,
          html: template.html
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpUser: this.config.smtpUser,
          smtpPassword: this.config.smtpPassword,
          enableSSL: this.config.enableSSL,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          to: adminEmail,
          subject: template.subject,
          html: template.html
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

  // Default partner request HTML template
  private getDefaultPartnerRequestHTML(data: PartnerRequestData): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🤝 Partner Application Received</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your interest in partnering with Luxe Staycations</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #8B4513; margin-top: 0;">Application Details</h2>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Business Name:</strong> ${data.businessName}</p>
          <p><strong>Contact Person:</strong> ${data.contactName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Property Type:</strong> ${data.propertyType}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Experience:</strong> ${data.experience}</p>
          <p><strong>Message:</strong> ${data.message}</p>
        </div>
        <p>We have received your partner application and will review it carefully. Our team will get back to you within 2-3 business days.</p>
        <p>Thank you for considering Luxe Staycations as your partner!</p>
        <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
      </div>
    </div>`;
  }

  // Default partner request text template
  private getDefaultPartnerRequestText(data: PartnerRequestData): string {
    return `
Partner Application Received - ${data.businessName}

Thank you for your interest in partnering with Luxe Staycations!

Application Details:
- Business Name: ${data.businessName}
- Contact Person: ${data.contactName}
- Email: ${data.email}
- Phone: ${data.phone}
- Property Type: ${data.propertyType}
- Location: ${data.location}
- Experience: ${data.experience}
- Message: ${data.message}

We have received your partner application and will review it carefully. Our team will get back to you within 2-3 business days.

Thank you for considering Luxe Staycations as your partner!

Best regards,
The Luxe Staycations Team

Email: info@luxestaycations.in | Phone: +91-8828279739`;
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





