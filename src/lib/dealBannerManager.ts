// Minimal deal banner manager for admin functionality
export interface DealBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export class DealBannerManager {
  private static instance: DealBannerManager;
  private banners: DealBanner[] = [];

  static getInstance(): DealBannerManager {
    if (!DealBannerManager.instance) {
      DealBannerManager.instance = new DealBannerManager();
    }
    return DealBannerManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<DealBanner[]> {
    return this.banners;
  }

  async getById(id: string): Promise<DealBanner | null> {
    return this.banners.find(b => b.id === id) || null;
  }

  async create(banner: Omit<DealBanner, 'id' | 'created_at' | 'updated_at'>): Promise<DealBanner> {
    const newBanner: DealBanner = {
      ...banner,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.banners.push(newBanner);
    return newBanner;
  }

  async update(id: string, updates: Partial<DealBanner>): Promise<DealBanner | null> {
    const index = this.banners.findIndex(b => b.id === id);
    if (index !== -1) {
      this.banners[index] = { ...this.banners[index], ...updates, updated_at: new Date().toISOString() };
      return this.banners[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.banners.findIndex(b => b.id === id);
    if (index !== -1) {
      this.banners.splice(index, 1);
      return true;
    }
    return false;
  }

  async getDealBanner(): Promise<DealBanner | null> {
    return this.banners.find(b => b.isActive) || null;
  }

  async updateDealBanner(data: Partial<DealBanner>): Promise<DealBanner | null> {
    const activeBanner = this.banners.find(b => b.isActive);
    if (activeBanner) {
      return this.update(activeBanner.id, data);
    } else {
      return this.create({
        title: data.title || 'Deal Banner',
        description: data.description || '',
        image: data.image || '',
        link: data.link || '',
        isActive: true
      });
    }
  }
}

export const dealBannerManager = DealBannerManager.getInstance();
