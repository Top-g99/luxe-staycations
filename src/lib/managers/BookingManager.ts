import { supabase, TABLES, Booking } from '@/lib/supabaseClient';

export class BookingManager {
  constructor() {
    // Initialization if needed
  }

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

  async getBooking(id: string): Promise<Booking | null> {
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

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .update({ ...booking, updated_at: new Date().toISOString() })
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

  async getBookingStats(): Promise<{ total: number; pending: number; confirmed: number; cancelled: number; completed: number; totalRevenue: number; averageBookingValue: number; monthlyBookings: Record<string, number> }> {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*', { count: 'exact', head: true });
      if (totalError) throw totalError;

      const { count: confirmedCount, error: confirmedError } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');
      if (confirmedError) throw confirmedError;

      const { count: pendingCount, error: pendingError } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (pendingError) throw pendingError;

      const { count: cancelledCount, error: cancelledError } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');
      if (cancelledError) throw cancelledError;

      const { count: completedCount, error: completedError } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      if (completedError) throw completedError;

      // Get revenue data
      const { data: bookingData, error: revenueError } = await supabase
        .from(TABLES.BOOKINGS)
        .select('total_amount, created_at')
        .eq('status', 'confirmed');
      if (revenueError) throw revenueError;

      const totalRevenue = bookingData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const averageBookingValue = bookingData?.length ? totalRevenue / bookingData.length : 0;

      // Get monthly bookings
      const monthlyBookings: Record<string, number> = {};
      bookingData?.forEach(booking => {
        if (booking.created_at) {
          const month = new Date(booking.created_at).toISOString().substring(0, 7); // YYYY-MM
          monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
        }
      });

      return {
        total: totalCount || 0,
        pending: pendingCount || 0,
        confirmed: confirmedCount || 0,
        cancelled: cancelledCount || 0,
        completed: completedCount || 0,
        totalRevenue,
        averageBookingValue,
        monthlyBookings
      };
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

  async getRecentBookings(limit: number = 5): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  }

  async getBookingsWithProperty(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select(`
          *,
          property:properties(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings with property:', error);
      return [];
    }
  }
}

export const bookingManager = new BookingManager();