// Enhanced Email Delivery Service for Luxe Staycations
// This service provides better email delivery tracking and error handling

import { emailService, EmailConfig } from './emailService';
import { integratedEmailService } from './integratedEmailService';

export interface EmailDeliveryStatus {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  recipient: string;
  subject: string;
  deliveryAttempts: number;
}

export interface EmailDeliveryLog {
  id: string;
  type: 'booking_confirmation' | 'consultation_request' | 'contact_form' | 'partner_request' | 'special_request' | 'booking_cancellation' | 'admin_notification';
  recipient: string;
  subject: string;
  status: EmailDeliveryStatus;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export class EmailDeliveryService {
  private deliveryLogs: EmailDeliveryLog[] = [];
  private maxRetryAttempts = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    // Initialize with empty logs - all data will be stored in Supabase
    this.deliveryLogs = [];
  }

  // Send email with delivery tracking
  async sendEmailWithTracking(
    type: EmailDeliveryLog['type'],
    recipient: string,
    subject: string,
    data: any,
    emailFunction: () => Promise<{ success: boolean; message: string }>
  ): Promise<EmailDeliveryStatus> {
    const logId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const log: EmailDeliveryLog = {
      id: logId,
      type,
      recipient,
      subject,
      status: {
        success: false,
        timestamp: new Date().toISOString(),
        recipient,
        subject,
        deliveryAttempts: 0
      },
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.deliveryLogs.push(log);
    // Note: Actual persistence is handled by SupabaseEmailDeliveryService

    // Attempt to send email with retries
    for (let attempt = 1; attempt <= this.maxRetryAttempts; attempt++) {
      try {
        log.status.deliveryAttempts = attempt;
        log.updatedAt = new Date().toISOString();

        console.log(`Email delivery attempt ${attempt}/${this.maxRetryAttempts} for ${type} to ${recipient}`);

        const result = await emailFunction();
        
        if (result.success) {
          log.status.success = true;
          log.status.messageId = result.message;
          log.status.timestamp = new Date().toISOString();
          
          console.log(`Email sent successfully on attempt ${attempt}:`, result.message);
          break;
        } else {
          log.status.error = result.message;
          console.warn(`Email delivery failed on attempt ${attempt}:`, result.message);
          
          if (attempt < this.maxRetryAttempts) {
            console.log(`Retrying in ${this.retryDelay}ms...`);
            await this.delay(this.retryDelay);
          }
        }
      } catch (error) {
        log.status.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Email delivery error on attempt ${attempt}:`, error);
        
        if (attempt < this.maxRetryAttempts) {
          console.log(`Retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
        }
      }
    }

    // Note: Actual persistence is handled by SupabaseEmailDeliveryService
    return log.status;
  }

