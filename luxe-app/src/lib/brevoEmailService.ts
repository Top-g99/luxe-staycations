// Brevo Email Service for Luxe Staycations
// This service handles all email communications using Brevo API

import * as brevo from '@getbrevo/brevo';
import { getTemplateById, replaceTemplateVariables, EmailTemplate } from './brevoTemplates';

export interface BrevoConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  replyToEmail?: string;
}

export interface BrevoEmailData {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
  tags?: string[];
  headers?: Record<string, string>;
  replyToEmail?: string;
}

export interface BrevoEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export class BrevoEmailService {
  private static instance: BrevoEmailService;
  private apiInstance: brevo.TransactionalEmailsApi;
  private config: BrevoConfig | null = null;
  private isInitialized = false;

  private constructor() {
    this.apiInstance = new brevo.TransactionalEmailsApi();
  }

  public static getInstance(): BrevoEmailService {
    if (!BrevoEmailService.instance) {
      BrevoEmailService.instance = new BrevoEmailService();
    }
    return BrevoEmailService.instance;
  }

  // Initialize Brevo service with API key
  public async initialize(config: BrevoConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // Set API key
      this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.apiKey);
      
      this.isInitialized = true;
      console.log('Brevo email service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Brevo email service:', error);
      return false;
    }
  }

  // Check if service is initialized
  public isServiceInitialized(): boolean {
    return this.isInitialized && this.config !== null;
  }

  // Send email using Brevo API
  public async sendEmail(data: BrevoEmailData): Promise<BrevoEmailResult> {
    if (!this.isInitialized || !this.config) {
      return {
        success: false,
        error: 'Brevo email service not initialized',
        timestamp: new Date().toISOString()
      };
    }

    try {
      // Prepare recipients
      const recipients = Array.isArray(data.to) ? data.to : [data.to];
      const to = recipients.map(email => ({ email, name: email.split('@')[0] }));

      // Create email object
      const emailData = {
        sender: {
          email: this.config.senderEmail,
          name: this.config.senderName
        },
        to: to,
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent || this.stripHtml(data.htmlContent),
        replyTo: data.replyToEmail ? { email: data.replyToEmail } : undefined,
        headers: data.headers,
        tags: data.tags || [],
        params: data.params
      };

      // Send email
      const result = await this.apiInstance.sendTransacEmail(emailData);
      
      console.log('Brevo email sent successfully:', result.body.messageId);

      return {
        success: true,
        messageId: result.body.messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Send booking confirmation email using template
  public async sendBookingConfirmation(data: {
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
  }): Promise<BrevoEmailResult> {
    const template = getTemplateById('booking_confirmation');
    if (template) {
      const variables = {
        guestName: data.guestName,
        bookingId: data.bookingId,
        propertyName: data.propertyName,
        checkInDate: data.checkIn,
        checkOutDate: data.checkOut,
        guestCount: data.guests,
        totalAmount: data.totalAmount.toLocaleString(),
        logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/images/luxe-logo.svg`,
        bookingLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/booking/confirmation/${data.bookingId}`,
        guestEmail: data.guestEmail,
        unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/unsubscribe?email=${data.guestEmail}`
      };

      const htmlContent = replaceTemplateVariables(template.htmlContent, variables);
      const textContent = replaceTemplateVariables(template.textContent, variables);
      const subject = replaceTemplateVariables(template.subject, variables);

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent,
        tags: ['booking', 'confirmation'],
        params: {
          guestName: data.guestName,
          bookingId: data.bookingId,
          propertyName: data.propertyName
        }
      });
    } else {
      // Fallback to original method
      const htmlContent = this.generateBookingConfirmationHTML(data);
      const subject = `🎉 Booking Confirmed - ${data.bookingId} | Luxe Staycations`;

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        tags: ['booking', 'confirmation'],
        params: {
          guestName: data.guestName,
          bookingId: data.bookingId,
          propertyName: data.propertyName
        }
      });
    }
  }

  // Send consultation confirmation email
  public async sendConsultationConfirmation(data: {
    requestId: string;
    name: string;
    email: string;
    phone: string;
    propertyType: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    consultationType: string;
  }): Promise<BrevoEmailResult> {
    const htmlContent = this.generateConsultationConfirmationHTML(data);
    const subject = `🏡 Host Partnership Consultation Confirmed - ${data.requestId} | Luxe Staycations`;

    return this.sendEmail({
      to: data.email,
      subject: subject,
      htmlContent: htmlContent,
      tags: ['consultation', 'host-partnership'],
      params: {
        name: data.name,
        requestId: data.requestId,
        propertyType: data.propertyType
      }
    });
  }

  // Send special request confirmation email using template
  public async sendSpecialRequestConfirmation(data: {
    guestName: string;
    guestEmail: string;
    bookingId: string;
    propertyName: string;
    requests: Array<{
      type: string;
      description: string;
      priority: string;
    }>;
    urgency: string;
    requestId: string;
  }): Promise<BrevoEmailResult> {
    const template = getTemplateById('special_request_confirmation');
    if (template) {
      const variables = {
        guestName: data.guestName,
        requestId: data.requestId,
        propertyName: data.propertyName,
        requestType: data.requests[0]?.type || 'General Request',
        description: data.requests[0]?.description || 'Special request',
        urgency: data.urgency,
        logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/images/luxe-logo.svg`,
        guestEmail: data.guestEmail,
        unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/unsubscribe?email=${data.guestEmail}`
      };

      const htmlContent = replaceTemplateVariables(template.htmlContent, variables);
      const textContent = replaceTemplateVariables(template.textContent, variables);
      const subject = replaceTemplateVariables(template.subject, variables);

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent,
        tags: ['special-request', 'guest-service'],
        params: {
          guestName: data.guestName,
          requestId: data.requestId,
          propertyName: data.propertyName
        }
      });
    } else {
      // Fallback to original method
      const htmlContent = this.generateSpecialRequestConfirmationHTML(data);
      const subject = `✨ Special Request Received | Luxe Staycations`;

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        tags: ['special-request', 'guest-service'],
        params: {
          guestName: data.guestName,
          requestId: data.requestId,
          propertyName: data.propertyName
        }
      });
    }
  }

  // Send contact form thank you email
  public async sendContactFormThankYou(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<BrevoEmailResult> {
    const htmlContent = this.generateContactFormThankYouHTML(data);
    const emailSubject = `🙏 Thank You for Contacting Us - ${data.subject} | Luxe Staycations`;

    return this.sendEmail({
      to: data.email,
      subject: emailSubject,
      htmlContent: htmlContent,
      tags: ['contact', 'thank-you'],
      params: {
        name: data.name,
        subject: data.subject
      }
    });
  }

  // Send partner request confirmation email
  public async sendPartnerRequestConfirmation(data: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    message: string;
    requestId: string;
  }): Promise<BrevoEmailResult> {
    const htmlContent = this.generatePartnerRequestConfirmationHTML(data);
    const subject = `🤝 Partner Application Received - ${data.businessName} | Luxe Staycations`;

    return this.sendEmail({
      to: data.email,
      subject: subject,
      htmlContent: htmlContent,
      tags: ['partner', 'application'],
      params: {
        businessName: data.businessName,
        contactName: data.contactName,
        requestId: data.requestId
      }
    });
  }

  // Send booking cancellation email
  public async sendBookingCancellation(data: {
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
  }): Promise<BrevoEmailResult> {
    const htmlContent = this.generateBookingCancellationHTML(data);
    const subject = `📋 Booking Cancellation Acknowledged - ${data.bookingId} | Luxe Staycations`;

    return this.sendEmail({
      to: data.guestEmail,
      subject: subject,
      htmlContent: htmlContent,
      tags: ['booking', 'cancellation'],
      params: {
        guestName: data.guestName,
        bookingId: data.bookingId,
        propertyName: data.propertyName
      }
    });
  }

  // Send admin notification email
  public async sendAdminNotification(type: string, data: any, adminEmail: string): Promise<BrevoEmailResult> {
    const htmlContent = this.generateAdminNotificationHTML(type, data);
    const subject = `🔔 Admin Notification - ${type} | Luxe Staycations`;

    return this.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlContent: htmlContent,
      tags: ['admin', 'notification'],
      params: {
        type: type,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Send loyalty welcome email using template
  public async sendLoyaltyWelcome(data: {
    guestName: string;
    guestEmail: string;
    currentPoints: number;
    rewardsDashboardLink: string;
  }): Promise<BrevoEmailResult> {
    const template = getTemplateById('loyalty_welcome');
    if (template) {
      const variables = {
        guestName: data.guestName,
        currentPoints: data.currentPoints.toString(),
        rewardsDashboardLink: data.rewardsDashboardLink,
        logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/images/luxe-logo.svg`,
        guestEmail: data.guestEmail,
        unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/unsubscribe?email=${data.guestEmail}`
      };

      const htmlContent = replaceTemplateVariables(template.htmlContent, variables);
      const textContent = replaceTemplateVariables(template.textContent, variables);
      const subject = replaceTemplateVariables(template.subject, variables);

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent,
        tags: ['loyalty', 'welcome'],
        params: {
          guestName: data.guestName,
          currentPoints: data.currentPoints
        }
      });
    } else {
      // Fallback to original method
      const htmlContent = this.generateLoyaltyWelcomeHTML(data);
      const subject = `Welcome to Luxe Rewards! Your journey to exclusive benefits starts now 🎁`;

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        tags: ['loyalty', 'welcome'],
        params: {
          guestName: data.guestName,
          currentPoints: data.currentPoints
        }
      });
    }
  }

  // Send marketing newsletter email using template
  public async sendMarketingNewsletter(data: {
    guestName: string;
    guestEmail: string;
    newsletterTitle: string;
    newsletterContent: string;
    featuredPropertyName: string;
    featuredPropertyDescription: string;
    featuredPropertyPrice: number;
    ctaText: string;
    ctaLink: string;
  }): Promise<BrevoEmailResult> {
    const template = getTemplateById('marketing_newsletter');
    if (template) {
      const variables = {
        guestName: data.guestName,
        newsletterTitle: data.newsletterTitle,
        newsletterContent: data.newsletterContent,
        featuredPropertyName: data.featuredPropertyName,
        featuredPropertyDescription: data.featuredPropertyDescription,
        featuredPropertyPrice: data.featuredPropertyPrice.toLocaleString(),
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/images/luxe-logo.svg`,
        guestEmail: data.guestEmail,
        unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/unsubscribe?email=${data.guestEmail}`
      };

      const htmlContent = replaceTemplateVariables(template.htmlContent, variables);
      const textContent = replaceTemplateVariables(template.textContent, variables);
      const subject = replaceTemplateVariables(template.subject, variables);

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent,
        tags: ['marketing', 'newsletter'],
        params: {
          guestName: data.guestName,
          newsletterTitle: data.newsletterTitle
        }
      });
    } else {
      // Fallback to original method
      const htmlContent = this.generateMarketingNewsletterHTML(data);
      const subject = `${data.newsletterTitle} | Luxe Staycations`;

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        tags: ['marketing', 'newsletter'],
        params: {
          guestName: data.guestName,
          newsletterTitle: data.newsletterTitle
        }
      });
    }
  }

  // Send booking reminder email using template
  public async sendBookingReminder(data: {
    guestName: string;
    guestEmail: string;
    bookingId: string;
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: string;
    checkInTime: string;
    checkOutTime: string;
    propertyAddress: string;
    hostPhone: string;
    bookingLink: string;
  }): Promise<BrevoEmailResult> {
    const template = getTemplateById('booking_reminder');
    if (template) {
      const variables = {
        guestName: data.guestName,
        bookingId: data.bookingId,
        propertyName: data.propertyName,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guestCount: data.guestCount,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        propertyAddress: data.propertyAddress,
        hostPhone: data.hostPhone,
        bookingLink: data.bookingLink,
        logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/images/luxe-logo.svg`,
        guestEmail: data.guestEmail,
        unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/unsubscribe?email=${data.guestEmail}`
      };

      const htmlContent = replaceTemplateVariables(template.htmlContent, variables);
      const textContent = replaceTemplateVariables(template.textContent, variables);
      const subject = replaceTemplateVariables(template.subject, variables);

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent,
        tags: ['booking', 'reminder'],
        params: {
          guestName: data.guestName,
          bookingId: data.bookingId,
          propertyName: data.propertyName
        }
      });
    } else {
      // Fallback to original method
      const htmlContent = this.generateBookingReminderHTML(data);
      const subject = `Your stay is coming up! Check-in details for ${data.propertyName} 📅`;

      return this.sendEmail({
        to: data.guestEmail,
        subject: subject,
        htmlContent: htmlContent,
        tags: ['booking', 'reminder'],
        params: {
          guestName: data.guestName,
          bookingId: data.bookingId,
          propertyName: data.propertyName
        }
      });
    }
  }

  // Test email sending with enhanced branding
  public async sendTestEmail(testEmail: string): Promise<BrevoEmailResult> {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🏖️ Luxe Staycations</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Email Service Test</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
            <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
              <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">🏖️</span>
            </div>
            <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE STAYCATIONS</h3>
            <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">LUXURY GETAWAYS</p>
          </div>
          
          <h2 style="color: #5a3d35; margin-bottom: 20px;">🧪 Brevo Email Test Successful!</h2>
          
          <p>This is a test email from the Luxe Staycations Brevo integration.</p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5a3d35; margin-top: 0;">Test Details</h3>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> ✅ Brevo email service is working correctly!</p>
            <p><strong>Logo Display:</strong> ✅ Company logo is displaying properly</p>
            <p><strong>Branding:</strong> ✅ Luxe Staycations branding is active</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
            <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid #2F4F4F;">
              <span style="color: #2F4F4F; font-size: 20px; font-weight: bold;">🏖️</span>
            </div>
            <p style="color: #5a3d35; font-weight: 600;">Your email system is ready to go!</p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            This email was sent via Brevo API to verify email delivery functionality and branding display.
          </p>
        </div>
        
        <div style="background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center;">
          <p><strong>Luxe Staycations</strong></p>
          <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
          <p><a href="https://luxestaycations.in" style="color: #d97706; text-decoration: none;">luxestaycations.in</a></p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: testEmail,
      subject: '🧪 Brevo Email Test - Luxe Staycations',
      htmlContent: htmlContent,
      tags: ['test', 'brevo']
    });
  }

  // Helper method to strip HTML tags
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Generate booking confirmation HTML
  private generateBookingConfirmationHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">🎉 Booking Confirmed!</h2>
          <p>Dear ${data.guestName},</p>
          <p>Your booking has been confirmed! We're excited to host you at our luxury property.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Location:</strong> ${data.propertyLocation}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Total Amount:</strong> ₹${data.totalAmount.toLocaleString()}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>

          ${data.specialRequests ? `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #f57c00; margin-top: 0;">Special Requests</h4>
              <p>${data.specialRequests}</p>
            </div>
          ` : ''}

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Host Contact Information</h4>
            <p><strong>Host Name:</strong> ${data.hostName || 'Property Host'}</p>
            <p><strong>Phone:</strong> ${data.hostPhone || '+91-8828279739'}</p>
            <p><strong>Email:</strong> ${data.hostEmail || 'host@luxestaycations.in'}</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Booking Details
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for choosing Luxe Staycations! We look forward to providing you with an exceptional experience.
          </p>
        </div>
      </div>
    `;
  }

  // Generate consultation confirmation HTML
  private generateConsultationConfirmationHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">🏡 Host Partnership Consultation Confirmed!</h2>
          <p>Dear ${data.name},</p>
          <p>Thank you for your interest in partnering with Luxe Staycations! Your consultation request has been confirmed.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Consultation Details</h3>
            <p><strong>Request ID:</strong> ${data.requestId}</p>
            <p><strong>Property Type:</strong> ${data.propertyType}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
            <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
            <p><strong>Consultation Type:</strong> ${data.consultationType}</p>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Next Steps</h4>
            <p>Our partnership team will contact you within 24 hours to schedule your consultation and discuss the partnership opportunities available.</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Learn More About Partnership
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            We're excited about the possibility of working together!
          </p>
        </div>
      </div>
    `;
  }

  // Generate special request confirmation HTML
  private generateSpecialRequestConfirmationHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">✨ Special Request Received!</h2>
          <p>Dear ${data.guestName},</p>
          <p>Thank you for your special request! We've received your request and will do our best to accommodate your needs.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Request Details</h3>
            <p><strong>Request ID:</strong> ${data.requestId}</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Urgency:</strong> ${data.urgency}</p>
          </div>

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #f57c00; margin-top: 0;">Your Requests</h4>
            ${data.requests.map((req: any) => `
              <div style="margin-bottom: 10px; padding: 10px; background-color: #fafafa; border-radius: 3px;">
                <strong>${req.type}</strong> (${req.priority} priority)<br>
                <span style="color: #666;">${req.description}</span>
              </div>
            `).join('')}
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">What Happens Next?</h4>
            <p>Our team will review your requests and get back to you within 24 hours with confirmation and any additional details needed.</p>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            We're committed to making your stay as comfortable and enjoyable as possible!
          </p>
        </div>
      </div>
    `;
  }

  // Generate contact form thank you HTML
  private generateContactFormThankYouHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">🙏 Thank You for Contacting Us!</h2>
          <p>Dear ${data.name},</p>
          <p>Thank you for reaching out to us! We've received your message and will get back to you within 24 hours.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Your Message</h3>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${data.message}</div>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">What Happens Next?</h4>
            <p>Our team will review your message and respond with detailed information about our luxury properties and services.</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Explore Our Properties
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            We look forward to helping you plan your perfect luxury getaway!
          </p>
        </div>
      </div>
    `;
  }

  // Generate partner request confirmation HTML
  private generatePartnerRequestConfirmationHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">🤝 Partner Application Received!</h2>
          <p>Dear ${data.contactName},</p>
          <p>Thank you for your interest in partnering with Luxe Staycations! We've received your application and will review it carefully.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Application Details</h3>
            <p><strong>Business Name:</strong> ${data.businessName}</p>
            <p><strong>Contact Name:</strong> ${data.contactName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Experience:</strong> ${data.experience}</p>
            <p><strong>Request ID:</strong> ${data.requestId}</p>
          </div>

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #f57c00; margin-top: 0;">Your Message</h4>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</div>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Next Steps</h4>
            <p>Our partnership team will review your application and get back to you within 2-3 business days with next steps and partnership opportunities.</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Learn More About Our Platform
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            We're excited about the possibility of working together!
          </p>
        </div>
      </div>
    `;
  }

  // Generate booking cancellation HTML
  private generateBookingCancellationHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">📋 Booking Cancellation Acknowledged</h2>
          <p>Dear ${data.guestName},</p>
          <p>We've received your booking cancellation request. We're sorry to see you go, but we understand that plans can change.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Cancellation Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Original Amount:</strong> ₹${data.totalAmount.toLocaleString()}</p>
            <p><strong>Refund Amount:</strong> ₹${data.refundAmount.toLocaleString()}</p>
            <p><strong>Refund Method:</strong> ${data.refundMethod}</p>
            <p><strong>Refund Timeline:</strong> ${data.refundTimeline}</p>
          </div>

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #f57c00; margin-top: 0;">Cancellation Reason</h4>
            <p>${data.cancellationReason}</p>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Host Contact</h4>
            <p><strong>Host Name:</strong> ${data.hostName}</p>
            <p><strong>Phone:</strong> ${data.hostPhone}</p>
            <p><strong>Email:</strong> ${data.hostEmail}</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Book Again
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            We hope to welcome you back for a future stay!
          </p>
        </div>
      </div>
    `;
  }

  // Generate admin notification HTML
  private generateAdminNotificationHTML(type: string, data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">🔔 Admin Notification</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Details</h3>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${JSON.stringify(data, null, 2)}</pre>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            This is an automated notification from the Luxe Staycations system.
          </p>
        </div>
      </div>
    `;
  }

  // Generate loyalty welcome HTML
  private generateLoyaltyWelcomeHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">🎁 Welcome to Luxe Rewards!</h2>
          <p>Dear ${data.guestName},</p>
          <p>Congratulations! You're now a member of our exclusive Luxe Rewards program.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Your Rewards Benefits</h3>
            <ul>
              <li>🏆 Earn 1 point for every ₹100 spent</li>
              <li>💎 Exclusive member-only rates</li>
              <li>🎯 Priority booking and upgrades</li>
              <li>🌟 Complimentary amenities and services</li>
              <li>📱 Early access to new properties</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
            <div style="font-size: 36px; font-weight: bold; color: #d97706;">${data.currentPoints}</div>
            <p style="color: #5a3d35; margin: 5px 0;">Luxe Points</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${data.rewardsDashboardLink}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Rewards Dashboard
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Start earning points on your next booking and unlock exclusive rewards!
          </p>
        </div>
      </div>
    `;
  }

  // Generate marketing newsletter HTML
  private generateMarketingNewsletterHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">${data.newsletterTitle}</h2>
          <p>Dear ${data.guestName},</p>
          <p>${data.newsletterContent}</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Featured Property</h3>
            <h4>${data.featuredPropertyName}</h4>
            <p>${data.featuredPropertyDescription}</p>
            <p><strong>Starting from:</strong> ₹${data.featuredPropertyPrice.toLocaleString()}/night</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${data.ctaLink}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ${data.ctaText}
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for being part of the Luxe Staycations family!
          </p>
        </div>
      </div>
    `;
  }

  // Generate booking reminder HTML
  private generateBookingReminderHTML(data: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; text-align: center; margin-bottom: 20px;">📅 Your Stay is Coming Up!</h2>
          <p>Dear ${data.guestName},</p>
          <p>We're excited to welcome you to ${data.propertyName}! Your luxury getaway is just around the corner.</p>
          
          <div style="background-color: #f0f8f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Check-in:</strong> ${data.checkInDate}</p>
            <p><strong>Check-out:</strong> ${data.checkOutDate}</p>
            <p><strong>Guests:</strong> ${data.guestCount}</p>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Important Information</h4>
            <ul>
              <li>Check-in time: ${data.checkInTime}</li>
              <li>Check-out time: ${data.checkOutTime}</li>
              <li>Property address: ${data.propertyAddress}</li>
              <li>Host contact: ${data.hostPhone}</li>
            </ul>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${data.bookingLink}" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Full Booking Details
            </a>
          </p>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            We look forward to making your stay unforgettable!
          </p>
        </div>
      </div>
    `;
  }
}

// Create singleton instance
export const brevoEmailService = BrevoEmailService.getInstance();
