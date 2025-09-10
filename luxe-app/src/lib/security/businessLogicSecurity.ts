// Business Logic Security Implementation for Luxe Staycations
import { SecurityAuditLogger, InputValidator } from './securityUtils';

export interface BusinessLogicSecurityConfig {
  enablePriceValidation: boolean;
  enableBookingValidation: boolean;
  enableInventoryControl: boolean;
  enableUserRoleValidation: boolean;
  enableDataIntegrityChecks: boolean;
  maxBookingDuration: number; // in days
  minBookingAdvance: number; // in days
  maxBookingAdvance: number; // in days
  enableDuplicateBookingPrevention: boolean;
  enableSuspiciousActivityDetection: boolean;
}

export const DEFAULT_BUSINESS_LOGIC_SECURITY_CONFIG: BusinessLogicSecurityConfig = {
  enablePriceValidation: true,
  enableBookingValidation: true,
  enableInventoryControl: true,
  enableUserRoleValidation: true,
  enableDataIntegrityChecks: true,
  maxBookingDuration: 30, // 30 days
  minBookingAdvance: 1, // 1 day
  maxBookingAdvance: 365, // 1 year
  enableDuplicateBookingPrevention: true,
  enableSuspiciousActivityDetection: true
};

export class BusinessLogicSecurityManager {
  private config: BusinessLogicSecurityConfig;
  private suspiciousActivities: Map<string, { count: number; lastActivity: Date; activities: string[] }>;
  private blockedUsers: Set<string>;
  private priceHistory: Map<string, { price: number; timestamp: Date; userId: string }[]>;

  constructor(config: BusinessLogicSecurityConfig = DEFAULT_BUSINESS_LOGIC_SECURITY_CONFIG) {
    this.config = config;
    this.suspiciousActivities = new Map();
    this.blockedUsers = new Set();
    this.priceHistory = new Map();
  }

