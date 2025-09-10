interface PartnerUser {
  id: string;
  partnerId: string;
  email: string;
  password: string; // In production, this should be hashed
  businessName: string;
  contactPerson: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'owner' | 'manager' | 'staff';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PartnerLoginCredentials {
  email: string;
  password: string;
}

class PartnerAuthManager {
  private partners: PartnerUser[] = [];
  private currentUser: PartnerUser | null = null;
  private subscribers: ((user: PartnerUser | null) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('luxe_partner_users');
        if (stored) {
          this.partners = JSON.parse(stored).map((partner: any) => ({
            ...partner,
            lastLogin: partner.lastLogin ? new Date(partner.lastLogin) : undefined,
            createdAt: new Date(partner.createdAt),
            updatedAt: new Date(partner.updatedAt)
          }));
        }

        // Load current user from session
        const currentUser = localStorage.getItem('luxe_current_partner');
        if (currentUser) {
          this.currentUser = JSON.parse(currentUser);
        }
      }
    } catch (error) {
      console.error('Error loading partner users:', error);
      this.partners = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxe_partner_users', JSON.stringify(this.partners));
      }
    } catch (error) {
      console.error('Error saving partner users:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentUser));
  }

  // Create partner account from approved application
  createPartnerAccount(partnerApplication: any): PartnerUser {
    const partnerUser: PartnerUser = {
      id: `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partnerId: partnerApplication.id,
      email: partnerApplication.email,
      password: this.generateTemporaryPassword(),
      businessName: partnerApplication.businessName,
      contactPerson: partnerApplication.contactPerson,
      phone: partnerApplication.phone,
      status: 'active',
      role: 'owner',
      permissions: ['view_bookings', 'view_revenue', 'view_occupancy', 'manage_property', 'view_guests'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.partners.push(partnerUser);
    this.saveToStorage();
    return partnerUser;
  }

  private generateTemporaryPassword(): string {
    // Generate a temporary password (in production, this should be more secure)
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Partner login
  async login(credentials: PartnerLoginCredentials): Promise<{ success: boolean; user?: PartnerUser; error?: string }> {
    const partner = this.partners.find(p => 
      p.email.toLowerCase() === credentials.email.toLowerCase() && 
      p.password === credentials.password
    );

    if (!partner) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (partner.status !== 'active') {
      return { success: false, error: 'Account is not active. Please contact support.' };
    }

    // Update last login
    partner.lastLogin = new Date();
    partner.updatedAt = new Date();
    this.saveToStorage();

    // Set current user
    this.currentUser = partner;
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxe_current_partner', JSON.stringify(partner));
    }

    this.notifySubscribers();
    return { success: true, user: partner };
  }

  // Partner logout
  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxe_current_partner');
    }
    this.notifySubscribers();
  }

  // Get current user
  getCurrentUser(): PartnerUser | null {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  // Get all partner users
  getAllPartners(): PartnerUser[] {
    return [...this.partners];
  }

  // Get partner by ID
  getPartnerById(id: string): PartnerUser | undefined {
    return this.partners.find(p => p.id === id);
  }

  // Update partner user
  updatePartner(id: string, updates: Partial<PartnerUser>): PartnerUser | null {
    const partner = this.partners.find(p => p.id === id);
    if (partner) {
      Object.assign(partner, updates, { updatedAt: new Date() });
      this.saveToStorage();
      return partner;
    }
    return null;
  }

  // Change password
  changePassword(partnerId: string, currentPassword: string, newPassword: string): boolean {
    const partner = this.partners.find(p => p.id === partnerId);
    if (partner && partner.password === currentPassword) {
      partner.password = newPassword;
      partner.updatedAt = new Date();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Reset password (admin function)
  resetPassword(partnerId: string): string {
    const partner = this.partners.find(p => p.id === partnerId);
    if (partner) {
      const newPassword = this.generateTemporaryPassword();
      partner.password = newPassword;
      partner.updatedAt = new Date();
      this.saveToStorage();
      return newPassword;
    }
    throw new Error('Partner not found');
  }

  // Subscribe to auth changes
  subscribe(callback: (user: PartnerUser | null) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Get partner statistics
  getPartnerStatistics() {
    const total = this.partners.length;
    const active = this.partners.filter(p => p.status === 'active').length;
    const inactive = this.partners.filter(p => p.status === 'inactive').length;
    const pending = this.partners.filter(p => p.status === 'pending').length;

    return {
      total,
      active,
      inactive,
      pending,
      activeRate: total > 0 ? (active / total) * 100 : 0
    };
  }
}

export const partnerAuthManager = new PartnerAuthManager();

