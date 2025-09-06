// Security Utilities for Luxe Staycations
import crypto from 'crypto';

// Input validation and sanitization
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation (Indian format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Password strength validation
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize HTML input
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Sanitize SQL input (basic protection)
  static sanitizeSql(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  // Validate and sanitize text input
  static sanitizeText(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return this.sanitizeHtml(input.trim().substring(0, maxLength));
  }

  // Validate URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate file type
  static isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }
}

// Encryption utilities
export class EncryptionUtils {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';

  // Hash password using bcrypt-like approach
  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // Encrypt sensitive data
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.SECRET_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt sensitive data
  static decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(this.ALGORITHM, this.SECRET_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  static isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (attempt.count >= maxAttempts) {
      return true;
    }
    
    attempt.count++;
    return false;
  }
  
  static resetAttempts(key: string): void {
    this.attempts.delete(key);
  }
  
  static getRemainingAttempts(key: string, maxAttempts: number = 5): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return maxAttempts;
    return Math.max(0, maxAttempts - attempt.count);
  }
}

// Security headers
export class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    };
  }
}

// Audit logging
export class SecurityAuditLogger {
  static logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ip: 'unknown' // Would be populated by middleware
    };
    
    console.warn(`[SECURITY-${severity.toUpperCase()}]`, logEntry);
    
    // In production, this would be sent to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring service
      this.sendToSecurityService(logEntry);
    }
  }
  
  private static sendToSecurityService(logEntry: any): void {
    // Implementation would depend on the security service used
    // Could be Sentry, DataDog, or custom security monitoring
  }
}

// Session security
export class SessionSecurity {
  static generateSecureSessionId(): string {
    return EncryptionUtils.generateSecureToken(32);
  }
  
  static validateSessionId(sessionId: string): boolean {
    return /^[a-f0-9]{64}$/.test(sessionId);
  }
  
  static isSessionExpired(createdAt: string, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    return (now - created) > maxAge;
  }
}

// CSRF protection
export class CSRFProtection {
  private static tokens: Map<string, string> = new Map();
  
  static generateToken(sessionId: string): string {
    const token = EncryptionUtils.generateCSRFToken();
    this.tokens.set(sessionId, token);
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const storedToken = this.tokens.get(sessionId);
    return storedToken === token;
  }
  
  static revokeToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }
}
