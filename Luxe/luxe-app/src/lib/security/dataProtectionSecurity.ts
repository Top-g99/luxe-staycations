// Data Protection and Privacy Security Implementation for Luxe Staycations
import { SecurityAuditLogger, EncryptionUtils } from './securityUtils';

export interface DataProtectionConfig {
  enableGDPRCompliance: boolean;
  enableDataEncryption: boolean;
  enableDataAnonymization: boolean;
  enableConsentManagement: boolean;
  enableDataRetention: boolean;
  enableRightToErasure: boolean;
  enableDataPortability: boolean;
  dataRetentionPeriod: number; // in days
  enableAuditLogging: boolean;
  enableDataMinimization: boolean;
}

export const DEFAULT_DATA_PROTECTION_CONFIG: DataProtectionConfig = {
  enableGDPRCompliance: true,
  enableDataEncryption: true,
  enableDataAnonymization: true,
  enableConsentManagement: true,
  enableDataRetention: true,
  enableRightToErasure: true,
  enableDataPortability: true,
  dataRetentionPeriod: 2555, // 7 years
  enableAuditLogging: true,
  enableDataMinimization: true
};

export interface PersonalData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  preferences?: any;
  consentGiven: boolean;
  consentDate: string;
  dataCategories: string[];
}

export interface ConsentRecord {
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  purpose: string;
  legalBasis: string;
}

export class DataProtectionSecurityManager {
  private config: DataProtectionConfig;
  private consentRecords: Map<string, ConsentRecord[]>;
  private dataProcessingLogs: Map<string, any[]>;
  private anonymizedData: Map<string, any>;

  constructor(config: DataProtectionConfig = DEFAULT_DATA_PROTECTION_CONFIG) {
    this.config = config;
    this.consentRecords = new Map();
    this.dataProcessingLogs = new Map();
    this.anonymizedData = new Map();
  }

  // Process personal data with GDPR compliance
  async processPersonalData(data: PersonalData, purpose: string, legalBasis: string, processorId: string): Promise<{
    isValid: boolean;
    errors: string[];
    processedData?: any;
  }> {
    const errors: string[] = [];

    if (this.config.enableGDPRCompliance) {
      // Check consent
      const consentCheck = this.checkConsent(data.userId, purpose);
      if (!consentCheck.hasConsent) {
        errors.push('User consent required for this data processing');
        return { isValid: false, errors };
      }

      // Log data processing
      this.logDataProcessing(data.userId, purpose, legalBasis, processorId);

      // Apply data minimization
      let processedData = data;
      if (this.config.enableDataMinimization) {
        processedData = this.minimizeData(data, purpose);
      }

      // Encrypt sensitive data
      if (this.config.enableDataEncryption) {
        processedData = await this.encryptSensitiveData(processedData);
      }

      return { isValid: true, errors, processedData };
    }

    return { isValid: true, errors, processedData: data };
  }

  // Check user consent
  private checkConsent(userId: string, purpose: string): { hasConsent: boolean; consentRecord?: ConsentRecord } {
    const userConsents = this.consentRecords.get(userId) || [];
    const relevantConsent = userConsents.find(consent => 
      consent.consentType === purpose && consent.granted
    );

    return {
      hasConsent: !!relevantConsent,
      consentRecord: relevantConsent
    };
  }

