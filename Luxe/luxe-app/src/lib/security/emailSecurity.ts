import { NextRequest } from 'next/server';

// Email security configuration
export interface EmailSecurityConfig {
  maxEmailsPerHour: number;
  maxEmailsPerDay: number;
  maxEmailSize: number;
  allowedDomains: string[];
  blockedDomains: string[];
  maxRecipients: number;
  requireEmailVerification: boolean;
  enableContentFiltering: boolean;
  enableRateLimiting: boolean;
  enableAuditLogging: boolean;
}

// Default security configuration
export const DEFAULT_EMAIL_SECURITY_CONFIG: EmailSecurityConfig = {
  maxEmailsPerHour: 50,
  maxEmailsPerDay: 200,
  maxEmailSize: 1024 * 1024, // 1MB
  allowedDomains: ['luxestaycations.in', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
  blockedDomains: ['tempmail.com', '10minutemail.com', 'guerrillamail.com'],
  maxRecipients: 10,
  requireEmailVerification: false,
  enableContentFiltering: true,
  enableRateLimiting: true,
  enableAuditLogging: true
};

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Email security validator class
export class EmailSecurityValidator {
  private config: EmailSecurityConfig;

  constructor(config: EmailSecurityConfig = DEFAULT_EMAIL_SECURITY_CONFIG) {
    this.config = config;
  }

  // Validate email address format and security
  validateEmailAddress(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!email || typeof email !== 'string') {
      errors.push('Email address is required');
      return { isValid: false, errors };
    }

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push('Email contains suspicious patterns');
    }

    // Check domain against blocked list
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && this.config.blockedDomains.includes(domain)) {
      errors.push('Email domain is blocked');
    }

    // Check domain against allowed list (if enabled)
    if (this.config.allowedDomains.length > 0 && domain && !this.config.allowedDomains.includes(domain)) {
      errors.push('Email domain is not allowed');
    }

    // Check for email length
    if (email.length > 254) {
      errors.push('Email address is too long');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate email content for security
  validateEmailContent(content: string, type: 'html' | 'text'): { isValid: boolean; errors: string[]; sanitized?: string } {
    const errors: string[] = [];

    if (!content || typeof content !== 'string') {
      errors.push('Email content is required');
      return { isValid: false, errors };
    }

    // Check content length
    if (content.length > this.config.maxEmailSize) {
      errors.push('Email content is too large');
    }

    let sanitized = content;

    if (type === 'html' && this.config.enableContentFiltering) {
      // Remove potentially dangerous HTML tags and attributes
      sanitized = this.sanitizeHtml(content);
      
      // Check for XSS patterns
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>.*?<\/embed>/gi
      ];

      for (const pattern of xssPatterns) {
        if (pattern.test(content)) {
          errors.push('Email content contains potentially dangerous elements');
          break;
        }
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi,
      /document\.write/gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        errors.push('Email content contains suspicious patterns');
        break;
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      sanitized: this.config.enableContentFiltering ? sanitized : content 
    };
  }

  // Sanitize HTML content
  private sanitizeHtml(html: string): string {
    // Remove dangerous tags and attributes
    let sanitized = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');

    // Allow only safe HTML tags
    const allowedTags = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'br', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'img'];
    const allowedAttributes = ['href', 'src', 'alt', 'title', 'style', 'class', 'id'];

    // This is a simplified sanitization - in production, use a library like DOMPurify
    return sanitized;
  }

  // Validate email template variables
  validateTemplateVariables(variables: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!variables || typeof variables !== 'object') {
      errors.push('Template variables must be an object');
      return { isValid: false, errors };
    }

    // Check for suspicious variable names
    const suspiciousKeys = ['__proto__', 'constructor', 'prototype', 'eval', 'function'];
    for (const key of Object.keys(variables)) {
      if (suspiciousKeys.includes(key.toLowerCase())) {
        errors.push(`Suspicious variable name: ${key}`);
      }
    }

    // Validate variable values
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string') {
        // Check for XSS in string values
        if (/<script|javascript:|on\w+\s*=/gi.test(value)) {
          errors.push(`Variable ${key} contains potentially dangerous content`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Check rate limiting
  checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    if (!this.config.enableRateLimiting) {
      return { allowed: true, remaining: this.config.maxEmailsPerHour, resetTime: Date.now() + 3600000 };
    }

    const now = Date.now();
    const hourKey = `${identifier}:${Math.floor(now / 3600000)}`;
    const dayKey = `${identifier}:${Math.floor(now / 86400000)}`;

    // Check hourly limit
    const hourData = rateLimitStore.get(hourKey) || { count: 0, resetTime: now + 3600000 };
    if (hourData.count >= this.config.maxEmailsPerHour) {
      return { allowed: false, remaining: 0, resetTime: hourData.resetTime };
    }

    // Check daily limit
    const dayData = rateLimitStore.get(dayKey) || { count: 0, resetTime: now + 86400000 };
    if (dayData.count >= this.config.maxEmailsPerDay) {
      return { allowed: false, remaining: 0, resetTime: dayData.resetTime };
    }

    return { 
      allowed: true, 
      remaining: Math.min(this.config.maxEmailsPerHour - hourData.count, this.config.maxEmailsPerDay - dayData.count),
      resetTime: Math.min(hourData.resetTime, dayData.resetTime)
    };
  }

  // Increment rate limit counter
  incrementRateLimit(identifier: string): void {
    if (!this.config.enableRateLimiting) return;

    const now = Date.now();
    const hourKey = `${identifier}:${Math.floor(now / 3600000)}`;
    const dayKey = `${identifier}:${Math.floor(now / 86400000)}`;

    // Increment hourly counter
    const hourData = rateLimitStore.get(hourKey) || { count: 0, resetTime: now + 3600000 };
    hourData.count++;
    rateLimitStore.set(hourKey, hourData);

    // Increment daily counter
    const dayData = rateLimitStore.get(dayKey) || { count: 0, resetTime: now + 86400000 };
    dayData.count++;
    rateLimitStore.set(dayKey, dayData);
  }

  // Validate SMTP configuration
  validateSmtpConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('SMTP configuration is required');
      return { isValid: false, errors };
    }

    // Validate required fields
    const requiredFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'fromEmail'];
    for (const field of requiredFields) {
      if (!config[field] || typeof config[field] !== 'string') {
        errors.push(`${field} is required`);
      }
    }

    // Validate email format
    if (config.fromEmail) {
      const emailValidation = this.validateEmailAddress(config.fromEmail);
      if (!emailValidation.isValid) {
        errors.push(`Invalid from email: ${emailValidation.errors.join(', ')}`);
      }
    }

    // Validate port number
    if (config.smtpPort) {
      const port = parseInt(config.smtpPort);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('Invalid SMTP port number');
      }
    }

    // Validate host format
    if (config.smtpHost) {
      const hostRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!hostRegex.test(config.smtpHost)) {
        errors.push('Invalid SMTP host format');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Log email security event
  logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'low'): void {
    if (!this.config.enableAuditLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      userAgent: 'server',
      ip: 'unknown'
    };

    console.log(`[EMAIL-SECURITY-${severity.toUpperCase()}]`, JSON.stringify(logEntry, null, 2));
  }

  // Get client IP from request
  getClientIP(request: NextRequest): string {
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

  // Validate email sending request
  validateEmailRequest(request: NextRequest, body: any): { isValid: boolean; errors: string[]; sanitizedBody?: any } {
    const errors: string[] = [];
    const clientIP = this.getClientIP(request);

    // Check rate limiting
    const rateLimit = this.checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      errors.push('Rate limit exceeded. Please try again later.');
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { clientIP, remaining: rateLimit.remaining }, 'medium');
    }

    // Validate request body
    if (!body || typeof body !== 'object') {
      errors.push('Invalid request body');
      return { isValid: false, errors };
    }

    // Validate email addresses
    if (body.to) {
      const emailValidation = this.validateEmailAddress(body.to);
      if (!emailValidation.isValid) {
        errors.push(`Invalid recipient email: ${emailValidation.errors.join(', ')}`);
      }
    }

    // Validate email content
    if (body.template) {
      if (body.template.html) {
        const htmlValidation = this.validateEmailContent(body.template.html, 'html');
        if (!htmlValidation.isValid) {
          errors.push(`Invalid HTML content: ${htmlValidation.errors.join(', ')}`);
        }
      }

      if (body.template.text) {
        const textValidation = this.validateEmailContent(body.template.text, 'text');
        if (!textValidation.isValid) {
          errors.push(`Invalid text content: ${textValidation.errors.join(', ')}`);
        }
      }
    }

    // Validate SMTP configuration
    if (body.config) {
      const smtpValidation = this.validateSmtpConfig(body.config);
      if (!smtpValidation.isValid) {
        errors.push(`Invalid SMTP configuration: ${smtpValidation.errors.join(', ')}`);
      }
    }

    // Log security event if there are errors
    if (errors.length > 0) {
      this.logSecurityEvent('EMAIL_VALIDATION_FAILED', { clientIP, errors }, 'medium');
    }

    return { 
      isValid: errors.length === 0, 
      errors,
      sanitizedBody: body // In production, return sanitized version
    };
  }
}

// Export singleton instance
export const emailSecurityValidator = new EmailSecurityValidator();
