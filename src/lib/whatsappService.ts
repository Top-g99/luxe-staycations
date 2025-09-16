// Minimal WhatsApp service for admin functionality
export interface WhatsAppConfig {
  id: string;
  access_token: string;
  phone_number_id: string;
  business_account_id: string;
  webhook_verify_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  private config: WhatsAppConfig | null = null;
  private messages: WhatsAppMessage[] = [];
  public isConfigured: boolean = false;

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }


  async setConfig(config: Omit<WhatsAppConfig, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppConfig> {
    const newConfig: WhatsAppConfig = {
      ...config,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.config = newConfig;
    return newConfig;
  }

  async getMessages(): Promise<WhatsAppMessage[]> {
    return this.messages;
  }

  async createMessage(message: Omit<WhatsAppMessage, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppMessage> {
    const newMessage: WhatsAppMessage = {
      ...message,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  async updateMessage(id: string, updates: Partial<WhatsAppMessage>): Promise<WhatsAppMessage | null> {
    const index = this.messages.findIndex(m => m.id === id);
    if (index !== -1) {
      this.messages[index] = { ...this.messages[index], ...updates, updated_at: new Date().toISOString() };
      return this.messages[index];
    }
    return null;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const index = this.messages.findIndex(m => m.id === id);
    if (index !== -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      await this.createMessage({
        to,
        message,
        status: 'sent'
      });
      console.log('WhatsApp message sent:', { to, message });
      return true;
    } catch (error) {
      console.error('WhatsApp message sending failed:', error);
      return false;
    }
  }

  async sendBookingConfirmation(data: any): Promise<{ success: boolean; message?: string }> {
    console.log('Sending WhatsApp booking confirmation:', data);
    return { success: true, message: 'WhatsApp confirmation sent' };
  }

  async sendQuickResponse(to: string, message: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await this.sendMessage(to, message);
      return { 
        success: result, 
        message: result ? 'Quick response sent successfully' : 'Failed to send quick response' 
      };
    } catch (error) {
      console.error('Error sending quick response:', error);
      return { 
        success: false, 
        message: `Failed to send quick response: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  getConfig(): WhatsAppConfig | null {
    return this.config;
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  async configure(config: WhatsAppConfig): Promise<boolean> {
    try {
      await this.setConfig(config);
      this.isConfigured = true;
      return true;
    } catch (error) {
      console.error('Error configuring WhatsApp service:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Mock connection test - in real app, this would test WhatsApp API connection
      if (!this.config || !this.config.access_token) {
        return {
          success: false,
          message: 'WhatsApp service not configured. Please provide access token.'
        };
      }
      
      return {
        success: true,
        message: 'WhatsApp connection test successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const whatsappService = WhatsAppService.getInstance();