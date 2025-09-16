// Minimal Supabase email manager for admin functionality
export interface EmailManager {
  id: string;
  to: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
}

export class SupabaseEmailManager {
  private static instance: SupabaseEmailManager;
  private emails: EmailManager[] = [];

  static getInstance(): SupabaseEmailManager {
    if (!SupabaseEmailManager.instance) {
      SupabaseEmailManager.instance = new SupabaseEmailManager();
    }
    return SupabaseEmailManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<EmailManager[]> {
    return this.emails;
  }

  async getById(id: string): Promise<EmailManager | null> {
    return this.emails.find(e => e.id === id) || null;
  }

  async create(email: Omit<EmailManager, 'id' | 'created_at' | 'updated_at'>): Promise<EmailManager> {
    const newEmail: EmailManager = {
      ...email,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.emails.push(newEmail);
    return newEmail;
  }

  async update(id: string, updates: Partial<EmailManager>): Promise<EmailManager | null> {
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

  getConfiguration(): any {
    return {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: 'test@example.com',
      smtp_pass: 'test_password',
      from_email: 'noreply@luxestaycations.in',
      from_name: 'Luxe Staycations',
      is_active: true
    };
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

  async getTemplates(): Promise<any[]> {
    return [];
  }

  async saveTemplate(template: any): Promise<string> {
    const newTemplate = {
      id: Date.now().toString(),
      ...template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newTemplate.id;
  }

  async updateTemplate(id: string, updates: any): Promise<boolean> {
    console.log('Updating template:', id, updates);
    return true;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    console.log('Deleting template:', id);
    return true;
  }
}

export const supabaseEmailManager = SupabaseEmailManager.getInstance();
