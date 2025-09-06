interface PartnerApplication {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  description: string;
  website: string;
  socialMedia: string;
  experience: string;
  partnershipGoals: string;
  expectedRevenue: string;
  marketingBudget: string;
  targetAudience: string;
  competitiveAdvantage: string;
  propertyImages: string[];
  propertyDetails: {
    propertyName: string;
    propertyType: string;
    numberOfRooms: string;
    amenities: string[];
    propertyDescription: string;
    propertyLocation: string;
    propertyPrice: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  createdAt: Date;
  updatedAt: Date;
}

class PartnerManager {
  private applications: PartnerApplication[] = [];
  private subscribers: (() => void)[] = [];
  private initialized = false;

  constructor() {
    // Only load from storage if we're in the browser
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  initialize() {
    if (this.initialized) return;
    // Only load from storage if we're in the browser
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
    this.initialized = true;
  }

  private loadFromStorage() {
    try {
      // Only access localStorage if we're in the browser
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('luxe_partner_applications');
        if (stored) {
          this.applications = JSON.parse(stored).map((app: any) => ({
            ...app,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading partner applications:', error);
      this.applications = [];
    }
  }

  private saveToStorage() {
    try {
      // Only access localStorage if we're in the browser
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('luxe_partner_applications', JSON.stringify(this.applications));
      }
    } catch (error) {
      console.error('Error saving partner applications:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  async addPartnerApplication(application: Omit<PartnerApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<PartnerApplication> {
    const newApplication: PartnerApplication = {
      ...application,
      id: `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.applications.push(newApplication);
    this.saveToStorage();
    this.notifySubscribers();

    return newApplication;
  }

  async addApplication(application: any): Promise<PartnerApplication> {
    return this.addPartnerApplication(application);
  }

  getAllApplications(): PartnerApplication[] {
    // If not initialized and we're on the server, return empty array
    if (!this.initialized && typeof window === 'undefined') {
      return [];
    }
    return [...this.applications];
  }

  getApplicationById(id: string): PartnerApplication | undefined {
    return this.applications.find(app => app.id === id);
  }

  updateApplicationStatus(id: string, status: PartnerApplication['status']): PartnerApplication | null {
    const application = this.applications.find(app => app.id === id);
    if (application) {
      application.status = status;
      application.updatedAt = new Date();
      this.saveToStorage();
      this.notifySubscribers();
      return application;
    }
    return null;
  }

  approveApplication(id: string): PartnerApplication | null {
    return this.updateApplicationStatus(id, 'approved');
  }

  rejectApplication(id: string): PartnerApplication | null {
    return this.updateApplicationStatus(id, 'rejected');
  }

  putUnderReview(id: string): PartnerApplication | null {
    return this.updateApplicationStatus(id, 'pending');
  }

  updateApplication(id: string, updates: Partial<PartnerApplication>): PartnerApplication | null {
    const application = this.applications.find(app => app.id === id);
    if (application) {
      Object.assign(application, updates);
      application.updatedAt = new Date();
      this.saveToStorage();
      this.notifySubscribers();
      return application;
    }
    return null;
  }

  deleteApplication(id: string): boolean {
    const index = this.applications.findIndex(app => app.id === id);
    if (index !== -1) {
      this.applications.splice(index, 1);
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  getApplicationsByStatus(status: PartnerApplication['status']): PartnerApplication[] {
    return this.applications.filter(app => app.status === status);
  }

  getPendingApplications(): PartnerApplication[] {
    return this.getApplicationsByStatus('pending');
  }

  getApprovedApplications(): PartnerApplication[] {
    return this.getApplicationsByStatus('approved');
  }

  getRejectedApplications(): PartnerApplication[] {
    return this.getApplicationsByStatus('rejected');
  }

  searchApplications(query: string): PartnerApplication[] {
    const lowerQuery = query.toLowerCase();
    return this.applications.filter(app => 
      app.businessName.toLowerCase().includes(lowerQuery) ||
      app.contactPerson.toLowerCase().includes(lowerQuery) ||
      app.email.toLowerCase().includes(lowerQuery) ||
      app.location.toLowerCase().includes(lowerQuery) ||
      app.businessType.toLowerCase().includes(lowerQuery)
    );
  }

  getStatistics() {
    const total = this.applications.length;
    const pending = this.getPendingApplications().length;
    const approved = this.getApprovedApplications().length;
    const rejected = this.getRejectedApplications().length;
    const contacted = this.getApplicationsByStatus('contacted').length;

    return {
      total,
      pending,
      approved,
      rejected,
      contacted,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  clearAllApplications(): void {
    this.applications = [];
    this.saveToStorage();
    this.notifySubscribers();
  }
}

export const partnerManager = new PartnerManager();

