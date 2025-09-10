export interface DealBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string;
  fallbackImageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

class DealBannerManager {
  private dealBanner: DealBanner | null = null;
  private subscribers: (() => void)[] = [];
  private initialized = false;

  initialize() {
    if (this.initialized) return;
    
    if (typeof window !== 'undefined') {
      const savedDealBanner = localStorage.getItem('luxeDealBanner');
      if (savedDealBanner) {
        try {
          const parsed = JSON.parse(savedDealBanner);
          this.dealBanner = {
            ...parsed,
            startDate: new Date(parsed.startDate),
            endDate: new Date(parsed.endDate),
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt)
          };
          console.log('DealBannerManager: Loaded deal banner from localStorage');
        } catch (error) {
          console.error('DealBannerManager: Error parsing saved deal banner, loading default');
          this.loadDefaultDealBanner();
        }
      } else {
        this.loadDefaultDealBanner();
      }
    } else {
      this.loadDefaultDealBanner();
    }
    
    this.initialized = true;
  }

  private loadDefaultDealBanner() {
    this.dealBanner = {
      id: '1',
      title: 'Flash Sale: 25% Off Luxury Villas',
      subtitle: 'Limited Time Offer - Book Now!',
      description: 'Experience luxury at unbeatable prices. Book your dream villa today and save up to 25% on your stay.',
      videoUrl: '', // No hardcoded video URL
      fallbackImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
      buttonText: 'Book Now',
      buttonLink: '/villas?deal=flash-sale',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveToStorage();
    console.log('DealBannerManager: Loaded default deal banner');
  }

  private saveToStorage() {
    if (typeof window !== 'undefined' && this.dealBanner) {
      localStorage.setItem('luxeDealBanner', JSON.stringify(this.dealBanner));
    }
  }

  getDealBanner(): DealBanner | null {
    if (!this.initialized) {
      this.initialize();
    }
    
    // Check if deal banner is still active
    if (this.dealBanner && this.dealBanner.isActive) {
      const now = new Date();
      if (now >= this.dealBanner.startDate && now <= this.dealBanner.endDate) {
        return this.dealBanner;
      } else {
        // Deal has expired, deactivate it
        this.dealBanner.isActive = false;
        this.saveToStorage();
        this.notifySubscribers();
        return null;
      }
    }
    
    return this.dealBanner;
  }

  createDealBanner(dealBannerData: Omit<DealBanner, 'id' | 'createdAt' | 'updatedAt'>): DealBanner {
    if (!this.initialized) {
      this.initialize();
    }

    const newDealBanner: DealBanner = {
      ...dealBannerData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.dealBanner = newDealBanner;
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DealBannerManager: Created new deal banner:', newDealBanner.title);
    return newDealBanner;
  }

  updateDealBanner(updates: Partial<Omit<DealBanner, 'id' | 'createdAt'>>): DealBanner | null {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.dealBanner) {
      console.error('DealBannerManager: No deal banner to update');
      return null;
    }
    
    this.dealBanner = { 
      ...this.dealBanner, 
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DealBannerManager: Updated deal banner:', this.dealBanner.title);
    return this.dealBanner;
  }

  deleteDealBanner(): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.dealBanner) {
      console.error('DealBannerManager: No deal banner to delete');
      return false;
    }
    
    const deletedDealBanner = this.dealBanner;
    this.dealBanner = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxeDealBanner');
    }
    
    this.notifySubscribers();
    
    console.log('DealBannerManager: Deleted deal banner:', deletedDealBanner.title);
    return true;
  }

  activateDealBanner(): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.dealBanner) {
      console.error('DealBannerManager: No deal banner to activate');
      return false;
    }
    
    this.dealBanner.isActive = true;
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DealBannerManager: Activated deal banner:', this.dealBanner.title);
    return true;
  }

  deactivateDealBanner(): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.dealBanner) {
      console.error('DealBannerManager: No deal banner to deactivate');
      return false;
    }
    
    this.dealBanner.isActive = false;
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DealBannerManager: Deactivated deal banner:', this.dealBanner.title);
    return true;
  }

  isDealActive(): boolean {
    const dealBanner = this.getDealBanner();
    return dealBanner !== null && dealBanner.isActive;
  }

  getDealStatus(): { isActive: boolean; daysRemaining: number; isExpired: boolean } {
    const dealBanner = this.getDealBanner();
    
    if (!dealBanner || !dealBanner.isActive) {
      return { isActive: false, daysRemaining: 0, isExpired: true };
    }
    
    const now = new Date();
    const endDate = new Date(dealBanner.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
      isActive: true,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: daysRemaining <= 0
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

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Video and image upload methods
  async uploadVideo(file: File): Promise<string> {
    try {
      // For now, we'll create a local URL for the video
      // In a production environment, you'd upload to a cloud service like AWS S3, Cloudinary, etc.
      const videoUrl = URL.createObjectURL(file);
      console.log('DealBannerManager: Video uploaded, URL created:', videoUrl);
      return videoUrl;
    } catch (error) {
      console.error('DealBannerManager: Error uploading video:', error);
      throw new Error('Failed to upload video');
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      // For now, we'll create a local URL for the image
      // In a production environment, you'd upload to a cloud service like AWS S3, Cloudinary, etc.
      const imageUrl = URL.createObjectURL(file);
      console.log('DealBannerManager: Image uploaded, URL created:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('DealBannerManager: Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Utility methods for video handling
  async validateVideoUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('DealBannerManager: Error validating video URL:', error);
      return false;
    }
  }

  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('DealBannerManager: Error validating image URL:', error);
      return false;
    }
  }

  // Reset to default deal banner
  resetToDefault(): void {
    console.log('DealBannerManager: Resetting to default deal banner');
    this.loadDefaultDealBanner();
    this.notifySubscribers();
  }

  // Clear deal banner completely
  clearDealBanner(): void {
    this.dealBanner = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxeDealBanner');
    }
    this.notifySubscribers();
    console.log('DealBannerManager: Cleared deal banner');
  }

  // Force reload from localStorage (useful for debugging)
  forceReload(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxeDealBanner');
    }
    this.initialized = false;
    this.initialize();
    console.log('DealBannerManager: Force reloaded deal banner');
  }
}

export const dealBannerManager = new DealBannerManager();