  // Validate booking request
  validateBookingRequest(bookingData: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    userId: string;
    userRole: string;
    ip: string;
    userAgent: string;
  }): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (this.config.enableBookingValidation) {
      // Validate dates
      const dateValidation = this.validateBookingDates(bookingData.checkIn, bookingData.checkOut);
      if (!dateValidation.isValid) {
        errors.push(...dateValidation.errors);
      }

      // Validate guest count
      const guestValidation = this.validateGuestCount(bookingData.guests);
      if (!guestValidation.isValid) {
        errors.push(guestValidation.error!);
      }

      // Validate booking duration
      const durationValidation = this.validateBookingDuration(bookingData.checkIn, bookingData.checkOut);
      if (!durationValidation.isValid) {
        errors.push(durationValidation.error!);
      }

      // Validate advance booking
      const advanceValidation = this.validateAdvanceBooking(bookingData.checkIn);
      if (!advanceValidation.isValid) {
        errors.push(advanceValidation.error!);
      }
    }

    // Check for suspicious activity
    if (this.config.enableSuspiciousActivityDetection) {
      const suspiciousCheck = this.detectSuspiciousBookingActivity(bookingData);
      if (suspiciousCheck.isSuspicious) {
        warnings.push(...suspiciousCheck.reasons);
        
        if (suspiciousCheck.severity === 'high') {
          errors.push('Booking request flagged for security review');
        }
      }
    }

    // Check for duplicate bookings
    if (this.config.enableDuplicateBookingPrevention) {
      const duplicateCheck = this.checkForDuplicateBooking(bookingData);
      if (duplicateCheck.isDuplicate) {
        errors.push('Duplicate booking detected');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Validate booking dates
  private validateBookingDates(checkIn: string, checkOut: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if dates are valid
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      errors.push('Invalid date format');
      return { isValid: false, errors };
    }

    // Check if check-in is in the past
    if (checkInDate < today) {
      errors.push('Check-in date cannot be in the past');
    }

    // Check if check-out is before check-in
    if (checkOutDate <= checkInDate) {
      errors.push('Check-out date must be after check-in date');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate guest count
  private validateGuestCount(guests: number): { isValid: boolean; error?: string } {
    if (guests < 1) {
      return { isValid: false, error: 'At least 1 guest is required' };
    }

    if (guests > 20) {
      return { isValid: false, error: 'Maximum 20 guests allowed per booking' };
    }

    return { isValid: true };
  }

  // Validate booking duration
  private validateBookingDuration(checkIn: string, checkOut: string): { isValid: boolean; error?: string } {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const duration = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (duration > this.config.maxBookingDuration) {
      return {
        isValid: false,
        error: `Maximum booking duration is ${this.config.maxBookingDuration} days`
      };
    }

    return { isValid: true };
  }

  // Validate advance booking
  private validateAdvanceBooking(checkIn: string): { isValid: boolean; error?: string } {
    const checkInDate = new Date(checkIn);
    const today = new Date();
    const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference < this.config.minBookingAdvance) {
      return {
        isValid: false,
        error: `Booking must be made at least ${this.config.minBookingAdvance} day(s) in advance`
      };
    }

    if (daysDifference > this.config.maxBookingAdvance) {
      return {
        isValid: false,
        error: `Booking cannot be made more than ${this.config.maxBookingAdvance} days in advance`
      };
    }

    return { isValid: true };
  }

  // Detect suspicious booking activity
  private detectSuspiciousBookingActivity(bookingData: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    userId: string;
    userRole: string;
    ip: string;
    userAgent: string;
  }): { isSuspicious: boolean; severity: 'low' | 'medium' | 'high'; reasons: string[] } {
    const reasons: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Check for rapid booking attempts
    const activityKey = `${bookingData.userId}_${bookingData.ip}`;
    const activity = this.suspiciousActivities.get(activityKey);

    if (activity) {
      const timeDiff = Date.now() - activity.lastActivity.getTime();
      if (timeDiff < 60000) { // Less than 1 minute
        reasons.push('Rapid booking attempts detected');
        severity = 'medium';
      }

      if (activity.count > 5) {
        reasons.push('Multiple booking attempts from same user');
        severity = 'high';
      }
    }

    // Check for unusual booking patterns
    if (bookingData.guests > 15) {
      reasons.push('Unusually large group booking');
      severity = severity === 'low' ? 'medium' : severity;
    }

    // Check for price manipulation
    if (this.config.enablePriceValidation) {
      const priceValidation = this.validatePriceIntegrity(bookingData.propertyId, bookingData.totalAmount, bookingData.userId);
      if (!priceValidation.isValid) {
        reasons.push('Price manipulation detected');
        severity = 'high';
      }
    }

    // Check for suspicious user agent
    if (this.isSuspiciousUserAgent(bookingData.userAgent)) {
      reasons.push('Suspicious user agent detected');
      severity = severity === 'low' ? 'medium' : severity;
    }

    // Record activity
    if (activity) {
      activity.count++;
      activity.lastActivity = new Date();
      activity.activities.push(`Booking attempt for property ${bookingData.propertyId}`);
    } else {
      this.suspiciousActivities.set(activityKey, {
        count: 1,
        lastActivity: new Date(),
        activities: [`Booking attempt for property ${bookingData.propertyId}`]
      });
    }

    const isSuspicious = reasons.length > 0;

    if (isSuspicious) {
      SecurityAuditLogger.logSecurityEvent('SUSPICIOUS_BOOKING_ACTIVITY', {
        userId: bookingData.userId,
        propertyId: bookingData.propertyId,
        reasons,
        severity,
        ip: bookingData.ip,
        userAgent: bookingData.userAgent
      }, severity === 'high' ? 'high' : 'medium');
    }

    return { isSuspicious, severity, reasons };
  }

  // Check for duplicate booking
  private checkForDuplicateBooking(bookingData: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    userId: string;
  }): { isDuplicate: boolean; existingBooking?: any } {
    // In a real implementation, this would check against the database
    // For now, we'll simulate the check
    const bookingKey = `${bookingData.userId}_${bookingData.propertyId}_${bookingData.checkIn}_${bookingData.checkOut}`;
    
    // This would be stored in a database in a real implementation
    const existingBookings = new Set(); // Simulated existing bookings
    
    if (existingBookings.has(bookingKey)) {
      return { isDuplicate: true, existingBooking: { id: 'existing_booking_id' } };
    }

    return { isDuplicate: false };
  }

  // Validate price integrity
  private validatePriceIntegrity(propertyId: string, currentPrice: number, userId: string): { isValid: boolean; error?: string } {
    const history = this.priceHistory.get(propertyId);
    
    if (!history || history.length === 0) {
      // First price for this property
      this.priceHistory.set(propertyId, [{
        price: currentPrice,
        timestamp: new Date(),
        userId
      }]);
      return { isValid: true };
    }

    const lastPrice = history[history.length - 1];
    const priceChange = Math.abs(currentPrice - lastPrice.price);
    const priceChangePercent = (priceChange / lastPrice.price) * 100;

    // Check for suspicious price changes (>50% change)
    if (priceChangePercent > 50) {
      SecurityAuditLogger.logSecurityEvent('SUSPICIOUS_PRICE_CHANGE', {
        propertyId,
        oldPrice: lastPrice.price,
        newPrice: currentPrice,
        changePercent: priceChangePercent,
        userId
      }, 'high');
      
      return { isValid: false, error: 'Suspicious price change detected' };
    }

    // Add to history
    history.push({
      price: currentPrice,
      timestamp: new Date(),
      userId
    });

    return { isValid: true };
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
      /php/i,
      /automation/i,
      /selenium/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Validate user role permissions
  validateUserRolePermissions(userId: string, userRole: string, action: string, resource: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!this.config.enableUserRoleValidation) {
      return { isValid: true };
    }

    const permissions: { [key: string]: string[] } = {
      'admin': ['*'], // Admin can do everything
      'host': ['read_properties', 'update_properties', 'read_bookings', 'update_bookings'],
      'guest': ['read_properties', 'create_bookings', 'read_own_bookings'],
      'partner': ['read_properties', 'create_bookings', 'read_own_bookings', 'read_analytics']
    };

    const userPermissions = permissions[userRole] || [];
    
    if (!userPermissions.includes('*') && !userPermissions.includes(action)) {
      SecurityAuditLogger.logSecurityEvent('UNAUTHORIZED_ACTION', {
        userId,
        userRole,
        action,
        resource
      }, 'medium');
      
      return { isValid: false, error: 'Insufficient permissions' };
    }

    return { isValid: true };
  }

  // Validate data integrity
  validateDataIntegrity(data: any, dataType: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.enableDataIntegrityChecks) {
      return { isValid: true, errors };
    }

    switch (dataType) {
      case 'property':
        errors.push(...this.validatePropertyData(data));
        break;
      case 'booking':
        errors.push(...this.validateBookingData(data));
        break;
      case 'user':
        errors.push(...this.validateUserData(data));
        break;
      default:
        errors.push('Unknown data type');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate property data
  private validatePropertyData(property: any): string[] {
    const errors: string[] = [];

    if (!property.name || property.name.trim().length < 3) {
      errors.push('Property name must be at least 3 characters');
    }

    if (!property.price || property.price < 0) {
      errors.push('Property price must be positive');
    }

    if (!property.location || property.location.trim().length < 3) {
      errors.push('Property location must be specified');
    }

    if (!property.capacity || property.capacity < 1) {
      errors.push('Property capacity must be at least 1');
    }

    return errors;
  }

  // Validate booking data
  private validateBookingData(booking: any): string[] {
    const errors: string[] = [];

    if (!booking.propertyId) {
      errors.push('Property ID is required');
    }

    if (!booking.checkIn || !booking.checkOut) {
      errors.push('Check-in and check-out dates are required');
    }

    if (!booking.guests || booking.guests < 1) {
      errors.push('Guest count must be at least 1');
    }

    if (!booking.totalAmount || booking.totalAmount < 0) {
      errors.push('Total amount must be positive');
    }

    return errors;
  }

  // Validate user data
  private validateUserData(user: any): string[] {
    const errors: string[] = [];

    if (!user.email || !InputValidator.isValidEmail(user.email)) {
      errors.push('Valid email is required');
    }

    if (!user.firstName || user.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!user.lastName || user.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (!user.phone || !InputValidator.isValidPhone(user.phone)) {
      errors.push('Valid phone number is required');
    }

    return errors;
  }

  // Block user
  blockUser(userId: string, reason: string): void {
    this.blockedUsers.add(userId);
    SecurityAuditLogger.logSecurityEvent('USER_BLOCKED', {
      userId,
      reason,
      timestamp: new Date().toISOString()
    }, 'high');
  }

  // Unblock user
  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
    SecurityAuditLogger.logSecurityEvent('USER_UNBLOCKED', {
      userId,
      timestamp: new Date().toISOString()
    }, 'medium');
  }

  // Check if user is blocked
  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }

  // Get suspicious activity statistics
  getSuspiciousActivityStatistics(): {
    totalActivities: number;
    blockedUsers: number;
    highRiskActivities: number;
    topSuspiciousPatterns: string[];
  } {
    const totalActivities = Array.from(this.suspiciousActivities.values())
      .reduce((sum, activity) => sum + activity.count, 0);

    const highRiskActivities = Array.from(this.suspiciousActivities.values())
      .filter(activity => activity.count > 5).length;

    return {
      totalActivities,
      blockedUsers: this.blockedUsers.size,
      highRiskActivities,
      topSuspiciousPatterns: ['Rapid booking attempts', 'Price manipulation', 'Large group bookings', 'Suspicious user agents']
    };
  }

  // Update security configuration
  updateConfig(newConfig: Partial<BusinessLogicSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    SecurityAuditLogger.logSecurityEvent('BUSINESS_LOGIC_CONFIG_UPDATED', {
      config: newConfig
    }, 'low');
  }

  // Get current configuration
  getConfig(): BusinessLogicSecurityConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const businessLogicSecurityManager = new BusinessLogicSecurityManager();
