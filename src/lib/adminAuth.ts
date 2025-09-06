// Admin Authentication Utility
export interface AdminCredentials {
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export class AdminAuthManager {
  private static readonly STORAGE_KEY = 'adminCredentials';
  private static readonly SESSION_KEY = 'adminLoggedIn';
  private static readonly SESSION_TIME_KEY = 'adminLoginTime';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Initialize default credentials if none exist
  static initializeDefaultCredentials(): void {
    const existingCredentials = this.getCredentials();
    
    if (!existingCredentials) {
      const defaultCredentials: AdminCredentials = {
        username: 'admin',
        password: 'luxe2024!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.setCredentials(defaultCredentials);
    }
  }

  // Get stored credentials
  static getCredentials(): AdminCredentials | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting admin credentials:', error);
      return null;
    }
  }

  // Set new credentials
  static setCredentials(credentials: AdminCredentials): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Error setting admin credentials:', error);
      throw new Error('Failed to save credentials');
    }
  }

  // Update credentials
  static updateCredentials(newCredentials: Partial<AdminCredentials>): void {
    const currentCredentials = this.getCredentials();
    if (!currentCredentials) {
      throw new Error('No existing credentials found');
    }

    const updatedCredentials: AdminCredentials = {
      ...currentCredentials,
      ...newCredentials,
      updatedAt: new Date().toISOString()
    };

    this.setCredentials(updatedCredentials);
  }

  // Verify credentials
  static verifyCredentials(username: string, password: string): boolean {
    const storedCredentials = this.getCredentials();
    if (!storedCredentials) {
      return false;
    }

    return storedCredentials.username === username && storedCredentials.password === password;
  }

  // Check if user is logged in and session is valid
  static isLoggedIn(): boolean {
    try {
      const isLoggedIn = localStorage.getItem(this.SESSION_KEY) === 'true';
      
      if (!isLoggedIn) {
        return false;
      }

      // Check session expiry
      const loginTime = localStorage.getItem(this.SESSION_TIME_KEY);
      
      if (!loginTime) {
        this.logout();
        return false;
      }

      const loginTimestamp = new Date(loginTime).getTime();
      const currentTimestamp = new Date().getTime();
      const timeDiff = currentTimestamp - loginTimestamp;
      
      if (timeDiff > this.SESSION_DURATION) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Set login session
  static setLoginSession(): void {
    localStorage.setItem(this.SESSION_KEY, 'true');
    localStorage.setItem(this.SESSION_TIME_KEY, new Date().toISOString());
  }

  // Logout
  static logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_TIME_KEY);
  }

  // Change password
  static changePassword(currentPassword: string, newPassword: string): boolean {
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new Error('No credentials found');
    }

    if (credentials.password !== currentPassword) {
      return false;
    }

    this.updateCredentials({ password: newPassword });
    return true;
  }

  // Reset credentials to default
  static resetToDefault(): void {
    const defaultCredentials: AdminCredentials = {
      username: 'admin',
      password: 'luxe2024!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.setCredentials(defaultCredentials);
  }

  // Get session info
  static getSessionInfo(): { isLoggedIn: boolean; loginTime: string | null; remainingTime: number } {
    const isLoggedIn = this.isLoggedIn();
    const loginTime = localStorage.getItem(this.SESSION_TIME_KEY);
    
    let remainingTime = 0;
    if (loginTime && isLoggedIn) {
      const loginTimestamp = new Date(loginTime).getTime();
      const currentTimestamp = new Date().getTime();
      remainingTime = Math.max(0, this.SESSION_DURATION - (currentTimestamp - loginTimestamp));
    }

    return {
      isLoggedIn,
      loginTime,
      remainingTime
    };
  }
}

// Initialize default credentials when module loads
if (typeof window !== 'undefined') {
  AdminAuthManager.initializeDefaultCredentials();
}
