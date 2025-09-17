// Minimal security utilities for admin functionality
export interface SecurityHeaders {
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private rateLimitStore = new Map<string, RateLimitEntry>();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = identifier;
    const entry = this.rateLimitStore.get(key);

    if (!entry || entry.resetTime <= now) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    this.rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  async clearRateLimit(identifier: string): Promise<void> {
    this.rateLimitStore.delete(identifier);
  }

  async clearAllRateLimits(): Promise<void> {
    this.rateLimitStore.clear();
  }
}

export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private logs: any[] = [];

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  async log(event: string, details: any): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details
    };
    this.logs.push(logEntry);
    console.log('Security Audit:', logEntry);
  }

  async getLogs(): Promise<any[]> {
    return this.logs;
  }

  static logSecurityEvent(eventType: string, data: any): void {
    const instance = SecurityAuditLogger.getInstance();
    instance.log(eventType, data);
  }
}

export const rateLimiter = RateLimiter.getInstance();
export const securityHeaders: SecurityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

export const SecurityHeaders = securityHeaders;
export const securityAuditLogger = SecurityAuditLogger.getInstance();