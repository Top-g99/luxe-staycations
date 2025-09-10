// Payment Security Implementation for Luxe Staycations
import { EncryptionUtils, SecurityAuditLogger, InputValidator } from './securityUtils';

export interface PaymentSecurityConfig {
  enablePCICompliance: boolean;
  enableFraudDetection: boolean;
  enableAmountValidation: boolean;
  enableCardTokenization: boolean;
  maxTransactionAmount: number;
  minTransactionAmount: number;
  allowedCurrencies: string[];
  blockedCountries: string[];
  requireCVV: boolean;
  enable3DSecure: boolean;
}

export const DEFAULT_PAYMENT_SECURITY_CONFIG: PaymentSecurityConfig = {
  enablePCICompliance: true,
  enableFraudDetection: true,
  enableAmountValidation: true,
  enableCardTokenization: true,
  maxTransactionAmount: 1000000, // 10 Lakh INR
  minTransactionAmount: 100, // 100 INR
  allowedCurrencies: ['INR', 'USD', 'EUR'],
  blockedCountries: [],
  requireCVV: true,
  enable3DSecure: true
};

export class PaymentSecurityManager {
  private config: PaymentSecurityConfig;
  private suspiciousPatterns: RegExp[];
  private blockedIPs: Set<string>;
  private fraudAttempts: Map<string, { count: number; lastAttempt: Date }>;

  constructor(config: PaymentSecurityConfig = DEFAULT_PAYMENT_SECURITY_CONFIG) {
    this.config = config;
    this.suspiciousPatterns = [
      /4[0-9]{12}(?:[0-9]{3})?/, // Visa test cards
      /5[1-5][0-9]{14}/, // Mastercard test cards
      /3[47][0-9]{13}/, // Amex test cards
      /6(?:011|5[0-9]{2})[0-9]{12}/, // Discover test cards
    ];
    this.blockedIPs = new Set();
    this.fraudAttempts = new Map();
  }

  // Validate payment amount
  validatePaymentAmount(amount: number, currency: string): {
    isValid: boolean;
    error?: string;
  } {
    if (this.config.enableAmountValidation) {
      if (amount < this.config.minTransactionAmount) {
        return {
          isValid: false,
          error: `Minimum transaction amount is ${this.config.minTransactionAmount} ${currency}`
        };
      }

      if (amount > this.config.maxTransactionAmount) {
        return {
          isValid: false,
          error: `Maximum transaction amount is ${this.config.maxTransactionAmount} ${currency}`
        };
      }

      if (!this.config.allowedCurrencies.includes(currency)) {
        return {
          isValid: false,
          error: `Currency ${currency} is not supported`
        };
      }
    }

    return { isValid: true };
  }

  // Validate card details
  validateCardDetails(cardDetails: {
    cardNumber: string;
    cardHolder: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate card number
    if (!this.validateCardNumber(cardDetails.cardNumber)) {
      errors.push('Invalid card number');
    }

    // Check for test cards
    if (this.isTestCard(cardDetails.cardNumber)) {
      SecurityAuditLogger.logSecurityEvent('TEST_CARD_DETECTED', {
        cardNumber: this.maskCardNumber(cardDetails.cardNumber),
        cardHolder: cardDetails.cardHolder
      }, 'medium');
      errors.push('Test cards are not allowed in production');
    }

    // Validate card holder name
    if (!cardDetails.cardHolder || cardDetails.cardHolder.trim().length < 2) {
      errors.push('Invalid card holder name');
    }

    // Validate expiry date
    const expiryValidation = this.validateExpiryDate(cardDetails.expiryMonth, cardDetails.expiryYear);
    if (!expiryValidation.isValid) {
      errors.push(expiryValidation.error!);
    }

    // Validate CVV
    if (this.config.requireCVV) {
      if (!cardDetails.cvv || cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
        errors.push('Invalid CVV');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate card number using Luhn algorithm
  private validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Check if card is a test card
  private isTestCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    return this.suspiciousPatterns.some(pattern => pattern.test(cleaned));
  }

  // Validate expiry date
  private validateExpiryDate(month: string, year: string): { isValid: boolean; error?: string } {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (expiryYear < currentYear) {
      return { isValid: false, error: 'Card has expired' };
    }

    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return { isValid: false, error: 'Card has expired' };
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      return { isValid: false, error: 'Invalid expiry month' };
    }

    return { isValid: true };
  }

  // Mask card number for logging
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 8) return '****';
    
    const firstFour = cleaned.substring(0, 4);
    const lastFour = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);
    
