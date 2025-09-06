import { supabaseEmailManager } from './supabaseEmailManager';

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'booking_confirmation' | 'booking_cancellation' | 'partner_request' | 'consultation_request' | 'special_request' | 'admin_notification' | 'custom';
  subject: string;
  html: string;
  text: string;
  variables: string[]; // List of available variables for this template
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
  required: boolean;
}

export const TEMPLATE_VARIABLES: Record<string, TemplateVariable> = {
  // Guest Information
  '{{guestName}}': {
    name: 'Guest Name',
    description: 'Full name of the guest',
    example: 'John Doe',
    required: true
  },
  '{{guestEmail}}': {
    name: 'Guest Email',
    description: 'Email address of the guest',
    example: 'john@example.com',
    required: true
  },
  '{{guestPhone}}': {
    name: 'Guest Phone',
    description: 'Phone number of the guest',
    example: '+91-8828279739',
    required: false
  },
  
  // Booking Information
  '{{bookingId}}': {
    name: 'Booking ID',
    description: 'Unique booking identifier',
    example: 'LS-20250104-001',
    required: true
  },
  '{{propertyName}}': {
    name: 'Property Name',
    description: 'Name of the booked property',
    example: 'Luxury Beach Villa',
    required: true
  },
  '{{propertyAddress}}': {
    name: 'Property Address',
    description: 'Full address of the property',
    example: '123 Beach Road, Goa',
    required: false
  },
  '{{checkIn}}': {
    name: 'Check-in Date',
    description: 'Check-in date',
    example: 'January 15, 2025',
    required: true
  },
  '{{checkOut}}': {
    name: 'Check-out Date',
    description: 'Check-out date',
    example: 'January 20, 2025',
    required: true
  },
  '{{guests}}': {
    name: 'Number of Guests',
    description: 'Total number of guests',
    example: '4',
    required: true
  },
  '{{totalAmount}}': {
    name: 'Total Amount',
    description: 'Total booking amount',
    example: '₹50,000',
    required: true
  },
  '{{specialRequests}}': {
    name: 'Special Requests',
    description: 'Any special requests from the guest',
    example: 'Late check-in requested',
    required: false
  },
  '{{amenities}}': {
    name: 'Property Amenities',
    description: 'List of property amenities',
    example: 'Swimming Pool, WiFi, Parking',
    required: false
  },
  
  // Host Information
  '{{hostName}}': {
    name: 'Host Name',
    description: 'Name of the property host',
    example: 'Sarah Johnson',
    required: true
  },
  '{{hostPhone}}': {
    name: 'Host Phone',
    description: 'Phone number of the host',
    example: '+91-8828279739',
    required: true
  },
  '{{hostEmail}}': {
    name: 'Host Email',
    description: 'Email address of the host',
    example: 'sarah@example.com',
    required: true
  },
  
  // Partner Information
  '{{businessName}}': {
    name: 'Business Name',
    description: 'Name of the partner business',
    example: 'Luxury Properties Ltd',
    required: true
  },
  '{{contactName}}': {
    name: 'Contact Person',
    description: 'Name of the contact person',
    example: 'Michael Smith',
    required: true
  },
  '{{businessType}}': {
    name: 'Business Type',
    description: 'Type of business',
    example: 'Property Management',
    required: false
  },
  '{{location}}': {
    name: 'Location',
    description: 'Business or property location',
    example: 'Mumbai, Maharashtra',
    required: false
  },
  '{{experience}}': {
    name: 'Experience',
    description: 'Years of experience',
    example: '5+ years',
    required: false
  },
  '{{message}}': {
    name: 'Message',
    description: 'Custom message or description',
    example: 'Looking forward to partnership',
    required: false
  },
  
  // Request Information
  '{{requestId}}': {
    name: 'Request ID',
    description: 'Unique request identifier',
    example: 'PR-20250104-001',
    required: true
  },
  '{{requestType}}': {
    name: 'Request Type',
    description: 'Type of request',
    example: 'Partnership Application',
    required: false
  },
  '{{urgency}}': {
    name: 'Urgency Level',
    description: 'Urgency of the request',
    example: 'High',
    required: false
  },
  '{{description}}': {
    name: 'Description',
    description: 'Detailed description of the request',
    example: 'Need assistance with property setup',
    required: false
  },
  
  // Consultation Information
  '{{preferredDate}}': {
    name: 'Preferred Date',
    description: 'Preferred consultation date',
    example: 'January 20, 2025',
    required: false
  },
  '{{preferredTime}}': {
    name: 'Preferred Time',
    description: 'Preferred consultation time',
    example: '2:00 PM',
    required: false
  },
  '{{propertyType}}': {
    name: 'Property Type',
    description: 'Type of property',
    example: 'Villa',
    required: false
  },
  '{{budget}}': {
    name: 'Budget',
    description: 'Budget range',
    example: '₹50,000 - ₹1,00,000',
    required: false
  },
  
  // Cancellation Information
  '{{cancellationReason}}': {
    name: 'Cancellation Reason',
    description: 'Reason for cancellation',
    example: 'Change in travel plans',
    required: false
  },
  '{{refundAmount}}': {
    name: 'Refund Amount',
    description: 'Amount to be refunded',
    example: '₹45,000',
    required: false
  },
  '{{refundMethod}}': {
    name: 'Refund Method',
    description: 'Method of refund',
    example: 'Original payment method',
    required: false
  },
  '{{refundTimeline}}': {
    name: 'Refund Timeline',
    description: 'Expected refund timeline',
    example: '5-7 business days',
    required: false
  },
  
  // System Information
  '{{currentDate}}': {
    name: 'Current Date',
    description: 'Current date',
    example: 'January 4, 2025',
    required: false
  },
  '{{currentTime}}': {
    name: 'Current Time',
    description: 'Current time',
    example: '2:30 PM',
    required: false
  },
  '{{companyName}}': {
    name: 'Company Name',
    description: 'Luxe Staycations',
    example: 'Luxe Staycations',
    required: false
  },
  '{{companyEmail}}': {
    name: 'Company Email',
    description: 'Company email address',
    example: 'info@luxestaycations.in',
    required: false
  },
  '{{companyPhone}}': {
    name: 'Company Phone',
    description: 'Company phone number',
    example: '+91-8828279739',
    required: false
  },
  '{{companyWebsite}}': {
    name: 'Company Website',
    description: 'Company website URL',
    example: 'www.luxestaycations.in',
    required: false
  }
};

