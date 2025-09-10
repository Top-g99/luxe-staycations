// Security Utilities for Luxe Staycations
// Using Web Crypto API instead of Node.js crypto for Edge Runtime compatibility

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
  private static readonly SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';

  // Hash password using Web Crypto API
  static async hashPassword(password: string): Promise<string> {
    const salt = this.generateRandomBytes(16);
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${salt}:${hash}`;
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verifyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash === verifyHash;
  }

  // Encrypt sensitive data using Web Crypto API
  static async encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = this.generateRandomBytesArray(16);
    const key = await this.getKey();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      data
    );
    
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    
    return Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Decrypt sensitive data using Web Crypto API
  static async decrypt(encryptedText: string): Promise<string> {
    const encryptedArray = new Uint8Array(
      encryptedText.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const iv = encryptedArray.slice(0, 16);
    const encrypted = encryptedArray.slice(16);
    
    const key = await this.getKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    return this.generateRandomBytes(length);
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return this.generateRandomBytes(32);
  }

  // Helper method to generate random bytes
  private static generateRandomBytes(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Helper method to generate random bytes as Uint8Array
  private static generateRandomBytesArray(length: number): Uint8Array {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  // Helper method to get encryption key
  private static async getKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.SECRET_KEY);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
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
