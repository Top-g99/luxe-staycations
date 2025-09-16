// Minimal email rate limiter for admin functionality
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class EmailRateLimiter {
  private static instance: EmailRateLimiter;
  private config: RateLimitConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100
  };

  static getInstance(): EmailRateLimiter {
    if (!EmailRateLimiter.instance) {
      EmailRateLimiter.instance = new EmailRateLimiter();
    }
    return EmailRateLimiter.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    // Mock rate limiting - always allow
    return {
      allowed: true,
      remaining: this.config.maxRequests,
      resetTime: Date.now() + this.config.windowMs
    };
  }

  async getConfig(): Promise<RateLimitConfig> {
    return this.config;
  }

  async updateConfig(newConfig: Partial<RateLimitConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
  }
}

export const emailRateLimiter = EmailRateLimiter.getInstance();

// Export additional functions for compatibility
export const emailSendRateLimiter = {
  checkRateLimit: (identifier: string) => emailRateLimiter.checkRateLimit(identifier),
  incrementRateLimit: (request: any, success: boolean) => {
    console.log('Rate limit incremented for:', success ? 'successful' : 'failed', 'request');
  }
};