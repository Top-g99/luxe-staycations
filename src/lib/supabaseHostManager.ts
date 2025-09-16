// Minimal Supabase host manager for admin functionality
export interface Host {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: string[];
  status: 'active' | 'inactive';
  memberSince: string;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface HostProperty {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  type?: string;
  status?: string;
  totalBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  pricing?: {
    basePrice: number;
    weekendMultiplier?: number;
    seasonalRates?: any;
  };
  max_guests: number;
  maxGuests?: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostBooking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: string;
  paymentStatus?: string;
  specialRequests?: string;
  created_at: string;
  updated_at: string;
}

export interface HostRevenue {
  id: string;
  property_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface HostNotification {
  id: string;
  host_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export class SupabaseHostManager {
  private static instance: SupabaseHostManager;
  private hosts: Host[] = [];

  static getInstance(): SupabaseHostManager {
    if (!SupabaseHostManager.instance) {
      SupabaseHostManager.instance = new SupabaseHostManager();
    }
    return SupabaseHostManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Host[]> {
    return this.hosts;
  }

  async getById(id: string): Promise<Host | null> {
    return this.hosts.find(h => h.id === id) || null;
  }

  async create(host: Omit<Host, 'id' | 'created_at' | 'updated_at'>): Promise<Host> {
    const newHost: Host = {
      ...host,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.hosts.push(newHost);
    return newHost;
  }

  async update(id: string, updates: Partial<Host>): Promise<Host | null> {
    const index = this.hosts.findIndex(h => h.id === id);
    if (index !== -1) {
      this.hosts[index] = { ...this.hosts[index], ...updates, updated_at: new Date().toISOString() };
      return this.hosts[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.hosts.findIndex(h => h.id === id);
    if (index !== -1) {
      this.hosts.splice(index, 1);
      return true;
    }
    return false;
  }

  async getHostSelfBookings(hostId: string): Promise<HostBooking[]> {
    console.log('Getting host self bookings for:', hostId);
    return [];
  }

  async login(email: string, password: string): Promise<{ success: boolean; host?: Host; error?: string }> {
    // Mock login - in real app, this would authenticate with Supabase
    const host = this.hosts.find(h => h.email === email);
    if (host) {
      return { success: true, host };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  async getHostProperties(hostId: string): Promise<HostProperty[]> {
    // Mock properties - in real app, this would fetch from Supabase
    return [];
  }

  async getHostDashboardStats(hostId: string): Promise<{ totalProperties: number; totalRevenue: number }> {
    return { totalProperties: 0, totalRevenue: 0 };
  }

  async getPropertyBookings(propertyId: string): Promise<HostBooking[]> {
    return [];
  }

  async getHostRevenue(hostId: string, period: string): Promise<HostRevenue[]> {
    return [];
  }

  async updateProperty(propertyId: string, updates: Partial<HostProperty>): Promise<boolean> {
    return true;
  }
}

export const supabaseHostManager = SupabaseHostManager.getInstance();
