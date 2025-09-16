// Minimal partner auth manager for admin functionality
export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export class PartnerAuthManager {
  private static instance: PartnerAuthManager;
  private partners: Partner[] = [];

  static getInstance(): PartnerAuthManager {
    if (!PartnerAuthManager.instance) {
      PartnerAuthManager.instance = new PartnerAuthManager();
    }
    return PartnerAuthManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Partner[]> {
    return this.partners;
  }

  async getById(id: string): Promise<Partner | null> {
    return this.partners.find(p => p.id === id) || null;
  }

  async create(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
    const newPartner: Partner = {
      ...partner,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.partners.push(newPartner);
    return newPartner;
  }

  async update(id: string, updates: Partial<Partner>): Promise<Partner | null> {
    const index = this.partners.findIndex(p => p.id === id);
    if (index !== -1) {
      this.partners[index] = { ...this.partners[index], ...updates, updated_at: new Date().toISOString() };
      return this.partners[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.partners.findIndex(p => p.id === id);
    if (index !== -1) {
      this.partners.splice(index, 1);
      return true;
    }
    return false;
  }

  getCurrentUser(): any {
    // Mock current user
    return null;
  }

  logout(): void {
    console.log('Partner logged out');
  }

  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; partner?: any; error?: string }> {
    try {
      const partner = await this.authenticate(credentials.email, credentials.password);
      if (partner) {
        return { success: true, partner };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  async authenticate(email: string, password: string): Promise<Partner | null> {
    // Mock authentication
    const partner = this.partners.find(p => p.email === email);
    return partner || null;
  }
}

export const partnerAuthManager = PartnerAuthManager.getInstance();
