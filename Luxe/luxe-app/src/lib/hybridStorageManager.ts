// Temporarily commented out to fix build errors
/*
import { storageManager } from './storageManager';
import { supabasePropertyService, supabaseDestinationService, supabaseBookingService, supabaseCallbackService, supabaseDealBannerService, supabaseSettingsService } from './supabaseService';
import { DatabaseProperty, DatabaseDestination, DatabaseBooking, DatabaseCallbackRequest, DatabaseDealBanner } from './supabase';

// Hybrid Storage Manager - Supabase + IndexedDB Fallback
export class HybridStorageManager {
  private isSupabaseAvailable = false;

  constructor() {
    this.checkSupabaseAvailability();
  }

  private async checkSupabaseAvailability() {
    try {
      // Check if Supabase environment variables are set
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        // Test connection
        const { data, error } = await supabasePropertyService.getAllProperties();
        if (!error) {
          this.isSupabaseAvailable = true;
          console.log('HybridStorageManager: Supabase is available');
        }
      }
    } catch (error) {
      console.log('HybridStorageManager: Supabase not available, using IndexedDB fallback');
      this.isSupabaseAvailable = false;
    }
  }

  // Properties
  async getAllProperties(): Promise<DatabaseProperty[]> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabasePropertyService.getAllProperties();
      } catch (error) {
        console.log('Falling back to IndexedDB for properties');
        return storageManager.getAllProperties();
      }
    }
    return storageManager.getAllProperties();
  }

  async getPropertyById(id: string): Promise<DatabaseProperty | null> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabasePropertyService.getPropertyById(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for property');
        return storageManager.getPropertyById(id);
      }
    }
    return storageManager.getPropertyById(id);
  }

  async createProperty(property: Omit<DatabaseProperty, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProperty> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabasePropertyService.createProperty(property);
        // Also store in IndexedDB as backup
        await storageManager.createProperty(property);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for property creation');
        return storageManager.createProperty(property);
      }
    }
    return storageManager.createProperty(property);
  }

  async updateProperty(id: string, updates: Partial<DatabaseProperty>): Promise<DatabaseProperty> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabasePropertyService.updateProperty(id, updates);
        // Also update in IndexedDB
        await storageManager.updateProperty(id, updates);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for property update');
        return storageManager.updateProperty(id, updates);
      }
    }
    return storageManager.updateProperty(id, updates);
  }

  async deleteProperty(id: string): Promise<void> {
    if (this.isSupabaseAvailable) {
      try {
        await supabasePropertyService.deleteProperty(id);
        // Also delete from IndexedDB
        await storageManager.deleteProperty(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for property deletion');
        await storageManager.deleteProperty(id);
      }
    } else {
      await storageManager.deleteProperty(id);
    }
  }

  // Destinations
  async getAllDestinations(): Promise<DatabaseDestination[]> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseDestinationService.getAllDestinations();
      } catch (error) {
        console.log('Falling back to IndexedDB for destinations');
        return storageManager.getAllDestinations();
      }
    }
    return storageManager.getAllDestinations();
  }

  async getDestinationById(id: string): Promise<DatabaseDestination | null> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseDestinationService.getDestinationById(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for destination');
        return storageManager.getDestinationById(id);
      }
    }
    return storageManager.getDestinationById(id);
  }

  async createDestination(destination: Omit<DatabaseDestination, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseDestination> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseDestinationService.createDestination(destination);
        // Also store in IndexedDB as backup
        await storageManager.createDestination(destination);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for destination creation');
        return storageManager.createDestination(destination);
      }
    }
    return storageManager.createDestination(destination);
  }

  async updateDestination(id: string, updates: Partial<DatabaseDestination>): Promise<DatabaseDestination> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseDestinationService.updateDestination(id, updates);
        // Also update in IndexedDB
        await storageManager.updateDestination(id, updates);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for destination update');
        return storageManager.updateDestination(id, updates);
      }
    }
    return storageManager.updateDestination(id, updates);
  }

  async deleteDestination(id: string): Promise<void> {
    if (this.isSupabaseAvailable) {
      try {
        await supabaseDestinationService.deleteDestination(id);
        // Also delete from IndexedDB
        await storageManager.deleteDestination(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for destination deletion');
        await storageManager.deleteDestination(id);
      }
    } else {
      await storageManager.deleteDestination(id);
    }
  }

  // Bookings
  async getAllBookings(): Promise<DatabaseBooking[]> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseBookingService.getAllBookings();
      } catch (error) {
        console.log('Falling back to IndexedDB for bookings');
        return storageManager.getAllBookings();
      }
    }
    return storageManager.getAllBookings();
  }

  async getBookingById(id: string): Promise<DatabaseBooking | null> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseBookingService.getBookingById(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for booking');
        return storageManager.getBookingById(id);
      }
    }
    return storageManager.getBookingById(id);
  }

  async createBooking(booking: Omit<DatabaseBooking, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseBooking> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseBookingService.createBooking(booking);
        // Also store in IndexedDB as backup
        await storageManager.createBooking(booking);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for booking creation');
        return storageManager.createBooking(booking);
      }
    }
    return storageManager.createBooking(booking);
  }

  async updateBooking(id: string, updates: Partial<DatabaseBooking>): Promise<DatabaseBooking> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseBookingService.updateBooking(id, updates);
        // Also update in IndexedDB
        await storageManager.updateBooking(id, updates);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for booking update');
        return storageManager.updateBooking(id, updates);
      }
    }
    return storageManager.updateBooking(id, updates);
  }

  async deleteBooking(id: string): Promise<void> {
    if (this.isSupabaseAvailable) {
      try {
        await supabaseBookingService.deleteBooking(id);
        // Also delete from IndexedDB
        await storageManager.deleteBooking(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for booking deletion');
        await storageManager.deleteBooking(id);
      }
    } else {
      await storageManager.deleteBooking(id);
    }
  }

  // Callback Requests
  async getAllCallbackRequests(): Promise<DatabaseCallbackRequest[]> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseCallbackService.getAllCallbackRequests();
      } catch (error) {
        console.log('Falling back to IndexedDB for callback requests');
        return storageManager.getAllCallbackRequests();
      }
    }
    return storageManager.getAllCallbackRequests();
  }

  async getCallbackRequestById(id: string): Promise<DatabaseCallbackRequest | null> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseCallbackService.getCallbackRequestById(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for callback request');
        return storageManager.getCallbackRequestById(id);
      }
    }
    return storageManager.getCallbackRequestById(id);
  }

  async createCallbackRequest(request: Omit<DatabaseCallbackRequest, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCallbackRequest> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseCallbackService.createCallbackRequest(request);
        // Also store in IndexedDB as backup
        await storageManager.createCallbackRequest(request);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for callback request creation');
        return storageManager.createCallbackRequest(request);
      }
    }
    return storageManager.createCallbackRequest(request);
  }

  async updateCallbackRequest(id: string, updates: Partial<DatabaseCallbackRequest>): Promise<DatabaseCallbackRequest> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseCallbackService.updateCallbackRequest(id, updates);
        // Also update in IndexedDB
        await storageManager.updateCallbackRequest(id, updates);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for callback request update');
        return storageManager.updateCallbackRequest(id, updates);
      }
    }
    return storageManager.updateCallbackRequest(id, updates);
  }

  async deleteCallbackRequest(id: string): Promise<void> {
    if (this.isSupabaseAvailable) {
      try {
        await supabaseCallbackService.deleteCallbackRequest(id);
        // Also delete from IndexedDB
        await storageManager.deleteCallbackRequest(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for callback request deletion');
        await storageManager.deleteCallbackRequest(id);
      }
    } else {
      await storageManager.deleteCallbackRequest(id);
    }
  }

  // Deal Banners
  async getAllDealBanners(): Promise<DatabaseDealBanner[]> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseDealBannerService.getAllDealBanners();
      } catch (error) {
        console.log('Falling back to IndexedDB for deal banners');
        return storageManager.getAllDealBanners();
      }
    }
    return storageManager.getAllDealBanners();
  }

  async getDealBannerById(id: string): Promise<DatabaseDealBanner | null> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseDealBannerService.getDealBannerById(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for deal banner');
        return storageManager.getDealBannerById(id);
      }
    }
    return storageManager.getDealBannerById(id);
  }

  async createDealBanner(banner: Omit<DatabaseDealBanner, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseDealBanner> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseDealBannerService.createDealBanner(banner);
        // Also store in IndexedDB as backup
        await storageManager.createDealBanner(banner);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for deal banner creation');
        return storageManager.createDealBanner(banner);
      }
    }
    return storageManager.createDealBanner(banner);
  }

  async updateDealBanner(id: string, updates: Partial<DatabaseDealBanner>): Promise<DatabaseDealBanner> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseDealBannerService.updateDealBanner(id, updates);
        // Also update in IndexedDB
        await storageManager.updateDealBanner(id, updates);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for deal banner update');
        return storageManager.updateDealBanner(id, updates);
      }
    }
    return storageManager.updateDealBanner(id, updates);
  }

  async deleteDealBanner(id: string): Promise<void> {
    if (this.isSupabaseAvailable) {
      try {
        await supabaseDealBannerService.deleteDealBanner(id);
        // Also delete from IndexedDB
        await storageManager.deleteDealBanner(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for deal banner deletion');
        await storageManager.deleteDealBanner(id);
      }
    } else {
      await storageManager.deleteDealBanner(id);
    }
  }

  // Settings
  async getAllSettings(): Promise<any[]> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseSettingsService.getAllSettings();
      } catch (error) {
        console.log('Falling back to IndexedDB for settings');
        return storageManager.getAllSettings();
      }
    }
    return storageManager.getAllSettings();
  }

  async getSettingByKey(key: string): Promise<any | null> {
    if (this.isSupabaseAvailable) {
      try {
        return await supabaseSettingsService.getSettingByKey(key);
      } catch (error) {
        console.log('Falling back to IndexedDB for setting');
        return storageManager.getSettingByKey(key);
      }
    }
    return storageManager.getSettingByKey(key);
  }

  async createSetting(setting: any): Promise<any> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseSettingsService.createSetting(setting);
        // Also store in IndexedDB as backup
        await storageManager.createSetting(setting);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for setting creation');
        return storageManager.createSetting(setting);
      }
    }
    return storageManager.createSetting(setting);
  }

  async updateSetting(id: string, updates: any): Promise<any> {
    if (this.isSupabaseAvailable) {
      try {
        const result = await supabaseSettingsService.updateSetting(id, updates);
        // Also update in IndexedDB
        await storageManager.updateSetting(id, updates);
        return result;
      } catch (error) {
        console.log('Falling back to IndexedDB for setting update');
        return storageManager.updateSetting(id, updates);
      }
    }
    return storageManager.updateSetting(id, updates);
  }

  async deleteSetting(id: string): Promise<void> {
    if (this.isSupabaseAvailable) {
      try {
        await supabaseSettingsService.deleteSetting(id);
        // Also delete from IndexedDB
        await storageManager.deleteSetting(id);
      } catch (error) {
        console.log('Falling back to IndexedDB for setting deletion');
        await storageManager.deleteSetting(id);
      }
    } else {
      await storageManager.deleteSetting(id);
    }
  }
}

// Export instance
export const hybridStorageManager = new HybridStorageManager();
*/
