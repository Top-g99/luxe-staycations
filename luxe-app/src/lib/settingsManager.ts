export interface AppSettings {
  id: string;
  category: 'general' | 'payment' | 'security' | 'notifications' | 'business';
  key: string;
  value: string | number | boolean;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  updatedAt: string;
}

export interface BusinessProfile {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  description: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface PaymentSettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  currency: string;
  taxRate: number;
  commissionRate: number;
  autoConfirmBookings: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmations: boolean;
  paymentReminders: boolean;
  marketingEmails: boolean;
}

export interface SecuritySettings {
  sessionTimeout: number;
  requireTwoFactor: boolean;
  maxLoginAttempts: number;
  passwordMinLength: number;
  enableAuditLog: boolean;
}

class SettingsManager {
  private settings: AppSettings[] = [];
  private businessProfile: BusinessProfile | null = null;
  private paymentSettings: PaymentSettings | null = null;
  private notificationSettings: NotificationSettings | null = null;
  private securitySettings: SecuritySettings | null = null;
  private subscribers: (() => void)[] = [];

  initialize() {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('luxeSettings');
      const savedBusinessProfile = localStorage.getItem('luxeBusinessProfile');
      const savedPaymentSettings = localStorage.getItem('luxePaymentSettings');
      const savedNotificationSettings = localStorage.getItem('luxeNotificationSettings');
      const savedSecuritySettings = localStorage.getItem('luxeSecuritySettings');

      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      } else {
        this.loadDefaultSettings();
      }

      if (savedBusinessProfile) {
        this.businessProfile = JSON.parse(savedBusinessProfile);
      } else {
        this.loadDefaultBusinessProfile();
      }

      if (savedPaymentSettings) {
        this.paymentSettings = JSON.parse(savedPaymentSettings);
      } else {
        this.loadDefaultPaymentSettings();
      }

      if (savedNotificationSettings) {
        this.notificationSettings = JSON.parse(savedNotificationSettings);
      } else {
        this.loadDefaultNotificationSettings();
      }

      if (savedSecuritySettings) {
        this.securitySettings = JSON.parse(savedSecuritySettings);
      } else {
        this.loadDefaultSecuritySettings();
      }
    }
  }

  private loadDefaultSettings() {
    this.settings = [
      {
        id: '1',
        category: 'general',
        key: 'siteName',
        value: 'Luxe Staycations',
        description: 'Website name',
        type: 'string',
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        category: 'general',
        key: 'siteDescription',
        value: 'Premium villa booking platform',
        description: 'Website description',
        type: 'string',
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        category: 'general',
        key: 'timezone',
        value: 'Asia/Kolkata',
        description: 'Default timezone',
        type: 'select',
        options: ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'],
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        category: 'general',
        key: 'maintenanceMode',
        value: false,
        description: 'Enable maintenance mode',
        type: 'boolean',
        updatedAt: new Date().toISOString()
      }
    ];
    this.saveSettings();
  }

  private loadDefaultBusinessProfile() {
    this.businessProfile = {
      companyName: 'Luxe Staycations',
      email: 'info@luxestaycations.com',
      phone: '+91-98765-43210',
      address: 'Mumbai, Maharashtra, India',
      website: 'www.luxestaycations.com',
      logo: '/logo.png',
      description: 'Premium villa booking platform offering luxury accommodations across India.',
      socialMedia: {
        facebook: 'luxestaycations',
        instagram: 'luxestaycations',
        twitter: 'luxestaycations',
        linkedin: 'luxestaycations'
      }
    };
    this.saveBusinessProfile();
  }

  private loadDefaultPaymentSettings() {
    this.paymentSettings = {
      razorpayKeyId: '',
      razorpayKeySecret: '',
      currency: 'INR',
      taxRate: 18,
      commissionRate: 10,
      autoConfirmBookings: false
    };
    this.savePaymentSettings();
  }

  private loadDefaultNotificationSettings() {
    this.notificationSettings = {
      emailNotifications: true,
      smsNotifications: false,
      bookingConfirmations: true,
      paymentReminders: true,
      marketingEmails: false
    };
    this.saveNotificationSettings();
  }

  private loadDefaultSecuritySettings() {
    this.securitySettings = {
      sessionTimeout: 30,
      requireTwoFactor: false,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      enableAuditLog: true
    };
    this.saveSecuritySettings();
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeSettings', JSON.stringify(this.settings));
    }
  }

  private saveBusinessProfile() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeBusinessProfile', JSON.stringify(this.businessProfile));
    }
  }

  private savePaymentSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxePaymentSettings', JSON.stringify(this.paymentSettings));
    }
  }

  private saveNotificationSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeNotificationSettings', JSON.stringify(this.notificationSettings));
    }
  }

  private saveSecuritySettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeSecuritySettings', JSON.stringify(this.securitySettings));
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // General Settings Methods
  getSetting(key: string): AppSettings | undefined {
    return this.settings.find(setting => setting.key === key);
  }

  getSettingsByCategory(category: AppSettings['category']): AppSettings[] {
    return this.settings.filter(setting => setting.category === category);
  }

  updateSetting(key: string, value: string | number | boolean): boolean {
    const setting = this.settings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      setting.updatedAt = new Date().toISOString();
      this.saveSettings();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  addSetting(setting: Omit<AppSettings, 'id' | 'updatedAt'>): AppSettings {
    const newSetting: AppSettings = {
      ...setting,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString()
    };
    this.settings.push(newSetting);
    this.saveSettings();
    this.notifySubscribers();
    return newSetting;
  }

  // Business Profile Methods
  getBusinessProfile(): BusinessProfile | null {
    return this.businessProfile;
  }

  updateBusinessProfile(updates: Partial<BusinessProfile>): boolean {
    if (this.businessProfile) {
      this.businessProfile = { ...this.businessProfile, ...updates };
      this.saveBusinessProfile();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Payment Settings Methods
  getPaymentSettings(): PaymentSettings | null {
    return this.paymentSettings;
  }

  updatePaymentSettings(updates: Partial<PaymentSettings>): boolean {
    if (this.paymentSettings) {
      this.paymentSettings = { ...this.paymentSettings, ...updates };
      this.savePaymentSettings();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Notification Settings Methods
  getNotificationSettings(): NotificationSettings | null {
    return this.notificationSettings;
  }

  updateNotificationSettings(updates: Partial<NotificationSettings>): boolean {
    if (this.notificationSettings) {
      this.notificationSettings = { ...this.notificationSettings, ...updates };
      this.saveNotificationSettings();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Security Settings Methods
  getSecuritySettings(): SecuritySettings | null {
    return this.securitySettings;
  }

  updateSecuritySettings(updates: Partial<SecuritySettings>): boolean {
    if (this.securitySettings) {
      this.securitySettings = { ...this.securitySettings, ...updates };
      this.saveSecuritySettings();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Utility Methods
  getAllSettings(): AppSettings[] {
    return this.settings;
  }

  getSettingsStats() {
    const total = this.settings.length;
    const general = this.settings.filter(s => s.category === 'general').length;
    const payment = this.settings.filter(s => s.category === 'payment').length;
    const security = this.settings.filter(s => s.category === 'security').length;
    const notifications = this.settings.filter(s => s.category === 'notifications').length;
    const business = this.settings.filter(s => s.category === 'business').length;

    return {
      total,
      general,
      payment,
      security,
      notifications,
      business
    };
  }
}

export const settingsManager = new SettingsManager();

