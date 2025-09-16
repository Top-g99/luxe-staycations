// Minimal settings manager for admin functionality
export interface Settings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  description: string;
  category: string;
  isRequired: boolean;
  isPublic: boolean;
  options?: Array<{ value: string; label: string }>;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  companyName: string;
  businessType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  coverImage: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentSettings {
  id: string;
  paymentGateway: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  paypalClientId: string;
  paypalClientSecret: string;
  currency: string;
  taxRate: number;
  commissionRate: number;
  autoConfirmBookings: boolean;
  testMode: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: Settings[] = [];

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Settings[]> {
    return this.settings;
  }

  async getById(id: string): Promise<Settings | null> {
    return this.settings.find(s => s.id === id) || null;
  }

  async getByKey(key: string): Promise<Settings | null> {
    return this.settings.find(s => s.key === key) || null;
  }

  async create(setting: Omit<Settings, 'id' | 'created_at' | 'updated_at'>): Promise<Settings> {
    const newSetting: Settings = {
      ...setting,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.settings.push(newSetting);
    return newSetting;
  }

  async update(id: string, updates: Partial<Settings>): Promise<Settings | null> {
    const index = this.settings.findIndex(s => s.id === id);
    if (index !== -1) {
      this.settings[index] = { ...this.settings[index], ...updates, updated_at: new Date().toISOString() };
      return this.settings[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.settings.findIndex(s => s.id === id);
    if (index !== -1) {
      this.settings.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAllSettings(): Promise<any[]> {
    return this.settings;
  }

  async getNotificationSettings(): Promise<any> {
    return this.settings.filter(s => s.category === 'notification');
  }

  async getSecuritySettings(): Promise<any> {
    return this.settings.filter(s => s.category === 'security');
  }

  async getSettingsStats(): Promise<any> {
    return {
      totalSettings: this.settings.length,
      categories: [...new Set(this.settings.map(s => s.category))],
      lastUpdated: this.settings.length > 0 ? Math.max(...this.settings.map(s => new Date(s.updated_at).getTime())) : null
    };
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    const setting = this.settings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      setting.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }



  async updateNotificationSettings(data: any): Promise<boolean> {
    // Update notification settings
    const notificationKeys = ['email_notifications', 'sms_notifications', 'push_notifications', 'notification_frequency'];
    let updated = false;
    
    for (const key of notificationKeys) {
      if (data[key] !== undefined) {
        const setting = this.settings.find(s => s.key === key);
        if (setting) {
          setting.value = data[key];
          setting.updated_at = new Date().toISOString();
          updated = true;
        }
      }
    }
    
    return updated;
  }

  async updateSecuritySettings(data: any): Promise<boolean> {
    // Update security settings
    const securityKeys = ['two_factor_auth', 'password_policy', 'session_timeout', 'ip_whitelist'];
    let updated = false;
    
    for (const key of securityKeys) {
      if (data[key] !== undefined) {
        const setting = this.settings.find(s => s.key === key);
        if (setting) {
          setting.value = data[key];
          setting.updated_at = new Date().toISOString();
          updated = true;
        }
      }
    }
    
    return updated;
  }

  async getBusinessProfile(): Promise<BusinessProfile | null> {
    // Mock business profile data
    return {
      id: '1',
      businessName: 'Luxe Staycations',
      companyName: 'Luxe Staycations Pvt Ltd',
      businessType: 'Hospitality',
      description: 'Premium villa booking platform',
      address: '123 Luxury Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
      phone: '+91-9876543210',
      email: 'info@luxestaycations.com',
      website: 'https://luxestaycations.com',
      logo: '/images/logo.png',
      coverImage: '/images/cover.jpg',
      socialMedia: {
        facebook: 'https://facebook.com/luxestaycations',
        instagram: 'https://instagram.com/luxestaycations',
        twitter: 'https://twitter.com/luxestaycations',
        linkedin: 'https://linkedin.com/company/luxestaycations'
      },
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async updateBusinessProfile(profile: BusinessProfile): Promise<boolean> {
    // Mock update - in real app, this would save to database
    console.log('Updating business profile:', profile);
    return true;
  }

  async getSettingsByCategory(category: string): Promise<AppSettings[]> {
    // Mock settings by category - in real app, this would query database
    return [
      {
        id: '1',
        key: 'site_name',
        value: 'Luxe Staycations',
        type: 'string',
        description: 'The name of the website',
        category: 'general',
        isRequired: true,
        isPublic: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        key: 'site_description',
        value: 'Premium villa booking platform',
        type: 'string',
        description: 'The description of the website',
        category: 'general',
        isRequired: false,
        isPublic: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  async getPaymentSettings(): Promise<PaymentSettings | null> {
    // Mock payment settings - in real app, this would load from database
    return {
      id: '1',
      paymentGateway: 'stripe',
      stripePublicKey: 'pk_test_...',
      stripeSecretKey: 'sk_test_...',
      stripeWebhookSecret: 'whsec_...',
      razorpayKeyId: 'rzp_test_...',
      razorpayKeySecret: 'rzp_test_...',
      paypalClientId: 'paypal_client_id',
      paypalClientSecret: 'paypal_client_secret',
      currency: 'INR',
      taxRate: 18.0,
      commissionRate: 5.0,
      autoConfirmBookings: false,
      testMode: true,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async updatePaymentSettings(settings: PaymentSettings): Promise<boolean> {
    // Mock update - in real app, this would save to database
    console.log('Updating payment settings:', settings);
    return true;
  }

  async getValue(key: string, defaultValue?: any): Promise<any> {
    const setting = await this.getByKey(key);
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    }
    return defaultValue;
  }

  async setValue(key: string, value: any): Promise<Settings> {
    const existing = await this.getByKey(key);
    if (existing) {
      return await this.update(existing.id, { value: JSON.stringify(value) }) || existing;
    } else {
      return await this.create({
        key,
        value: JSON.stringify(value),
        type: 'json',
        description: `Setting for ${key}`
      });
    }
  }
}

export const settingsManager = SettingsManager.getInstance();
