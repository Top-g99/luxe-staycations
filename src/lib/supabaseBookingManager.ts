import { getSupabaseClient, isSupabaseAvailable } from './supabase';

export interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
}

class SupabaseBookingManager {
  private bookings: Booking[] = [];
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
      console.error('SupabaseBookingManager: Error initializing:', error);
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
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SupabaseBookingManager: Error loading from Supabase:', error);
        throw error;
      }

      this.bookings = data || [];
      console.log('SupabaseBookingManager: Loaded bookings from Supabase:', this.bookings.length);
    } catch (error) {
      console.error('SupabaseBookingManager: Failed to load from Supabase, falling back to localStorage:', error);
      await this.loadFromLocalStorage();
    }
  }

  private async loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedBookings = localStorage.getItem('luxeBookings');
      if (savedBookings) {
        try {
          this.bookings = JSON.parse(savedBookings);
          console.log('SupabaseBookingManager: Loaded bookings from localStorage:', this.bookings.length);
        } catch (error) {
          console.error('SupabaseBookingManager: Error parsing saved bookings');
          this.bookings = [];
        }
      } else {
        this.bookings = [];
      }
    } else {
      this.bookings = [];
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeBookings', JSON.stringify(this.bookings));
      console.log('SupabaseBookingManager: Saved bookings to localStorage');
    }
  }

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: crypto.randomUUID(),
      status: 'pending'
    };

    this.bookings.push(newBooking);
    
    // Save to both Supabase and localStorage
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('bookings')
          .insert(newBooking);

        if (error) {
          console.error('SupabaseBookingManager: Error creating booking in Supabase:', error);
        } else {
          console.log('SupabaseBookingManager: Booking created in Supabase');
        }
      } catch (error) {
        console.error('SupabaseBookingManager: Error creating booking in Supabase:', error);
      }
    }
    
    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updatedBooking = { ...this.bookings[index], ...updates };
    this.bookings[index] = updatedBooking;

    // Update in Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('SupabaseBookingManager: Error updating booking in Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseBookingManager: Error updating booking in Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) return false;

    this.bookings.splice(index, 1);

    // Delete from Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('SupabaseBookingManager: Error deleting booking from Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseBookingManager: Error deleting booking from Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return true;
  }

  getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find(b => b.id === id);
  }

  getBookingsByProperty(propertyId: string): Booking[] {
    return this.bookings.filter(b => b.property_id === propertyId);
  }

  getBookingsByEmail(email: string): Booking[] {
    return this.bookings.filter(b => b.guest_email === email);
  }

  getBookingsByStatus(status: Booking['status']): Booking[] {
    return this.bookings.filter(b => b.status === status);
  }

  getPendingBookings(): Booking[] {
    return this.getBookingsByStatus('pending');
  }

  getConfirmedBookings(): Booking[] {
    return this.getBookingsByStatus('confirmed');
  }

  getCancelledBookings(): Booking[] {
    return this.getBookingsByStatus('cancelled');
  }

  getCompletedBookings(): Booking[] {
    return this.getBookingsByStatus('completed');
  }

  async confirmBooking(id: string): Promise<Booking | null> {
    return this.updateBooking(id, { status: 'confirmed' });
  }

  async cancelBooking(id: string): Promise<Booking | null> {
    return this.updateBooking(id, { status: 'cancelled' });
  }

  async completeBooking(id: string): Promise<Booking | null> {
    return this.updateBooking(id, { status: 'completed' });
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

export const supabaseBookingManager = new SupabaseBookingManager();
