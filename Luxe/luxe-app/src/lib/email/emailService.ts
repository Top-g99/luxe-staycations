// Main Email Service
// Integrates all email components and provides a unified interface

import { emailCore } from './EmailCore';
import { emailTemplateManager } from './EmailTemplateManager';
import { emailTriggerManager } from './EmailTriggerManager';
import { 
  EmailOptions, 
  EmailSendResult, 
  EmailRecipient,
  BookingEmailData, 
  PartnerRequestEmailData, 
  ConsultationRequestEmailData, 
  SpecialRequestEmailData, 
  ContactFormEmailData, 
  LoyaltyEmailData, 
  AdminNotificationEmailData 
} from './types';

export class EmailService {
  private static instance: EmailService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Initialize the complete email system
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing complete EmailService...');

      // Initialize core components
      const coreInitialized = await emailCore.initialize();
      if (!coreInitialized) {
        console.error('Failed to initialize EmailCore');
        return false;
      }

      const templateInitialized = await emailTemplateManager.initialize();
      if (!templateInitialized) {
        console.error('Failed to initialize EmailTemplateManager');
        return false;
      }

      const triggerInitialized = await emailTriggerManager.initialize();
      if (!triggerInitialized) {
        console.error('Failed to initialize EmailTriggerManager');
        return false;
      }

      // Initialize default templates and triggers
      await emailTemplateManager.initializeDefaultTemplates();
      await emailTriggerManager.initializeDefaultTriggers();

