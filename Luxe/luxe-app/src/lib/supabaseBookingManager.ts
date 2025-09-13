import { supabase, TABLES, DatabaseBooking } from './supabase';

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  averageBookingValue: number;
  monthlyRevenue: number;
  monthlyBookings: number;
  topProperties: Array<{
    propertyId: string;
    propertyName: string;
    bookingCount: number;
    revenue: number;
  }>;
  recentBookings: Booking[];
}

export class SupabaseBookingManager {
  private static instance: SupabaseBookingManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SupabaseBookingManager {
    if (!SupabaseBookingManager.instance) {
      SupabaseBookingManager.instance = new SupabaseBookingManager();
    }
    return SupabaseBookingManager.instance;
  }

  public get initialized(): boolean {
    return this.isInitialized;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if bookings table exists
      if (supabase) {
        const { data, error } = await supabase.from(TABLES.BOOKINGS).select('id').limit(1);
        
        if (error && error.code === 'PGRST116') {
          console.log('Bookings table does not exist, creating...');
          await this.createBookingsTable();
        }
      }

      this.isInitialized = true;
      console.log('SupabaseBookingManager initialized successfully');
    } catch (error) {
      console.error('Error initializing SupabaseBookingManager:', error);
    }
  }

  private async createBookingsTable(): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.rpc('create_bookings_table');
    if (error) {
      console.error('Error creating bookings table:', error);
    }
  }

  // Convert DatabaseBooking to Booking interface
  private convertToBooking(dbBooking: any): Booking {
    return {
      id: dbBooking.id || dbBooking.booking_id, // Handle both id and booking_id
      guestName: dbBooking.guest_name,
      guestEmail: dbBooking.guest_email,
      guestPhone: dbBooking.guest_phone,
      propertyName: '', // Will be populated from properties table
      propertyId: dbBooking.property_id,
      checkIn: dbBooking.check_in,
      checkOut: dbBooking.check_out,
      guests: dbBooking.guests,
      amount: dbBooking.total_amount,
      status: dbBooking.status,
      paymentStatus: dbBooking.payment_status,
      specialRequests: dbBooking.special_requests,
      createdAt: dbBooking.created_at,
      updatedAt: dbBooking.updated_at
    };
  }

  // Convert Booking to DatabaseBooking interface
  private convertToDatabaseBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      booking_id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique booking ID
      property_id: booking.propertyId,
      guest_name: booking.guestName,
      guest_email: booking.guestEmail,
      guest_phone: booking.guestPhone,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      total_amount: booking.amount,
      status: booking.status,
      payment_status: booking.paymentStatus,
      special_requests: booking.specialRequests
    };
  }

  // Create a new booking
  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking | null> {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      // First, ensure the property exists and get the valid property ID
      const validPropertyId = await this.ensurePropertyExists(bookingData.propertyId, bookingData.propertyName);
      
      // Update booking data with valid property ID
      const updatedBookingData = {
        ...bookingData,
        propertyId: validPropertyId
      };
      
      const dbBooking = this.convertToDatabaseBooking(updatedBookingData);
      
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .insert([dbBooking])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        return null;
      }

      const newBooking = this.convertToBooking(data);
      
      // Trigger email notifications
      await this.triggerBookingEmails(newBooking);
      
      // Update analytics
      await this.updateAnalytics();
      
      console.log('Booking created successfully:', newBooking.id);
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  }

  // Generate a valid UUID for property ID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Ensure property exists in the database
  private async ensurePropertyExists(propertyId: string, propertyName: string): Promise<string> {
    if (!supabase) return propertyId;

    try {
      // If propertyId is not a valid UUID, generate one
      let validPropertyId = propertyId;
      if (!propertyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        validPropertyId = this.generateUUID();
        console.log(`Generated UUID for property: ${validPropertyId}`);
      }

      // Check if property exists
      const { data: existingProperty, error: checkError } = await supabase
        .from(TABLES.PROPERTIES)
        .select('id')
        .eq('id', validPropertyId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Property doesn't exist, create it
        const newProperty = {
          id: validPropertyId,
          name: propertyName || `Property ${validPropertyId.slice(0, 8)}`,
          description: 'Auto-created property for booking',
          price: 10000,
          location: 'Location TBD',
          type: 'villa',
          amenities: ['wifi', 'parking'],
          images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
          featured: false,
          available: true,
          max_guests: 4,
          bedrooms: 2,
          bathrooms: 2
        };

        const { error: insertError } = await supabase
          .from(TABLES.PROPERTIES)
          .insert([newProperty]);

        if (insertError) {
          console.error('Error creating property:', insertError);
        } else {
          console.log('Property created for booking:', validPropertyId);
        }
      }

      return validPropertyId;
    } catch (error) {
      console.error('Error ensuring property exists:', error);
      return propertyId;
    }
  }

  // Get all bookings
  public async getAllBookings(): Promise<Booking[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }

      return data.map(booking => this.convertToBooking(booking));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  // Get booking by ID
  public async getBookingById(id: string): Promise<Booking | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
        return null;
      }

      return this.convertToBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  // Update booking
  public async updateBooking(id: string, updates: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Booking | null> {
    if (!supabase) return null;

    try {
      const updateData: any = {};
      
      if (updates.guestName) updateData.guest_name = updates.guestName;
      if (updates.guestEmail) updateData.guest_email = updates.guestEmail;
      if (updates.guestPhone) updateData.guest_phone = updates.guestPhone;
      if (updates.propertyId) updateData.property_id = updates.propertyId;
      if (updates.checkIn) updateData.check_in = updates.checkIn;
      if (updates.checkOut) updateData.check_out = updates.checkOut;
      if (updates.guests) updateData.guests = updates.guests;
      if (updates.amount) updateData.total_amount = updates.amount;
      if (updates.status) updateData.status = updates.status;
      if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus;
      if (updates.specialRequests) updateData.special_requests = updates.specialRequests;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        return null;
      }

      const updatedBooking = this.convertToBooking(data);
      
      // Trigger email notifications for status changes
      if (updates.status) {
        await this.triggerBookingEmails(updatedBooking);
      }
      
      // Update analytics
      await this.updateAnalytics();
      
      return updatedBooking;
    } catch (error) {
      console.error('Error updating booking:', error);
      return null;
    }
  }

  // Delete booking
  public async deleteBooking(id: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from(TABLES.BOOKINGS)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        return false;
      }

      // Update analytics
      await this.updateAnalytics();
      
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }

  // Get analytics data
  public async getAnalytics(): Promise<BookingAnalytics> {
    if (!supabase) {
      return this.getDefaultAnalytics();
    }

    try {
      const { data: bookings, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*');

      if (error) {
        console.error('Error fetching analytics data:', error);
        return this.getDefaultAnalytics();
      }

      const bookingList = bookings.map(booking => this.convertToBooking(booking));
      
      // Calculate analytics
      const totalBookings = bookingList.length;
      const totalRevenue = bookingList.reduce((sum, booking) => sum + booking.amount, 0);
      const confirmedBookings = bookingList.filter(b => b.status === 'confirmed').length;
      const pendingBookings = bookingList.filter(b => b.status === 'pending').length;
      const cancelledBookings = bookingList.filter(b => b.status === 'cancelled').length;
      const completedBookings = bookingList.filter(b => b.status === 'completed').length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Monthly data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyBookings = bookingList.filter(b => 
        new Date(b.createdAt) >= thirtyDaysAgo
      );
      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.amount, 0);

      // Top properties
      const propertyStats = new Map<string, { name: string; count: number; revenue: number }>();
      bookingList.forEach(booking => {
        const existing = propertyStats.get(booking.propertyId) || { name: booking.propertyName, count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += booking.amount;
        propertyStats.set(booking.propertyId, existing);
      });

      const topProperties = Array.from(propertyStats.entries())
        .map(([propertyId, stats]) => ({
          propertyId,
          propertyName: stats.name,
          bookingCount: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);

      return {
        totalBookings,
        totalRevenue,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        completedBookings,
        averageBookingValue,
        monthlyRevenue,
        monthlyBookings: monthlyBookings.length,
        topProperties,
        recentBookings: bookingList.slice(0, 10)
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  private getDefaultAnalytics(): BookingAnalytics {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      completedBookings: 0,
      averageBookingValue: 0,
      monthlyRevenue: 0,
      monthlyBookings: 0,
      topProperties: [],
      recentBookings: []
    };
  }

  // Trigger email notifications for booking events
  private async triggerBookingEmails(booking: Booking): Promise<void> {
    try {
      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./emailService');
      
      if (booking.status === 'confirmed') {
        // Send booking confirmation email
        // Use delivery tracking service for better monitoring
        const { emailDeliveryService } = await import('./emailDeliveryService');
        await emailDeliveryService.sendBookingConfirmationWithTracking({
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          bookingId: booking.id,
          propertyName: booking.propertyName,
          propertyLocation: 'Luxe Staycations',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests.toString(),
          totalAmount: booking.amount,
          transactionId: `TXN-${booking.id}`,
          paymentMethod: 'Online Payment',
          hostName: 'Luxe Staycations Team',
          hostPhone: '+91-9876543210',
          hostEmail: 'info@luxestaycations.in',
          specialRequests: booking.specialRequests
        });
      } else if (booking.status === 'cancelled') {
        // Send cancellation email
        // Use delivery tracking service for better monitoring
        const { emailDeliveryService } = await import('./emailDeliveryService');
        await emailDeliveryService.sendBookingCancellationWithTracking({
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          bookingId: booking.id,
          propertyName: booking.propertyName,
          propertyAddress: 'Luxe Staycations',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          totalAmount: booking.amount,
          cancellationReason: 'Guest request',
          refundAmount: booking.amount,
          refundMethod: 'Original payment method',
          refundTimeline: '5-7 business days',
          hostName: 'Luxe Staycations Team',
          hostPhone: '+91-9876543210',
          hostEmail: 'info@luxestaycations.in'
        });
      }
    } catch (error) {
      console.error('Error sending booking emails:', error);
    }
  }

  // Update analytics in real-time
  private async updateAnalytics(): Promise<void> {
    try {
      // This could trigger real-time updates to admin dashboard
      // For now, we'll just log the update
      console.log('Analytics updated');
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }
}

// Create singleton instance
export const supabaseBookingManager = SupabaseBookingManager.getInstance();