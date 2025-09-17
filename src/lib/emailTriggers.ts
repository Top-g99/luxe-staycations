// Minimal email triggers for admin functionality
export interface EmailTrigger {
  id: string;
  name: string;
  event: string;
  template_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export class EmailTriggers {
  private static instance: EmailTriggers;
  private triggers: EmailTrigger[] = [];

  static getInstance(): EmailTriggers {
    if (!EmailTriggers.instance) {
      EmailTriggers.instance = new EmailTriggers();
    }
    return EmailTriggers.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getTriggers(): Promise<EmailTrigger[]> {
    return this.triggers;
  }

  async getTrigger(id: string): Promise<EmailTrigger | null> {
    return this.triggers.find(t => t.id === id) || null;
  }

  async createTrigger(trigger: Omit<EmailTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTrigger> {
    const newTrigger: EmailTrigger = {
      ...trigger,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.triggers.push(newTrigger);
    return newTrigger;
  }

  async updateTrigger(id: string, updates: Partial<EmailTrigger>): Promise<EmailTrigger | null> {
    const index = this.triggers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.triggers[index] = { ...this.triggers[index], ...updates, updated_at: new Date().toISOString() };
      return this.triggers[index];
    }
    return null;
  }

  async deleteTrigger(id: string): Promise<boolean> {
    const index = this.triggers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.triggers.splice(index, 1);
      return true;
    }
    return false;
  }

  async executeTrigger(event: string, data: Record<string, any>): Promise<boolean> {
    try {
      const trigger = this.triggers.find(t => t.event === event && t.enabled);
      if (trigger) {
        console.log(`Executing trigger for event: ${event}`, data);
        // Mock trigger execution
        return true;
      }
      return false;
    } catch (error) {
      console.error('Trigger execution failed:', error);
      return false;
    }
  }
}

export const emailTriggers = EmailTriggers.getInstance();
export const emailTriggerManager = emailTriggers;
