import { supabase, TABLES, Booking, Property } from '../supabaseClient';

export class BookingManager {
  // Get all bookings
  async getAllBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  // Create new booking
  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .insert([booking])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  }

  // Update booking
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      return null;
    }
  }

  // Delete booking
  async deleteBooking(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.BOOKINGS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }

  // Get bookings by status
  async getBookingsByStatus(status: Booking['status']): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      return [];
    }
  }

  // Get bookings by property
  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings by property:', error);
      return [];
    }
  }

  // Get bookings with property details
  async getBookingsWithProperty(): Promise<(Booking & { property: Property })[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select(`
          *,
          property:${TABLES.PROPERTIES}(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings with property:', error);
      return [];
    }
  }

  // Update booking status
  async updateBookingStatus(id: string, status: Booking['status']): Promise<boolean> {
    try {
      const result = await this.updateBooking(id, { status });
      return result !== null;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  }

  // Update payment status
  async updatePaymentStatus(id: string, paymentStatus: Booking['payment_status']): Promise<boolean> {
    try {
      const result = await this.updateBooking(id, { payment_status: paymentStatus });
      return result !== null;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  // Get booking statistics
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    totalRevenue: number;
    averageBookingValue: number;
    monthlyBookings: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*');
      
      if (error) throw error;
      
      const bookings = data || [];
      const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        averageBookingValue: 0,
        monthlyBookings: {} as Record<string, number>
      };
      
      stats.averageBookingValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;
      
      // Group by month
      bookings.forEach(booking => {
        const month = new Date(booking.created_at).toISOString().substring(0, 7);
        stats.monthlyBookings[month] = (stats.monthlyBookings[month] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        monthlyBookings: {}
      };
    }
  }

  // Check property availability
  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending'])
        .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`);
      
      if (error) throw error;
      return (data || []).length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }
}

export const bookingManager = new BookingManager();
