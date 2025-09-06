export interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  firstName: string;
  lastName: string;
  phone: string;
  role: 'guest' | 'admin' | 'partner';
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    language: string;
  };
}

class UserManager {
  private users: User[] = [];
  private currentUser: User | null = null;
  private subscribers: (() => void)[] = [];

  initialize() {
    // For server-side rendering, always load default users
    if (this.users.length === 0) {
      this.loadDefaultUsers();
    }
    
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('luxeUsers');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        this.loadDefaultUsers();
      }
      
      // Check for existing session
      const sessionUser = localStorage.getItem('luxeCurrentUser');
      if (sessionUser) {
        this.currentUser = JSON.parse(sessionUser);
      }
    }
  }

  private loadDefaultUsers() {
    this.users = [
      {
        id: '1',
        email: 'admin@luxe.com',
        password: 'admin123', // In production, use proper hashing
        firstName: 'Admin',
        lastName: 'User',
        phone: '+91-98765-43210',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        email: 'guest@example.com',
        password: 'guest123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+91-98765-43211',
        role: 'guest',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      }
    ];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeUsers', JSON.stringify(this.users));
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // User registration
  registerUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>): User | null {
    // Check if user already exists
    if (this.users.find(user => user.email === userData.email)) {
      return null;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };

    this.users.push(newUser);
    this.saveToStorage();
    this.notifySubscribers();
    return newUser;
  }

  // User login
  loginUser(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email && u.password === password && u.isActive);
    
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.currentUser = user;
      this.saveToStorage();
      
      // Save to localStorage for session management
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxeCurrentUser', JSON.stringify(user));
        localStorage.setItem('luxeGuestLoggedIn', 'true');
      }
      
      this.notifySubscribers();
      return user;
    }
    
    return null;
  }

  // User logout
  logoutUser(): void {
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxeCurrentUser');
      localStorage.removeItem('luxeGuestLoggedIn');
    }
    
    this.notifySubscribers();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Check if user has specific role
  hasRole(role: User['role']): boolean {
    return this.currentUser?.role === role;
  }

  // Get user by ID
  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  // Get user by email
  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  // Update user profile
  updateUserProfile(userId: string, updates: Partial<User>): boolean {
    const index = this.users.findIndex(user => user.id === userId);
    if (index !== -1) {
      // Don't allow role changes through profile update
      const { role, ...safeUpdates } = updates;
      
      this.users[index] = { ...this.users[index], ...safeUpdates };
      this.saveToStorage();
      
      // Update current user if it's the same user
      if (this.currentUser?.id === userId) {
        this.currentUser = { ...this.currentUser, ...safeUpdates };
        if (typeof window !== 'undefined') {
          localStorage.setItem('luxeCurrentUser', JSON.stringify(this.currentUser));
        }
      }
      
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Deactivate user
  deactivateUser(userId: string): boolean {
    const index = this.users.findIndex(user => user.id === userId);
    if (index !== -1) {
      this.users[index].isActive = false;
      this.saveToStorage();
      
      // Logout if it's the current user
      if (this.currentUser?.id === userId) {
        this.logoutUser();
      }
      
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Reactivate user
  reactivateUser(userId: string): boolean {
    const index = this.users.findIndex(user => user.id === userId);
    if (index !== -1) {
      this.users[index].isActive = true;
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Get all users (admin only)
  getAllUsers(): User[] {
    return this.users;
  }

  // Get active users
  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }

  // Get users by role
  getUsersByRole(role: User['role']): User[] {
    return this.users.filter(user => user.role === role);
  }

  // Change user password
  changePassword(userId: string, oldPassword: string, newPassword: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user && user.password === oldPassword) {
      user.password = newPassword;
      this.saveToStorage();
      
      // Update current user if it's the same user
      if (this.currentUser?.id === userId) {
        this.currentUser.password = newPassword;
        if (typeof window !== 'undefined') {
          localStorage.setItem('luxeCurrentUser', JSON.stringify(this.currentUser));
        }
      }
      
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Get user statistics
  getUserStats() {
    const total = this.users.length;
    const active = this.users.filter(u => u.isActive).length;
    const guests = this.users.filter(u => u.role === 'guest').length;
    const admins = this.users.filter(u => u.role === 'admin').length;
    const partners = this.users.filter(u => u.role === 'partner').length;

    return {
      total,
      active,
      guests,
      admins,
      partners
    };
  }
}

export const userManager = new UserManager();

