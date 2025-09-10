// Email Trigger Manager
// Handles automatic email sending based on business events

import { getSupabaseClient, TABLES } from '../supabase';
import { emailCore } from './EmailCore';
import { emailTemplateManager } from './EmailTemplateManager';
import { EmailTrigger, EmailTriggerData, BookingEmailData, PartnerRequestEmailData, ConsultationRequestEmailData, SpecialRequestEmailData, ContactFormEmailData, LoyaltyEmailData, AdminNotificationEmailData } from './types';

export class EmailTriggerManager {
  private static instance: EmailTriggerManager;
  private triggers: EmailTrigger[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EmailTriggerManager {
    if (!EmailTriggerManager.instance) {
      EmailTriggerManager.instance = new EmailTriggerManager();
    }
    return EmailTriggerManager.instance;
  }

  // Initialize trigger manager
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing EmailTriggerManager...');
      await this.loadTriggers();
      this.isInitialized = true;
      console.log(`EmailTriggerManager initialized with ${this.triggers.length} triggers`);
      return true;
    } catch (error) {
      console.error('Failed to initialize EmailTriggerManager:', error);
      return false;
    }
  }

  // Load triggers from Supabase
  private async loadTriggers(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('email_triggers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error loading email triggers:', error);
        throw error;
      }

      this.triggers = (data || []).map((trigger: any) => ({
        id: trigger.id,
        name: trigger.name,
        event: trigger.event,
        templateId: trigger.template_id,
        conditions: trigger.conditions || {},
        isActive: trigger.is_active,
        priority: trigger.priority,
        delay: trigger.delay || 0,
        createdAt: trigger.created_at,
        updatedAt: trigger.updated_at
      }));

      console.log(`Loaded ${this.triggers.length} email triggers from Supabase`);
    } catch (error) {
      console.error('Error loading email triggers:', error);
      throw error;
    }
  }

  // Process business event
  public async processEvent(event: string, data: any): Promise<void> {
    try {
      console.log(`Processing email event: ${event}`, data);

      // Find matching triggers
      const matchingTriggers = this.triggers.filter(trigger => 
        trigger.event === event && trigger.isActive
      );

      if (matchingTriggers.length === 0) {
        console.log(`No active triggers found for event: ${event}`);
        return;
      }

      // Process each trigger
      for (const trigger of matchingTriggers) {
        try {
          // Check conditions
          if (this.checkConditions(trigger.conditions || {}, data)) {
            // Apply delay if specified
            if (trigger.delay && trigger.delay > 0) {
              setTimeout(() => {
                this.executeTrigger(trigger, data);
              }, trigger.delay * 60 * 1000); // Convert minutes to milliseconds
            } else {
              await this.executeTrigger(trigger, data);
            }
          }
        } catch (error) {
          console.error(`Error processing trigger ${trigger.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing event ${event}:`, error);
    }
  }

  // Check trigger conditions
  private checkConditions(conditions: Record<string, any>, data: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false;
      }
    }

    return true;
  }

  // Execute trigger
  private async executeTrigger(trigger: EmailTrigger, data: any): Promise<void> {
    try {
      console.log(`Executing trigger: ${trigger.name} for event: ${trigger.event}`);

      // Get template
      const template = emailTemplateManager.getTemplateById(trigger.templateId);
      if (!template) {
        console.error(`Template not found: ${trigger.templateId}`);
        return;
      }

      // Prepare variables based on event type
      const variables = this.prepareVariables(trigger.event, data);

      // Send email
      const result = await emailCore.sendTemplateEmail(
        variables.to,
        trigger.templateId,
        variables
      );

      if (result.success) {
        console.log(`Email sent successfully for trigger: ${trigger.name}`);
      } else {
        console.error(`Failed to send email for trigger: ${trigger.name}`, result.error);
      }
    } catch (error) {
      console.error(`Error executing trigger ${trigger.name}:`, error);
    }
  }

  // Prepare variables based on event type
  private prepareVariables(event: string, data: any): { to: string | string[]; [key: string]: any } {
    switch (event) {
      case 'booking_confirmed':
        return this.prepareBookingConfirmationVariables(data as BookingEmailData);
      
      case 'booking_cancelled':
        return this.prepareBookingCancellationVariables(data as BookingEmailData);
      
      case 'partner_request_submitted':
        return this.preparePartnerRequestVariables(data as PartnerRequestEmailData);
      
      case 'consultation_request_submitted':
        return this.prepareConsultationRequestVariables(data as ConsultationRequestEmailData);
      
      case 'special_request_submitted':
        return this.prepareSpecialRequestVariables(data as SpecialRequestEmailData);
      
      case 'contact_form_submitted':
        return this.prepareContactFormVariables(data as ContactFormEmailData);
      
      case 'loyalty_points_earned':
        return this.prepareLoyaltyEarnedVariables(data as LoyaltyEmailData);
      
      case 'admin_notification':
        return this.prepareAdminNotificationVariables(data as AdminNotificationEmailData);
      
      default:
        return { to: data.email || data.to, ...data };
    }
  }

  // Booking confirmation variables
  private prepareBookingConfirmationVariables(data: BookingEmailData): { to: string; [key: string]: any } {
    return {
      to: data.guestEmail,
      bookingId: data.bookingId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      propertyName: data.propertyName,
      propertyLocation: data.propertyLocation,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      totalAmount: data.totalAmount.toLocaleString(),
      paymentStatus: data.paymentStatus,
      specialRequests: data.specialRequests || '',
      hostName: data.hostName || 'Property Host',
      hostPhone: data.hostPhone || '+91-8828279739',
      hostEmail: data.hostEmail || 'host@luxestaycations.in',
      amenities: (data.amenities || []).join(', '),
      cancellationPolicy: data.cancellationPolicy || 'Standard cancellation policy applies',
      checkInInstructions: data.checkInInstructions || 'Check-in instructions will be provided 24 hours before arrival',
      propertyAddress: data.propertyAddress || data.propertyLocation
    };
  }

  // Booking cancellation variables
  private prepareBookingCancellationVariables(data: BookingEmailData): { to: string; [key: string]: any } {
    return {
      to: data.guestEmail,
      bookingId: data.bookingId,
      guestName: data.guestName,
      propertyName: data.propertyName,
      refundAmount: data.totalAmount.toLocaleString(),
      cancellationReason: data.specialRequests || 'Customer requested cancellation'
    };
  }

  // Partner request variables
  private preparePartnerRequestVariables(data: PartnerRequestEmailData): { to: string; [key: string]: any } {
    return {
      to: data.email,
      requestId: data.requestId,
      businessName: data.businessName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      propertyType: data.propertyType,
      location: data.location,
      experience: data.experience,
      message: data.message,
      propertyCount: data.propertyCount || 1,
      expectedRevenue: data.expectedRevenue || 'To be discussed',
      preferredContactTime: data.preferredContactTime || 'Any time',
      website: data.website || 'Not provided',
      socialMedia: data.socialMedia || 'Not provided'
    };
  }

  // Consultation request variables
  private prepareConsultationRequestVariables(data: ConsultationRequestEmailData): { to: string; [key: string]: any } {
    return {
      to: data.email,
      requestId: data.requestId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      propertyType: data.propertyType,
      location: data.location,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      consultationType: data.consultationType,
      propertyDetails: data.propertyDetails || 'Not provided',
      budget: data.budget || 'To be discussed',
      timeline: data.timeline || 'Flexible',
      specialRequirements: data.specialRequirements || 'None'
    };
  }

  // Special request variables
  private prepareSpecialRequestVariables(data: SpecialRequestEmailData): { to: string; [key: string]: any } {
    return {
      to: data.email,
      requestId: data.requestId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      requestType: data.requestType,
      description: data.description,
      preferredDate: data.preferredDate || 'Flexible',
      budget: data.budget ? `₹${data.budget.toLocaleString()}` : 'To be discussed',
      urgency: data.urgency,
      additionalNotes: data.additionalNotes || 'None'
    };
  }

  // Contact form variables
  private prepareContactFormVariables(data: ContactFormEmailData): { to: string; [key: string]: any } {
    return {
      to: data.email,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      preferredContactMethod: data.preferredContactMethod,
      inquiryType: data.inquiryType,
      propertyInterest: data.propertyInterest || 'General inquiry',
      budget: data.budget || 'To be discussed',
      travelDates: data.travelDates || 'Flexible',
      guestCount: data.guestCount || 'Not specified'
    };
  }

  // Loyalty earned variables
  private prepareLoyaltyEarnedVariables(data: LoyaltyEmailData): { to: string; [key: string]: any } {
    return {
      to: data.userEmail,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      action: data.action,
      points: data.points,
      totalPoints: data.totalPoints,
      description: data.description,
      expiryDate: data.expiryDate || 'No expiry',
      redemptionCode: data.redemptionCode || 'Not applicable',
      propertyName: data.propertyName || 'General earning',
      bookingId: data.bookingId || 'Not applicable'
    };
  }

  // Admin notification variables
  private prepareAdminNotificationVariables(data: AdminNotificationEmailData): { to: string[]; [key: string]: any } {
    return {
      to: data.adminEmails,
      type: data.type,
      title: data.title,
      description: data.description,
      data: data.data,
      priority: data.priority,
      actionRequired: data.actionRequired,
      actionUrl: data.actionUrl || 'https://silly-banoffee-445ea8.netlify.app/admin',
      timestamp: new Date().toLocaleString(),
      ...data.data
    };
  }

  // Create trigger
  public async createTrigger(triggerData: EmailTriggerData): Promise<{ success: boolean; triggerId?: string; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('email_triggers')
        .insert({
          name: triggerData.name,
          event: triggerData.event,
          template_id: triggerData.templateId,
          conditions: triggerData.conditions || {},
          is_active: triggerData.isActive,
          priority: triggerData.priority,
          delay: triggerData.delay || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating email trigger:', error);
        return { success: false, error: error.message };
      }

      // Reload triggers
      await this.loadTriggers();

      console.log('Email trigger created successfully:', data.id);
      return { success: true, triggerId: data.id };
    } catch (error) {
      console.error('Error creating email trigger:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Update trigger
  public async updateTrigger(id: string, triggerData: Partial<EmailTriggerData>): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: any = {};

      if (triggerData.name !== undefined) updateData.name = triggerData.name;
      if (triggerData.event !== undefined) updateData.event = triggerData.event;
      if (triggerData.templateId !== undefined) updateData.template_id = triggerData.templateId;
      if (triggerData.conditions !== undefined) updateData.conditions = triggerData.conditions;
      if (triggerData.isActive !== undefined) updateData.is_active = triggerData.isActive;
      if (triggerData.priority !== undefined) updateData.priority = triggerData.priority;
      if (triggerData.delay !== undefined) updateData.delay = triggerData.delay;

      const { error } = await supabase
        .from('email_triggers')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating email trigger:', error);
        return { success: false, error: error.message };
      }

      // Reload triggers
      await this.loadTriggers();

      console.log('Email trigger updated successfully:', id);
      return { success: true };
    } catch (error) {
      console.error('Error updating email trigger:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Delete trigger
  public async deleteTrigger(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('email_triggers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting email trigger:', error);
        return { success: false, error: error.message };
      }

      // Reload triggers
      await this.loadTriggers();

      console.log('Email trigger deleted successfully:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting email trigger:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Initialize default triggers
  public async initializeDefaultTriggers(): Promise<void> {
    const defaultTriggers = [
      {
        name: 'Booking Confirmation',
        event: 'booking_confirmed',
        templateId: '', // Will be set after templates are created
        conditions: {},
        isActive: true,
        priority: 'high' as const,
        delay: 0
      },
      {
        name: 'Booking Cancellation',
        event: 'booking_cancelled',
        templateId: '', // Will be set after templates are created
        conditions: {},
        isActive: true,
        priority: 'high' as const,
        delay: 0
      },
      {
        name: 'Partner Request Confirmation',
        event: 'partner_request_submitted',
        templateId: '', // Will be set after templates are created
        conditions: {},
        isActive: true,
        priority: 'normal' as const,
        delay: 0
      },
      {
        name: 'Consultation Request Confirmation',
        event: 'consultation_request_submitted',
        templateId: '', // Will be set after templates are created
        conditions: {},
        isActive: true,
        priority: 'normal' as const,
        delay: 0
      },
      {
        name: 'Contact Form Thank You',
        event: 'contact_form_submitted',
        templateId: '', // Will be set after templates are created
        conditions: {},
        isActive: true,
        priority: 'normal' as const,
        delay: 0
      },
      {
        name: 'Loyalty Points Earned',
        event: 'loyalty_points_earned',
        templateId: '', // Will be set after templates are created
        conditions: {},
        isActive: true,
        priority: 'low' as const,
        delay: 0
      }
    ];

    // Get template IDs
    const templates = emailTemplateManager.getTemplates();
    for (const trigger of defaultTriggers) {
      const template = templates.find(t => t.type === trigger.event.replace('_submitted', '').replace('_confirmed', ''));
      if (template) {
        trigger.templateId = template.id;
        await this.createTrigger(trigger);
      }
    }
  }

  // Get triggers
  public getTriggers(): EmailTrigger[] {
    return this.triggers;
  }

  // Get triggers by event
  public getTriggersByEvent(event: string): EmailTrigger[] {
    return this.triggers.filter(trigger => trigger.event === event && trigger.isActive);
  }
}

// Export singleton instance
export const emailTriggerManager = EmailTriggerManager.getInstance();
