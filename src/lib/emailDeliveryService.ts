// Minimal email delivery service for admin functionality
export interface EmailDelivery {
  id: string;
  to: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
}

export class EmailDeliveryService {
  private static instance: EmailDeliveryService;
  private deliveries: EmailDelivery[] = [];

  static getInstance(): EmailDeliveryService {
    if (!EmailDeliveryService.instance) {
      EmailDeliveryService.instance = new EmailDeliveryService();
    }
    return EmailDeliveryService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<EmailDelivery[]> {
    return this.deliveries;
  }

  async getById(id: string): Promise<EmailDelivery | null> {
    return this.deliveries.find(d => d.id === id) || null;
  }

  async create(delivery: Omit<EmailDelivery, 'id' | 'created_at' | 'updated_at'>): Promise<EmailDelivery> {
    const newDelivery: EmailDelivery = {
      ...delivery,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.deliveries.push(newDelivery);
    return newDelivery;
  }

  async update(id: string, updates: Partial<EmailDelivery>): Promise<EmailDelivery | null> {
    const index = this.deliveries.findIndex(d => d.id === id);
    if (index !== -1) {
      this.deliveries[index] = { ...this.deliveries[index], ...updates, updated_at: new Date().toISOString() };
      return this.deliveries[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.deliveries.findIndex(d => d.id === id);
    if (index !== -1) {
      this.deliveries.splice(index, 1);
      return true;
    }
    return false;
  }

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      await this.create({
        to,
        subject,
        content,
        status: 'sent'
      });
      console.log('Email sent:', { to, subject });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendConsultationRequestWithTracking(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Consultation Request Confirmation - Luxe Staycations';
      const content = `Dear ${data.name}, we have received your consultation request. Request ID: ${data.requestId}. We will contact you soon.`;
      
      const result = await this.sendEmail(data.email, subject, content);
      return { success: result };
    } catch (error) {
      console.error('Consultation request email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendContactFormThankYouWithTracking(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Thank You for Contacting Luxe Staycations';
      const content = `Dear ${data.name}, thank you for contacting us. We have received your message and will get back to you soon.`;
      
      const result = await this.sendEmail(data.email, subject, content);
      return { success: result };
    } catch (error) {
      console.error('Contact form thank you email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendPartnerRequestWithTracking(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Partner Application Received - Luxe Staycations';
      const content = `Dear ${data.name}, thank you for your interest in partnering with us. We have received your application and will review it soon.`;
      
      const result = await this.sendEmail(data.email, subject, content);
      return { success: result };
    } catch (error) {
      console.error('Partner request email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getDeliveryStatistics(): any {
    return {
      totalSent: this.deliveries.length,
      successfulDeliveries: this.deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length,
      failedDeliveries: this.deliveries.filter(d => d.status === 'failed').length,
      deliveryRate: this.deliveries.length > 0 ? 
        (this.deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length / this.deliveries.length) * 100 : 0
    };
  }

  getRecentDeliveryLogs(limit: number = 10): EmailDelivery[] {
    return this.deliveries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}

export const emailDeliveryService = EmailDeliveryService.getInstance();
