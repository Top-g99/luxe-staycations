// WhatsApp Service for Luxe Staycations
// Handles WhatsApp Business API integration for notifications and communication

import { supabaseWhatsAppManager } from './supabaseWhatsAppManager';

export interface WhatsAppConfig {
  businessAccountId: string;
  accessToken: string;
  phoneNumberId: string;
  webhookVerifyToken: string;
  apiVersion: string;
  enabled: boolean;
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}

export interface BookingWhatsAppData {
  guestName: string;
  guestPhone: string;
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  confirmationCode: string;
}

export interface CancellationWhatsAppData {
  guestName: string;
  guestPhone: string;
  bookingId: string;
  propertyName: string;
  refundAmount: number;
  cancellationReason: string;
}

export interface ReminderWhatsAppData {
  guestName: string;
  guestPhone: string;
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  reminderType: 'check_in' | 'check_out' | 'payment_due';
}

export class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  public isConfigured = false;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  // Initialize WhatsApp service
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await supabaseWhatsAppManager.initialize();
      await this.loadConfiguration();
      this.isInitialized = true;
      console.log('WhatsApp service initialized');
    } catch (error) {
      console.error('Error initializing WhatsApp service:', error);
    }
  }

  // Load configuration from Supabase
  private async loadConfiguration(): Promise<void> {
    try {
      const config = await supabaseWhatsAppManager.loadConfiguration();
      if (config) {
        this.config = config;
        this.isConfigured = config.enabled;
        console.log('WhatsApp configuration loaded from Supabase');
      }
    } catch (error) {
      console.error('Error loading WhatsApp configuration:', error);
    }
  }

  // Configure WhatsApp service
  public async configure(config: WhatsAppConfig): Promise<boolean> {
    try {
      const success = await supabaseWhatsAppManager.saveConfiguration(config);
      if (success) {
        this.config = config;
        this.isConfigured = config.enabled;
        console.log('WhatsApp configuration saved to Supabase');
      }
      return success;
    } catch (error) {
      console.error('Error saving WhatsApp configuration:', error);
      return false;
    }
  }

  // Send WhatsApp message
  public async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; message: string; messageId?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          message: message
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false, message: 'Failed to send WhatsApp message' };
    }
  }

  // Send booking confirmation
  public async sendBookingConfirmation(data: BookingWhatsAppData): Promise<{ success: boolean; message: string }> {
    const message = this.createBookingConfirmationMessage(data);
    return await this.sendMessage(message);
  }

  // Send booking cancellation
  public async sendBookingCancellation(data: CancellationWhatsAppData): Promise<{ success: boolean; message: string }> {
    const message = this.createCancellationMessage(data);
    return await this.sendMessage(message);
  }

  // Send reminder
  public async sendReminder(data: ReminderWhatsAppData): Promise<{ success: boolean; message: string }> {
    const message = this.createReminderMessage(data);
    return await this.sendMessage(message);
  }

  // Send welcome message
  public async sendWelcomeMessage(phone: string, guestName: string): Promise<{ success: boolean; message: string }> {
    const message: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: `🎉 Welcome to Luxe Staycations, ${guestName}!\n\nThank you for choosing us for your luxury villa experience. We're here to make your stay unforgettable!\n\nFor any assistance, feel free to reach out to us.\n\nBest regards,\nLuxe Staycations Team\n📞 +91-8828279739`
      }
    };
    return await this.sendMessage(message);
  }

  // Send quick response
  public async sendQuickResponse(phone: string, message: string): Promise<{ success: boolean; message: string }> {
    const whatsappMessage: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: message
      }
    };
    return await this.sendMessage(whatsappMessage);
  }

  // Create booking confirmation message
  private createBookingConfirmationMessage(data: BookingWhatsAppData): WhatsAppMessage {
    return {
      to: data.guestPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `🎉 *Booking Confirmed!*\n\nDear ${data.guestName},\n\nYour luxury villa booking has been confirmed!\n\n📋 *Booking Details:*\n• Booking ID: ${data.bookingId}\n• Property: ${data.propertyName}\n• Check-in: ${data.checkIn}\n• Check-out: ${data.checkOut}\n• Total Amount: ₹${data.totalAmount}\n• Confirmation Code: ${data.confirmationCode}\n\nWe're excited to host you! For any queries, contact us at +91-8828279739\n\nThank you for choosing Luxe Staycations! 🏖️`
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'view_booking',
                title: 'View Booking'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'contact_support',
                title: 'Contact Support'
              }
            }
          ]
        }
      }
    };
  }

  // Create cancellation message
  private createCancellationMessage(data: CancellationWhatsAppData): WhatsAppMessage {
    return {
      to: data.guestPhone,
      type: 'text',
      text: {
        body: `📋 *Booking Cancellation Confirmed*\n\nDear ${data.guestName},\n\nYour booking has been cancelled as requested.\n\n📋 *Cancellation Details:*\n• Booking ID: ${data.bookingId}\n• Property: ${data.propertyName}\n• Refund Amount: ₹${data.refundAmount}\n• Reason: ${data.cancellationReason}\n\nYour refund will be processed within 5-7 business days.\n\nWe hope to serve you again soon!\n\nFor any queries, contact us at +91-8828279739\n\nBest regards,\nLuxe Staycations Team`
      }
    };
  }

  // Create reminder message
  private createReminderMessage(data: ReminderWhatsAppData): WhatsAppMessage {
    let reminderText = '';
    let emoji = '';

    switch (data.reminderType) {
      case 'check_in':
        emoji = '🏖️';
        reminderText = `*Check-in Reminder*\n\nDear ${data.guestName},\n\nYour check-in is tomorrow!\n\n📋 *Booking Details:*\n• Property: ${data.propertyName}\n• Check-in: ${data.checkIn}\n• Check-out: ${data.checkOut}\n\nWe're excited to welcome you! Please arrive between 2:00 PM - 6:00 PM.\n\nFor any assistance, contact us at +91-8828279739`;
        break;
      case 'check_out':
        emoji = '👋';
        reminderText = `*Check-out Reminder*\n\nDear ${data.guestName},\n\nYour check-out is tomorrow!\n\n📋 *Booking Details:*\n• Property: ${data.propertyName}\n• Check-out: ${data.checkOut}\n\nPlease check out by 11:00 AM. We hope you had a wonderful stay!\n\nFor any assistance, contact us at +91-8828279739`;
        break;
      case 'payment_due':
        emoji = '💳';
        reminderText = `*Payment Reminder*\n\nDear ${data.guestName},\n\nYour payment is due soon!\n\n📋 *Booking Details:*\n• Property: ${data.propertyName}\n• Check-in: ${data.checkIn}\n• Check-out: ${data.checkOut}\n\nPlease complete your payment to confirm your booking.\n\nFor any assistance, contact us at +91-8828279739`;
        break;
    }

    return {
      to: data.guestPhone,
      type: 'text',
      text: {
        body: `${emoji} ${reminderText}\n\nBest regards,\nLuxe Staycations Team`
      }
    };
  }

  // Test WhatsApp connection
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/whatsapp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      return { success: false, message: 'Failed to test WhatsApp connection' };
    }
  }

  // Get current configuration
  public getConfig(): WhatsAppConfig | null {
    return this.config;
  }

  // Check if service is configured
  public isServiceConfigured(): boolean {
    return this.isConfigured && this.config !== null;
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