    return `${firstFour}${middle}${lastFour}`;
  }

  // Detect fraud patterns
  detectFraudPatterns(paymentData: {
    amount: number;
    cardNumber: string;
    cardHolder: string;
    email: string;
    ip: string;
    userAgent: string;
  }): { isFraudulent: boolean; riskScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for blocked IP
    if (this.blockedIPs.has(paymentData.ip)) {
      reasons.push('Blocked IP address');
      riskScore += 100;
    }

    // Check for suspicious amounts
    if (paymentData.amount > this.config.maxTransactionAmount * 0.8) {
      reasons.push('High transaction amount');
      riskScore += 30;
    }

    // Check for rapid transactions
    const fraudKey = `${paymentData.ip}_${paymentData.cardNumber}`;
    const fraudAttempt = this.fraudAttempts.get(fraudKey);
    
    if (fraudAttempt) {
      const timeDiff = Date.now() - fraudAttempt.lastAttempt.getTime();
      if (timeDiff < 60000) { // Less than 1 minute
        reasons.push('Rapid transaction attempts');
        riskScore += 50;
      }
    }

    // Check for test cards
    if (this.isTestCard(paymentData.cardNumber)) {
      reasons.push('Test card detected');
      riskScore += 80;
    }

    // Check for suspicious email patterns
    if (!InputValidator.isValidEmail(paymentData.email)) {
      reasons.push('Invalid email format');
      riskScore += 20;
    }

    // Check for suspicious user agent
    if (this.isSuspiciousUserAgent(paymentData.userAgent)) {
      reasons.push('Suspicious user agent');
      riskScore += 25;
    }

    // Record fraud attempt
    this.fraudAttempts.set(fraudKey, {
      count: (fraudAttempt?.count || 0) + 1,
      lastAttempt: new Date()
    });

    const isFraudulent = riskScore > 70;

    if (isFraudulent) {
      SecurityAuditLogger.logSecurityEvent('FRAUD_DETECTED', {
        riskScore,
        reasons,
        maskedCard: this.maskCardNumber(paymentData.cardNumber),
        amount: paymentData.amount,
        ip: paymentData.ip
      }, 'critical');
    }

    return {
      isFraudulent,
      riskScore,
      reasons
    };
  }

  // Check for suspicious user agent
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Encrypt sensitive payment data
  encryptPaymentData(paymentData: any): string {
    const sensitiveFields = ['cardNumber', 'cvv', 'accountNumber'];
    const encryptedData = { ...paymentData };

    sensitiveFields.forEach(field => {
      if (encryptedData[field]) {
        encryptedData[field] = EncryptionUtils.encrypt(encryptedData[field]);
      }
    });

    return JSON.stringify(encryptedData);
  }

  // Decrypt sensitive payment data
  decryptPaymentData(encryptedData: string): any {
    const data = JSON.parse(encryptedData);
    const sensitiveFields = ['cardNumber', 'cvv', 'accountNumber'];

    sensitiveFields.forEach(field => {
      if (data[field]) {
        data[field] = EncryptionUtils.decrypt(data[field]);
      }
    });

    return data;
  }

  // Generate secure transaction ID
  generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  // Validate UPI ID
  validateUPIId(upiId: string): { isValid: boolean; error?: string } {
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    
    if (!upiPattern.test(upiId)) {
      return { isValid: false, error: 'Invalid UPI ID format' };
    }

    if (upiId.length > 50) {
      return { isValid: false, error: 'UPI ID too long' };
    }

    return { isValid: true };
  }

  // Validate bank account details
  validateBankDetails(bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate account number
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 9 || bankDetails.accountNumber.length > 18) {
      errors.push('Invalid account number');
    }

    // Validate IFSC code
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(bankDetails.ifscCode)) {
      errors.push('Invalid IFSC code format');
    }

    // Validate account holder name
    if (!bankDetails.accountHolder || bankDetails.accountHolder.trim().length < 2) {
      errors.push('Invalid account holder name');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Block IP address
  blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip);
    SecurityAuditLogger.logSecurityEvent('IP_BLOCKED', {
      ip,
      reason,
      timestamp: new Date().toISOString()
    }, 'high');
  }

  // Unblock IP address
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    SecurityAuditLogger.logSecurityEvent('IP_UNBLOCKED', {
      ip,
      timestamp: new Date().toISOString()
    }, 'medium');
  }

  // Get fraud statistics
  getFraudStatistics(): {
    totalAttempts: number;
    blockedIPs: number;
    fraudRate: number;
    topRiskFactors: string[];
  } {
    const totalAttempts = Array.from(this.fraudAttempts.values())
      .reduce((sum, attempt) => sum + attempt.count, 0);

    const fraudRate = totalAttempts > 0 ? 
      (Array.from(this.fraudAttempts.values()).filter(a => a.count > 3).length / totalAttempts) * 100 : 0;

    return {
      totalAttempts,
      blockedIPs: this.blockedIPs.size,
      fraudRate,
      topRiskFactors: ['High transaction amount', 'Rapid attempts', 'Test cards', 'Suspicious IP']
    };
  }

  // Update security configuration
  updateConfig(newConfig: Partial<PaymentSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    SecurityAuditLogger.logSecurityEvent('PAYMENT_CONFIG_UPDATED', {
      config: newConfig
    }, 'low');
  }

  // Get current configuration
  getConfig(): PaymentSecurityConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const paymentSecurityManager = new PaymentSecurityManager();
