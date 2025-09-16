// Minimal email service for admin functionality
export interface EmailData {
  to: string;
  subject: string;
  content: string;
  template?: string;
  data?: Record<string, any>;
}

export class EmailService {
  private static instance: EmailService;
  private emails: EmailData[] = [];

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
      this.emails.push(emailData);
      console.log('Email sent:', emailData);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async getAll(): Promise<EmailData[]> {
    return this.emails;
  }

  async getById(id: string): Promise<EmailData | null> {
    return this.emails.find(e => e.to === id) || null;
  }
}

export const emailService = EmailService.getInstance();
