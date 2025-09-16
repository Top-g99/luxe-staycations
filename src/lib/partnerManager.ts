// Minimal partner manager for admin functionality
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

export class PartnerManager {
  private static instance: PartnerManager;
  private partners: Partner[] = [];

  static getInstance(): PartnerManager {
    if (!PartnerManager.instance) {
      PartnerManager.instance = new PartnerManager();
    }
    return PartnerManager.instance;
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

  async getAllApplications(): Promise<any[]> {
    return this.partners;
  }

  async addApplication(data: any): Promise<any> {
    return this.create(data);
  }
}

export const partnerManager = PartnerManager.getInstance();
