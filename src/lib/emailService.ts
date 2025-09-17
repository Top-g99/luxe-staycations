// Minimal email service for admin functionality
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  html?: string;
  template?: string;
  data?: Record<string, any>;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  enableSSL: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  testMode: boolean;
  maxRetries: number;
  retryDelay: number;
}

export const defaultEmailConfig: EmailConfig = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpSecure: false,
  enableSSL: false,
  smtpUser: '',
  smtpPassword: '',
  fromEmail: 'noreply@luxestaycations.com',
  fromName: 'Luxe Staycations',
  replyTo: 'info@luxestaycations.com',
  testMode: true,
  maxRetries: 3,
  retryDelay: 1000
};

export class EmailService {
  private static instance: EmailService;
  private templates: EmailTemplate[] = [];
  public isConfigured: boolean = false;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('Sending email:', emailData);
      // Mock email sending
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    return this.templates;
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates, updated_at: new Date().toISOString() };
      return this.templates[index];
    }
    return null;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates.splice(index, 1);
      return true;
    }
    return false;
  }

  getConfig(): EmailConfig | null {
    // Mock config - in real app, this would load from database
    return {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
      enableSSL: false,
      smtpUser: 'test@example.com',
      smtpPassword: 'password',
      fromEmail: 'noreply@luxestaycations.com',
      fromName: 'Luxe Staycations',
      replyTo: 'info@luxestaycations.com',
      testMode: true,
      maxRetries: 3,
      retryDelay: 1000
    };
  }

  async configure(config: EmailConfig): Promise<boolean> {
    // Mock configuration - in real app, this would save to database
    console.log('Configuring email service:', config);
    this.isConfigured = true;
    return true;
  }

  async reloadConfiguration(): Promise<void> {
    // Mock reload - in real app, this would reload from database
    console.log('Reloading email configuration');
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.sendEmail({
        to,
        subject: 'Test Email - Luxe Staycations',
        content: 'This is a test email from Luxe Staycations email service.',
        html: '<p>This is a test email from <strong>Luxe Staycations</strong> email service.</p>'
      });
      return { success: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBookingConfirmation(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Booking Confirmation - Luxe Staycations';
      const content = `Dear ${data.guestName}, your booking ${data.bookingId} for ${data.propertyName} is confirmed. Check-in: ${data.checkIn}, Check-out: ${data.checkOut}`;
      
      const result = await this.sendEmail({
        to: data.guestEmail,
        subject,
        content,
        template: 'booking-confirmation'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Booking confirmation email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }


  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log('Testing email connection...');
    return { success: true, message: 'Email connection test successful' };
  }

  async sendBookingCancellation(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Booking Cancellation - Luxe Staycations';
      const content = `Dear ${data.guestName}, your booking ${data.bookingId} has been cancelled. Refund will be processed within 5-7 business days.`;
      
      const result = await this.sendEmail({
        to: data.guestEmail,
        subject,
        content,
        template: 'booking-cancellation'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Booking cancellation email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendConsultationConfirmation(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Consultation Request Confirmation - Luxe Staycations';
      const content = `Hi ${data.name}, we have received your consultation request. Request ID: ${data.requestId}`;
      
      const result = await this.sendEmail({
        to: data.email,
        subject,
        content,
        template: 'consultation-confirmation'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Consultation confirmation email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendSpecialRequestConfirmation(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Special Request Confirmation - Luxe Staycations';
      const content = `Hi ${data.guestName}, we have received your special request for ${data.propertyName}. Request ID: ${data.requestId}`;
      
      const result = await this.sendEmail({
        to: data.email,
        subject,
        content,
        template: 'special-request-confirmation'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Special request confirmation email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendContactFormThankYou(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Thank You for Contacting Us - Luxe Staycations';
      const content = `Hi ${data.name}, thank you for contacting us. We will get back to you soon.`;
      
      const result = await this.sendEmail({
        to: data.email,
        subject,
        content,
        template: 'contact-thank-you'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Contact form thank you email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendPartnerRequestConfirmation(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Partner Request Confirmation - Luxe Staycations';
      const content = `Hi ${data.contactName}, we have received your partner request for ${data.businessName}. Request ID: ${data.requestId}`;
      
      const result = await this.sendEmail({
        to: data.email,
        subject,
        content,
        template: 'partner-request-confirmation'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Partner request confirmation email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendAdminNotification(type: string, data: any, adminEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = `Admin Notification - ${type} - Luxe Staycations`;
      const content = `Admin notification: ${type}. Data: ${JSON.stringify(data)}`;
      
      const result = await this.sendEmail({
        to: adminEmail,
        subject,
        content,
        template: 'admin-notification'
      });
      
      return { success: result };
    } catch (error) {
      console.error('Admin notification email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const emailService = EmailService.getInstance();
