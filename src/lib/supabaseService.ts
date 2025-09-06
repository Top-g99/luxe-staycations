// Temporarily commented out to fix build errors
/*
import { supabase, TABLES, DatabaseProperty, DatabaseDestination, DatabaseBooking, DatabaseCallbackRequest, DatabaseDealBanner, DatabaseSettings } from './supabase';

// Base service class with common operations
class BaseSupabaseService {
  protected checkSupabase() {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    return supabase;
  }

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
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.PROPERTIES)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch properties');
  }

  async getPropertyById(id: string): Promise<DatabaseProperty> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
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
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch bookings');
  }

  async getBookingById(id: string): Promise<DatabaseBooking> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch booking');
  }

  async getBookingsByProperty(propertyId: string): Promise<DatabaseBooking[]> {
    const query = supabase
      .from(TABLES.BOOKINGS)
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch property bookings');
  }

  async createBooking(booking: Omit<DatabaseBooking, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseBooking> {
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

  async deleteBooking(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.BOOKINGS)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete booking');
    }
  }
}

// Callback Requests Service
export class SupabaseCallbackRequestService extends BaseSupabaseService {
  async getAllCallbackRequests(): Promise<DatabaseCallbackRequest[]> {
    const query = supabase
      .from(TABLES.CALLBACK_REQUESTS)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch callback requests');
  }

  async getCallbackRequestById(id: string): Promise<DatabaseCallbackRequest> {
    const query = supabase
      .from(TABLES.CALLBACK_REQUESTS)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch callback request');
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

  async deleteCallbackRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CALLBACK_REQUESTS)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete callback request');
    }
  }
}

// Deal Banners Service
export class SupabaseDealBannerService extends BaseSupabaseService {
  async getAllDealBanners(): Promise<DatabaseDealBanner[]> {
    const query = supabase
      .from(TABLES.DEAL_BANNERS)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch deal banners');
  }

  async getDealBannerById(id: string): Promise<DatabaseDealBanner> {
    const query = supabase
      .from(TABLES.DEAL_BANNERS)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch deal banner');
  }

  async getActiveDealBanner(): Promise<DatabaseDealBanner | null> {
    const query = supabase
      .from(TABLES.DEAL_BANNERS)
      .select('*')
      .eq('active', true)
      .single();

    try {
      return await this.executeQuery(query, 'fetch active deal banner');
    } catch (error) {
      return null;
    }
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

  async deleteDealBanner(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.DEAL_BANNERS)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete deal banner');
    }
  }
}

// Settings Service
export class SupabaseSettingsService extends BaseSupabaseService {
  async getAllSettings(): Promise<DatabaseSettings[]> {
    const query = supabase
      .from(TABLES.SETTINGS)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch settings');
  }

  async getSettingByKey(key: string): Promise<DatabaseSettings | null> {
    const query = supabase
      .from(TABLES.SETTINGS)
      .select('*')
      .eq('key', key)
      .single();

    try {
      return await this.executeQuery(query, 'fetch setting');
    } catch (error) {
      return null;
    }
  }

  async createSetting(setting: Omit<DatabaseSettings, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseSettings> {
    const query = supabase
      .from(TABLES.SETTINGS)
      .insert(setting)
      .select()
      .single();

    return this.executeQuery(query, 'create setting');
  }

  async updateSetting(id: string, updates: Partial<DatabaseSettings>): Promise<DatabaseSettings> {
    const query = supabase
      .from(TABLES.SETTINGS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update setting');
  }

  async deleteSetting(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SETTINGS)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete setting');
    }
  }
}
*/
