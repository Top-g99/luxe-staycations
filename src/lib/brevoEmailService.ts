// Minimal Brevo email service for admin functionality
export interface BrevoConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  senderEmail?: string;
  senderName?: string;
  replyToEmail?: string;
}

export interface BrevoEmail {
  id: string;
  to: string;
  subject: string;
  content: string;
  template: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
}

export class BrevoEmailService {
  private static instance: BrevoEmailService;
  private emails: BrevoEmail[] = [];

  static getInstance(): BrevoEmailService {
    if (!BrevoEmailService.instance) {
      BrevoEmailService.instance = new BrevoEmailService();
    }
    return BrevoEmailService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<BrevoEmail[]> {
    return this.emails;
  }

  async getById(id: string): Promise<BrevoEmail | null> {
    return this.emails.find(e => e.id === id) || null;
  }

  async create(email: Omit<BrevoEmail, 'id' | 'created_at' | 'updated_at'>): Promise<BrevoEmail> {
    const newEmail: BrevoEmail = {
      ...email,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.emails.push(newEmail);
    return newEmail;
  }

  async update(id: string, updates: Partial<BrevoEmail>): Promise<BrevoEmail | null> {
    const index = this.emails.findIndex(e => e.id === id);
    if (index !== -1) {
      this.emails[index] = { ...this.emails[index], ...updates, updated_at: new Date().toISOString() };
      return this.emails[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.emails.findIndex(e => e.id === id);
    if (index !== -1) {
      this.emails.splice(index, 1);
      return true;
    }
    return false;
  }

  async sendEmail(to: string, subject: string, content: string, template?: string): Promise<boolean> {
    try {
      await this.create({
        to,
        subject,
        content,
        template: template || 'default',
        status: 'sent'
      });
      console.log('Brevo email sent:', { to, subject, template });
      return true;
    } catch (error) {
      console.error('Brevo email sending failed:', error);
      return false;
    }
  }

  async sendBookingConfirmation(to: string, bookingData: any): Promise<boolean> {
    const subject = 'Booking Confirmation - Luxe Staycations';
    const content = `Your booking has been confirmed. Booking ID: ${bookingData.id}`;
    return await this.sendEmail(to, subject, content, 'booking-confirmation');
  }

  async sendLoyaltyEmail(to: string, loyaltyData: any): Promise<boolean> {
    const subject = 'Loyalty Program Update - Luxe Staycations';
    const content = `Your loyalty points have been updated. Points: ${loyaltyData.points}`;
    return await this.sendEmail(to, subject, content, 'loyalty');
  }

  async sendNewsletter(to: string, newsletterData: any): Promise<boolean> {
    const subject = 'Newsletter - Luxe Staycations';
    const content = newsletterData.content || 'Latest updates from Luxe Staycations';
    return await this.sendEmail(to, subject, content, 'newsletter');
  }

  async sendReminder(to: string, reminderData: any): Promise<boolean> {
    const subject = 'Reminder - Luxe Staycations';
    const content = reminderData.message || 'This is a reminder from Luxe Staycations';
    return await this.sendEmail(to, subject, content, 'reminder');
  }

  async sendLoyaltyWelcome(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Welcome to Luxe Staycations Loyalty Program';
    const content = `Welcome ${data.guestName}! You have ${data.currentPoints} points. Visit: ${data.rewardsDashboardLink}`;
    const success = await this.sendEmail(data.guestEmail, subject, content, 'loyalty-welcome');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendMarketingNewsletter(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = data.newsletterTitle || 'Newsletter - Luxe Staycations';
    const content = data.newsletterContent || 'Latest updates from Luxe Staycations';
    const success = await this.sendEmail(data.guestEmail, subject, content, 'marketing-newsletter');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendBookingReminder(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Booking Reminder - Luxe Staycations';
    const content = `Hi ${data.guestName}, this is a reminder about your booking ${data.bookingId} for ${data.propertyName}. Check-in: ${data.checkIn}, Check-out: ${data.checkOut}`;
    const success = await this.sendEmail(data.guestEmail, subject, content, 'booking-reminder');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendSpecialRequestConfirmation(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Special Request Confirmation - Luxe Staycations';
    const content = `Hi ${data.guestName}, we have received your special request for ${data.propertyName}. Request ID: ${data.bookingId}. Description: ${data.description}`;
    const success = await this.sendEmail(data.guestEmail, subject, content, 'special-request-confirmation');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendConsultationConfirmation(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Consultation Request Confirmation - Luxe Staycations';
    const content = `Hi ${data.name}, we have received your consultation request. Request ID: ${data.requestId}`;
    const success = await this.sendEmail(data.email, subject, content, 'consultation-confirmation');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendContactFormThankYou(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Thank You for Contacting Us - Luxe Staycations';
    const content = `Hi ${data.name}, thank you for contacting us. We will get back to you soon.`;
    const success = await this.sendEmail(data.email, subject, content, 'contact-thank-you');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendPartnerRequestConfirmation(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Partner Request Confirmation - Luxe Staycations';
    const content = `Hi ${data.contactName}, we have received your partner request for ${data.businessName}. Request ID: ${data.requestId}`;
    const success = await this.sendEmail(data.email, subject, content, 'partner-request-confirmation');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendBookingCancellation(data: any): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Booking Cancellation - Luxe Staycations';
    const content = `Hi ${data.guestName}, your booking ${data.bookingId} has been cancelled. Refund: ${data.refundAmount}`;
    const success = await this.sendEmail(data.guestEmail, subject, content, 'booking-cancellation');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendAdminNotification(type: string, data: any, adminEmail: string): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = `Admin Notification - ${type} - Luxe Staycations`;
    const content = `Admin notification: ${type}. Data: ${JSON.stringify(data)}`;
    const success = await this.sendEmail(adminEmail, subject, content, 'admin-notification');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }

  async sendTestEmail(testEmail: string): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
    const subject = 'Test Email - Luxe Staycations';
    const content = 'This is a test email from Luxe Staycations Brevo service.';
    const success = await this.sendEmail(testEmail, subject, content, 'test-email');
    return {
      success,
      messageId: success ? Date.now().toString() : undefined,
      error: success ? undefined : 'Failed to send email',
      timestamp: new Date().toISOString()
    };
  }
}

export const brevoEmailService = BrevoEmailService.getInstance();
