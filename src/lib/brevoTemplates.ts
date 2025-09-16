// Minimal Brevo templates service for admin functionality
export interface BrevoTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  textContent?: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export class BrevoTemplates {
  private static instance: BrevoTemplates;
  private templates: BrevoTemplate[] = [];

  static getInstance(): BrevoTemplates {
    if (!BrevoTemplates.instance) {
      BrevoTemplates.instance = new BrevoTemplates();
    }
    return BrevoTemplates.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<BrevoTemplate[]> {
    return this.templates;
  }

  async getById(id: string): Promise<BrevoTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }

  async create(template: Omit<BrevoTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<BrevoTemplate> {
    const newTemplate: BrevoTemplate = {
      ...template,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async update(id: string, updates: Partial<BrevoTemplate>): Promise<BrevoTemplate | null> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates, updated_at: new Date().toISOString() };
      return this.templates[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const brevoTemplates = BrevoTemplates.getInstance();

// Export additional functions for compatibility
export const getTemplateById = (id: string) => brevoTemplates.getById(id);
export const getTemplatesByCategory = (category: string) => brevoTemplates.getAll().then(templates => templates.filter(t => t.category === category));

export const LUXE_EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking-confirmation',
  LOYALTY_UPDATE: 'loyalty-update',
  NEWSLETTER: 'newsletter',
  REMINDER: 'reminder'
};
