// Email Template Manager
// Handles all template operations with Supabase integration

import { getSupabaseClient, TABLES } from '../supabase';
import { EmailTemplate, EmailTemplateData } from './types';

export class EmailTemplateManager {
  private static instance: EmailTemplateManager;
  private templates: EmailTemplate[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EmailTemplateManager {
    if (!EmailTemplateManager.instance) {
      EmailTemplateManager.instance = new EmailTemplateManager();
    }
    return EmailTemplateManager.instance;
  }

  // Initialize template manager
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing EmailTemplateManager...');
      await this.loadTemplates();
      this.isInitialized = true;
      console.log(`EmailTemplateManager initialized with ${this.templates.length} templates`);
      return true;
    } catch (error) {
      console.error('Failed to initialize EmailTemplateManager:', error);
      return false;
    }
  }

  // Load templates from Supabase
  private async loadTemplates(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading email templates:', error);
        throw error;
      }

      this.templates = (data || []).map((template: any) => ({
        id: template.id,
        name: template.name,
        type: template.type,
        subject: template.subject,
        htmlContent: template.html_content,
        textContent: template.text_content,
        variables: template.variables || [],
        isActive: template.is_active,
        isDefault: template.is_default,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }));

      console.log(`Loaded ${this.templates.length} email templates from Supabase`);
    } catch (error) {
      console.error('Error loading email templates:', error);
      throw error;
    }
  }

  // Get all templates
  public getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  // Get templates by type
  public getTemplatesByType(type: string): EmailTemplate[] {
    return this.templates.filter(template => template.type === type && template.isActive);
  }

  // Get template by ID
  public getTemplateById(id: string): EmailTemplate | null {
    return this.templates.find(template => template.id === id) || null;
  }

  // Get default template for type
  public getDefaultTemplate(type: string): EmailTemplate | null {
    return this.templates.find(template => 
      template.type === type && template.isDefault && template.isActive
    ) || null;
  }

  // Create new template
  public async createTemplate(templateData: EmailTemplateData): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .insert({
          name: templateData.name,
          type: templateData.type,
          subject: templateData.subject,
          html_content: templateData.htmlContent,
          text_content: templateData.textContent,
          variables: templateData.variables,
          is_active: templateData.isActive,
          is_default: templateData.isDefault
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating email template:', error);
        return { success: false, error: error.message };
      }

      // Reload templates
      await this.loadTemplates();

      console.log('Email template created successfully:', data.id);
      return { success: true, templateId: data.id };
    } catch (error) {
      console.error('Error creating email template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Update template
  public async updateTemplate(id: string, templateData: Partial<EmailTemplateData>): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: any = {};

      if (templateData.name !== undefined) updateData.name = templateData.name;
      if (templateData.type !== undefined) updateData.type = templateData.type;
      if (templateData.subject !== undefined) updateData.subject = templateData.subject;
      if (templateData.htmlContent !== undefined) updateData.html_content = templateData.htmlContent;
      if (templateData.textContent !== undefined) updateData.text_content = templateData.textContent;
      if (templateData.variables !== undefined) updateData.variables = templateData.variables;
      if (templateData.isActive !== undefined) updateData.is_active = templateData.isActive;
      if (templateData.isDefault !== undefined) updateData.is_default = templateData.isDefault;

      const { error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating email template:', error);
        return { success: false, error: error.message };
      }

      // Reload templates
      await this.loadTemplates();

      console.log('Email template updated successfully:', id);
      return { success: true };
    } catch (error) {
      console.error('Error updating email template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Delete template
  public async deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting email template:', error);
        return { success: false, error: error.message };
      }

      // Reload templates
      await this.loadTemplates();

      console.log('Email template deleted successfully:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting email template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Process template with variables
  public processTemplate(templateId: string, variables: Record<string, any>): { subject: string; html: string; text: string } | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent || this.stripHtml(html);

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder, 'g');
      subject = subject.replace(regex, String(value));
      html = html.replace(regex, String(value));
      text = text.replace(regex, String(value));
    });

    return { subject, html, text };
  }

  // Strip HTML tags for text content
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Initialize default templates
  public async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Booking Confirmation',
        type: 'booking_confirmation',
        subject: '🎉 Booking Confirmed - {{bookingId}} | Luxe Staycations',
        htmlContent: this.getBookingConfirmationHTML(),
        textContent: this.getBookingConfirmationText(),
        variables: ['bookingId', 'guestName', 'propertyName', 'checkIn', 'checkOut', 'totalAmount'],
        isActive: true,
        isDefault: true
      },
      {
        name: 'Booking Cancellation',
        type: 'booking_cancellation',
        subject: '📋 Booking Cancelled - {{bookingId}} | Luxe Staycations',
        htmlContent: this.getBookingCancellationHTML(),
        textContent: this.getBookingCancellationText(),
        variables: ['bookingId', 'guestName', 'propertyName', 'refundAmount', 'cancellationReason'],
        isActive: true,
        isDefault: true
      },
      {
        name: 'Partner Request Confirmation',
        type: 'partner_request',
        subject: '🤝 Partner Application Received - {{businessName}} | Luxe Staycations',
        htmlContent: this.getPartnerRequestHTML(),
        textContent: this.getPartnerRequestText(),
        variables: ['businessName', 'contactName', 'email', 'propertyType', 'location'],
        isActive: true,
        isDefault: true
      },
      {
        name: 'Consultation Request Confirmation',
        type: 'consultation_request',
        subject: '🏡 Consultation Confirmed - {{requestId}} | Luxe Staycations',
        htmlContent: this.getConsultationRequestHTML(),
        textContent: this.getConsultationRequestText(),
        variables: ['requestId', 'name', 'email', 'propertyType', 'preferredDate'],
        isActive: true,
        isDefault: true
      },
      {
        name: 'Contact Form Thank You',
        type: 'contact_form',
        subject: '🙏 Thank You for Contacting Us - {{subject}} | Luxe Staycations',
        htmlContent: this.getContactFormHTML(),
        textContent: this.getContactFormText(),
        variables: ['name', 'email', 'subject', 'message'],
        isActive: true,
        isDefault: true
      },
      {
        name: 'Loyalty Points Earned',
        type: 'loyalty_earned',
        subject: '💎 You Earned {{points}} Loyalty Points! | Luxe Staycations',
        htmlContent: this.getLoyaltyEarnedHTML(),
        textContent: this.getLoyaltyEarnedText(),
        variables: ['userName', 'points', 'totalPoints', 'description'],
        isActive: true,
        isDefault: true
      }
    ];

    for (const template of defaultTemplates) {
      const existing = this.getDefaultTemplate(template.type);
      if (!existing) {
        await this.createTemplate(template);
      }
    }
  }

  // Default template HTML generators
  private getBookingConfirmationHTML(): string {
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
      <p><strong>Booking ID:</strong> {{bookingId}}</p>
      <p><strong>Guest Name:</strong> {{guestName}}</p>
      <p><strong>Property:</strong> {{propertyName}}</p>
      <p><strong>Check-in:</strong> {{checkIn}}</p>
      <p><strong>Check-out:</strong> {{checkOut}}</p>
      <p><strong>Total Amount:</strong> ₹{{totalAmount}}</p>
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

  private getBookingConfirmationText(): string {
    return `Booking Confirmed - {{bookingId}}

Dear {{guestName}},

Thank you for choosing Luxe Staycations! Your booking has been confirmed.

Booking Details:
- Booking ID: {{bookingId}}
- Property: {{propertyName}}
- Check-in: {{checkIn}}
- Check-out: {{checkOut}}
- Total Amount: ₹{{totalAmount}}

What's Next?
- You will receive a detailed itinerary 24 hours before your check-in
- Our team will contact you to confirm your arrival time
- Any special requests will be arranged prior to your stay

Contact us at info@luxestaycations.in or +91-8828279739

Best regards,
Luxe Staycations Team`;
  }

  private getBookingCancellationHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Cancellation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">📋 Booking Cancelled</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">We understand that plans can change</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #8B4513; margin-top: 0;">Cancellation Details</h2>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Booking ID:</strong> {{bookingId}}</p>
      <p><strong>Guest Name:</strong> {{guestName}}</p>
      <p><strong>Property:</strong> {{propertyName}}</p>
      <p><strong>Refund Amount:</strong> ₹{{refundAmount}}</p>
      <p><strong>Reason:</strong> {{cancellationReason}}</p>
    </div>
    
    <p>We hope to welcome you back to Luxe Staycations in the future!</p>
    <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
  </div>
</body>
</html>`;
  }

  private getBookingCancellationText(): string {
    return `Booking Cancelled - {{bookingId}}

Dear {{guestName}},

Your booking has been cancelled as requested.

Cancellation Details:
- Booking ID: {{bookingId}}
- Property: {{propertyName}}
- Refund Amount: ₹{{refundAmount}}
- Reason: {{cancellationReason}}

We hope to welcome you back to Luxe Staycations in the future!

Best regards,
The Luxe Staycations Team`;
  }

  private getPartnerRequestHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Partner Application Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🤝 Partner Application Received</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your interest in partnering with us</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #8B4513; margin-top: 0;">Application Details</h2>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Business Name:</strong> {{businessName}}</p>
      <p><strong>Contact Person:</strong> {{contactName}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Property Type:</strong> {{propertyType}}</p>
      <p><strong>Location:</strong> {{location}}</p>
    </div>
    
    <p>We have received your partner application and will review it carefully. Our team will get back to you within 2-3 business days.</p>
    <p>Thank you for considering Luxe Staycations as your partner!</p>
    <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
  </div>
</body>
</html>`;
  }

  private getPartnerRequestText(): string {
    return `Partner Application Received - {{businessName}}

Thank you for your interest in partnering with Luxe Staycations!

Application Details:
- Business Name: {{businessName}}
- Contact Person: {{contactName}}
- Email: {{email}}
- Property Type: {{propertyType}}
- Location: {{location}}

We have received your partner application and will review it carefully. Our team will get back to you within 2-3 business days.

Thank you for considering Luxe Staycations as your partner!

Best regards,
The Luxe Staycations Team`;
  }

  private getConsultationRequestHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Consultation Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🏡 Consultation Confirmed</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Welcome to the Luxe Staycations Host Family</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #8B4513; margin-top: 0;">Consultation Details</h2>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Request ID:</strong> {{requestId}}</p>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Property Type:</strong> {{propertyType}}</p>
      <p><strong>Preferred Date:</strong> {{preferredDate}}</p>
    </div>
    
    <p>Our partnership specialist will contact you within 24 hours to schedule your consultation.</p>
    <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
  </div>