  // Record user consent
  recordConsent(consentData: {
    userId: string;
    consentType: string;
    granted: boolean;
    ipAddress: string;
    userAgent: string;
    purpose: string;
    legalBasis: string;
  }): { success: boolean; error?: string } {
    try {
      const consentRecord: ConsentRecord = {
        ...consentData,
        timestamp: new Date().toISOString()
      };

      const userConsents = this.consentRecords.get(consentData.userId) || [];
      userConsents.push(consentRecord);
      this.consentRecords.set(consentData.userId, userConsents);

      SecurityAuditLogger.logSecurityEvent('CONSENT_RECORDED', {
        userId: consentData.userId,
        consentType: consentData.consentType,
        granted: consentData.granted,
        purpose: consentData.purpose
      }, 'low');

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Log data processing activity
  private logDataProcessing(userId: string, purpose: string, legalBasis: string, processorId: string): void {
    if (!this.config.enableAuditLogging) return;

    const logEntry = {
      userId,
      purpose,
      legalBasis,
      processorId,
      timestamp: new Date().toISOString(),
      dataCategories: ['personal_data', 'contact_data', 'booking_data']
    };

    const userLogs = this.dataProcessingLogs.get(userId) || [];
    userLogs.push(logEntry);
    this.dataProcessingLogs.set(userId, userLogs);

    SecurityAuditLogger.logSecurityEvent('DATA_PROCESSING_LOGGED', {
      userId,
      purpose,
      legalBasis,
      processorId
    }, 'low');
  }

  // Minimize data based on purpose
  private minimizeData(data: PersonalData, purpose: string): PersonalData {
    const minimizedData = { ...data };

    switch (purpose) {
      case 'booking':
        // For booking, we need most data
        break;
      case 'marketing':
        // For marketing, we only need contact info
        delete minimizedData.passportNumber;
        delete minimizedData.dateOfBirth;
        break;
      case 'analytics':
        // For analytics, we anonymize personal identifiers
        minimizedData.email = this.anonymizeEmail(data.email);
        minimizedData.phone = this.anonymizePhone(data.phone);
        break;
      default:
        // Default: keep only essential data
        delete minimizedData.passportNumber;
        delete minimizedData.dateOfBirth;
        delete minimizedData.nationality;
    }

    return minimizedData;
  }

  // Encrypt sensitive data
  private async encryptSensitiveData(data: PersonalData): Promise<PersonalData> {
    const encryptedData = { ...data };

    if (encryptedData.email) {
      encryptedData.email = await EncryptionUtils.encrypt(encryptedData.email);
    }

    if (encryptedData.phone) {
      encryptedData.phone = await EncryptionUtils.encrypt(encryptedData.phone);
    }

    if (encryptedData.passportNumber) {
      encryptedData.passportNumber = await EncryptionUtils.encrypt(encryptedData.passportNumber);
    }

    return encryptedData;
  }

  // Anonymize email
  private anonymizeEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const anonymizedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
    return `${anonymizedLocal}@${domain}`;
  }

  // Anonymize phone
  private anonymizePhone(phone: string): string {
    if (phone.length < 4) return '*'.repeat(phone.length);
    return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
  }

  // Implement right to erasure (GDPR Article 17)
  implementRightToErasure(userId: string, requestorId: string): {
    success: boolean;
    error?: string;
    anonymizedData?: any;
  } {
    try {
      if (!this.config.enableRightToErasure) {
        return { success: false, error: 'Right to erasure is not enabled' };
      }

      // Check if data can be erased (no legal obligation to retain)
      const retentionCheck = this.checkDataRetention(userId);
      if (!retentionCheck.canErase) {
        return { 
          success: false, 
          error: `Data cannot be erased due to legal retention requirements: ${retentionCheck.reason}` 
        };
      }

      // Anonymize data instead of complete deletion
      const anonymizedData = this.anonymizeUserData(userId);
      this.anonymizedData.set(userId, anonymizedData);

      // Log the erasure request
      SecurityAuditLogger.logSecurityEvent('DATA_ERASURE_REQUESTED', {
        userId,
        requestorId,
        timestamp: new Date().toISOString()
      }, 'medium');

      return { success: true, anonymizedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Check data retention requirements
  private checkDataRetention(userId: string): { canErase: boolean; reason?: string } {
    // In a real implementation, this would check against legal requirements
    // For now, we'll simulate the check
    
    // Check if user has active bookings
    const hasActiveBookings = false; // This would be checked against the database
    
    if (hasActiveBookings) {
      return { 
        canErase: false, 
        reason: 'User has active bookings that require data retention' 
      };
    }

    // Check if data is within retention period
    const dataAge = this.getDataAge(userId);
    if (dataAge < this.config.dataRetentionPeriod) {
      return { 
        canErase: false, 
        reason: `Data is within ${this.config.dataRetentionPeriod} day retention period` 
      };
    }

    return { canErase: true };
  }

  // Get data age in days
  private getDataAge(userId: string): number {
    // In a real implementation, this would check the actual data creation date
    // For now, we'll return a random age
    return Math.floor(Math.random() * 1000);
  }

  // Anonymize user data
  private anonymizeUserData(userId: string): any {
    return {
      userId: `ANON_${userId.substring(0, 8)}`,
      email: 'anonymized@example.com',
      firstName: 'Anonymous',
      lastName: 'User',
      phone: '***-***-****',
      address: 'Anonymized',
      anonymizedAt: new Date().toISOString(),
      originalUserId: userId
    };
  }

  // Implement data portability (GDPR Article 20)
  implementDataPortability(userId: string, requestorId: string): {
    success: boolean;
    error?: string;
    portableData?: any;
  } {
    try {
      if (!this.config.enableDataPortability) {
        return { success: false, error: 'Data portability is not enabled' };
      }

      // Check consent for data portability
      const consentCheck = this.checkConsent(userId, 'data_portability');
      if (!consentCheck.hasConsent) {
        return { success: false, error: 'User consent required for data portability' };
      }

      // Gather portable data
      const portableData = this.gatherPortableData(userId);

      // Log the portability request
      SecurityAuditLogger.logSecurityEvent('DATA_PORTABILITY_REQUESTED', {
        userId,
        requestorId,
        timestamp: new Date().toISOString()
      }, 'low');

      return { success: true, portableData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Gather portable data
  private gatherPortableData(userId: string): any {
    // In a real implementation, this would gather all user data from various sources
    return {
      userId,
      personalData: {
        // Personal information
      },
      bookingData: {
        // Booking history
      },
      preferences: {
        // User preferences
      },
      consentHistory: this.consentRecords.get(userId) || [],
      dataProcessingLogs: this.dataProcessingLogs.get(userId) || [],
      exportedAt: new Date().toISOString(),
      format: 'JSON'
    };
  }

  // Generate privacy policy compliance report
  generatePrivacyComplianceReport(): {
    totalUsers: number;
    consentRecords: number;
    dataProcessingLogs: number;
    erasureRequests: number;
    portabilityRequests: number;
    complianceScore: number;
  } {
    const totalUsers = this.consentRecords.size;
    const consentRecords = Array.from(this.consentRecords.values())
      .reduce((sum, records) => sum + records.length, 0);
    const dataProcessingLogs = Array.from(this.dataProcessingLogs.values())
      .reduce((sum, logs) => sum + logs.length, 0);
    const erasureRequests = this.anonymizedData.size;
    const portabilityRequests = 0; // This would be tracked in a real implementation

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore({
      totalUsers,
      consentRecords,
      dataProcessingLogs,
      erasureRequests,
      portabilityRequests
    });

    return {
      totalUsers,
      consentRecords,
      dataProcessingLogs,
      erasureRequests,
      portabilityRequests,
      complianceScore
    };
  }

  // Calculate compliance score
  private calculateComplianceScore(metrics: any): number {
    // Simple compliance scoring algorithm
    let score = 100;

    // Deduct points for missing consent records
    if (metrics.consentRecords < metrics.totalUsers) {
      score -= 20;
    }

    // Deduct points for missing data processing logs
    if (metrics.dataProcessingLogs < metrics.totalUsers) {
      score -= 15;
    }

    // Deduct points for high erasure request rate
    const erasureRate = metrics.erasureRequests / metrics.totalUsers;
    if (erasureRate > 0.1) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  // Update data protection configuration
  updateConfig(newConfig: Partial<DataProtectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    SecurityAuditLogger.logSecurityEvent('DATA_PROTECTION_CONFIG_UPDATED', {
      config: newConfig
    }, 'low');
  }

  // Get current configuration
  getConfig(): DataProtectionConfig {
    return { ...this.config };
  }

  // Get user consent history
  getUserConsentHistory(userId: string): ConsentRecord[] {
    return this.consentRecords.get(userId) || [];
  }

  // Get data processing logs for user
  getUserDataProcessingLogs(userId: string): any[] {
    return this.dataProcessingLogs.get(userId) || [];
  }

  // Check if user has given consent for specific purpose
  hasUserConsent(userId: string, purpose: string): boolean {
    const userConsents = this.consentRecords.get(userId) || [];
    return userConsents.some(consent => 
      consent.consentType === purpose && consent.granted
    );
  }

  // Revoke user consent
  revokeConsent(userId: string, purpose: string, requestorId: string): { success: boolean; error?: string } {
    try {
      const userConsents = this.consentRecords.get(userId) || [];
      const consentIndex = userConsents.findIndex(consent => 
        consent.consentType === purpose && consent.granted
      );

      if (consentIndex === -1) {
        return { success: false, error: 'No active consent found for this purpose' };
      }

      // Add revocation record
      const revocationRecord: ConsentRecord = {
        userId,
        consentType: purpose,
        granted: false,
        timestamp: new Date().toISOString(),
        ipAddress: 'system',
        userAgent: 'system',
        purpose: 'consent_revocation',
        legalBasis: 'user_request'
      };

      userConsents.push(revocationRecord);
      this.consentRecords.set(userId, userConsents);

      SecurityAuditLogger.logSecurityEvent('CONSENT_REVOKED', {
        userId,
        purpose,
        requestorId
      }, 'medium');

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const dataProtectionSecurityManager = new DataProtectionSecurityManager();
