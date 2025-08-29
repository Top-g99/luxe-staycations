import { storageManager } from './storageManager';
import { supabasePropertyService, supabaseDestinationService, supabaseBookingService, supabaseCallbackService, supabaseDealBannerService, supabaseSettingsService } from './supabaseService';
import { DatabaseProperty, DatabaseDestination, DatabaseBooking, DatabaseCallbackRequest, DatabaseDealBanner } from './supabase';

// Hybrid Storage Manager - Supabase + IndexedDB Fallback
export class HybridStorageManager {
  private isOnline = true;
  private syncQueue: Array<{ type: string; data: any; timestamp: number }> = [];

  constructor() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.checkOnlineStatus();
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private updateOnlineStatus(): void {
    this.isOnline = navigator.onLine;
  }

  private handleOnline(): void {
    console.log('HybridStorageManager: Back online, syncing data...');
    this.isOnline = true;
    this.syncOfflineData();
  }

  private handleOffline(): void {
    console.log('HybridStorageManager: Going offline, switching to local storage');
    this.isOnline = false;
  }

  private async syncOfflineData(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`HybridStorageManager: Syncing ${this.syncQueue.length} offline changes...`);
    
    for (const item of this.syncQueue) {
      try {
        await this.processSyncItem(item);
      } catch (error) {
        console.error('HybridStorageManager: Failed to sync item:', item, error);
      }
    }

