// Supabase WhatsApp Manager for Luxe Staycations
// Handles WhatsApp configuration and template storage in Supabase

import { supabase } from './supabase';
import { WhatsAppConfig, WhatsAppMessage } from './whatsappService';

export interface DatabaseWhatsAppConfiguration {
  id: string;
  business_account_id: string;
  access_token: string;
  phone_number_id: string;
  webhook_verify_token: string;
  api_version: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWhatsAppTemplate {
  id: string;
  name: string;
  type: string;
  language_code: string;
  template_content: any;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class SupabaseWhatsAppManager {
  private static instance: SupabaseWhatsAppManager;
  private isInitialized = false;

  public static getInstance(): SupabaseWhatsAppManager {
    if (!SupabaseWhatsAppManager.instance) {
      SupabaseWhatsAppManager.instance = new SupabaseWhatsAppManager();
    }
    return SupabaseWhatsAppManager.instance;
  }

  // Initialize the manager
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      // Test connection by checking if tables exist
      const { error } = await supabase
        .from('whatsapp_configurations')
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(`WhatsApp tables not found: ${error.message}`);
      }
      
      this.isInitialized = true;
      console.log('SupabaseWhatsAppManager initialized successfully');
    } catch (error) {
      console.error('Error initializing SupabaseWhatsAppManager:', error);
      throw error;
    }
  }

  // Load WhatsApp configuration from Supabase
  public async loadConfiguration(): Promise<WhatsAppConfig | null> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_configurations')
        .select('*')
        .eq('enabled', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No WhatsApp configuration found');
          return null;
        }
        throw error;
      }

      const config: WhatsAppConfig = {
        businessAccountId: data.business_account_id,
        accessToken: data.access_token,
        phoneNumberId: data.phone_number_id,
        webhookVerifyToken: data.webhook_verify_token,
        apiVersion: data.api_version,
        enabled: data.enabled
      };

      console.log('WhatsApp configuration loaded from Supabase');
      return config;
    } catch (error) {
      console.error('Error loading WhatsApp configuration:', error);
      return null;
    }
  }

  // Save WhatsApp configuration to Supabase
  public async saveConfiguration(config: WhatsAppConfig): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      // First, disable all existing configurations
      await supabase
        .from('whatsapp_configurations')
        .update({ enabled: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

      // Insert new configuration
      const { error } = await supabase
        .from('whatsapp_configurations')
        .insert({
          business_account_id: config.businessAccountId,
          access_token: config.accessToken,
          phone_number_id: config.phoneNumberId,
          webhook_verify_token: config.webhookVerifyToken,
          api_version: config.apiVersion,
          enabled: config.enabled
        });

      if (error) {
        throw error;
      }

      console.log('WhatsApp configuration saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving WhatsApp configuration:', error);
      return false;
    }
  }

  // Get all WhatsApp templates
  public async getTemplates(): Promise<DatabaseWhatsAppTemplate[]> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading WhatsApp templates:', error);
      return [];
    }
  }

  // Get templates by type
  public async getTemplatesByType(type: string): Promise<DatabaseWhatsAppTemplate[]> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading WhatsApp templates by type:', error);
      return [];
    }
  }

  // Get specific template by ID
  public async getTemplate(id: string): Promise<DatabaseWhatsAppTemplate | null> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error loading WhatsApp template:', error);
      return null;
    }
  }

  // Save new template
  public async saveTemplate(template: Omit<DatabaseWhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .insert(template);

      if (error) {
        throw error;
      }

      console.log('WhatsApp template saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving WhatsApp template:', error);
      return false;
    }
  }

  // Update existing template
  public async updateTemplate(id: string, updates: Partial<DatabaseWhatsAppTemplate>): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('WhatsApp template updated in Supabase');
      return true;
    } catch (error) {
      console.error('Error updating WhatsApp template:', error);
      return false;
    }
  }

  // Delete template
  public async deleteTemplate(id: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('WhatsApp template deleted from Supabase');
      return true;
    } catch (error) {
      console.error('Error deleting WhatsApp template:', error);
      return false;
    }
  }

  // Process template with variables
  public processTemplate(template: DatabaseWhatsAppTemplate, variables: Record<string, string>): WhatsAppMessage {
    try {
      let processedContent = JSON.parse(JSON.stringify(template.template_content));
      
      // Replace variables in the template content
      const replaceVariables = (obj: any): any => {
        if (typeof obj === 'string') {
          return obj.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return variables[varName] || match;
          });
        } else if (Array.isArray(obj)) {
          return obj.map(replaceVariables);
        } else if (obj && typeof obj === 'object') {
          const newObj: any = {};
          for (const key in obj) {
            newObj[key] = replaceVariables(obj[key]);
          }
          return newObj;
        }
        return obj;
      };

      processedContent = replaceVariables(processedContent);
      
      return processedContent as WhatsAppMessage;
    } catch (error) {
      console.error('Error processing WhatsApp template:', error);
      throw error;
    }
  }

  // Get configuration status
  public async isConfigured(): Promise<boolean> {
    try {
      const config = await this.loadConfiguration();
      return config !== null && config.enabled;
    } catch (error) {
      console.error('Error checking WhatsApp configuration status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supabaseWhatsAppManager = SupabaseWhatsAppManager.getInstance();
