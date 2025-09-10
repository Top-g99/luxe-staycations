// File Upload Security Implementation for Luxe Staycations
import { SecurityAuditLogger, InputValidator } from './securityUtils';

export interface FileUploadSecurityConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxFilesPerUpload: number;
  enableVirusScanning: boolean;
  enableImageValidation: boolean;
  enableMetadataStripping: boolean;
  blockedFileTypes: string[];
  quarantineSuspiciousFiles: boolean;
  enableContentScanning: boolean;
}

export const DEFAULT_FILE_UPLOAD_SECURITY_CONFIG: FileUploadSecurityConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  maxFilesPerUpload: 10,
  enableVirusScanning: true,
  enableImageValidation: true,
  enableMetadataStripping: true,
  blockedFileTypes: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1'
  ],
  quarantineSuspiciousFiles: true,
  enableContentScanning: true
};

export class FileUploadSecurityManager {
  private config: FileUploadSecurityConfig;
  private suspiciousPatterns: RegExp[];
  private blockedHashes: Set<string>;
  private uploadAttempts: Map<string, { count: number; lastAttempt: Date }>;

  constructor(config: FileUploadSecurityConfig = DEFAULT_FILE_UPLOAD_SECURITY_CONFIG) {
    this.config = config;
    this.suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /\.\.\//, // Directory traversal
      /%2e%2e%2f/i, // URL encoded directory traversal
      /%2e%2e%5c/i, // Windows directory traversal
    ];
    this.blockedHashes = new Set();
    this.uploadAttempts = new Map();
  }

  // Validate file upload
  async validateFileUpload(files: File[], uploaderIP: string, userAgent: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedFiles?: File[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedFiles: File[] = [];

    // Check upload rate limiting
    const rateLimitCheck = this.checkUploadRateLimit(uploaderIP);
    if (!rateLimitCheck.allowed) {
      errors.push('Upload rate limit exceeded. Please try again later.');
      SecurityAuditLogger.logSecurityEvent('UPLOAD_RATE_LIMITED', {
        ip: uploaderIP,
        userAgent,
        attempts: rateLimitCheck.attempts
      }, 'high');
      return { isValid: false, errors, warnings };
    }

    // Check number of files
    if (files.length > this.config.maxFilesPerUpload) {
      errors.push(`Maximum ${this.config.maxFilesPerUpload} files allowed per upload`);
    }

    for (const file of files) {
      const fileValidation = await this.validateSingleFile(file, uploaderIP, userAgent);
      
      if (!fileValidation.isValid) {
        errors.push(...fileValidation.errors);
        continue;
      }

      if (fileValidation.warnings.length > 0) {
        warnings.push(...fileValidation.warnings);
      }

      // Sanitize file if needed
      if (fileValidation.needsSanitization) {
        const sanitizedFile = await this.sanitizeFile(file);
        if (sanitizedFile) {
          sanitizedFiles.push(sanitizedFile);
        } else {
          errors.push(`Failed to sanitize file: ${file.name}`);
        }
      } else {
        sanitizedFiles.push(file);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedFiles: errors.length === 0 ? sanitizedFiles : undefined
    };
  }

  // Validate single file
  private async validateSingleFile(file: File, uploaderIP: string, userAgent: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    needsSanitization: boolean;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let needsSanitization = false;

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File ${file.name} exceeds maximum size of ${this.formatFileSize(this.config.maxFileSize)}`);
    }

    // Check file type
    const fileTypeCheck = this.validateFileType(file);
    if (!fileTypeCheck.isValid) {
      errors.push(`File ${file.name}: ${fileTypeCheck.error}`);
    }

    // Check file extension
    const extensionCheck = this.validateFileExtension(file);
    if (!extensionCheck.isValid) {
      errors.push(`File ${file.name}: ${extensionCheck.error}`);
    }

    // Check for suspicious patterns in filename
    if (this.containsSuspiciousPatterns(file.name)) {
      errors.push(`File ${file.name} contains suspicious characters`);
      SecurityAuditLogger.logSecurityEvent('SUSPICIOUS_FILENAME', {
        filename: file.name,
        ip: uploaderIP,
        userAgent
      }, 'high');
    }

    // Check file content if it's an image
    if (this.config.enableImageValidation && file.type.startsWith('image/')) {
      const imageValidation = await this.validateImageFile(file);
      if (!imageValidation.isValid) {
        errors.push(`File ${file.name}: ${imageValidation.error}`);
      }
      if (imageValidation.needsSanitization) {
        needsSanitization = true;
        warnings.push(`File ${file.name} will be sanitized`);
      }
    }

    // Check for blocked file types
    if (this.isBlockedFileType(file)) {
      errors.push(`File type ${file.name} is not allowed`);
      SecurityAuditLogger.logSecurityEvent('BLOCKED_FILE_TYPE', {
        filename: file.name,
        fileType: file.type,
        ip: uploaderIP
      }, 'high');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      needsSanitization
    };
  }

  // Validate file type
  private validateFileType(file: File): { isValid: boolean; error?: string } {
    if (!this.config.allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { isValid: true };
  }

  // Validate file extension
  private validateFileExtension(file: File): { isValid: boolean; error?: string } {
    const extension = this.getFileExtension(file.name);
    
    if (!this.config.allowedExtensions.includes(extension.toLowerCase())) {
      return {
        isValid: false,
        error: `File extension ${extension} is not allowed`
      };
    }

    return { isValid: true };
  }

  // Get file extension
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }

  // Check for suspicious patterns
  private containsSuspiciousPatterns(filename: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  // Validate image file
  private async validateImageFile(file: File): Promise<{ isValid: boolean; error?: string; needsSanitization: boolean }> {
    // Check if file is actually an image by reading its header
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check for image file signatures
        const isValidImage = this.checkImageSignature(uint8Array, file.type);
        
        if (!isValidImage) {
          resolve({
            isValid: false,
            error: 'File is not a valid image',
            needsSanitization: false
          });
          return;
        }

        // Check for embedded scripts or suspicious content
        const hasSuspiciousContent = this.checkForSuspiciousContent(uint8Array);
        
        resolve({
          isValid: true,
          error: undefined,
          needsSanitization: hasSuspiciousContent
        });
      };
      
      reader.onerror = () => {
        resolve({
          isValid: false,
          error: 'Failed to read file',
          needsSanitization: false
        });
      };
      
      reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB
    });
  }

  // Check image file signature
  private checkImageSignature(uint8Array: Uint8Array, mimeType: string): boolean {
    const signatures: { [key: string]: number[][] } = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]]
    };

    const signature = signatures[mimeType];
    if (!signature) return false;

    return signature.some(sig => 
      sig.every((byte, index) => uint8Array[index] === byte)
    );
  }

  // Check for suspicious content in file
  private checkForSuspiciousContent(uint8Array: Uint8Array): boolean {
    const content = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    return this.suspiciousPatterns.some(pattern => pattern.test(content));
  }

  // Check if file type is blocked
  private isBlockedFileType(file: File): boolean {
    const extension = this.getFileExtension(file.name);
    return this.config.blockedFileTypes.includes(extension.toLowerCase());
  }

  // Sanitize file
  private async sanitizeFile(file: File): Promise<File | null> {
    try {
      if (file.type.startsWith('image/')) {
        return await this.sanitizeImageFile(file);
      }
      
      // For other file types, we might want to reject them
      return null;
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('FILE_SANITIZATION_FAILED', {
        filename: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      return null;
    }
  }

  // Sanitize image file
  private async sanitizeImageFile(file: File): Promise<File | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas (this strips metadata and potential malicious content)
        ctx?.drawImage(img, 0, 0);

        // Convert back to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const sanitizedFile = new File([blob], file.name, {
              type: 'image/png', // Convert to PNG to ensure clean format
              lastModified: Date.now()
            });
            resolve(sanitizedFile);
          } else {
            resolve(null);
          }
        }, 'image/png', 0.9);
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Check upload rate limiting
  private checkUploadRateLimit(ip: string): { allowed: boolean; attempts: number } {
    const now = new Date();
    const key = `upload_${ip}`;
    const attempt = this.uploadAttempts.get(key);

    if (!attempt) {
      this.uploadAttempts.set(key, { count: 1, lastAttempt: now });
      return { allowed: true, attempts: 1 };
    }

    // Reset if more than 1 hour has passed
    const timeDiff = now.getTime() - attempt.lastAttempt.getTime();
    if (timeDiff > 60 * 60 * 1000) {
      this.uploadAttempts.set(key, { count: 1, lastAttempt: now });
      return { allowed: true, attempts: 1 };
    }

    // Check if within rate limit (10 uploads per hour)
    if (attempt.count >= 10) {
      return { allowed: false, attempts: attempt.count };
    }

    attempt.count++;
    attempt.lastAttempt = now;
    return { allowed: true, attempts: attempt.count };
  }

  // Generate secure filename
  generateSecureFilename(originalFilename: string): string {
    const extension = this.getFileExtension(originalFilename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `secure_${timestamp}_${random}${extension}`;
  }

  // Calculate file hash for duplicate detection
  async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Check if file hash is blocked
  isFileHashBlocked(hash: string): boolean {
    return this.blockedHashes.has(hash);
  }

  // Block file hash
  blockFileHash(hash: string, reason: string): void {
    this.blockedHashes.add(hash);
    SecurityAuditLogger.logSecurityEvent('FILE_HASH_BLOCKED', {
      hash,
      reason,
      timestamp: new Date().toISOString()
    }, 'high');
  }

  // Format file size
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get upload statistics
  getUploadStatistics(): {
    totalAttempts: number;
    blockedFiles: number;
    sanitizedFiles: number;
    blockedHashes: number;
  } {
    const totalAttempts = Array.from(this.uploadAttempts.values())
      .reduce((sum, attempt) => sum + attempt.count, 0);

    return {
      totalAttempts,
      blockedFiles: 0, // This would be tracked in a real implementation
      sanitizedFiles: 0, // This would be tracked in a real implementation
      blockedHashes: this.blockedHashes.size
    };
  }

  // Update security configuration
  updateConfig(newConfig: Partial<FileUploadSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    SecurityAuditLogger.logSecurityEvent('FILE_UPLOAD_CONFIG_UPDATED', {
      config: newConfig
    }, 'low');
  }

  // Get current configuration
  getConfig(): FileUploadSecurityConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const fileUploadSecurityManager = new FileUploadSecurityManager();
