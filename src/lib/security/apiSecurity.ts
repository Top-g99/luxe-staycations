// API Security Middleware and Utilities
import { NextRequest, NextResponse } from 'next/server';
import { SecurityHeaders, RateLimiter, SecurityAuditLogger, InputValidator } from './securityUtils';
import { SecureAuthManager } from './secureAuth';

// API Security Configuration
export interface APISecurityConfig {
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  requireAuth?: boolean;
  requireCSRF?: boolean;
  allowedMethods?: string[];
  validateInput?: boolean;
  logRequests?: boolean;
}

// Default security configuration
const DEFAULT_CONFIG: APISecurityConfig = {
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  requireAuth: true,
  requireCSRF: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  validateInput: true,
  logRequests: true
};

// API Security Middleware
export class APISecurityMiddleware {
  static async secureAPI(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    config: APISecurityConfig = DEFAULT_CONFIG
  ): Promise<NextResponse> {
    try {
      const startTime = Date.now();
      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      // Log request
      if (config.logRequests) {
        SecurityAuditLogger.logSecurityEvent('API_REQUEST', {
          method: request.method,
          url: request.url,
          ip: clientIP,
          userAgent,
          timestamp: new Date().toISOString()
        }, 'low');
      }

      // Check allowed methods
      if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
        SecurityAuditLogger.logSecurityEvent('INVALID_METHOD', {
          method: request.method,
          url: request.url,
          ip: clientIP
        }, 'medium');
        
        return this.createErrorResponse('Method not allowed', 405);
      }

      // Rate limiting
      if (config.rateLimit) {
        const rateLimitKey = `api:${clientIP}:${request.nextUrl.pathname}`;
        if (RateLimiter.isRateLimited(rateLimitKey, config.rateLimit.maxRequests, config.rateLimit.windowMs)) {
          SecurityAuditLogger.logSecurityEvent('API_RATE_LIMITED', {
            ip: clientIP,
            url: request.url,
            method: request.method
          }, 'high');
          
          return this.createErrorResponse('Too many requests', 429);
        }
      }

      // Authentication check
      if (config.requireAuth) {
        const authResult = await this.validateAuthentication(request);
        if (!authResult.isValid) {
          SecurityAuditLogger.logSecurityEvent('API_AUTH_FAILED', {
            url: request.url,
            ip: clientIP,
            reason: authResult.error
          }, 'medium');
          
          return this.createErrorResponse('Unauthorized', 401);
        }
      }

      // CSRF protection
      if (config.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfResult = await this.validateCSRF(request);
        if (!csrfResult.isValid) {
          SecurityAuditLogger.logSecurityEvent('CSRF_VALIDATION_FAILED', {
            url: request.url,
            ip: clientIP,
            method: request.method
          }, 'high');
          
          return this.createErrorResponse('CSRF token validation failed', 403);
        }
      }

      // Input validation
      if (config.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const validationResult = await this.validateInput(request);
        if (!validationResult.isValid) {
          SecurityAuditLogger.logSecurityEvent('INPUT_VALIDATION_FAILED', {
            url: request.url,
            ip: clientIP,
            errors: validationResult.errors
          }, 'medium');
          
          return this.createErrorResponse('Invalid input data', 400, validationResult.errors);
        }
      }

      // Execute the actual handler
      const response = await handler(request);
      
      // Add security headers
      this.addSecurityHeaders(response);
      
      // Log response
      if (config.logRequests) {
        const duration = Date.now() - startTime;
        SecurityAuditLogger.logSecurityEvent('API_RESPONSE', {
          method: request.method,
          url: request.url,
          status: response.status,
          duration,
          ip: clientIP
        }, 'low');
      }
      
      return response;
      
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('API_ERROR', {
        url: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  // Get client IP address
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return 'unknown';
  }

  // Validate authentication
  private static async validateAuthentication(request: NextRequest): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      // Check for session in cookies or headers
      const sessionToken = request.cookies.get('session')?.value || 
                          request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return { isValid: false, error: 'No authentication token provided' };
      }

      // For client-side validation, we'll check the session
      // In a real implementation, this would validate against a server-side session store
      const sessionInfo = SecureAuthManager.getSessionInfo();
      
      if (!sessionInfo.isLoggedIn) {
        return { isValid: false, error: 'Invalid or expired session' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Authentication validation failed' };
    }
  }

  // Validate CSRF token
  private static async validateCSRF(request: NextRequest): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const csrfToken = request.headers.get('x-csrf-token') || 
                       request.headers.get('csrf-token');
      
      if (!csrfToken) {
        return { isValid: false, error: 'CSRF token not provided' };
      }

      const isValid = SecureAuthManager.validateCSRFToken(csrfToken);
      
      if (!isValid) {
        return { isValid: false, error: 'Invalid CSRF token' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'CSRF validation failed' };
    }
  }

  // Validate input data
  private static async validateInput(request: NextRequest): Promise<{
    isValid: boolean;
    errors?: string[];
  }> {
    try {
      const contentType = request.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        return { isValid: true }; // Skip validation for non-JSON requests
      }

      const body = await request.json();
      const errors: string[] = [];

      // Basic input validation
      if (typeof body === 'object' && body !== null) {
        for (const [key, value] of Object.entries(body)) {
          if (typeof value === 'string') {
            // Check for potential XSS
            if (value.includes('<script') || value.includes('javascript:')) {
              errors.push(`Potential XSS detected in field: ${key}`);
            }
            
            // Check for SQL injection patterns
            if (value.match(/(union|select|insert|update|delete|drop|create|alter)\s+/i)) {
              errors.push(`Potential SQL injection detected in field: ${key}`);
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return { isValid: false, errors: ['Invalid JSON data'] };
    }
  }

  // Add security headers to response
  private static addSecurityHeaders(response: NextResponse): void {
    const securityHeaders = SecurityHeaders.getSecurityHeaders();
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Create error response
  private static createErrorResponse(
    message: string, 
    status: number, 
    details?: any
  ): NextResponse {
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        ...(details && { details })
      },
      { status }
    );
    
    this.addSecurityHeaders(response);
    return response;
  }
}

// Input sanitization for API endpoints
export class APIInputSanitizer {
  static sanitizeRequestBody(body: any): any {
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized: any = Array.isArray(body) ? [] : {};

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitized[key] = InputValidator.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeRequestBody(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static validateEmail(email: string): boolean {
    return InputValidator.isValidEmail(email);
  }

  static validatePhone(phone: string): boolean {
    return InputValidator.isValidPhone(phone);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    return InputValidator.isStrongPassword(password);
  }
}

// API endpoint decorator for easy security application
export function secureEndpoint(config: APISecurityConfig = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (request: NextRequest) {
      return APISecurityMiddleware.secureAPI(request, originalMethod.bind(this), config);
    };
    
    return descriptor;
  };
}

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://luxestaycations.com', 'https://www.luxestaycations.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// CORS middleware
export function handleCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (origin && CORS_CONFIG.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());
    
    return response;
  }
  
  if (origin && CORS_CONFIG.origin.includes(origin)) {
    return null; // Allow the request to continue
  }
  
  return new NextResponse('CORS policy violation', { status: 403 });
}
