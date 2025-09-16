// Minimal email trigger manager for admin functionality
export interface EmailTrigger {
  id: string;
  name: string;
  type: string;
  template_id: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class EmailTriggerManager {
  private static instance: EmailTriggerManager;
  private triggers: EmailTrigger[] = [];

  static getInstance(): EmailTriggerManager {
    if (!EmailTriggerManager.instance) {
      EmailTriggerManager.instance = new EmailTriggerManager();
    }
    return EmailTriggerManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<EmailTrigger[]> {
    return this.triggers;
  }

  async getById(id: string): Promise<EmailTrigger | null> {
    return this.triggers.find(t => t.id === id) || null;
  }

  async create(trigger: Omit<EmailTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTrigger> {
    const newTrigger: EmailTrigger = {
      ...trigger,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.triggers.push(newTrigger);
    return newTrigger;
  }

  async update(id: string, updates: Partial<EmailTrigger>): Promise<EmailTrigger | null> {
    const index = this.triggers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.triggers[index] = { ...this.triggers[index], ...updates, updated_at: new Date().toISOString() };
      return this.triggers[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.triggers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.triggers.splice(index, 1);
      return true;
    }
    return false;
  }

  async triggerBookingConfirmation(bookingData: any): Promise<{ success: boolean; message?: string }> {
    console.log('Triggering booking confirmation email:', bookingData);
    return { success: true, message: 'Booking confirmation email sent' };
  }
}

export const emailTriggerManager = EmailTriggerManager.getInstance();
