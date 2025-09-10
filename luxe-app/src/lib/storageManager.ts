// Advanced Storage Manager using IndexedDB
// Provides much higher storage capacity than localStorage

export interface StorageData {
  id: string;
  data: any;
  timestamp: number;
  version: string;
}

class StorageManager {
  private dbName = 'LuxeStaycationsDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, skipping IndexedDB init');
      return;
    }

    if (this.db) {
      console.log('StorageManager: Database already initialized');
      return;
    }

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('StorageManager: IndexedDB error:', request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('StorageManager: IndexedDB initialized successfully');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('destinations')) {
          const destinationStore = db.createObjectStore('destinations', { keyPath: 'id' });
          destinationStore.createIndex('name', 'name', { unique: false });
          console.log('StorageManager: Created destinations store');
        }
        
        if (!db.objectStoreNames.contains('properties')) {
          const propertyStore = db.createObjectStore('properties', { keyPath: 'id' });
          propertyStore.createIndex('name', 'name', { unique: false });
          propertyStore.createIndex('location', 'location', { unique: false });
          console.log('StorageManager: Created properties store');
        }
        
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingStore.createIndex('userId', 'userId', { unique: false });
          bookingStore.createIndex('propertyId', 'propertyId', { unique: false });
          console.log('StorageManager: Created bookings store');
        }
        
        if (!db.objectStoreNames.contains('callbacks')) {
          const callbackStore = db.createObjectStore('callbacks', { keyPath: 'id' });
          callbackStore.createIndex('phone', 'phone', { unique: false });
          console.log('StorageManager: Created callbacks store');
        }
        
        if (!db.objectStoreNames.contains('dealBanners')) {
          const dealBannerStore = db.createObjectStore('dealBanners', { keyPath: 'id' });
          console.log('StorageManager: Created dealBanners store');
        }
      };

      // Wait for the database to be ready
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          this.db = request.result;
          console.log('StorageManager: IndexedDB initialized successfully');
          resolve();
        };
        
        request.onerror = () => {
          console.error('StorageManager: IndexedDB initialization failed:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('StorageManager: Error initializing IndexedDB:', error);
      throw error;
    }
  }

  async save(storeName: string, data: any): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, skipping save');
      return;
    }

    try {
      await this.init();
      
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Clear existing data
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // Add new data
          if (Array.isArray(data)) {
            let completed = 0;
            const total = data.length;
            
            if (total === 0) {
              resolve();
              return;
            }
            
            data.forEach((item, index) => {
              const addRequest = store.add(item);
              
              addRequest.onsuccess = () => {
                completed++;
                if (completed === total) {
                  console.log(`StorageManager: Saved ${total} items to ${storeName}`);
                  resolve();
                }
              };
              
              addRequest.onerror = () => {
                console.error(`StorageManager: Error adding item ${index} to ${storeName}:`, addRequest.error);
                reject(addRequest.error);
              };
            });
          } else {
            const addRequest = store.add(data);
            
            addRequest.onsuccess = () => {
              console.log(`StorageManager: Saved item to ${storeName}`);
              resolve();
            };
            
            addRequest.onerror = () => {
              console.error(`StorageManager: Error adding item to ${storeName}:`, addRequest.error);
              reject(addRequest.error);
            };
          }
        };
        
        clearRequest.onerror = () => {
          console.error(`StorageManager: Error clearing ${storeName}:`, clearRequest.error);
          reject(clearRequest.error);
        };
      });
    } catch (error) {
      console.error(`StorageManager: Error saving to ${storeName}:`, error);
      throw error;
    }
  }

  async load(storeName: string): Promise<any> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, returning null');
      return null;
    }

    try {
      await this.init();
      
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const result = request.result;
          console.log(`StorageManager: Loaded ${result.length} items from ${storeName}`);
          resolve(result);
        };
        
        request.onerror = () => {
          console.error(`StorageManager: Error loading from ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`StorageManager: Error loading from ${storeName}:`, error);
      throw error;
    }
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, skipping delete');
      return;
    }

    try {
      await this.init();
      
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => {
          console.log(`StorageManager: Deleted item with key ${key} from ${storeName}`);
          resolve();
        };
        
        request.onerror = () => {
          console.error(`StorageManager: Error deleting from ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`StorageManager: Error deleting from ${storeName}:`, error);
      throw error;
    }
  }

  async clear(storeName: string): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, skipping clear');
      return;
    }

    try {
      await this.init();
      
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log(`StorageManager: Cleared ${storeName}`);
          resolve();
        };
        
        request.onerror = () => {
          console.error(`StorageManager: Error clearing ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`StorageManager: Error clearing ${storeName}:`, error);
      throw error;
    }
  }

  // Fallback methods using localStorage
  async fallbackSave(key: string, data: any): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, skipping fallback save');
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`StorageManager: Saved to localStorage with key: ${key}`);
    } catch (error) {
      console.error(`StorageManager: Error saving to localStorage:`, error);
      throw error;
    }
  }

  async fallbackLoad(key: string): Promise<any> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, returning null for fallback load');
      return null;
    }

    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`StorageManager: Loaded from localStorage with key: ${key}`);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error(`StorageManager: Error loading from localStorage:`, error);
      return null;
    }
  }

  async fallbackDelete(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('StorageManager: Running on server side, skipping fallback delete');
      return;
    }

    try {
      localStorage.removeItem(key);
      console.log(`StorageManager: Deleted from localStorage with key: ${key}`);
    } catch (error) {
      console.error(`StorageManager: Error deleting from localStorage:`, error);
      throw error;
    }
  }

  // Utility methods
  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      await this.init();
      return this.db !== null;
    } catch (error) {
      console.error('StorageManager: IndexedDB not available:', error);
      return false;
    }
  }

  async getStorageInfo(): Promise<{ type: string; available: boolean }> {
    const indexedDBAvailable = await this.isAvailable();
    
    if (indexedDBAvailable) {
      return { type: 'IndexedDB', available: true };
    } else if (typeof window !== 'undefined' && window.localStorage) {
      return { type: 'localStorage', available: true };
    } else {
      return { type: 'none', available: false };
    }
  }
}

export const storageManager = new StorageManager();
