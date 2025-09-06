import { createClient } from '@supabase/supabase-js';

// Types for different data entities
export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  maxGuests: number;
  amenities: string[];
  image: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  attractions: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'contacted' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface DealBanner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  videoUrl?: string;
  fallbackImageUrl: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'host';
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  preferences?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  description: string;
  booking_id?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  request_type: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface HeroBackground {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  alt_text?: string;
  active: boolean;
  priority: number;
  link?: string;
  link_text?: string;
  start_date?: string;
  end_date?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic data manager class
export class DataManager<T> {
  private supabase: any;
  private tableName: string;
  private useLocalStorage: boolean = false;
  private subscribers: Set<() => void> = new Set();
  private data: T[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
    // Don't set useLocalStorage here - we'll check it dynamically at runtime
    this.initializeSupabase();
  }

  private shouldUseLocalStorage(): boolean {
    return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';
  }

  private initializeSupabase() {
    if (typeof window !== 'undefined' && !this.shouldUseLocalStorage()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.shouldUseLocalStorage()) {
      this.loadFromLocalStorage();
    } else if (this.supabase) {
      await this.loadFromSupabase();
    }
  }

  private loadFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`luxe_${this.tableName}`);
      if (stored) {
        try {
          this.data = JSON.parse(stored);
        } catch (error) {
          console.error(`Error loading ${this.tableName} from localStorage:`, error);
          this.data = [];
        }
      }
    }
  }

  private async loadFromSupabase(): Promise<void> {
    if (!this.supabase) return;

    try {
      // First check if the table exists
      const { error: tableCheckError } = await this.supabase
        .from(this.tableName)
        .select('id')
        .limit(1);

      if (tableCheckError) {
        // Table doesn't exist or has permission issues
        console.warn(`Table ${this.tableName} not found or inaccessible in Supabase. Using localStorage fallback.`);
        this.loadFromLocalStorage();
        return;
      }

      // Table exists, try to load data
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.warn(`Error loading ${this.tableName} from Supabase:`, error.message || error);
        this.loadFromLocalStorage(); // Fallback to localStorage
      } else {
        this.data = data || [];
        this.saveToLocalStorage(); // Backup to localStorage
      }
    } catch (error) {
      console.warn(`Error loading ${this.tableName} from Supabase:`, error);
      this.loadFromLocalStorage(); // Fallback to localStorage
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`luxe_${this.tableName}`, JSON.stringify(this.data));
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // CRUD Operations
  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T;

    if (this.shouldUseLocalStorage() || !this.supabase) {
      this.data.unshift(newItem);
      this.saveToLocalStorage();
    } else {
      try {
        // Check if table exists first
        const { error: tableCheckError } = await this.supabase
          .from(this.tableName)
          .select('id')
          .limit(1);

        if (tableCheckError) {
          console.warn(`Table ${this.tableName} not available. Using localStorage fallback.`);
          this.data.unshift(newItem);
          this.saveToLocalStorage();
        } else {
          const { data, error } = await this.supabase
            .from(this.tableName)
            .insert(newItem)
            .select()
            .single();

          if (error) {
            console.warn(`Error creating ${this.tableName}:`, error.message || error);
            // Fallback to localStorage
            this.data.unshift(newItem);
            this.saveToLocalStorage();
          } else {
            this.data.unshift(data);
            this.saveToLocalStorage();
          }
        }
      } catch (error) {
        console.warn(`Error creating ${this.tableName}:`, error);
        // Fallback to localStorage
        this.data.unshift(newItem);
        this.saveToLocalStorage();
      }
    }

    this.notifySubscribers();
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const index = this.data.findIndex(item => (item as any).id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...this.data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as T;

    if (this.shouldUseLocalStorage() || !this.supabase) {
      this.data[index] = updatedItem;
      this.saveToLocalStorage();
    } else {
      try {
        // Check if table exists first
        const { error: tableCheckError } = await this.supabase
          .from(this.tableName)
          .select('id')
          .limit(1);

        if (tableCheckError) {
          console.warn(`Table ${this.tableName} not available. Using localStorage fallback.`);
          this.data[index] = updatedItem;
          this.saveToLocalStorage();
        } else {
          const { data, error } = await this.supabase
            .from(this.tableName)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.warn(`Error updating ${this.tableName}:`, error.message || error);
            // Fallback to localStorage
            this.data[index] = updatedItem;
            this.saveToLocalStorage();
          } else {
            this.data[index] = data;
            this.saveToLocalStorage();
          }
        }
      } catch (error) {
        console.warn(`Error updating ${this.tableName}:`, error);
        // Fallback to localStorage
        this.data[index] = updatedItem;
        this.saveToLocalStorage();
      }
    }

    this.notifySubscribers();
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex(item => (item as any).id === id);
    if (index === -1) return false;

    if (this.shouldUseLocalStorage() || !this.supabase) {
      this.data.splice(index, 1);
      this.saveToLocalStorage();
    } else {
      try {
        // Check if table exists first
        const { error: tableCheckError } = await this.supabase
          .from(this.tableName)
          .select('id')
          .limit(1);

        if (tableCheckError) {
          console.warn(`Table ${this.tableName} not available. Using localStorage fallback.`);
          this.data.splice(index, 1);
          this.saveToLocalStorage();
        } else {
          const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

          if (error) {
            console.warn(`Error deleting ${this.tableName}:`, error.message || error);
            // Fallback to localStorage
            this.data.splice(index, 1);
            this.saveToLocalStorage();
          } else {
            this.data.splice(index, 1);
            this.saveToLocalStorage();
          }
        }
      } catch (error) {
        console.warn(`Error deleting ${this.tableName}:`, error);
        // Fallback to localStorage
        this.data.splice(index, 1);
        this.saveToLocalStorage();
      }
    }

    this.notifySubscribers();
    return true;
  }

  // Query Operations
  getAll(): T[] {
    return [...this.data];
  }

  getById(id: string): T | null {
    return this.data.find(item => (item as any).id === id) || null;
  }

  getByField(field: keyof T, value: any): T[] {
    return this.data.filter(item => (item as any)[field] === value);
  }

  getFeatured(): T[] {
    return this.data.filter(item => (item as any).featured === true);
  }

  getActive(): T[] {
    return this.data.filter(item => (item as any).active !== false);
  }

  search(query: string, fields: (keyof T)[]): T[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.filter(item => 
      fields.some(field => {
        const value = (item as any)[field];
        return value && value.toString().toLowerCase().includes(lowercaseQuery);
      })
    );
  }

  // Pagination
  getPaginated(page: number = 1, limit: number = 10): { data: T[], total: number, page: number, totalPages: number } {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = this.data.slice(start, end);
    
    return {
      data: paginatedData,
      total: this.data.length,
      page,
      totalPages: Math.ceil(this.data.length / limit)
    };
  }

  // Statistics
  getStats(): { total: number, active: number, featured: number } {
    return {
      total: this.data.length,
      active: this.data.filter(item => (item as any).active !== false).length,
      featured: this.data.filter(item => (item as any).featured === true).length
    };
  }

  // Subscription
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Utility
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Bulk Operations
  async bulkCreate(items: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const newItems = items.map(item => ({
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) as T[];

    if (this.shouldUseLocalStorage() || !this.supabase) {
      this.data.unshift(...newItems);
      this.saveToLocalStorage();
    } else {
      try {
        // Check if table exists first
        const { error: tableCheckError } = await this.supabase
          .from(this.tableName)
          .select('id')
          .limit(1);

        if (tableCheckError) {
          console.warn(`Table ${this.tableName} not available. Using localStorage fallback.`);
          this.data.unshift(...newItems);
          this.saveToLocalStorage();
        } else {
          const { data, error } = await this.supabase
            .from(this.tableName)
            .insert(newItems)
            .select();

          if (error) {
            console.warn(`Error bulk creating ${this.tableName}:`, error.message || error);
            // Fallback to localStorage
            this.data.unshift(...newItems);
            this.saveToLocalStorage();
          } else {
            this.data.unshift(...(data || []));
            this.saveToLocalStorage();
          }
        }
      } catch (error) {
        console.warn(`Error bulk creating ${this.tableName}:`, error);
        // Fallback to localStorage
        this.data.unshift(...newItems);
        this.saveToLocalStorage();
      }
    }

    this.notifySubscribers();
    return newItems;
  }

  async bulkUpdate(updates: { id: string; updates: Partial<T> }[]): Promise<T[]> {
    const updatedItems: T[] = [];

    for (const { id, updates: itemUpdates } of updates) {
      const updated = await this.update(id, itemUpdates);
      if (updated) updatedItems.push(updated);
    }

    return updatedItems;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    let deletedCount = 0;

    for (const id of ids) {
      const deleted = await this.delete(id);
      if (deleted) deletedCount++;
    }

    return deletedCount;
  }

  // Export/Import
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      if (Array.isArray(importedData)) {
        this.data = importedData;
        this.saveToLocalStorage();
        this.notifySubscribers();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error importing ${this.tableName} data:`, error);
      return false;
    }
  }

  // Clear all data
  clear(): void {
    this.data = [];
    this.saveToLocalStorage();
    this.notifySubscribers();
  }
}

// Sample tourist destinations data
const sampleDestinations: Destination[] = [
  {
    id: 'malpe-maharashtra',
    name: 'Malpe, Maharashtra',
    description: 'Pristine beaches and coastal charm await in this serene coastal town. Experience the perfect blend of tranquility and adventure with golden sands, clear waters, and stunning sunsets.',
    image: '/images/destinations/malpe-maharashtra.jpg',
    location: 'Maharashtra, India',
    attractions: ['Malpe Beach', 'St. Mary\'s Island', 'Udupi Temple', 'Water Sports', 'Seafood Delicacies'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lonavala-maharashtra',
    name: 'Lonavala, Maharashtra',
    description: 'Nestled in the Western Ghats, this hill station offers breathtaking views, ancient caves, and refreshing waterfalls. Perfect for nature lovers and adventure seekers.',
    image: '/images/destinations/lonavala-maharashtra.jpg',
    location: 'Maharashtra, India',
    attractions: ['Tiger\'s Leap', 'Karla Caves', 'Bhaja Caves', 'Lonavala Lake', 'Trekking Trails'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mahabaleshwar-maharashtra',
    name: 'Mahabaleshwar, Maharashtra',
    description: 'Queen of Hill Stations offers panoramic views, strawberry farms, and colonial charm. Experience the cool mountain air and scenic beauty of the Western Ghats.',
    image: '/images/destinations/mahabaleshwar-maharashtra.jpg',
    location: 'Maharashtra, India',
    attractions: ['Wilson Point', 'Mapro Garden', 'Venna Lake', 'Strawberry Farms', 'Scenic Points'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goa-beaches',
    name: 'Goa Beaches',
    description: 'Famous for its pristine beaches, vibrant culture, and Portuguese heritage. From party beaches to secluded coves, Goa offers something for every traveler.',
    image: '/images/destinations/goa-beaches.jpg',
    location: 'Goa, India',
    attractions: ['Calangute Beach', 'Baga Beach', 'Anjuna Beach', 'Old Goa Churches', 'Portuguese Architecture'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters',
    description: 'Experience the serene beauty of Kerala\'s backwaters with houseboat cruises, lush greenery, and traditional village life. A perfect escape into nature.',
    image: '/images/destinations/kerala-backwaters.jpg',
    location: 'Kerala, India',
    attractions: ['Alleppey Backwaters', 'Kumarakom', 'Vembanad Lake', 'Houseboat Cruises', 'Ayurvedic Spas'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'udaipur-rajasthan',
    name: 'Udaipur, Rajasthan',
    description: 'The City of Lakes offers royal heritage, stunning palaces, and romantic boat rides. Experience the magic of Rajasthan\'s most beautiful city.',
    image: '/images/destinations/udaipur-rajasthan.jpg',
    location: 'Rajasthan, India',
    attractions: ['Lake Palace', 'City Palace', 'Jag Mandir', 'Fateh Sagar Lake', 'Royal Heritage'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'manali-himachal',
    name: 'Manali, Himachal Pradesh',
    description: 'Adventure capital of India with snow-capped mountains, apple orchards, and thrilling activities. Perfect for both relaxation and adventure.',
    image: '/images/destinations/manali-himachal.jpg',
    location: 'Himachal Pradesh, India',
    attractions: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Apple Orchards', 'Adventure Sports'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shimla-himachal',
    name: 'Shimla, Himachal Pradesh',
    description: 'Queen of Hills offers colonial architecture, scenic beauty, and pleasant weather. Experience the charm of British-era hill stations.',
    image: '/images/destinations/shimla-himachal.jpg',
    location: 'Himachal Pradesh, India',
    attractions: ['The Ridge', 'Christ Church', 'Jakhu Temple', 'Mall Road', 'Colonial Architecture'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'darjeeling-west-bengal',
    name: 'Darjeeling, West Bengal',
    description: 'Famous for its tea gardens, toy train, and views of Kanchenjunga. Experience the charm of the Himalayan foothills.',
    image: '/images/destinations/darjeeling-west-bengal.jpg',
    location: 'West Bengal, India',
    attractions: ['Tiger Hill', 'Darjeeling Toy Train', 'Tea Gardens', 'Kanchenjunga Views', 'Colonial Charm'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'varanasi-uttar-pradesh',
    name: 'Varanasi, Uttar Pradesh',
    description: 'Spiritual capital of India with ancient temples, Ganga ghats, and cultural heritage. Experience the essence of Indian spirituality.',
    image: '/images/destinations/varanasi-uttar-pradesh.jpg',
    location: 'Uttar Pradesh, India',
    attractions: ['Ganga Ghats', 'Kashi Vishwanath Temple', 'Ganga Aarti', 'Ancient Temples', 'Spiritual Heritage'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'agra-uttar-pradesh',
    name: 'Agra, Uttar Pradesh',
    description: 'Home to the iconic Taj Mahal, a symbol of eternal love. Experience the grandeur of Mughal architecture and history.',
    image: '/images/destinations/agra-uttar-pradesh.jpg',
    location: 'Uttar Pradesh, India',
    attractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Itmad-ud-Daula', 'Mughal Architecture'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jaisalmer-rajasthan',
    name: 'Jaisalmer, Rajasthan',
    description: 'Golden City in the Thar Desert offers stunning sand dunes, ancient forts, and camel safaris. Experience the magic of the desert.',
    image: '/images/destinations/jaisalmer-rajasthan.jpg',
    location: 'Rajasthan, India',
    attractions: ['Jaisalmer Fort', 'Sam Sand Dunes', 'Camel Safari', 'Golden Architecture', 'Desert Culture'],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Specific data managers
export const propertyManager = new DataManager<Property>('properties');
export const destinationManager = new DataManager<Destination>('destinations');
export const bookingManager = new DataManager<Booking>('bookings');
export const callbackManager = new DataManager<CallbackRequest>('callback_requests');
export const dealBannerManager = new DataManager<DealBanner>('deal_banners');
export const heroBackgroundManager = new DataManager<HeroBackground>('hero_backgrounds');
export const settingsManager = new DataManager<Settings>('settings');
export const userManager = new DataManager<User>('users');
export const profileManager = new DataManager<Profile>('profiles');
export const reviewManager = new DataManager<Review>('reviews');
export const paymentManager = new DataManager<Payment>('payments');
export const loyaltyManager = new DataManager<LoyaltyTransaction>('loyalty_transactions');
export const couponManager = new DataManager<Coupon>('coupons');
export const specialRequestManager = new DataManager<SpecialRequest>('special_requests');

// Master data manager for coordinating all managers
export class MasterDataManager {
  private managers: Map<string, DataManager<any>> = new Map();

  constructor() {
    this.managers.set('properties', propertyManager);
    this.managers.set('destinations', destinationManager);
    this.managers.set('bookings', bookingManager);
    this.managers.set('callback_requests', callbackManager);
    this.managers.set('deal_banners', dealBannerManager);
    this.managers.set('hero_backgrounds', heroBackgroundManager);
    this.managers.set('settings', settingsManager);
    this.managers.set('users', userManager);
    this.managers.set('profiles', profileManager);
    this.managers.set('reviews', reviewManager);
    this.managers.set('payments', paymentManager);
    this.managers.set('loyalty_transactions', loyaltyManager);
    this.managers.set('coupons', couponManager);
    this.managers.set('special_requests', specialRequestManager);
  }

  async initializeAll(): Promise<void> {
    const promises = Array.from(this.managers.values()).map(manager => manager.initialize());
    await Promise.all(promises);
  }

  getManager<T>(tableName: string): DataManager<T> | null {
    return this.managers.get(tableName) || null;
  }

  getAllManagers(): Map<string, DataManager<any>> {
    return this.managers;
  }

  async exportAllData(): Promise<Record<string, any[]>> {
    const exportData: Record<string, any[]> = {};
    
    for (const [tableName, manager] of this.managers) {
      exportData[tableName] = manager.getAll();
    }
    
    return exportData;
  }

  async importAllData(data: Record<string, any[]>): Promise<boolean> {
    try {
      for (const [tableName, items] of Object.entries(data)) {
        const manager = this.managers.get(tableName);
        if (manager && Array.isArray(items)) {
          manager.clear();
          if (items.length > 0) {
            await manager.bulkCreate(items);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error importing all data:', error);
      return false;
    }
  }

  getStats(): Record<string, { total: number; active: number; featured: number }> {
    const stats: Record<string, { total: number; active: number; featured: number }> = {};
    
    for (const [tableName, manager] of this.managers) {
      stats[tableName] = manager.getStats();
    }
    
    return stats;
  }

  subscribeToAll(callback: (tableName: string) => void): () => void {
    const unsubscribers: (() => void)[] = [];
    
    for (const [tableName, manager] of this.managers) {
      const unsubscribe = manager.subscribe(() => callback(tableName));
      unsubscribers.push(unsubscribe);
    }
    
    return () => unsubscribers.forEach(unsub => unsub());
  }
}

// Export the master data manager instance
export const masterDataManager = new MasterDataManager();
