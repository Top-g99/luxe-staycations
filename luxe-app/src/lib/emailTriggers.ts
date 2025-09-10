// Email Triggers for Luxe Staycations
// Auto-stage email triggers for different events

import { emailService } from './emailService';
import { emailTemplateManager } from './emailTemplateManager';

export interface EmailTrigger {
  id: string;
  name: string;
  event: string;
  templateType: string;
  enabled: boolean;
  conditions?: Record<string, any>;
  delay?: number; // Delay in minutes
}

export class EmailTriggerManager {
  private triggers: EmailTrigger[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await emailService.initialize();
      // EmailTemplateManager initializes itself in constructor
      this.setupDefaultTriggers();
      this.isInitialized = true;
      console.log('EmailTriggerManager initialized');
    } catch (error) {
      console.error('Error initializing EmailTriggerManager:', error);
    }
  }

  private setupDefaultTriggers(): void {
    this.triggers = [
      {
        id: 'booking_confirmation',
        name: 'Booking Confirmation',
        event: 'booking_created',
        templateType: 'booking_confirmation',
        enabled: true,
        delay: 0
      },
      {
        id: 'booking_reminder_24h',
        name: '24-Hour Booking Reminder',
        event: 'booking_reminder_24h',
        templateType: 'booking_confirmation',
        enabled: true,
        delay: 24 * 60 // 24 hours in minutes
      },
      {
        id: 'booking_reminder_1h',
        name: '1-Hour Check-in Reminder',
        event: 'booking_reminder_1h',
        templateType: 'booking_confirmation',
        enabled: true,
        delay: 1 * 60 // 1 hour in minutes
      },
      {
        id: 'booking_cancellation',
        name: 'Booking Cancellation',
        event: 'booking_cancelled',
        templateType: 'booking_cancellation',
        enabled: true,
        delay: 0
      },
      {
        id: 'partner_request',
        name: 'Partner Request Confirmation',
        event: 'partner_request_created',
        templateType: 'partner_request',
        enabled: true,
        delay: 0
      },
      {
        id: 'consultation_request',
        name: 'Consultation Request Confirmation',
        event: 'consultation_request_created',
        templateType: 'consultation_request',
        enabled: true,
        delay: 0
      },
      {
        id: 'special_request',
        name: 'Special Request Confirmation',
        event: 'special_request_created',
        templateType: 'special_request',
        enabled: true,
        delay: 0
      },
      {
        id: 'contact_form',
        name: 'Contact Form Thank You',
        event: 'contact_form_submitted',
        templateType: 'contact_form',
        enabled: true,
        delay: 0
      }
    ];
  }

  // Trigger email for specific event
  async triggerEmail(event: string, data: any): Promise<{ success: boolean; message: string }> {
    try {
      const trigger = this.triggers.find(t => t.event === event && t.enabled);
      if (!trigger) {
        console.log(`No email trigger found for event: ${event}`);
        return { success: false, message: `No email trigger found for event: ${event}` };
      }

      // Check if email service is configured
      if (!emailService.isEmailConfigured()) {
        console.log('Email service not configured, skipping trigger');
        return { success: false, message: 'Email service not configured' };
      }

      // Get template for the trigger
      const templates = emailTemplateManager.getTemplatesByType(trigger.templateType as any);
      if (templates.length === 0) {
        console.log(`No template found for type: ${trigger.templateType}`);
        return { success: false, message: `No template found for type: ${trigger.templateType}` };
      }

      const template = templates[0];
      const processed = emailTemplateManager.processTemplate(template.id, data);
      if (!processed) {
        console.log('Failed to process template');
        return { success: false, message: 'Failed to process template' };
      }

      // Send email using the processed template
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: emailService.getConfig(),
          to: data.email || data.guestEmail,
          template: processed
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        return { success: false, message: errorResult.message || 'Failed to send email' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message || 'Email sent successfully' };

    } catch (error) {
      console.error('Error triggering email:', error);
      return { success: false, message: 'Error triggering email' };
    }
  }

  // Trigger booking confirmation email
  async triggerBookingConfirmation(bookingData: any): Promise<{ success: boolean; message: string }> {
    return this.triggerEmail('booking_created', bookingData);
  }

  // Trigger booking cancellation email
  async triggerBookingCancellation(cancellationData: any): Promise<{ success: boolean; message: string }> {
    return this.triggerEmail('booking_cancelled', cancellationData);
  }

  // Trigger partner request email
  async triggerPartnerRequest(partnerData: any): Promise<{ success: boolean; message: string }> {
    return this.triggerEmail('partner_request_created', partnerData);
  }

  // Trigger consultation request email
  async triggerConsultationRequest(consultationData: any): Promise<{ success: boolean; message: string }> {
    return this.triggerEmail('consultation_request_created', consultationData);
  }

  // Trigger special request email
  async triggerSpecialRequest(specialData: any): Promise<{ success: boolean; message: string }> {
    return this.triggerEmail('special_request_created', specialData);
  }

  // Trigger contact form email
  async triggerContactForm(contactData: any): Promise<{ success: boolean; message: string }> {
    return this.triggerEmail('contact_form_submitted', contactData);
  }

  // Get all triggers
  getTriggers(): EmailTrigger[] {
    return [...this.triggers];
  }

  // Enable/disable trigger
  toggleTrigger(triggerId: string, enabled: boolean): void {
    const trigger = this.triggers.find(t => t.id === triggerId);
    if (trigger) {
      trigger.enabled = enabled;
    }
  }

  // Add custom trigger
  addTrigger(trigger: Omit<EmailTrigger, 'id'>): void {
    const newTrigger: EmailTrigger = {
      ...trigger,
      id: `custom_${Date.now()}`
    };
    this.triggers.push(newTrigger);
  }

  // Remove trigger
  removeTrigger(triggerId: string): void {
    this.triggers = this.triggers.filter(t => t.id !== triggerId);
  }
}

// Create singleton instance
export const emailTriggerManager = new EmailTriggerManager();
