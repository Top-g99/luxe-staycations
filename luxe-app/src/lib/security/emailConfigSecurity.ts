import crypto from 'crypto';

// Email configuration security utilities
export class EmailConfigSecurity {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits

  // Generate a secure encryption key
  static generateEncryptionKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  // Encrypt sensitive email configuration data
  static encryptConfig(config: any, encryptionKey: string): string {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, key);
      cipher.setAAD(Buffer.from('email-config', 'utf8'));

      let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV, tag, and encrypted data
      const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      
      return combined;
    } catch (error) {
      console.error('Error encrypting email config:', error);
      throw new Error('Failed to encrypt email configuration');
    }
  }

  // Decrypt sensitive email configuration data
  static decryptConfig(encryptedConfig: string, encryptionKey: string): any {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      const parts = encryptedConfig.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted configuration format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, key);
      decipher.setAAD(Buffer.from('email-config', 'utf8'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting email config:', error);
      throw new Error('Failed to decrypt email configuration');
    }
  }

  // Sanitize email configuration for logging (remove sensitive data)
  static sanitizeForLogging(config: any): any {
    if (!config || typeof config !== 'object') {
      return config;
    }

    const sanitized = { ...config };
    
    // Remove or mask sensitive fields
    if (sanitized.smtpPassword) {
      sanitized.smtpPassword = '***REDACTED***';
    }
    
    if (sanitized.smtpUser) {
      // Mask email username but keep domain
      const [username, domain] = sanitized.smtpUser.split('@');
      if (username && domain) {
        sanitized.smtpUser = `${username.substring(0, 2)}***@${domain}`;
      } else {
        sanitized.smtpUser = '***REDACTED***';
      }
    }

    return sanitized;
  }

  // Validate email configuration security
  static validateConfigSecurity(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors };
    }

    // Check for required fields
    const requiredFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'fromEmail'];
    for (const field of requiredFields) {
      if (!config[field]) {
        errors.push(`${field} is required`);
      }
    }

    // Validate password strength
    if (config.smtpPassword) {
      if (config.smtpPassword.length < 8) {
        errors.push('SMTP password must be at least 8 characters long');
      }
      
      // Check for common weak passwords
      const weakPasswords = ['password', '123456', 'admin', 'test', 'demo'];
      if (weakPasswords.includes(config.smtpPassword.toLowerCase())) {
        errors.push('SMTP password is too weak');
      }
    }

    // Validate email format
    if (config.fromEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(config.fromEmail)) {
        errors.push('Invalid from email format');
      }
    }

    // Validate SMTP host
    if (config.smtpHost) {
      const hostRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!hostRegex.test(config.smtpHost)) {
        errors.push('Invalid SMTP host format');
      }
    }

    // Validate port number
    if (config.smtpPort) {
      const port = parseInt(config.smtpPort);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('Invalid SMTP port number');
      }
      
      // Warn about insecure ports
      if (port === 25 || port === 465) {
        // These are common but may be insecure depending on configuration
        console.warn('Using potentially insecure SMTP port:', port);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Generate secure random string for tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive data for comparison (one-way)
  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Verify data integrity
  static verifyDataIntegrity(data: string, hash: string): boolean {
    const computedHash = this.hashSensitiveData(data);
    return computedHash === hash;
  }

  // Create secure configuration object
  static createSecureConfig(baseConfig: any): { config: any; securityHash: string } {
    const sanitizedConfig = this.sanitizeForLogging(baseConfig);
    const securityHash = this.hashSensitiveData(JSON.stringify(sanitizedConfig));
    
    return {
      config: baseConfig,
      securityHash
    };
  }

  // Check for configuration tampering
  static detectTampering(currentConfig: any, originalHash: string): boolean {
    const currentHash = this.hashSensitiveData(JSON.stringify(this.sanitizeForLogging(currentConfig)));
    return currentHash !== originalHash;
  }
}

// Export singleton instance
export const emailConfigSecurity = new EmailConfigSecurity();