</body>
</html>`;
  }

  private getConsultationRequestText(): string {
    return `Consultation Confirmed - {{requestId}}

Dear {{name}},

Welcome to the Luxe Staycations Host Family! Your consultation request has been confirmed.

Consultation Details:
- Request ID: {{requestId}}
- Name: {{name}}
- Email: {{email}}
- Property Type: {{propertyType}}
- Preferred Date: {{preferredDate}}

Our partnership specialist will contact you within 24 hours to schedule your consultation.

Best regards,
The Luxe Staycations Team`;
  }

  private getContactFormHTML(): string {
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
    <h2 style="color: #8B4513; margin-top: 0;">Your Message</h2>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Subject:</strong> {{subject}}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">{{message}}</div>
    </div>
    
    <p>Our travel specialists will review your inquiry within 24 hours and contact you to discuss your requirements.</p>
    <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
  </div>
</body>
</html>`;
  }

  private getContactFormText(): string {
    return `Thank You for Contacting Us - {{subject}}

Dear {{name}},

Thank you for reaching out to Luxe Staycations! We appreciate your interest in our luxury villa rentals.

Your Message:
- Name: {{name}}
- Email: {{email}}
- Subject: {{subject}}
- Message: {{message}}

Our travel specialists will review your inquiry within 24 hours and contact you to discuss your requirements.

Best regards,
The Luxe Staycations Team`;
  }

  private getLoyaltyEarnedHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Loyalty Points Earned</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8B4513, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">💎 Loyalty Points Earned!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">You've earned {{points}} points</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #8B4513; margin-top: 0;">Congratulations {{userName}}!</h2>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Points Earned:</strong> {{points}}</p>
      <p><strong>Total Points:</strong> {{totalPoints}}</p>
      <p><strong>Description:</strong> {{description}}</p>
    </div>
    
    <p>Keep earning points with every booking and redeem them for amazing rewards!</p>
    <p>Best regards,<br><strong>The Luxe Staycations Team</strong></p>
  </div>
</body>
</html>`;
  }

  private getLoyaltyEarnedText(): string {
    return `Loyalty Points Earned!

Congratulations {{userName}}!

You've earned {{points}} loyalty points!

Details:
- Points Earned: {{points}}
- Total Points: {{totalPoints}}
- Description: {{description}}

Keep earning points with every booking and redeem them for amazing rewards!

Best regards,
The Luxe Staycations Team`;
  }
}

// Export singleton instance
export const emailTemplateManager = EmailTemplateManager.getInstance();
