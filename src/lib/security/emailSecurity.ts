// Minimal email security service for admin functionality
export interface EmailSecurityConfig {
  maxEmailsPerHour: number;
  maxEmailsPerDay: number;
  blockedDomains: string[];
  allowedDomains: string[];
}

export class EmailSecurity {
  private static instance: EmailSecurity;
  private config: EmailSecurityConfig = {
    maxEmailsPerHour: 100,
    maxEmailsPerDay: 1000,
    blockedDomains: [],
    allowedDomains: []
  };

  static getInstance(): EmailSecurity {
    if (!EmailSecurity.instance) {
      EmailSecurity.instance = new EmailSecurity();
    }
    return EmailSecurity.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    // Mock rate limiting - always allow
    return {
      allowed: true,
      remaining: this.config.maxEmailsPerHour,
      resetTime: Date.now() + 3600000
    };
  }

  async isDomainAllowed(domain: string): Promise<boolean> {
    if (this.config.blockedDomains.includes(domain)) {
      return false;
    }
    if (this.config.allowedDomains.length > 0 && !this.config.allowedDomains.includes(domain)) {
      return false;
    }
    return true;
  }

  async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getConfig(): Promise<EmailSecurityConfig> {
    return this.config;
  }

  async updateConfig(newConfig: Partial<EmailSecurityConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
  }
}

export const emailSecurity = EmailSecurity.getInstance();

// Export additional functions for compatibility
export const emailSecurityValidator = {
  validateEmail: (email: string) => emailSecurity.validateEmail(email),
  isDomainAllowed: (domain: string) => emailSecurity.isDomainAllowed(domain),
  checkRateLimit: (identifier: string) => emailSecurity.checkRateLimit(identifier),
  getClientIP: (request: any) => {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded ? forwarded.split(',')[0] : realIP || '127.0.0.1';
    return clientIP;
  },
  logSecurityEvent: (event: string, data: any, severity: string = 'medium') => {
    console.log(`Security Event [${severity.toUpperCase()}]: ${event}`, data);
  },
  validateEmailRequest: (request: any, body: any) => {
    return { isValid: true, sanitizedBody: body, errors: [] };
  },
  validateSmtpConfig: (config: any) => {
    return { isValid: true, errors: [] };
  },
  validateEmailContent: (content: string, type: string) => {
    return { isValid: true, errors: [], sanitized: content };
  },
  validateTemplateVariables: (variables: any) => {
    return { isValid: true, errors: [] };
  }
};