import { getSupabaseClient, TABLES, DatabaseEmailConfiguration, DatabaseEmailTemplate } from './supabase';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableSSL: boolean;
  fromName: string;
  fromEmail: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export class SupabaseEmailManager {
  private static instance: SupabaseEmailManager;
  private config: EmailConfig | null = null;
  private templates: EmailTemplate[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SupabaseEmailManager {
    if (!SupabaseEmailManager.instance) {
      SupabaseEmailManager.instance = new SupabaseEmailManager();
    }
    return SupabaseEmailManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadConfiguration();
      await this.loadTemplates();
      this.isInitialized = true;
      console.log('SupabaseEmailManager initialized successfully');
    } catch (error) {
      console.error('Error initializing SupabaseEmailManager:', error);
      throw error;
    }
  }

  public async loadConfiguration(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_CONFIGURATIONS)
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading email configuration:', error);
        return;
      }

      if (data) {
        this.config = {
          smtpHost: data.smtp_host,
          smtpPort: data.smtp_port,
          smtpUser: data.smtp_user,
          smtpPassword: data.smtp_password,
          enableSSL: data.enable_ssl,
          fromName: data.from_name,
          fromEmail: data.from_email
        };
        console.log('Email configuration loaded from Supabase');
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
    }
  }

  public async saveConfiguration(config: EmailConfig): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      
      // First, deactivate all existing configurations
      await supabase
        .from(TABLES.EMAIL_CONFIGURATIONS)
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

      // Insert new configuration
      const { data, error } = await supabase
        .from(TABLES.EMAIL_CONFIGURATIONS)
        .insert({
          smtp_host: config.smtpHost,
          smtp_port: config.smtpPort,
          smtp_user: config.smtpUser,
          smtp_password: config.smtpPassword,
          enable_ssl: config.enableSSL,
          from_name: config.fromName,
          from_email: config.fromEmail,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving email configuration:', error);
        return false;
      }

      this.config = config;
      console.log('Email configuration saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving email configuration:', error);
      return false;
    }
  }

  public async loadTemplates(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading email templates:', error);
        return;
      }

      if (data) {
        this.templates = data.map((template: DatabaseEmailTemplate) => ({
          id: template.id,
          name: template.name,
          type: template.type,
          subject: template.subject,
          htmlContent: template.html_content,
          textContent: template.text_content,
          variables: template.variables,
          isActive: template.is_active,
          isDefault: template.is_default,
          createdAt: template.created_at,
          updatedAt: template.updated_at
        }));
        console.log(`Loaded ${this.templates.length} email templates from Supabase`);
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  public async saveTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .insert({
          name: template.name,
          type: template.type,
          subject: template.subject,
          html_content: template.htmlContent,
          text_content: template.textContent,
          variables: template.variables,
          is_active: template.isActive,
          is_default: template.isDefault
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving email template:', error);
        return null;
      }

      // Reload templates to include the new one
      await this.loadTemplates();
      console.log('Email template saved to Supabase');
      return data.id;
    } catch (error) {
      console.error('Error saving email template:', error);
      return null;
    }
  }

  public async updateTemplate(id: string, template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const updateData: any = {};

      if (template.name !== undefined) updateData.name = template.name;
      if (template.type !== undefined) updateData.type = template.type;
      if (template.subject !== undefined) updateData.subject = template.subject;
      if (template.htmlContent !== undefined) updateData.html_content = template.htmlContent;
      if (template.textContent !== undefined) updateData.text_content = template.textContent;
      if (template.variables !== undefined) updateData.variables = template.variables;
      if (template.isActive !== undefined) updateData.is_active = template.isActive;
      if (template.isDefault !== undefined) updateData.is_default = template.isDefault;

      const { error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating email template:', error);
        return false;
      }

      // Reload templates to reflect changes
      await this.loadTemplates();
      console.log('Email template updated in Supabase');
      return true;
    } catch (error) {
      console.error('Error updating email template:', error);
      return false;
    }
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
       .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting email template:', error);
        return false;
      }

      // Reload templates to reflect changes
      await this.loadTemplates();
      console.log('Email template deleted from Supabase');
      return true;
    } catch (error) {
      console.error('Error deleting email template:', error);
      return false;
    }
  }

  public getConfiguration(): EmailConfig | null {
    return this.config;
  }

  public isConfigured(): boolean {
    return this.config !== null;
  }

  public getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  public getTemplatesByType(type: string): EmailTemplate[] {
    return this.templates.filter(template => template.type === type && template.isActive);
  }

  public getTemplateById(id: string): EmailTemplate | null {
    return this.templates.find(template => template.id === id) || null;
  }

  public processTemplate(templateId: string, variables: Record<string, string>): { subject: string; html: string; text?: string } | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      html = html.replace(new RegExp(placeholder, 'g'), value);
      if (text) {
        text = text.replace(new RegExp(placeholder, 'g'), value);
      }
    });

    return {
      subject,
      html,
      text
    };
  }
}

// Export singleton instance
export const supabaseEmailManager = SupabaseEmailManager.getInstance();
