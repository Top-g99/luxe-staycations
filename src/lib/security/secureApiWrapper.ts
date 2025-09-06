// Secure API Route Wrapper
import { NextRequest, NextResponse } from 'next/server';
import { APISecurityMiddleware, APIInputSanitizer, handleCORS } from './apiSecurity';
import { SecurityAuditLogger } from './securityUtils';

// API Security Configuration Presets
export const API_SECURITY_PRESETS = {
  // Public API (no auth required, basic rate limiting)
  PUBLIC: {
    rateLimit: { maxRequests: 200, windowMs: 15 * 60 * 1000 },
    requireAuth: false,
    requireCSRF: false,
    allowedMethods: ['GET', 'POST'],
    validateInput: true,
    logRequests: true
  },
  
  // Authenticated API (requires auth, CSRF protection)
  AUTHENTICATED: {
    rateLimit: { maxRequests: 100, windowMs: 15 * 60 * 1000 },
    requireAuth: true,
    requireCSRF: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    validateInput: true,
    logRequests: true
  },
  
  // Admin API (strict security)
  ADMIN: {
    rateLimit: { maxRequests: 50, windowMs: 15 * 60 * 1000 },
    requireAuth: true,
    requireCSRF: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    validateInput: true,
    logRequests: true
  },
  
  // Read-only API (GET only, no auth)
  READ_ONLY: {
    rateLimit: { maxRequests: 300, windowMs: 15 * 60 * 1000 },
    requireAuth: false,
    requireCSRF: false,
    allowedMethods: ['GET'],
    validateInput: false,
    logRequests: true
  }
};

// Secure API Route Handler
export class SecureAPIRoute {
  static async handle(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    securityConfig = API_SECURITY_PRESETS.AUTHENTICATED
  ): Promise<NextResponse> {
    try {
      // Handle CORS
      const corsResponse = handleCORS(request);
      if (corsResponse) {
        return corsResponse;
      }

      // Apply security middleware
      return await APISecurityMiddleware.secureAPI(request, handler, securityConfig);
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('API_WRAPPER_ERROR', {
        url: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // GET handler with security
  static async GET(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    securityConfig = API_SECURITY_PRESETS.READ_ONLY
  ): Promise<NextResponse> {
    if (request.method !== 'GET') {
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    return this.handle(request, handler, securityConfig);
  }

  // POST handler with security
  static async POST(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    securityConfig = API_SECURITY_PRESETS.AUTHENTICATED
  ): Promise<NextResponse> {
    if (request.method !== 'POST') {
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    return this.handle(request, handler, securityConfig);
  }

  // PUT handler with security
  static async PUT(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    securityConfig = API_SECURITY_PRESETS.AUTHENTICATED
  ): Promise<NextResponse> {
    if (request.method !== 'PUT') {
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    return this.handle(request, handler, securityConfig);
  }

  // DELETE handler with security
  static async DELETE(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
    securityConfig = API_SECURITY_PRESETS.ADMIN
  ): Promise<NextResponse> {
    if (request.method !== 'DELETE') {
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    return this.handle(request, handler, securityConfig);
  }

  // Multi-method handler
  static async handleMethods(
    request: NextRequest,
    handlers: {
      GET?: (req: NextRequest) => Promise<NextResponse>;
      POST?: (req: NextRequest) => Promise<NextResponse>;
      PUT?: (req: NextRequest) => Promise<NextResponse>;
      DELETE?: (req: NextRequest) => Promise<NextResponse>;
    },
    securityConfig = API_SECURITY_PRESETS.AUTHENTICATED
  ): Promise<NextResponse> {
    const method = request.method as keyof typeof handlers;
    const handler = handlers[method];

    if (!handler) {
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    return this.handle(request, handler, securityConfig);
  }
}

// Input validation helpers
export class APIValidation {
  static validateRequestBody<T>(
    body: any,
    schema: {
      required?: string[];
      email?: string[];
      phone?: string[];
      password?: string[];
      maxLength?: Record<string, number>;
    }
  ): { isValid: boolean; data?: T; errors?: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
          errors.push(`Field '${field}' is required`);
        }
      }
    }

    // Validate email fields
    if (schema.email) {
      for (const field of schema.email) {
        if (body[field] && !APIInputSanitizer.validateEmail(body[field])) {
          errors.push(`Field '${field}' must be a valid email address`);
        }
      }
    }

    // Validate phone fields
    if (schema.phone) {
      for (const field of schema.phone) {
        if (body[field] && !APIInputSanitizer.validatePhone(body[field])) {
          errors.push(`Field '${field}' must be a valid phone number`);
        }
      }
    }

    // Validate password fields
    if (schema.password) {
      for (const field of schema.password) {
        if (body[field]) {
          const passwordValidation = APIInputSanitizer.validatePassword(body[field]);
          if (!passwordValidation.isValid) {
            errors.push(`Field '${field}': ${passwordValidation.errors.join(', ')}`);
          }
        }
      }
    }

    // Check max length
    if (schema.maxLength) {
      for (const [field, maxLen] of Object.entries(schema.maxLength)) {
        if (body[field] && typeof body[field] === 'string' && body[field].length > maxLen) {
          errors.push(`Field '${field}' must not exceed ${maxLen} characters`);
        }
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Sanitize the data
    const sanitizedData = APIInputSanitizer.sanitizeRequestBody(body) as T;
    return { isValid: true, data: sanitizedData };
  }

  static validateQueryParams(
    searchParams: URLSearchParams,
    schema: {
      required?: string[];
      optional?: string[];
      types?: Record<string, 'string' | 'number' | 'boolean'>;
    }
  ): { isValid: boolean; data?: Record<string, any>; errors?: string[] } {
    const errors: string[] = [];
    const data: Record<string, any> = {};

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        const value = searchParams.get(field);
        if (!value) {
          errors.push(`Query parameter '${field}' is required`);
        } else {
          data[field] = value;
        }
      }
    }

    // Process optional fields
    const allFields = [...(schema.required || []), ...(schema.optional || [])];
    for (const field of allFields) {
      const value = searchParams.get(field);
      if (value) {
        // Type conversion
        if (schema.types && schema.types[field]) {
          try {
            switch (schema.types[field]) {
              case 'number':
                data[field] = parseFloat(value);
                if (isNaN(data[field])) {
                  errors.push(`Query parameter '${field}' must be a valid number`);
                }
                break;
              case 'boolean':
                data[field] = value.toLowerCase() === 'true';
                break;
              default:
                data[field] = value;
            }
          } catch (error) {
            errors.push(`Query parameter '${field}' has invalid format`);
          }
        } else {
          data[field] = value;
        }
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, data };
  }
}

// Response helpers
export class APIResponse {
  static success(data: any, message?: string): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString()
    });
  }

  static error(message: string, status: number = 400, details?: any): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    }, { status });
  }

  static validationError(errors: string[]): NextResponse {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 401 });
  }

  static forbidden(message: string = 'Forbidden'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 403 });
  }

  static notFound(message: string = 'Resource not found'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 404 });
  }

  static rateLimited(message: string = 'Too many requests'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 429 });
  }

  static serverError(message: string = 'Internal server error'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
