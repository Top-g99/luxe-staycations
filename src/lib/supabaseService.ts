import { supabase, TABLES, DatabaseProperty, DatabaseDestination, DatabaseBooking, DatabaseCallbackRequest, DatabaseDealBanner, DatabaseSettings } from './supabase';

// Base service class with common operations
class BaseSupabaseService {
  protected async handleError(error: any, operation: string): Promise<never> {
    console.error(`Supabase ${operation} error:`, error);
    const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || 'Unknown error';
    throw new Error(`Failed to ${operation}: ${errorMessage}`);
  }

  protected async executeQuery<T>(
    query: any,
    operation: string
  ): Promise<T> {
    const { data, error } = await query;
    if (error) {
      await this.handleError(error, operation);
    }
    if (!data) {
      throw new Error(`No data returned from ${operation}`);
    }
    return data;
  }
}

// Properties Service
export class SupabasePropertyService extends BaseSupabaseService {
  async getAllProperties(): Promise<DatabaseProperty[]> {
    const query = supabase
      .from(TABLES.PROPERTIES)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch properties');
  }

  async getPropertyById(id: string): Promise<DatabaseProperty> {
    const query = supabase
      .from(TABLES.PROPERTIES)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch property');
  }

  async getFeaturedProperties(): Promise<DatabaseProperty[]> {
    const query = supabase
      .from(TABLES.PROPERTIES)
      .select('*')
      .eq('featured', true)
      .eq('available', true)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch featured properties');
  }

  async createProperty(property: Omit<DatabaseProperty, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProperty> {
    // Check for duplicates before creating
    const { data: existingProperties, error: checkError } = await supabase
      .from(TABLES.PROPERTIES)
      .select('*')
      .eq('name', property.name)
      .eq('location', property.location);
    
    if (checkError) {
      throw new Error(`Failed to check for duplicates: ${checkError.message}`);
    }
    
    if (existingProperties && existingProperties.length > 0) {
      throw new Error(`Property "${property.name}" already exists in "${property.location}". Please use a different name or location.`);
    }
    
    const query = supabase
      .from(TABLES.PROPERTIES)
      .insert(property)
      .select()
      .single();

    return this.executeQuery(query, 'create property');
  }

  async updateProperty(id: string, updates: Partial<DatabaseProperty>): Promise<DatabaseProperty> {
    const query = supabase
      .from(TABLES.PROPERTIES)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update property');
  }

  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.PROPERTIES)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete property');
    }
  }

  async searchProperties(filters: {
    location?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
  }): Promise<DatabaseProperty[]> {
    let query = supabase
      .from(TABLES.PROPERTIES)
      .select('*')
      .eq('available', true);

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.guests) {
      query = query.gte('max_guests', filters.guests);
    }

    query = query.order('created_at', { ascending: false });

    return this.executeQuery(query, 'search properties');
  }
}

// Destinations Service
export class SupabaseDestinationService extends BaseSupabaseService {
  async getAllDestinations(): Promise<DatabaseDestination[]> {
    const query = supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch destinations');
  }

  async getDestinationById(id: string): Promise<DatabaseDestination> {
    const query = supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch destination');
  }

  async getFeaturedDestinations(): Promise<DatabaseDestination[]> {
    const query = supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch featured destinations');
  }

  async createDestination(destination: Omit<DatabaseDestination, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseDestination> {
    // Check for duplicates before creating
    const { data: existingDestinations, error: checkError } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('name', destination.name);
    
    if (checkError) {
      throw new Error(`Failed to check for duplicates: ${checkError.message}`);
    }
    
    if (existingDestinations && existingDestinations.length > 0) {
      throw new Error(`Destination "${destination.name}" already exists. Please use a different name.`);
    }
    
    const query = supabase
      .from(TABLES.DESTINATIONS)
      .insert(destination)
      .select()
      .single();

    return this.executeQuery(query, 'create destination');
  }

  async updateDestination(id: string, updates: Partial<DatabaseDestination>): Promise<DatabaseDestination> {
    const query = supabase
      .from(TABLES.DESTINATIONS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update destination');
  }

  async deleteDestination(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.DESTINATIONS)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete destination');
    }
  }
}

