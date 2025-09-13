// Enhanced Secure Authentication System
import { AdminAuthManager } from '@/lib/adminAuth';
import { EncryptionUtils, RateLimiter, SecurityAuditLogger, SessionSecurity, CSRFProtection } from './securityUtils';

export interface SecureSession {
  sessionId: string;
  userId: string;
  role: string;
  createdAt: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
  csrfToken: string;
}

export interface LoginAttempt {
  identifier: string;
  attempts: number;
  lastAttempt: string;
  lockedUntil?: string;
}

export class SecureAuthManager {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly SESSION_KEY = 'secureSession';
  private static readonly LOGIN_ATTEMPTS_KEY = 'loginAttempts';
  
  // Enhanced login with security measures
  static async secureLogin(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
    success: boolean;
    session?: SecureSession;
    error?: string;
    remainingAttempts?: number;
  }> {
    try {
      // Check rate limiting
      const rateLimitKey = `login:${username}:${ipAddress || 'unknown'}`;
      if (RateLimiter.isRateLimited(rateLimitKey, this.MAX_LOGIN_ATTEMPTS, this.LOCKOUT_DURATION)) {
        SecurityAuditLogger.logSecurityEvent('LOGIN_RATE_LIMITED', {
          username,
          ipAddress,
          userAgent
        }, 'high');
        
        return {
          success: false,
          error: 'Too many login attempts. Please try again later.',
          remainingAttempts: 0
        };
      }

      // Check if account is locked
      const lockoutInfo = this.getLockoutInfo(username);
      if (lockoutInfo && lockoutInfo.lockedUntil && new Date(lockoutInfo.lockedUntil) > new Date()) {
        SecurityAuditLogger.logSecurityEvent('LOGIN_ATTEMPT_LOCKED_ACCOUNT', {
          username,
          ipAddress,
          userAgent
        }, 'high');
        
        return {
          success: false,
          error: 'Account is temporarily locked due to multiple failed attempts.'
        };
      }

      // Verify credentials
      const isValid = AdminAuthManager.verifyCredentials(username, password);
      
      if (!isValid) {
        // Record failed attempt
        this.recordFailedAttempt(username, ipAddress);
        
        SecurityAuditLogger.logSecurityEvent('LOGIN_FAILED', {
          username,
          ipAddress,
          userAgent
        }, 'medium');
        
        const remainingAttempts = RateLimiter.getRemainingAttempts(rateLimitKey, this.MAX_LOGIN_ATTEMPTS);
        
        return {
          success: false,
          error: 'Invalid credentials',
          remainingAttempts
        };
      }

      // Successful login - create secure session
      const session = await this.createSecureSession(username, 'admin', ipAddress, userAgent);
      
      // Clear failed attempts
      this.clearFailedAttempts(username);
      RateLimiter.resetAttempts(rateLimitKey);
      
      SecurityAuditLogger.logSecurityEvent('LOGIN_SUCCESS', {
        username,
        ipAddress,
        userAgent,
        sessionId: session.sessionId
      }, 'low');
      
      return {
        success: true,
        session
      };
      
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('LOGIN_ERROR', {
        username,
        ipAddress,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      
      return {
        success: false,
        error: 'An error occurred during login'
      };
    }
  }

  // Create secure session
  private static async createSecureSession(
    userId: string, 
    role: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<SecureSession> {
    const sessionId = SessionSecurity.generateSecureSessionId();
    const csrfToken = CSRFProtection.generateToken(sessionId);
    
    const session: SecureSession = {
      sessionId,
      userId,
      role,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress,
      userAgent,
      csrfToken
    };
    
    // Store session securely
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
    
    return session;
  }

  // Validate current session
  static validateSession(): { isValid: boolean; session?: SecureSession; error?: string } {
    try {
      if (typeof window === 'undefined') {
        return { isValid: false, error: 'Server-side validation not supported' };
      }
      
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return { isValid: false, error: 'No session found' };
      }
      
      const session: SecureSession = JSON.parse(sessionData);
      
      // Validate session ID format
      if (!SessionSecurity.validateSessionId(session.sessionId)) {
        SecurityAuditLogger.logSecurityEvent('INVALID_SESSION_ID', {
          sessionId: session.sessionId
        }, 'high');
        return { isValid: false, error: 'Invalid session' };
      }
      
      // Check session expiry
      if (SessionSecurity.isSessionExpired(session.createdAt, this.SESSION_DURATION)) {
        SecurityAuditLogger.logSecurityEvent('SESSION_EXPIRED', {
          sessionId: session.sessionId,
          userId: session.userId
        }, 'medium');
        this.logout();
        return { isValid: false, error: 'Session expired' };
      }
      
      // Update last activity
      session.lastActivity = new Date().toISOString();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      return { isValid: true, session };
      
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('SESSION_VALIDATION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      
      return { isValid: false, error: 'Session validation failed' };
    }
  }

  // Validate CSRF token
  static validateCSRFToken(token: string): boolean {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return false;
      
      const session: SecureSession = JSON.parse(sessionData);
      return CSRFProtection.validateToken(session.sessionId, token);
    } catch {
      return false;
    }
  }

  // Get current session
  static getCurrentSession(): SecureSession | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }

  // Logout
  static logout(): void {
    try {
      const session = this.getCurrentSession();
      if (session) {
        CSRFProtection.revokeToken(session.sessionId);
        
        SecurityAuditLogger.logSecurityEvent('LOGOUT', {
          sessionId: session.sessionId,
          userId: session.userId
        }, 'low');
      }
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('LOGOUT_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
    }
  }

  // Record failed login attempt
  private static recordFailedAttempt(username: string, ipAddress?: string): void {
    try {
      if (typeof window === 'undefined') return;
      
      const attemptsKey = `${this.LOGIN_ATTEMPTS_KEY}:${username}`;
      const existing = localStorage.getItem(attemptsKey);
      
      let attempt: LoginAttempt;
      if (existing) {
        attempt = JSON.parse(existing);
        attempt.attempts++;
        attempt.lastAttempt = new Date().toISOString();
      } else {
        attempt = {
          identifier: username,
          attempts: 1,
          lastAttempt: new Date().toISOString()
        };
      }
      
      // Lock account if too many attempts
      if (attempt.attempts >= this.MAX_LOGIN_ATTEMPTS) {
        attempt.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION).toISOString();
        
        SecurityAuditLogger.logSecurityEvent('ACCOUNT_LOCKED', {
          username,
          ipAddress,
          attempts: attempt.attempts
        }, 'critical');
      }
      
      localStorage.setItem(attemptsKey, JSON.stringify(attempt));
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  // Get lockout information
  private static getLockoutInfo(username: string): LoginAttempt | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const attemptsKey = `${this.LOGIN_ATTEMPTS_KEY}:${username}`;
      const data = localStorage.getItem(attemptsKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Clear failed attempts
  private static clearFailedAttempts(username: string): void {
    try {
      if (typeof window === 'undefined') return;
      
      const attemptsKey = `${this.LOGIN_ATTEMPTS_KEY}:${username}`;
      localStorage.removeItem(attemptsKey);
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }

  // Change password with security checks
  static async changePassword(
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate inputs
      if (newPassword !== confirmPassword) {
        return { success: false, error: 'New passwords do not match' };
      }
      
      if (currentPassword === newPassword) {
        return { success: false, error: 'New password must be different from current password' };
      }
      
      // Get current session
      const session = this.getCurrentSession();
      if (!session) {
        return { success: false, error: 'No active session' };
      }
      
      // Verify current password
      const isValid = AdminAuthManager.verifyCredentials(session.userId, currentPassword);
      if (!isValid) {
        SecurityAuditLogger.logSecurityEvent('PASSWORD_CHANGE_FAILED', {
          userId: session.userId,
          reason: 'Invalid current password'
        }, 'medium');
        
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // Change password
      const success = AdminAuthManager.changePassword(currentPassword, newPassword);
      if (success) {
        SecurityAuditLogger.logSecurityEvent('PASSWORD_CHANGED', {
          userId: session.userId
        }, 'low');
        
        return { success: true };
      } else {
        return { success: false, error: 'Failed to change password' };
      }
      
    } catch (error) {
      SecurityAuditLogger.logSecurityEvent('PASSWORD_CHANGE_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      
      return { success: false, error: 'An error occurred while changing password' };
    }
  }

  // Get session info
  static getSessionInfo(): {
    isLoggedIn: boolean;
    session?: SecureSession;
    remainingTime?: number;
    error?: string;
  } {
    const validation = this.validateSession();
    
    if (!validation.isValid) {
      return {
        isLoggedIn: false,
        error: validation.error
      };
    }
    
    const session = validation.session!;
    const remainingTime = this.SESSION_DURATION - (Date.now() - new Date(session.createdAt).getTime());
    
    return {
      isLoggedIn: true,
      session,
      remainingTime: Math.max(0, remainingTime)
    };
  }
}
