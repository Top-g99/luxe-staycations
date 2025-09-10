import { getSupabaseClient, isSupabaseAvailable } from './supabase';

export interface DealBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

class SupabaseDealBannerManager {
  private banners: DealBanner[] = [];
  private subscribers: (() => void)[] = [];
  private initialized = false;
  private loading = false;

  async initialize() {
    if (this.initialized) return;
    
    this.loading = true;
    
    try {
      if (isSupabaseAvailable()) {
        await this.loadFromSupabase();
      } else {
        await this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('SupabaseDealBannerManager: Error initializing:', error);
      await this.loadFromLocalStorage();
    }
    
    this.initialized = true;
    this.loading = false;
    this.notifySubscribers();
  }

  private async loadFromSupabase() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('deal_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SupabaseDealBannerManager: Error loading from Supabase:', error);
        throw error;
      }

      this.banners = data || [];
      console.log('SupabaseDealBannerManager: Loaded banners from Supabase:', this.banners.length);
      
      // If no banners in Supabase, load defaults
      if (this.banners.length === 0) {
        await this.loadDefaultBanners();
      }
    } catch (error) {
      console.error('SupabaseDealBannerManager: Failed to load from Supabase, falling back to localStorage:', error);
      await this.loadFromLocalStorage();
    }
  }

  private async loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedBanners = localStorage.getItem('luxeDealBanners');
      if (savedBanners) {
        try {
          this.banners = JSON.parse(savedBanners);
          console.log('SupabaseDealBannerManager: Loaded banners from localStorage:', this.banners.length);
        } catch (error) {
          console.error('SupabaseDealBannerManager: Error parsing saved banners, loading defaults');
          await this.loadDefaultBanners();
        }
      } else {
        await this.loadDefaultBanners();
      }
    } else {
      await this.loadDefaultBanners();
    }
  }

  private async loadDefaultBanners() {
    const defaultBanners: DealBanner[] = [
      {
        id: '1',
        title: 'Summer Getaway Special',
        subtitle: 'Up to 40% off on luxury villas',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
        link: '/villas?promo=summer40',
        active: true
      },
      {
        id: '2',
        title: 'Weekend Escape',
        subtitle: 'Perfect family destinations',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
        link: '/destinations',
        active: true
      }
    ];

    this.banners = defaultBanners;
    console.log('SupabaseDealBannerManager: Loaded default banners:', this.banners.length);
    
    // Save to both Supabase and localStorage
    await this.saveToSupabase();
    this.saveToLocalStorage();
  }

  private async saveToSupabase() {
    if (!isSupabaseAvailable()) return;

    try {
      const supabase = getSupabaseClient();
      
      // Clear existing banners and insert new ones
      const { error: deleteError } = await supabase
        .from('deal_banners')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('SupabaseDealBannerManager: Error clearing banners:', deleteError);
      }

      // Insert new banners
      const { error: insertError } = await supabase
        .from('deal_banners')
        .insert(this.banners);

      if (insertError) {
        console.error('SupabaseDealBannerManager: Error saving to Supabase:', insertError);
      } else {
        console.log('SupabaseDealBannerManager: Saved banners to Supabase');
      }
    } catch (error) {
      console.error('SupabaseDealBannerManager: Error saving to Supabase:', error);
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeDealBanners', JSON.stringify(this.banners));
      console.log('SupabaseDealBannerManager: Saved banners to localStorage');
    }
  }

  async addBanner(banner: Omit<DealBanner, 'id'>): Promise<DealBanner> {
    const newBanner: DealBanner = {
      ...banner,
      id: crypto.randomUUID()
    };

    this.banners.push(newBanner);
    
    // Save to both Supabase and localStorage
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('deal_banners')
          .insert(newBanner);

        if (error) {
          console.error('SupabaseDealBannerManager: Error adding banner to Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseDealBannerManager: Error adding banner to Supabase:', error);
      }
    }
    
    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return newBanner;
  }

  async updateBanner(id: string, updates: Partial<DealBanner>): Promise<DealBanner | null> {
    const index = this.banners.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updatedBanner = { ...this.banners[index], ...updates };
    this.banners[index] = updatedBanner;

    // Update in Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('deal_banners')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('SupabaseDealBannerManager: Error updating banner in Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseDealBannerManager: Error updating banner in Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return updatedBanner;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const index = this.banners.findIndex(b => b.id === id);
    if (index === -1) return false;

    this.banners.splice(index, 1);

    // Delete from Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('deal_banners')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('SupabaseDealBannerManager: Error deleting banner from Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseDealBannerManager: Error deleting banner from Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return true;
  }

  getAllBanners(): DealBanner[] {
    return [...this.banners];
  }

  getActiveBanners(): DealBanner[] {
    return this.banners.filter(b => b.active);
  }

  getBannerById(id: string): DealBanner | undefined {
    return this.banners.find(b => b.id === id);
  }

  getCurrentBanner(): DealBanner | null {
    const activeBanners = this.getActiveBanners();
    if (activeBanners.length === 0) return null;
    
    // Return the first active banner (you can implement rotation logic here)
    return activeBanners[0];
  }

  async activateBanner(id: string): Promise<DealBanner | null> {
    return this.updateBanner(id, { active: true });
  }

  async deactivateBanner(id: string): Promise<DealBanner | null> {
    return this.updateBanner(id, { active: false });
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  isLoading(): boolean {
    return this.loading;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async refresh() {
    this.initialized = false;
    await this.initialize();
  }
}

export const supabaseDealBannerManager = new SupabaseDealBannerManager();