      this.isInitialized = true;
      console.log('EmailService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize EmailService:', error);
      return false;
    }
  }

  // Helper function to convert EmailRecipient[] to string[]
  private convertRecipientsToEmails(recipients: string | string[] | EmailRecipient[]): string | string[] {
    if (typeof recipients === 'string') {
      return recipients;
    }
    
    if (Array.isArray(recipients)) {
      // Check if it's EmailRecipient[]
      if (recipients.length > 0 && typeof recipients[0] === 'object' && 'email' in recipients[0]) {
        return (recipients as EmailRecipient[]).map(r => r.email);
      }
      // It's string[]
      return recipients as string[];
    }
    
    return recipients;
  }

  // Send email using options
  public async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { to, subject, html, text, templateId, variables, ...otherOptions } = options;
      const convertedTo = this.convertRecipientsToEmails(to);

      if (templateId) {
        return await emailCore.sendTemplateEmail(convertedTo, templateId, variables || {});
      } else {
        return await emailCore.sendEmail(convertedTo, subject, html || '', text);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send booking confirmation email
  public async sendBookingConfirmation(data: BookingEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('booking_confirmed', data);

      // Also send admin notification
      await this.sendAdminNotification({
        type: 'booking',
        title: 'New Booking Confirmed',
        description: `Booking ${data.bookingId} confirmed for ${data.propertyName}`,
        data: data,
        priority: 'normal',
        actionRequired: false,
        adminEmails: ['admin@luxestaycations.in']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send booking cancellation email
  public async sendBookingCancellation(data: BookingEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('booking_cancelled', data);

      // Also send admin notification
      await this.sendAdminNotification({
        type: 'cancellation',
        title: 'Booking Cancelled',
        description: `Booking ${data.bookingId} has been cancelled`,
        data: data,
        priority: 'high',
        actionRequired: true,
        adminEmails: ['admin@luxestaycations.in']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending booking cancellation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send partner request confirmation email
  public async sendPartnerRequestConfirmation(data: PartnerRequestEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('partner_request_submitted', data);

      // Also send admin notification
      await this.sendAdminNotification({
        type: 'partner_request',
        title: 'New Partner Application',
        description: `Partner application from ${data.businessName}`,
        data: data,
        priority: 'normal',
        actionRequired: true,
        adminEmails: ['admin@luxestaycations.in', 'partnerships@luxestaycations.in']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending partner request confirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send consultation request confirmation email
  public async sendConsultationRequestConfirmation(data: ConsultationRequestEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('consultation_request_submitted', data);

      // Also send admin notification
      await this.sendAdminNotification({
        type: 'consultation',
        title: 'New Consultation Request',
        description: `Consultation request from ${data.name}`,
        data: data,
        priority: 'normal',
        actionRequired: true,
        adminEmails: ['admin@luxestaycations.in', 'consultations@luxestaycations.in']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending consultation request confirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send special request confirmation email
  public async sendSpecialRequestConfirmation(data: SpecialRequestEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('special_request_submitted', data);

      // Also send admin notification
      await this.sendAdminNotification({
        type: 'special_request',
        title: 'New Special Request',
        description: `Special request from ${data.name}: ${data.requestType}`,
        data: data,
        priority: data.urgency === 'high' ? 'high' : 'normal',
        actionRequired: true,
        adminEmails: ['admin@luxestaycations.in', 'specialrequests@luxestaycations.in']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending special request confirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send contact form thank you email
  public async sendContactFormThankYou(data: ContactFormEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('contact_form_submitted', data);

      // Also send admin notification
      await this.sendAdminNotification({
        type: 'contact_form',
        title: 'New Contact Form Submission',
        description: `Contact form from ${data.name}: ${data.subject}`,
        data: data,
        priority: 'normal',
        actionRequired: true,
        adminEmails: ['admin@luxestaycations.in', 'info@luxestaycations.in']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending contact form thank you:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send loyalty points earned email
  public async sendLoyaltyPointsEarned(data: LoyaltyEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('loyalty_points_earned', data);

      return { success: true };
    } catch (error) {
      console.error('Error sending loyalty points earned:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send admin notification email
  public async sendAdminNotification(data: AdminNotificationEmailData): Promise<EmailSendResult> {
    try {
      // Trigger automatic email
      await emailTriggerManager.processEvent('admin_notification', data);

      return { success: true };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test email connection
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await emailCore.testConnection();
  }

  // Send test email
  public async sendTestEmail(to: string): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const testEmailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email - Luxe Staycations</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #d97706;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #5a3d35;
            margin-bottom: 10px;
        }
        .tagline {
            color: #666;
            font-style: italic;
        }
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
        }
        .config-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #5a3d35;
        }
        .detail-value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Luxe Staycations</div>
            <div class="tagline">Luxury Redefined</div>
        </div>

        <h2>🎉 Email System Test Successful!</h2>
        
        <div class="success-message">
            <strong>✅ Congratulations!</strong><br>
            Your new email system is working perfectly. This test email was successfully sent using the enhanced email infrastructure.
        </div>

        <p>Dear Admin,</p>
        <p>This is a test email to confirm that your new email system is working correctly. The system now includes:</p>
        
        <ul>
            <li>✅ Enhanced SMTP configuration with retry logic</li>
            <li>✅ Template management system</li>
            <li>✅ Automatic email triggers for all business flows</li>
            <li>✅ Email queue and retry system</li>
            <li>✅ Comprehensive logging and analytics</li>
            <li>✅ Supabase integration for configuration and templates</li>
        </ul>

        <div class="config-details">
            <h3>System Features:</h3>
            <div class="detail-row">
                <span class="detail-label">Email Core:</span>
                <span class="detail-value">Initialized</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Template Manager:</span>
                <span class="detail-value">Active</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Trigger Manager:</span>
                <span class="detail-value">Active</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Auto-Emails:</span>
                <span class="detail-value">Enabled</span>
            </div>
        </div>

        <p><strong>Next Steps:</strong></p>
        <p>Your enhanced email system is now ready to handle all business communications automatically. The system will send emails for bookings, cancellations, partner requests, consultations, and more.</p>

        <div class="footer">
            <p>This is a test email from Luxe Staycations Enhanced Email System</p>
            <p>&copy; 2025 Luxe Staycations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    return await emailCore.sendEmail(
      to,
      '✅ Enhanced Email System Test - Luxe Staycations',
      testEmailContent
    );
  }

  // Get email configuration
  public getConfig() {
    return emailCore.getConfig();
  }

  // Check if service is ready
  public isReady(): boolean {
    return this.isInitialized && emailCore.isReady();
  }

  // Get templates
  public getTemplates() {
    return emailTemplateManager.getTemplates();
  }

  // Get triggers
  public getTriggers() {
    return emailTriggerManager.getTriggers();
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