  // Send booking confirmation with tracking
  async sendBookingConfirmationWithTracking(data: any): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'booking_confirmation',
      data.guestEmail,
      `🎉 Booking Confirmed - ${data.bookingId} | Luxe Staycations`,
      data,
      async () => {
        const result = await integratedEmailService.sendBookingConfirmation(data);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Send consultation request with tracking
  async sendConsultationRequestWithTracking(data: any): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'consultation_request',
      data.email,
      `🏡 Host Partnership Consultation Confirmed - ${data.requestId} | Luxe Staycations`,
      data,
      async () => {
        const result = await integratedEmailService.sendConsultationConfirmation(data);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Send contact form thank you with tracking
  async sendContactFormThankYouWithTracking(data: any): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'contact_form',
      data.email,
      `🙏 Thank You for Contacting Us - ${data.subject} | Luxe Staycations`,
      data,
      async () => {
        const result = await integratedEmailService.sendContactFormThankYou(data);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Send partner request with tracking
  async sendPartnerRequestWithTracking(data: any): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'partner_request',
      data.email,
      `🤝 Partner Application Received - ${data.businessName} | Luxe Staycations`,
      data,
      async () => {
        const result = await integratedEmailService.sendPartnerRequestConfirmation(data);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Send special request with tracking
  async sendSpecialRequestWithTracking(data: any): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'special_request',
      data.guestEmail,
      `✨ Special Request Received | Luxe Staycations`,
      data,
      async () => {
        const result = await integratedEmailService.sendSpecialRequestConfirmation(data);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Send booking cancellation with tracking
  async sendBookingCancellationWithTracking(data: any): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'booking_cancellation',
      data.guestEmail,
      `📋 Booking Cancellation Acknowledged - ${data.bookingId} | Luxe Staycations`,
      data,
      async () => {
        const result = await integratedEmailService.sendBookingCancellation(data);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Send admin notification with tracking
  async sendAdminNotificationWithTracking(type: string, data: any, adminEmail: string): Promise<EmailDeliveryStatus> {
    return this.sendEmailWithTracking(
      'admin_notification',
      adminEmail,
      `🔔 Admin Notification - ${type} | Luxe Staycations`,
      { type, data },
      async () => {
        const result = await integratedEmailService.sendAdminNotification(type, data, adminEmail);
        return {
          success: result.success,
          message: result.error || 'Email sent successfully'
        };
      }
    );
  }

  // Get delivery statistics
  getDeliveryStatistics(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    recentFailures: EmailDeliveryLog[];
  } {
    const total = this.deliveryLogs.length;
    const successful = this.deliveryLogs.filter(log => log.status.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    
    const recentFailures = this.deliveryLogs
      .filter(log => !log.status.success)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      total,
      successful,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      recentFailures
    };
  }

  // Get delivery logs by type
  getDeliveryLogsByType(type: EmailDeliveryLog['type']): EmailDeliveryLog[] {
    return this.deliveryLogs.filter(log => log.type === type);
  }

  // Get recent delivery logs
  getRecentDeliveryLogs(limit: number = 50): EmailDeliveryLog[] {
    return this.deliveryLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Clear old delivery logs (older than 30 days)
  clearOldLogs(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.deliveryLogs = this.deliveryLogs.filter(
      log => new Date(log.createdAt) > thirtyDaysAgo
    );
    
    // Note: Actual persistence is handled by SupabaseEmailDeliveryService
  }

  // Retry failed emails
  async retryFailedEmails(): Promise<{ retried: number; successful: number }> {
    const failedLogs = this.deliveryLogs.filter(log => !log.status.success);
    let retried = 0;
    let successful = 0;

    for (const log of failedLogs) {
      if (log.status.deliveryAttempts < this.maxRetryAttempts) {
        retried++;
        
        try {
          let result;
          switch (log.type) {
            case 'booking_confirmation':
              result = await emailService.sendBookingConfirmation(log.data);
              break;
            case 'consultation_request':
              result = await emailService.sendConsultationConfirmation(log.data);
              break;
            case 'contact_form':
              result = await emailService.sendContactFormThankYou(log.data);
              break;
            case 'partner_request':
              result = await emailService.sendPartnerRequestConfirmation(log.data);
              break;
            case 'special_request':
              result = await emailService.sendSpecialRequestConfirmation(log.data);
              break;
            case 'booking_cancellation':
              result = await emailService.sendBookingCancellation(log.data);
              break;
            case 'admin_notification':
              result = await emailService.sendAdminNotification(log.data.type, log.data.data, log.recipient);
              break;
            default:
              continue;
          }

          if (result.success) {
            log.status.success = true;
            log.status.messageId = result.message;
            log.status.error = undefined;
            successful++;
          } else {
            log.status.error = result.message;
            log.status.deliveryAttempts++;
          }
          
          log.updatedAt = new Date().toISOString();
        } catch (error) {
          log.status.error = error instanceof Error ? error.message : 'Unknown error';
          log.status.deliveryAttempts++;
          log.updatedAt = new Date().toISOString();
        }
      }
    }

    // Note: Actual persistence is handled by SupabaseEmailDeliveryService
    return { retried, successful };
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Run email diagnostics
  async runEmailDiagnostics(config: EmailConfig): Promise<any> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Diagnostics failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error running email diagnostics:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create singleton instance
export const emailDeliveryService = new EmailDeliveryService();
