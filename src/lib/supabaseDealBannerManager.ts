// Minimal Supabase deal banner manager for admin functionality
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

export class SupabaseDealBannerManager {
  private static instance: SupabaseDealBannerManager;
  private banners: DealBanner[] = [];

  static getInstance(): SupabaseDealBannerManager {
    if (!SupabaseDealBannerManager.instance) {
      SupabaseDealBannerManager.instance = new SupabaseDealBannerManager();
    }
    return SupabaseDealBannerManager.instance;
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

  getAllBanners(): DealBanner[] {
    return this.banners;
  }

  isLoading(): boolean {
    return false;
  }

  isInitialized(): boolean {
    return true;
  }

  async addBanner(banner: Omit<DealBanner, 'id' | 'created_at' | 'updated_at'>): Promise<DealBanner> {
    const newBanner: DealBanner = {
      ...banner,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.banners.push(newBanner);
    return newBanner;
  }
}

export const supabaseDealBannerManager = SupabaseDealBannerManager.getInstance();