// Bookings Service
export class SupabaseBookingService extends BaseSupabaseService {
  async getAllBookings(): Promise<DatabaseBooking[]> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .select(`
        *,
        properties:property_id (id, name, location, images)
      `)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch bookings');
  }

  async getBookingById(id: string): Promise<DatabaseBooking> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .select(`
        *,
        properties:property_id (id, name, location, images)
      `)
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch booking');
  }

  async getBookingByBookingId(bookingId: string): Promise<DatabaseBooking> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .select(`
        *,
        properties:property_id (id, name, location, images)
      `)
      .eq('booking_id', bookingId)
      .single();

    return this.executeQuery(query, 'fetch booking by booking ID');
  }

  async createBooking(booking: Omit<DatabaseBooking, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseBooking> {
    // Check for duplicates before creating
    const { data: existingBookings, error: checkError } = await supabase
      .from(TABLES.BOOKINGS)
      .select('*')
      .eq('guest_email', booking.guest_email)
      .eq('check_in', booking.check_in)
      .eq('check_out', booking.check_out)
      .eq('property_id', booking.property_id);
    
    if (checkError) {
      throw new Error(`Failed to check for duplicates: ${checkError.message}`);
    }
    
    if (existingBookings && existingBookings.length > 0) {
      throw new Error(`A booking already exists for ${booking.guest_email} at this property for the same dates (${booking.check_in} to ${booking.check_out}).`);
    }
    
    const query = supabase
      .from(TABLES.BOOKINGS)
      .insert(booking)
      .select()
      .single();

    return this.executeQuery(query, 'create booking');
  }

  async updateBooking(id: string, updates: Partial<DatabaseBooking>): Promise<DatabaseBooking> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update booking');
  }

  async getBookingsByEmail(email: string): Promise<DatabaseBooking[]> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .select(`
        *,
        properties:property_id (id, name, location, images)
      `)
      .eq('guest_email', email)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch bookings by email');
  }

  async deleteBooking(id: string): Promise<void> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .delete()
      .eq('id', id);

    await this.executeQuery(query, 'delete booking');
  }
}

// Callback Requests Service
export class SupabaseCallbackService extends BaseSupabaseService {
  async getAllCallbackRequests(): Promise<DatabaseCallbackRequest[]> {
    const query = supabase
      .from(TABLES.CALLBACK_REQUESTS)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch callback requests');
  }

  async createCallbackRequest(request: Omit<DatabaseCallbackRequest, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCallbackRequest> {
    const query = supabase
      .from(TABLES.CALLBACK_REQUESTS)
      .insert(request)
      .select()
      .single();

    return this.executeQuery(query, 'create callback request');
  }

  async updateCallbackRequest(id: string, updates: Partial<DatabaseCallbackRequest>): Promise<DatabaseCallbackRequest> {
    const query = supabase
      .from(TABLES.CALLBACK_REQUESTS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update callback request');
  }
}

// Deal Banners Service
export class SupabaseDealBannerService extends BaseSupabaseService {
  async getActiveDealBanner(): Promise<DatabaseDealBanner | null> {
    const query = supabase
      .from(TABLES.DEAL_BANNERS)
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    const { data, error } = await query;
    if (error) {
      await this.handleError(error, 'fetch active deal banner');
    }
    return data?.[0] || null;
  }

  async createDealBanner(banner: Omit<DatabaseDealBanner, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseDealBanner> {
    const query = supabase
      .from(TABLES.DEAL_BANNERS)
      .insert(banner)
      .select()
      .single();

    return this.executeQuery(query, 'create deal banner');
  }

  async updateDealBanner(id: string, updates: Partial<DatabaseDealBanner>): Promise<DatabaseDealBanner> {
    const query = supabase
      .from(TABLES.DEAL_BANNERS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update deal banner');
  }
}

// Settings Service
export class SupabaseSettingsService extends BaseSupabaseService {
  async getSetting(key: string): Promise<string | null> {
    const query = supabase
      .from(TABLES.SETTINGS)
      .select('value')
      .eq('key', key)
      .single();

    const { data, error } = await query;
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      await this.handleError(error, 'fetch setting');
    }
    return data?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SETTINGS)
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      await this.handleError(error, 'set setting');
    }
  }

  async getAllSettings(): Promise<DatabaseSettings[]> {
    const query = supabase
      .from(TABLES.SETTINGS)
      .select('*')
      .order('key');

    return this.executeQuery(query, 'fetch all settings');
  }
}

// Export service instances
export const supabasePropertyService = new SupabasePropertyService();
export const supabaseDestinationService = new SupabaseDestinationService();
export const supabaseBookingService = new SupabaseBookingService();
export const supabaseCallbackService = new SupabaseCallbackService();
export const supabaseDealBannerService = new SupabaseDealBannerService();
export const supabaseSettingsService = new SupabaseSettingsService();