export class EmailTemplateManager {
  private templates: EmailTemplate[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await supabaseEmailManager.initialize();
      await this.loadTemplates();
      this.isInitialized = true;
      console.log('EmailTemplateManager initialized with Supabase');
    } catch (error) {
      console.error('Error initializing EmailTemplateManager:', error);
    }
  }

  private async loadTemplates(): Promise<void> {
    try {
      const supabaseTemplates = supabaseEmailManager.getTemplates();
      this.templates = supabaseTemplates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type as any,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent || '',
        variables: template.variables,
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }));
      console.log(`Loaded ${this.templates.length} email templates from Supabase`);
    } catch (error) {
      console.error('Error loading email templates:', error);
      this.templates = [];
    }
  }

  private async initializeDefaultTemplates(): Promise<void> {
    if (this.templates.length === 0) {
      await this.createDefaultTemplates();
    }
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Booking Confirmation',
        type: 'booking_confirmation',
        subject: '🎉 Booking Confirmed - {{propertyName}} | {{companyName}}',
        html: this.getDefaultBookingConfirmationHTML(),
        text: this.getDefaultBookingConfirmationText(),
        variables: ['guestName', 'bookingId', 'propertyName', 'checkIn', 'checkOut', 'guests', 'totalAmount', 'hostName', 'hostPhone', 'hostEmail'],
        isActive: true,
        description: 'Sent when a booking is confirmed'
      },
      {
        name: 'Booking Cancellation',
        type: 'booking_cancellation',
        subject: '📋 Booking Cancellation Acknowledged - {{bookingId}} | {{companyName}}',
        html: this.getDefaultBookingCancellationHTML(),
        text: this.getDefaultBookingCancellationText(),
        variables: ['guestName', 'bookingId', 'propertyName', 'checkIn', 'checkOut', 'cancellationReason', 'refundAmount', 'refundMethod', 'refundTimeline'],
        isActive: true,
        description: 'Sent when a booking cancellation is requested'
      },
      {
        name: 'Partner Request Confirmation',
        type: 'partner_request',
        subject: '🤝 Partnership Request Received - {{businessName}} | {{companyName}}',
        html: this.getDefaultPartnerRequestHTML(),
        text: this.getDefaultPartnerRequestText(),
        variables: ['contactName', 'businessName', 'email', 'phone', 'businessType', 'location', 'experience', 'message', 'requestId'],
        isActive: true,
        description: 'Sent when a partnership request is submitted'
      },
      {
        name: 'Consultation Request Confirmation',
        type: 'consultation_request',
        subject: '💼 Consultation Request Confirmed - {{name}} | {{companyName}}',
        html: this.getDefaultConsultationRequestHTML(),
        text: this.getDefaultConsultationRequestText(),
        variables: ['name', 'email', 'phone', 'preferredDate', 'preferredTime', 'propertyType', 'budget', 'message', 'requestId'],
        isActive: true,
        description: 'Sent when a consultation request is submitted'
      },
      {
        name: 'Special Request Confirmation',
        type: 'special_request',
        subject: '⭐ Special Request Received - {{propertyName}} | {{companyName}}',
        html: this.getDefaultSpecialRequestHTML(),
        text: this.getDefaultSpecialRequestText(),
        variables: ['guestName', 'email', 'phone', 'propertyName', 'requestType', 'description', 'urgency', 'requestId'],
        isActive: true,
        description: 'Sent when a special request is submitted'
      }
    ];

    for (const template of defaultTemplates) {
      await supabaseEmailManager.saveTemplate({
        name: template.name,
        type: template.type,
        subject: template.subject,
        htmlContent: template.html,
        textContent: template.text,
        variables: template.variables,
        isActive: template.isActive,
        isDefault: true
      });
    }
    
    // Reload templates after creating defaults
    await this.loadTemplates();
  }

  // CRUD Operations
  async addTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate | null> {
    try {
      const templateId = await supabaseEmailManager.saveTemplate({
        name: templateData.name,
        type: templateData.type,
        subject: templateData.subject,
        htmlContent: templateData.html,
        textContent: templateData.text,
        variables: templateData.variables,
        isActive: templateData.isActive,
        isDefault: false
      });

      if (templateId) {
        // Reload templates to get the new one
        await this.loadTemplates();
        const newTemplate = this.templates.find(t => t.id === templateId);
        return newTemplate || null;
      }
      return null;
    } catch (error) {
      console.error('Error adding template:', error);
      return null;
    }
  }

  async updateTemplate(id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'createdAt'>>): Promise<EmailTemplate | null> {
    try {
      const success = await supabaseEmailManager.updateTemplate(id, {
        name: updates.name,
        type: updates.type,
        subject: updates.subject,
        htmlContent: updates.html,
        textContent: updates.text,
        variables: updates.variables,
        isActive: updates.isActive
      });

      if (success) {
        // Reload templates to get the updated one
        await this.loadTemplates();
        const updatedTemplate = this.templates.find(t => t.id === id);
        return updatedTemplate || null;
      }
      return null;
    } catch (error) {
      console.error('Error updating template:', error);
      return null;
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const success = await supabaseEmailManager.deleteTemplate(id);
      if (success) {
        // Reload templates to reflect the deletion
        await this.loadTemplates();
      }
      return success;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  getTemplate(id: string): EmailTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  getTemplatesByType(type: EmailTemplate['type']): EmailTemplate[] {
    return this.templates.filter(t => t.type === type && t.isActive);
  }

  getAllTemplates(): EmailTemplate[] {
    return [...this.templates];
  }

  getActiveTemplates(): EmailTemplate[] {
    return this.templates.filter(t => t.isActive);
  }

  // Template Processing
  processTemplate(templateId: string, variables: Record<string, string>): { subject: string; html: string; text: string } | null {
    const result = supabaseEmailManager.processTemplate(templateId, variables);
    if (!result) return null;

    return {
      subject: result.subject,
      html: result.html,
      text: result.text || ''
    };
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    let processed = content;
    
    // Replace all variables
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key] || '';
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace system variables
    const now = new Date();
    processed = processed.replace(/\{\{currentDate\}\}/g, now.toLocaleDateString());
    processed = processed.replace(/\{\{currentTime\}\}/g, now.toLocaleTimeString());
    processed = processed.replace(/\{\{companyName\}\}/g, 'Luxe Staycations');
    processed = processed.replace(/\{\{companyEmail\}\}/g, 'info@luxestaycations.in');
    processed = processed.replace(/\{\{companyPhone\}\}/g, '+91-8828279739');
    processed = processed.replace(/\{\{companyWebsite\}\}/g, 'www.luxestaycations.in');

    return processed;
  }

  // Default Template HTMLs
  private getDefaultBookingConfirmationHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .email-container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #8B4513; font-size: 24px; margin-bottom: 20px; }
        .booking-details { background-color: #f8f6f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-row:last-child { border-bottom: none; font-weight: bold; color: #8B4513; }
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
            <h2>🎉 Booking Confirmed!</h2>
            <p>Dear <strong>{{guestName}}</strong>,</p>
            <p>Thank you for choosing <strong>{{companyName}}</strong> for your upcoming getaway!</p>
            <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                    <span>Booking ID:</span>
                    <span>{{bookingId}}</span>
                </div>
                <div class="detail-row">
                    <span>Property:</span>
                    <span>{{propertyName}}</span>
                </div>
                <div class="detail-row">
                    <span>Check-in:</span>
                    <span>{{checkIn}}</span>
                </div>
                <div class="detail-row">
                    <span>Check-out:</span>
                    <span>{{checkOut}}</span>
                </div>
                <div class="detail-row">
                    <span>Guests:</span>
                    <span>{{guests}}</span>
                </div>
                <div class="detail-row">
                    <span>Total Amount:</span>
                    <span>{{totalAmount}}</span>
                </div>
            </div>
            <p>We look forward to providing you with an exceptional luxury experience!</p>
            <p>Best regards,<br><strong>The {{companyName}} Team</strong></p>
        </div>
        <div class="footer">
            <p><strong>{{companyName}}</strong></p>
            <p>📧 {{companyEmail}} | 📞 {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDefaultBookingCancellationHTML(): string {
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
            <p>Dear <strong>{{guestName}}</strong>,</p>
            <p>We have received your cancellation request for booking <strong>{{bookingId}}</strong>.</p>
            <div class="cancellation-details">
                <h3>📋 Cancellation Details</h3>
                <p><strong>Property:</strong> {{propertyName}}</p>
                <p><strong>Original Dates:</strong> {{checkIn}} to {{checkOut}}</p>
                <p><strong>Reason:</strong> {{cancellationReason}}</p>
                <p><strong>Refund Amount:</strong> {{refundAmount}}</p>
                <p><strong>Refund Method:</strong> {{refundMethod}}</p>
                <p><strong>Expected Timeline:</strong> {{refundTimeline}}</p>
            </div>
            <p>We understand that plans can change, and we're here to help make the process as smooth as possible.</p>
            <p>If you have any questions about your cancellation or refund, please don't hesitate to contact us.</p>
            <p>We hope to welcome you back to {{companyName}} in the future!</p>
            <p>Best regards,<br><strong>The {{companyName}} Team</strong></p>
        </div>
        <div class="footer">
            <p><strong>{{companyName}}</strong></p>
            <p>📧 {{companyEmail}} | 📞 {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDefaultPartnerRequestHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partnership Request</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .email-container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #8B4513; font-size: 24px; margin-bottom: 20px; }
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
            <h2>🤝 Partnership Request Received</h2>
            <p>Dear <strong>{{contactName}}</strong>,</p>
            <p>Thank you for your interest in partnering with <strong>{{companyName}}</strong>!</p>
            <p>We have received your partnership request from <strong>{{businessName}}</strong> and will review it within 2-3 business days.</p>
            <p>Our partnership team will contact you soon to discuss the next steps.</p>
            <p>Best regards,<br><strong>The Partnership Team<br>{{companyName}}</strong></p>
        </div>
        <div class="footer">
            <p><strong>{{companyName}}</strong></p>
            <p>📧 {{companyEmail}} | 📞 {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDefaultConsultationRequestHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consultation Request</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .email-container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #8B4513; font-size: 24px; margin-bottom: 20px; }
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
            <h2>💼 Consultation Request Confirmed</h2>
            <p>Dear <strong>{{name}}</strong>,</p>
            <p>Thank you for requesting a consultation with <strong>{{companyName}}</strong>!</p>
            <p>We have received your consultation request and will contact you within 24 hours to schedule your appointment.</p>
            <p>We look forward to helping you plan your perfect luxury getaway!</p>
            <p>Best regards,<br><strong>The Consultation Team<br>{{companyName}}</strong></p>
        </div>
        <div class="footer">
            <p><strong>{{companyName}}</strong></p>
            <p>📧 {{companyEmail}} | 📞 {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDefaultSpecialRequestHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Request</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .email-container { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #8B4513; font-size: 24px; margin-bottom: 20px; }
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
            <h2>⭐ Special Request Received</h2>
            <p>Dear <strong>{{guestName}}</strong>,</p>
            <p>Thank you for your special request for <strong>{{propertyName}}</strong>!</p>
            <p>We have received your request and will review it promptly. Our team will contact you within the next few hours to discuss your requirements.</p>
            <p>We're committed to making your stay absolutely perfect!</p>
            <p>Best regards,<br><strong>The Concierge Team<br>{{companyName}}</strong></p>
        </div>
        <div class="footer">
            <p><strong>{{companyName}}</strong></p>
            <p>📧 {{companyEmail}} | 📞 {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Default Template Texts
  private getDefaultBookingConfirmationText(): string {
    return `Booking Confirmed for {{propertyName}}. Booking ID: {{bookingId}}. Check-in: {{checkIn}}, Check-out: {{checkOut}}. Total: {{totalAmount}}. Contact: {{hostName}} at {{hostPhone}}.`;
  }

  private getDefaultBookingCancellationText(): string {
    return `Booking Cancellation Acknowledged for {{bookingId}}. Property: {{propertyName}}. Refund Amount: {{refundAmount}}. Expected Timeline: {{refundTimeline}}.`;
  }

  private getDefaultPartnerRequestText(): string {
    return `Partnership request received from {{businessName}}. We'll review and contact you within 2-3 business days.`;
  }

  private getDefaultConsultationRequestText(): string {
    return `Consultation request confirmed for {{name}}. We'll contact you within 24 hours to schedule your consultation.`;
  }

  private getDefaultSpecialRequestText(): string {
    return `Special request received from {{guestName}} for {{propertyName}}. We'll contact you within a few hours.`;
  }
}

// Create singleton instance
export const emailTemplateManager = new EmailTemplateManager();
