import { NextRequest } from 'next/server';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

// Rate limit entry
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Default rate limiting configurations
export const EMAIL_RATE_LIMITS = {
  // General email sending
  EMAIL_SEND: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Email template operations
  TEMPLATE_OPERATIONS: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Email configuration changes
  CONFIG_CHANGES: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Test email sending
  TEST_EMAILS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Email rate limiter class
export class EmailRateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // Generate rate limit key
  private generateKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // Default key generation based on IP
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const endpoint = new URL(request.url).pathname;
    
    return `email:${endpoint}:${ip}:${this.hashString(userAgent)}`;
  }

  // Get client IP address
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('x-remote-addr');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (remoteAddr) {
      return remoteAddr;
    }
    
    return 'unknown';
  }

  // Hash string for consistent key generation
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Check if request is within rate limit
  checkRateLimit(request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.generateKey(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
      rateLimitStore.set(key, entry);
    }

    // Check if already blocked
    if (entry.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      entry.blocked = true;
      rateLimitStore.set(key, entry);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count - 1,
      resetTime: entry.resetTime
    };
  }

  // Increment rate limit counter
  incrementRateLimit(request: NextRequest, success: boolean = true): void {
    const key = this.generateKey(request);
    const entry = rateLimitStore.get(key);
    
    if (entry && !entry.blocked) {
      // Skip counting based on configuration
      if (success && this.config.skipSuccessfulRequests) {
        return;
      }
      
      if (!success && this.config.skipFailedRequests) {
        return;
      }

      entry.count++;
      rateLimitStore.set(key, entry);
    }
  }

  // Reset rate limit for a specific key
  resetRateLimit(request: NextRequest): void {
    const key = this.generateKey(request);
    rateLimitStore.delete(key);
  }

  // Clean up expired entries
  private cleanupExpiredEntries(now: number): void {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  // Get rate limit status for a key
  getRateLimitStatus(request: NextRequest): {
    count: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  } {
    const key = this.generateKey(request);
    const entry = rateLimitStore.get(key);
    const now = Date.now();

    if (!entry || entry.resetTime <= now) {
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked
    };
  }

  // Get all rate limit entries (for monitoring)
  getAllEntries(): Map<string, RateLimitEntry> {
    return new Map(rateLimitStore);
  }

  // Clear all rate limit entries
  clearAll(): void {
    rateLimitStore.clear();
  }
}

// Create rate limiter instances
export const emailSendRateLimiter = new EmailRateLimiter(EMAIL_RATE_LIMITS.EMAIL_SEND);
export const templateOperationsRateLimiter = new EmailRateLimiter(EMAIL_RATE_LIMITS.TEMPLATE_OPERATIONS);
export const configChangesRateLimiter = new EmailRateLimiter(EMAIL_RATE_LIMITS.CONFIG_CHANGES);
export const testEmailRateLimiter = new EmailRateLimiter(EMAIL_RATE_LIMITS.TEST_EMAILS);

// Rate limiting middleware function
export function withEmailRateLimit(
  rateLimiter: EmailRateLimiter,
  operation: string
) {
  return function rateLimitMiddleware(request: NextRequest) {
    const rateLimitResult = rateLimiter.checkRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        details: {
          operation,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          retryAfter: rateLimitResult.retryAfter
        }
      };
    }

    return {
      success: true,
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    };
  };
}
