import { getSupabaseClient } from './supabase';

// Initialize Supabase client
const supabase = getSupabaseClient();

export interface HostProperty {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  description?: string;
  amenities: string[];
  pricing: {
    basePrice: number;
    weekendPrice: number;
    seasonalRates: Record<string, number>;
  };
  images: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Host {
  id: string;
  name: string;
  email: string;
  phone?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  memberSince: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostBooking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingDate: string;
  specialRequests?: string;
  isSelfBooking?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostRevenue {
  id: string;
  hostId: string;
  propertyId?: string;
  bookingId?: string;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  revenueType: 'booking' | 'commission' | 'bonus' | 'refund';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodDate: string;
  createdAt: string;
}

export interface HostNotification {
  id: string;
  hostId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export class SupabaseHostManager {
  private supabase = supabase;

  // Host Authentication
  async login(email: string, password: string): Promise<{ success: boolean; host?: Host; error?: string }> {
    try {
      // For demo purposes, we'll use a simple email check
      // In production, you'd implement proper password hashing and verification
      const { data: hosts, error } = await this.supabase
        .from('hosts')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !hosts) {
        return { success: false, error: 'Invalid credentials' };
      }

      // In production, verify password hash here
      // For demo, accept any password
      return { success: true, host: this.transformHostData(hosts) };
    } catch (error) {
      console.error('Host login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async getHostById(hostId: string): Promise<Host | null> {
    try {
      const { data, error } = await this.supabase
        .from('hosts')
        .select('*')
        .eq('id', hostId)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;
      return this.transformHostData(data);
    } catch (error) {
      console.error('Error fetching host:', error);
      return null;
    }
  }

  // Host Properties
  async getHostProperties(hostId: string): Promise<HostProperty[]> {
    try {
      const { data, error } = await this.supabase
        .from('host_properties')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching host properties:', error);
        return [];
      }

      return data.map(this.transformPropertyData);
    } catch (error) {
      console.error('Error fetching host properties:', error);
      return [];
    }
  }

  async getPropertyById(propertyId: string): Promise<HostProperty | null> {
    try {
      const { data, error } = await this.supabase
        .from('host_properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error || !data) return null;
      return this.transformPropertyData(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  async updateProperty(propertyId: string, updates: Partial<HostProperty>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('host_properties')
        .update(this.transformPropertyForUpdate(updates))
        .eq('id', propertyId);

      if (error) {
        console.error('Error updating property:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      return false;
    }
  }

  async createProperty(hostId: string, propertyData: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('host_properties')
        .insert([{
          host_id: hostId,
          name: propertyData.name,
          location: propertyData.location,
          type: propertyData.type,
          status: propertyData.status,
          description: propertyData.description,
          amenities: propertyData.amenities,
          pricing: propertyData.pricing,
          images: propertyData.images,
          max_guests: propertyData.maxGuests,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          is_featured: propertyData.isFeatured
        }])
        .select('id')
        .single();

      if (error || !data) {
        console.error('Error creating property:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating property:', error);
      return null;
    }
  }

  // Host Bookings
  async getHostBookings(hostId: string): Promise<HostBooking[]> {
    try {
      const { data, error } = await this.supabase
        .from('host_bookings')
        .select(`
          *,
          host_properties!inner(host_id)
        `)
        .eq('host_properties.host_id', hostId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching host bookings:', error);
        return [];
      }

      return data.map(this.transformBookingData);
    } catch (error) {
      console.error('Error fetching host bookings:', error);
      return [];
    }
  }

  async getPropertyBookings(propertyId: string): Promise<HostBooking[]> {
    try {
      const { data, error } = await this.supabase
        .from('host_bookings')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching property bookings:', error);
        return [];
      }

      return data.map(this.transformBookingData);
    } catch (error) {
      console.error('Error fetching property bookings:', error);
      return [];
    }
  }

  // Host Revenue
  async getHostRevenue(hostId: string, period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<HostRevenue[]> {
    try {
      let query = this.supabase
        .from('host_revenue')
        .select('*')
        .eq('host_id', hostId);

      if (period !== 'all') {
        query = query.eq('period', period);
      }

      const { data, error } = await query.order('period_date', { ascending: false });

      if (error) {
        console.error('Error fetching host revenue:', error);
        return [];
      }

      return data.map(this.transformRevenueData);
    } catch (error) {
      console.error('Error fetching host revenue:', error);
      return [];
    }
  }

  // Host Notifications
  async getHostNotifications(hostId: string): Promise<HostNotification[]> {
    try {
      const { data, error } = await this.supabase
        .from('host_notifications')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching host notifications:', error);
        return [];
      }

      return data.map(this.transformNotificationData);
    } catch (error) {
      console.error('Error fetching host notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('host_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Dashboard Statistics
  async getHostDashboardStats(hostId: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  }> {
    try {
      const [properties, bookings, revenue] = await Promise.all([
        this.getHostProperties(hostId),
        this.getHostBookings(hostId),
        this.getHostRevenue(hostId, 'all')
      ]);

      const totalProperties = properties.length;
      const activeProperties = properties.filter(p => p.status === 'active').length;
      const totalBookings = bookings.length;
      const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
      const averageRating = properties.length > 0 
        ? properties.reduce((sum, p) => sum + p.averageRating, 0) / properties.length 
        : 0;

      return {
        totalProperties,
        activeProperties,
        totalBookings,
        totalRevenue,
        averageRating
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalProperties: 0,
        activeProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    }
  }

  // Admin Methods for Host Management
  async getAllHosts(): Promise<Host[]> {
    try {
      const { data, error } = await this.supabase
        .from('hosts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all hosts:', error);
        return [];
      }

      return data.map(this.transformHostData);
    } catch (error) {
      console.error('Error fetching all hosts:', error);
      return [];
    }
  }

  async getAllOwnerBookings(): Promise<HostBooking[]> {
    try {
      const { data, error } = await this.supabase
        .from('host_bookings')
        .select(`
          *,
          host_properties!inner(
            id,
            name,
            host_id,
            hosts!inner(
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all owner bookings:', error);
        return [];
      }

      return data.map((booking: any) => ({
        ...this.transformBookingData(booking),
        propertyName: booking.host_properties?.name || 'Unknown Property',
        hostName: booking.host_properties?.hosts?.name || 'Unknown Host'
      }));
    } catch (error) {
      console.error('Error fetching all owner bookings:', error);
      return [];
    }
  }

  async getHostSelfBookings(hostId: string): Promise<HostBooking[]> {
    try {
      console.log('Fetching self-bookings for host:', hostId);
      
      // Direct approach: try to query the host_bookings table
      console.log('Attempting to query host_bookings table directly...');
      
      // First, try to fetch all bookings to see if the table is accessible
      const { data: allBookings, error: allBookingsError } = await this.supabase
        .from('host_bookings')
        .select('*')
        .limit(5);

      if (allBookingsError) {
        console.error('Error fetching all bookings:', allBookingsError);
        console.error('Error details:', {
          message: allBookingsError.message,
          details: allBookingsError.details,
          hint: allBookingsError.hint,
          code: allBookingsError.code
        });
        return [];
      }

      console.log('Successfully accessed host_bookings table');
      console.log('Sample of all bookings:', allBookings);

      // Now try to fetch bookings for the specific host
      // First, get the host's properties
      const { data: hostProperties, error: propertiesError } = await this.supabase
        .from('host_properties')
        .select('id')
        .eq('host_id', hostId);

      if (propertiesError) {
        console.error('Error fetching host properties:', propertiesError);
        return [];
      }

      console.log('Host properties:', hostProperties);

      if (!hostProperties || hostProperties.length === 0) {
        console.log('No properties found for this host');
        return [];
      }

      // Get property IDs
      const propertyIds = hostProperties.map((prop: any) => prop.id);
      console.log('Property IDs to search:', propertyIds);

      // Now fetch bookings for these properties
      const { data, error } = await this.supabase
        .from('host_bookings')
        .select('*')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching host-specific bookings:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }

      console.log('Found bookings for host:', data);
      
      // Filter for self-bookings if the column exists, otherwise return all
      const selfBookings = data.filter((booking: any) => {
        if (booking.is_self_booking !== undefined) {
          return booking.is_self_booking === true;
        }
        // If column doesn't exist, return all bookings for now
        return true;
      });

      console.log('Filtered self-bookings:', selfBookings);
      
      return selfBookings.map(this.transformBookingData);
    } catch (error) {
      console.error('Error fetching host self-bookings:', error);
      console.error('Full error object:', error);
      return [];
    }
  }

  async createHost(hostData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    verificationStatus?: 'pending' | 'verified' | 'unverified';
    isActive?: boolean;
  }): Promise<{ success: boolean; hostId?: string; error?: string }> {
    try {
      // Check if email already exists
      const { data: existingHost } = await this.supabase
        .from('hosts')
        .select('id')
        .eq('email', hostData.email)
        .single();

      if (existingHost) {
        return { success: false, error: 'Email already exists' };
      }

      // In production, you'd hash the password here
      const passwordHash = `$2a$10$dummy.hash.for.${hostData.password}`;

      const { data, error } = await this.supabase
        .from('hosts')
        .insert([{
          name: hostData.name,
          email: hostData.email,
          phone: hostData.phone,
          password_hash: passwordHash,
          verification_status: hostData.verificationStatus || 'pending',
          is_active: hostData.isActive !== false,
          bank_details: {}
        }])
        .select('id')
        .single();

      if (error || !data) {
        console.error('Error creating host:', error);
        return { success: false, error: 'Failed to create host' };
      }

      return { success: true, hostId: data.id };
    } catch (error) {
      console.error('Error creating host:', error);
      return { success: false, error: 'Failed to create host' };
    }
  }

  async updateHost(hostId: string, updates: Partial<{
    name: string;
    email: string;
    phone: string;
    verificationStatus: 'pending' | 'verified' | 'unverified';
    isActive: boolean;
  }>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.verificationStatus !== undefined) updateData.verification_status = updates.verificationStatus;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await this.supabase
        .from('hosts')
        .update(updateData)
        .eq('id', hostId);

      if (error) {
        console.error('Error updating host:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating host:', error);
      return false;
    }
  }

  async deleteHost(hostId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('hosts')
        .delete()
        .eq('id', hostId);

      if (error) {
        console.error('Error deleting host:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting host:', error);
      return false;
    }
  }

  async assignPropertyToHost(hostId: string, propertyData: {
    name: string;
    location: string;
    type: string;
    description: string;
    amenities: string[];
    pricing: any;
    images: string[];
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
  }): Promise<{ success: boolean; propertyId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('host_properties')
        .insert([{
          host_id: hostId,
          name: propertyData.name,
          location: propertyData.location,
          type: propertyData.type,
          status: 'active',
          description: propertyData.description,
          amenities: propertyData.amenities,
          pricing: propertyData.pricing,
          images: propertyData.images,
          max_guests: propertyData.maxGuests,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms
        }])
        .select('id')
        .single();

      if (error || !data) {
        console.error('Error assigning property to host:', error);
        return { success: false, error: 'Failed to assign property' };
      }

      return { success: true, propertyId: data.id };
    } catch (error) {
      console.error('Error assigning property to host:', error);
      return { success: false, error: 'Failed to assign property' };
    }
  }

  async getHostStats(hostId: string): Promise<{
    totalProperties: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  }> {
    try {
      const [properties, bookings, revenue] = await Promise.all([
        this.getHostProperties(hostId),
        this.getHostBookings(hostId),
        this.getHostRevenue(hostId, 'all')
      ]);

      const totalProperties = properties.length;
      const totalBookings = bookings.length;
      const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
      const averageRating = properties.length > 0 
        ? properties.reduce((sum, p) => sum + p.averageRating, 0) / properties.length 
        : 0;

      return {
        totalProperties,
        totalBookings,
        totalRevenue,
        averageRating
      };
    } catch (error) {
      console.error('Error fetching host stats:', error);
      return {
        totalProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    }
  }

  // Data Transformers
  private transformHostData(data: any): Host {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      verificationStatus: data.verification_status,
      memberSince: data.member_since,
      bankDetails: data.bank_details || {},
      profileImageUrl: data.profile_image_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private transformPropertyData(data: any): HostProperty {
    return {
      id: data.id,
      name: data.name,
      location: data.location,
      type: data.type,
      status: data.status,
      description: data.description,
      amenities: data.amenities || [],
      pricing: data.pricing || {},
      images: data.images || [],
      maxGuests: data.max_guests,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      totalBookings: data.total_bookings,
      totalRevenue: parseFloat(data.total_revenue || '0'),
      averageRating: parseFloat(data.average_rating || '0'),
      reviewCount: data.review_count,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private transformPropertyForUpdate(updates: Partial<HostProperty>): any {
    const transformed: any = {};
    
    if (updates.name !== undefined) transformed.name = updates.name;
    if (updates.location !== undefined) transformed.location = updates.location;
    if (updates.type !== undefined) transformed.type = updates.type;
    if (updates.status !== undefined) transformed.status = updates.status;
    if (updates.description !== undefined) transformed.description = updates.description;
    if (updates.amenities !== undefined) transformed.amenities = updates.amenities;
    if (updates.pricing !== undefined) transformed.pricing = updates.pricing;
    if (updates.images !== undefined) transformed.images = updates.images;
    if (updates.maxGuests !== undefined) transformed.max_guests = updates.maxGuests;
    if (updates.bedrooms !== undefined) transformed.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) transformed.bathrooms = updates.bathrooms;
    if (updates.isFeatured !== undefined) transformed.is_featured = updates.isFeatured;

    return transformed;
  }

  private transformBookingData(data: any): HostBooking {
    return {
      id: data.id,
      propertyId: data.property_id,
      guestName: data.guest_name,
      guestEmail: data.guest_email,
      guestPhone: data.guest_phone,
      checkIn: data.check_in,
      checkOut: data.check_out,
      guests: data.guests,
      totalAmount: parseFloat(data.total_amount || '0'),
      status: data.status,
      paymentStatus: data.payment_status,
      bookingDate: data.booking_date,
      specialRequests: data.special_requests,
      isSelfBooking: data.is_self_booking === true,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private transformRevenueData(data: any): HostRevenue {
    return {
      id: data.id,
      hostId: data.host_id,
      propertyId: data.property_id,
      bookingId: data.booking_id,
      amount: parseFloat(data.amount || '0'),
      commissionAmount: parseFloat(data.commission_amount || '0'),
      netAmount: parseFloat(data.net_amount || '0'),
      revenueType: data.revenue_type,
      period: data.period,
      periodDate: data.period_date,
      createdAt: data.created_at
    };
  }

  private transformNotificationData(data: any): HostNotification {
    return {
      id: data.id,
      hostId: data.host_id,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: data.is_read,
      actionUrl: data.action_url,
      createdAt: data.created_at
    };
  }
}

// Export singleton instance
export const supabaseHostManager = new SupabaseHostManager();
