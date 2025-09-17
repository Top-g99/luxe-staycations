// Minimal data manager for admin functionality
export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  type: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  available: boolean;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
}

export interface CallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  specialRequests?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface DealBanner {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  image: string;
  link: string;
  buttonText?: string;
  buttonLink?: string;
  fallbackImageUrl?: string;
  videoUrl?: string;
  discountValue?: number;
  discountType?: string;
  backgroundImageUrl?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  created_at: string;
  updated_at: string;
}

export interface OffersBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImageUrl?: string;
  discountValue?: number;
  discountType?: string;
  couponCode?: string;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  category?: string;
  termsAndConditions?: string;
}

// Mock data
export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Villa 1',
    description: 'Beautiful luxury villa with ocean view',
    price: 500,
    location: 'Goa',
    type: 'villa',
    amenities: ['pool', 'wifi', 'ac'],
    images: ['/images/villa1.jpg'],
    featured: true,
    available: true,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    property_id: '1',
    user_id: '1',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+1234567890',
    checkIn: '2024-01-01',
    checkOut: '2024-01-05',
    guests: 4,
    totalAmount: 2000,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    phone: '+1234567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Simple data manager class
export class DataManager<T> {
  private data: T[] = [];
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<T[]> {
    return this.data;
  }

  async getById(id: string): Promise<T | null> {
    return this.data.find((item: any) => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    this.data.push(item);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      return this.data[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    return false;
  }

  async redeemCoupon(code: string, amount: number, bookingId: string, email?: string, name?: string): Promise<any> {
    console.log('Redeeming coupon:', { code, amount, bookingId, email, name });
    return { success: true, discount: 0 };
  }

  async validateCoupon(code: string, amount: number): Promise<any> {
    console.log('Validating coupon:', { code, amount });
    return { isValid: true, discount: 0, message: 'Coupon is valid' };
  }

  async getFeatured(): Promise<T[]> {
    return this.data.filter((item: any) => item.featured === true);
  }

  async getActive(): Promise<T[]> {
    return this.data.filter((item: any) => item.isActive === true);
  }

  subscribe(callback: () => void): () => void {
    // Mock subscription
    return () => {};
  }

  async initializeAll(): Promise<void> {
    // Mock initialization
    await this.getAll();
  }

  getStats(): { total: number; loading: boolean; initialized: boolean } {
    return {
      total: this.data.length,
      loading: false,
      initialized: true
    };
  }

  async clear(): Promise<void> {
    this.data = [];
  }
}

// Export managers
export const propertyManager = new DataManager<Property>('properties');
export const bookingManager = new DataManager<Booking>('bookings');
export const userManager = new DataManager<User>('users');
export const dealBannerManager = new DataManager<any>('dealBanners');
export const destinationManager = new DataManager<any>('destinations');
export const heroBackgroundManager = new DataManager<any>('heroBackgrounds');
export const dealManager = new DataManager<any>('deals');
export const offersBannerManager = new DataManager<OffersBanner>('offersBanners');
export const callbackManager = new DataManager<CallbackRequest>('callbacks');
export const couponManagerInstance = new DataManager<any>('coupons');
export const masterDataManager = new DataManager<any>('masterData');
