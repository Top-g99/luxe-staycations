interface HeroBackground {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

class HeroBackgroundManager {
  private backgrounds: HeroBackground[] = [];
  private subscribers: (() => void)[] = [];
  private currentIndex = 0;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadBackgrounds();
    this.startAutoSlide();
  }

  private loadBackgrounds() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('luxeHeroBackgrounds');
      if (saved) {
        try {
          this.backgrounds = JSON.parse(saved);
          // Sort by order
          this.backgrounds.sort((a, b) => a.order - b.order);
        } catch (error) {
          console.error('Error loading hero backgrounds:', error);
          this.initializeDefaultBackgrounds();
        }
      } else {
        this.initializeDefaultBackgrounds();
      }
    }
  }

  private initializeDefaultBackgrounds() {
    this.backgrounds = [
      {
        id: '1',
        imageUrl: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
        title: 'Ready to Find a Great Villa Deal?',
        subtitle: 'Save up to 25% on your next luxury villa stay',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
        title: 'Luxury Villa Experiences',
        subtitle: 'Discover exclusive villas with premium amenities',
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
        title: 'Perfect Staycations',
        subtitle: 'Create unforgettable memories with family and friends',
        isActive: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.saveBackgrounds();
  }

  private saveBackgrounds() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeHeroBackgrounds', JSON.stringify(this.backgrounds));
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Get all backgrounds (for admin)
  getAllBackgrounds(): HeroBackground[] {
    return [...this.backgrounds];
  }

  // Get active backgrounds (for frontend)
  getActiveBackgrounds(): HeroBackground[] {
    return this.backgrounds.filter(bg => bg.isActive).sort((a, b) => a.order - b.order);
  }

  // Get current background for slider
  getCurrentBackground(): HeroBackground | null {
    const activeBackgrounds = this.getActiveBackgrounds();
    if (activeBackgrounds.length === 0) return null;
    return activeBackgrounds[this.currentIndex % activeBackgrounds.length];
  }

  // Add new background
  addBackground(background: Omit<HeroBackground, 'id' | 'createdAt' | 'updatedAt'>): HeroBackground {
    const newBackground: HeroBackground = {
      ...background,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.backgrounds.push(newBackground);
    this.saveBackgrounds();
    this.notifySubscribers();
    return newBackground;
  }

  // Update background
  updateBackground(id: string, updates: Partial<HeroBackground>): HeroBackground | null {
    const index = this.backgrounds.findIndex(bg => bg.id === id);
    if (index === -1) return null;

    this.backgrounds[index] = {
      ...this.backgrounds[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveBackgrounds();
    this.notifySubscribers();
    return this.backgrounds[index];
  }

  // Delete background
  deleteBackground(id: string): boolean {
    const index = this.backgrounds.findIndex(bg => bg.id === id);
    if (index === -1) return false;

    this.backgrounds.splice(index, 1);
    this.saveBackgrounds();
    this.notifySubscribers();
    return true;
  }

  // Reorder backgrounds
  reorderBackgrounds(orderedIds: string[]): void {
    const newOrder: HeroBackground[] = [];
    
    orderedIds.forEach((id, index) => {
      const background = this.backgrounds.find(bg => bg.id === id);
      if (background) {
        background.order = index + 1;
        newOrder.push(background);
      }
    });

    // Add any remaining backgrounds
    this.backgrounds.forEach(background => {
      if (!orderedIds.includes(background.id)) {
        newOrder.push(background);
      }
    });

    this.backgrounds = newOrder;
    this.saveBackgrounds();
    this.notifySubscribers();
  }

  // Toggle background active status
  toggleBackgroundActive(id: string): boolean {
    const background = this.backgrounds.find(bg => bg.id === id);
    if (!background) return false;

    background.isActive = !background.isActive;
    background.updatedAt = new Date().toISOString();
    this.saveBackgrounds();
    this.notifySubscribers();
    return true;
  }

  // Slider controls
  nextSlide(): void {
    const activeBackgrounds = this.getActiveBackgrounds();
    if (activeBackgrounds.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % activeBackgrounds.length;
      this.notifySubscribers();
    }
  }

  previousSlide(): void {
    const activeBackgrounds = this.getActiveBackgrounds();
    if (activeBackgrounds.length > 1) {
      this.currentIndex = this.currentIndex === 0 
        ? activeBackgrounds.length - 1 
        : this.currentIndex - 1;
      this.notifySubscribers();
    }
  }

  goToSlide(index: number): void {
    const activeBackgrounds = this.getActiveBackgrounds();
    if (index >= 0 && index < activeBackgrounds.length) {
      this.currentIndex = index;
      this.notifySubscribers();
    }
  }

  // Auto-slide functionality
  startAutoSlide(intervalMs: number = 5000): void {
    this.stopAutoSlide();
    this.interval = setInterval(() => {
      this.nextSlide();
    }, intervalMs);
  }

  stopAutoSlide(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Subscription management
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Get slider info
  getSliderInfo(): { currentIndex: number; totalSlides: number } {
    const activeBackgrounds = this.getActiveBackgrounds();
    return {
      currentIndex: this.currentIndex,
      totalSlides: activeBackgrounds.length
    };
  }
}

export const heroBackgroundManager = new HeroBackgroundManager();