    this.syncQueue = [];
    console.log('HybridStorageManager: Offline sync completed');
  }

  private async processSyncItem(item: { type: string; data: any; timestamp: number }): Promise<void> {
    switch (item.type) {
      case 'property_create':
        await supabasePropertyService.createProperty(item.data);
        break;
      case 'property_update':
        await supabasePropertyService.updateProperty(item.data.id, item.data);
        break;
      case 'property_delete':
        await supabasePropertyService.deleteProperty(item.data.id);
        break;
      case 'destination_create':
        await supabaseDestinationService.createDestination(item.data);
        break;
      case 'destination_update':
        await supabaseDestinationService.updateDestination(item.data.id, item.data);
        break;
      case 'destination_delete':
        await supabaseDestinationService.deleteDestination(item.data.id);
        break;
      case 'booking_create':
        await supabaseBookingService.createBooking(item.data);
        break;
      case 'callback_create':
        await supabaseCallbackService.createCallbackRequest(item.data);
        break;
      default:
        console.warn('HybridStorageManager: Unknown sync item type:', item.type);
    }
  }

  private addToSyncQueue(type: string, data: any): void {
    this.syncQueue.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Save sync queue to IndexedDB
    storageManager.save('sync-queue', this.syncQueue).catch(console.error);
  }

  // Properties
  async getAllProperties(): Promise<DatabaseProperty[]> {
    try {
      if (this.isOnline) {
        const properties = await supabasePropertyService.getAllProperties();
        // Cache in IndexedDB
        await storageManager.save('properties', properties);
        return properties;
      } else {
        // Use cached data from IndexedDB
        const cached = await storageManager.load('properties');
        return cached || [];
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to get properties, using cached data:', error);
      const cached = await storageManager.load('properties');
      return cached || [];
    }
  }

  async createProperty(property: Omit<DatabaseProperty, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProperty> {
    try {
      // Check for duplicates before creating
      const existingProperties = await this.getAllProperties();
      const isDuplicate = existingProperties.some((prop: any) => 
        prop.name.toLowerCase() === property.name.toLowerCase() && 
        prop.location.toLowerCase() === property.location.toLowerCase()
      );
      
      if (isDuplicate) {
        throw new Error(`Property "${property.name}" already exists in "${property.location}". Please use a different name or location.`);
      }
      
      if (this.isOnline) {
        try {
          const newProperty = await supabasePropertyService.createProperty(property);
          // Update local cache
          const properties = await this.getAllProperties();
          properties.unshift(newProperty);
          await storageManager.save('properties', properties);
          return newProperty;
                 } catch (error: any) {
           // If it's a duplicate key error, try to get the existing property instead
           const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || '';
           if (errorMessage.includes('duplicate key value')) {
             console.log(`HybridStorageManager: Property already exists, fetching existing`);
             const existingProperties = await this.getAllProperties();
             const existing = existingProperties.find(p => p.name === property.name && p.location === property.location);
             if (existing) {
               return existing;
             }
           }
           // Re-throw other errors
           throw error;
         }
      } else {
        // Create offline
        const offlineProperty: DatabaseProperty = {
          ...property,
          id: `offline_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to sync queue
        this.addToSyncQueue('property_create', property);
        
        // Update local cache
        const properties = await this.getAllProperties();
        properties.unshift(offlineProperty);
        await storageManager.save('properties', properties);
        
        return offlineProperty;
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to create property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, updates: Partial<DatabaseProperty>): Promise<DatabaseProperty> {
    try {
      if (this.isOnline) {
        const updatedProperty = await supabasePropertyService.updateProperty(id, updates);
        // Update local cache
        const properties = await this.getAllProperties();
        const index = properties.findIndex(p => p.id === id);
        if (index !== -1) {
          properties[index] = updatedProperty;
          await storageManager.save('properties', properties);
        }
        return updatedProperty;
      } else {
        // Update offline
        this.addToSyncQueue('property_update', { id, ...updates });
        
        // Update local cache
        const properties = await this.getAllProperties();
        const index = properties.findIndex(p => p.id === id);
        if (index !== -1) {
          properties[index] = { ...properties[index], ...updates, updated_at: new Date().toISOString() };
          await storageManager.save('properties', properties);
          return properties[index];
        }
        throw new Error('Property not found');
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to update property:', error);
      throw error;
    }
  }

  // Destinations
  async getAllDestinations(): Promise<DatabaseDestination[]> {
    try {
      if (this.isOnline) {
        const destinations = await supabaseDestinationService.getAllDestinations();
        // Cache in IndexedDB
        await storageManager.save('destinations', destinations);
        return destinations;
      } else {
        // Use cached data from IndexedDB
        const cached = await storageManager.load('destinations');
        return cached || [];
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to get destinations, using cached data:', error);
      const cached = await storageManager.load('destinations');
      return cached || [];
    }
  }

  async createDestination(destination: Omit<DatabaseDestination, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseDestination> {
    try {
      // Check for duplicates before creating
      const existingDestinations = await this.getAllDestinations();
      const duplicate = existingDestinations.find(
        dest => dest.name.toLowerCase().trim() === destination.name.toLowerCase().trim()
      );
      
      if (duplicate) {
        throw new Error(`Destination "${destination.name}" already exists!`);
      }

      if (this.isOnline) {
        try {
          const newDestination = await supabaseDestinationService.createDestination(destination);
          // Update local cache
          const destinations = await this.getAllDestinations();
          destinations.unshift(newDestination);
          await storageManager.save('destinations', destinations);
          return newDestination;
                 } catch (error: any) {
                     // If it's a duplicate key error, try to get the existing destination instead
          const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || '';
          if (errorMessage.includes('duplicate key value')) {
            console.log(`HybridStorageManager: Destination ${destination.name} already exists, fetching existing`);
            const existingDestinations = await this.getAllDestinations();
            const existing = existingDestinations.find(d => d.name === destination.name);
            if (existing) {
              return existing;
            }
          }
           // Re-throw other errors
           throw error;
         }
      } else {
        // Create offline
        const offlineDestination: DatabaseDestination = {
          id: `offline_dest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate local ID
          ...destination,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to sync queue
        this.addToSyncQueue('destination_create', destination);
        
        // Update local cache
        const destinations = await this.getAllDestinations();
        destinations.unshift(offlineDestination);
        await storageManager.save('destinations', destinations);
        
        return offlineDestination;
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to create destination:', error);
      throw error;
    }
  }

  async updateDestination(id: string, updates: Partial<DatabaseDestination>): Promise<DatabaseDestination> {
    try {
      if (this.isOnline) {
        const updatedDestination = await supabaseDestinationService.updateDestination(id, updates);
        // Update local cache
        const destinations = await this.getAllDestinations();
        const index = destinations.findIndex(d => d.id === id);
        if (index !== -1) {
          destinations[index] = updatedDestination;
          await storageManager.save('destinations', destinations);
        }
        return updatedDestination;
      } else {
        // Update offline
        this.addToSyncQueue('destination_update', { id, ...updates });
        
        // Update local cache
        const destinations = await this.getAllDestinations();
        const index = destinations.findIndex(d => d.id === id);
        if (index !== -1) {
          destinations[index] = { ...destinations[index], ...updates, updated_at: new Date().toISOString() };
          await storageManager.save('destinations', destinations);
          return destinations[index];
        }
        throw new Error('Destination not found');
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to update destination:', error);
      throw error;
    }
  }

  // Bookings
  async createBooking(booking: Omit<DatabaseBooking, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseBooking> {
    try {
      if (this.isOnline) {
        try {
          return await supabaseBookingService.createBooking(booking);
                 } catch (error: any) {
           // If it's a duplicate key error, try to get the existing booking instead
           const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || '';
           if (errorMessage.includes('duplicate key value')) {
             console.log(`HybridStorageManager: Booking already exists, fetching existing`);
             // For bookings, we might want to handle this differently since they should be unique
             // For now, we'll re-throw the error
             throw error;
           }
           // Re-throw other errors
           throw error;
         }
      } else {
        // Create offline
        const offlineBooking: DatabaseBooking = {
          ...booking,
          id: `offline_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to sync queue
        this.addToSyncQueue('booking_create', booking);
        
        return offlineBooking;
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to create booking:', error);
      throw error;
    }
  }

  // Callback Requests
  async createCallbackRequest(request: Omit<DatabaseCallbackRequest, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCallbackRequest> {
    try {
      if (this.isOnline) {
        return await supabaseCallbackService.createCallbackRequest(request);
      } else {
        // Create offline
        const offlineRequest: DatabaseCallbackRequest = {
          ...request,
          id: `offline_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to sync queue
        this.addToSyncQueue('callback_create', request);
        
        return offlineRequest;
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to create callback request:', error);
      throw error;
    }
  }

  // Settings
  async getSetting(key: string): Promise<string | null> {
    try {
      if (this.isOnline) {
        const value = await supabaseSettingsService.getSetting(key);
        // Cache in IndexedDB
        await storageManager.save(`setting_${key}`, value);
        return value;
      } else {
        // Use cached data from IndexedDB
        return await storageManager.load(`setting_${key}`) || null;
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to get setting, using cached data:', error);
      return await storageManager.load(`setting_${key}`) || null;
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    try {
      if (this.isOnline) {
        await supabaseSettingsService.setSetting(key, value);
      }
      // Always cache locally
      await storageManager.save(`setting_${key}`, value);
    } catch (error) {
      console.error('HybridStorageManager: Failed to set setting:', error);
      // Still cache locally even if online save fails
      await storageManager.save(`setting_${key}`, value);
    }
  }

  // Deal Banners
  async getActiveDealBanner(): Promise<DatabaseDealBanner | null> {
    try {
      if (this.isOnline) {
        const banner = await supabaseDealBannerService.getActiveDealBanner();
        // Cache in IndexedDB
        await storageManager.save('active-deal-banner', banner);
        return banner;
      } else {
        // Use cached data from IndexedDB
        return await storageManager.load('active-deal-banner') || null;
      }
    } catch (error) {
      console.error('HybridStorageManager: Failed to get deal banner, using cached data:', error);
      return await storageManager.load('active-deal-banner') || null;
    }
  }

  // Utility methods
  async checkOnlineStatus(): Promise<boolean> {
    return this.isOnline;
  }

  async getSyncQueueLength(): Promise<number> {
    return this.syncQueue.length;
  }

  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await storageManager.save('sync-queue', []);
  }
}

// Export singleton instance
// export const hybridStorageManager = new HybridStorageManager();
