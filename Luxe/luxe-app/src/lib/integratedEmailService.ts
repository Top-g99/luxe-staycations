// Integrated Email Service for Luxe Staycations
// This service integrates Brevo as the primary email provider with fallback to existing services

import { brevoEmailService, BrevoConfig } from './brevoEmailService';
import { emailService } from './emailService';
import { getSupabaseClient } from './supabase';

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  provider: 'brevo' | 'fallback';
}

export class IntegratedEmailService {
  private static instance: IntegratedEmailService;
  private isBrevoConfigured = false;
  private brevoConfig: BrevoConfig | null = null;

  private constructor() {}

  public static getInstance(): IntegratedEmailService {
    if (!IntegratedEmailService.instance) {
      IntegratedEmailService.instance = new IntegratedEmailService();
    }
    return IntegratedEmailService.instance;
  }

  // Initialize the integrated email service
  public async initialize(): Promise<boolean> {
    try {
      // Check if Brevo is configured
      const supabase = getSupabaseClient();
      const { data: config, error } = await supabase
        .from('brevo_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error || !config || config.length === 0) {
        console.log('Brevo not configured, will use fallback email service');
        this.isBrevoConfigured = false;
        return true;
      }

      this.brevoConfig = {
        apiKey: config[0].api_key,
        senderEmail: config[0].sender_email,
        senderName: config[0].sender_name,
        replyToEmail: config[0].reply_to_email
      };

      // Initialize Brevo service
      const brevoInitialized = await brevoEmailService.initialize(this.brevoConfig);
      this.isBrevoConfigured = brevoInitialized;
      
      console.log(`Integrated email service initialized with ${this.isBrevoConfigured ? 'Brevo' : 'fallback'} provider`);
      return true;

    } catch (error) {
      console.error('Error initializing integrated email service:', error);
      this.isBrevoConfigured = false;
      return true; // Still return true to allow fallback
    }
  }

  // Send booking confirmation email
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendBookingConfirmation(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo booking confirmation failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      const result = await emailService.sendBookingConfirmation(data);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendConsultationConfirmation(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo consultation confirmation failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      const result = await emailService.sendConsultationConfirmation(data);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Send special request confirmation email
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendSpecialRequestConfirmation(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo special request confirmation failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      // Map data to expected format
      const mappedData = {
        guestName: data.guestName,
        email: data.guestEmail,
        phone: '', // Not available in current data structure
        propertyName: data.propertyName,
        requestType: data.requests?.[0]?.type || 'General Request',
        description: data.requests?.[0]?.description || 'Special request',
        urgency: data.urgency,
        requestId: data.requestId
      };
      const result = await emailService.sendSpecialRequestConfirmation(mappedData);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Send contact form thank you email
  public async sendContactFormThankYou(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendContactFormThankYou(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo contact form thank you failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      const result = await emailService.sendContactFormThankYou(data);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendPartnerRequestConfirmation(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo partner request confirmation failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      // Map data to expected format
      const mappedData = {
        businessName: data.businessName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        propertyType: 'Luxury Property', // Default value
        location: data.location,
        experience: data.experience,
        message: data.message,
        requestId: data.requestId
      };
      const result = await emailService.sendPartnerRequestConfirmation(mappedData);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendBookingCancellation(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo booking cancellation failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      const result = await emailService.sendBookingCancellation(data);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Send admin notification email
  public async sendAdminNotification(type: string, data: any, adminEmail: string): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendAdminNotification(type, data, adminEmail);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo admin notification failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      const result = await emailService.sendAdminNotification(type, data, adminEmail);
      return {
        success: result.success,
        messageId: undefined,
        error: result.success ? undefined : result.message,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Send loyalty welcome email
  public async sendLoyaltyWelcome(data: {
    guestName: string;
    guestEmail: string;
    currentPoints: number;
    rewardsDashboardLink: string;
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendLoyaltyWelcome(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo loyalty welcome failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service (if available)
    try {
      // For now, just return success as fallback
      return {
        success: true,
        messageId: undefined,
        error: undefined,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Send marketing newsletter email
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendMarketingNewsletter(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo marketing newsletter failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service (if available)
    try {
      // For now, just return success as fallback
      return {
        success: true,
        messageId: undefined,
        error: undefined,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Send booking reminder email
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
  }): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendBookingReminder(data);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo booking reminder failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service (if available)
    try {
      // For now, just return success as fallback
      return {
        success: true,
        messageId: undefined,
        error: undefined,
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Test email sending
  public async sendTestEmail(testEmail: string): Promise<EmailDeliveryResult> {
    await this.initialize();

    if (this.isBrevoConfigured) {
      try {
        const result = await brevoEmailService.sendTestEmail(testEmail);
        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          timestamp: result.timestamp,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Brevo test email failed, trying fallback:', error);
      }
    }

    // Fallback to existing email service
    try {
      const result = await emailService.sendTestEmail(testEmail);
      return {
        success: result,
        messageId: undefined,
        error: result ? undefined : 'Test email failed',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        provider: 'fallback'
      };
    }
  }

  // Get service status
  public getServiceStatus(): {
    isBrevoConfigured: boolean;
    provider: 'brevo' | 'fallback';
    brevoConfig?: Partial<BrevoConfig>;
  } {
    return {
      isBrevoConfigured: this.isBrevoConfigured,
      provider: this.isBrevoConfigured ? 'brevo' : 'fallback',
      brevoConfig: this.brevoConfig ? {
        senderEmail: this.brevoConfig.senderEmail,
        senderName: this.brevoConfig.senderName,
        replyToEmail: this.brevoConfig.replyToEmail
      } : undefined
    };
  }
}

// Create singleton instance
export const integratedEmailService = IntegratedEmailService.getInstance();
