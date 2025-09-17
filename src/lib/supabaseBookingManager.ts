// Minimal Supabase booking manager for admin functionality
export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseBookingManager {
  private static instance: SupabaseBookingManager;
  private bookings: Booking[] = [];

  static getInstance(): SupabaseBookingManager {
    if (!SupabaseBookingManager.instance) {
      SupabaseBookingManager.instance = new SupabaseBookingManager();
    }
    return SupabaseBookingManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Booking[]> {
    return this.bookings;
  }

  async getById(id: string): Promise<Booking | null> {
    return this.bookings.find(b => b.id === id) || null;
  }

  async create(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async update(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings[index] = { ...this.bookings[index], ...updates, updated_at: new Date().toISOString() };
      return this.bookings[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      return true;
    }
    return false;
  }

  get initialized(): boolean {
    return true;
  }

  async getAnalytics(): Promise<any> {
    return {
      totalBookings: this.bookings.length,
      totalRevenue: this.bookings.reduce((sum, booking) => sum + booking.total_amount, 0),
      averageBookingValue: this.bookings.length > 0 ? this.bookings.reduce((sum, booking) => sum + booking.total_amount, 0) / this.bookings.length : 0
    };
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookings;
  }

  async createBooking(bookingData: any): Promise<Booking> {
    const newBooking: Booking = {
      id: Date.now().toString(),
      property_id: bookingData.propertyId || '',
      user_id: bookingData.userId || '',
      check_in: bookingData.checkIn || '',
      check_out: bookingData.checkOut || '',
      guests: bookingData.guests || 1,
      total_amount: bookingData.totalAmount || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings[index] = { ...this.bookings[index], ...updates, updated_at: new Date().toISOString() };
      return this.bookings[index];
    }
    return null;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const supabaseBookingManager = SupabaseBookingManager.getInstance();
