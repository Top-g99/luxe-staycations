import { storageManager } from './storageManager';

export interface Destination {
  id: string;
  name: string;
  image: string;
  description?: string;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class DestinationManager {
  private destinations: Destination[] = [];
  private subscribers: (() => void)[] = [];
  private initialized: boolean = false;

  constructor() {
    console.log('DestinationManager: Constructor called');
    this.loadDestinations().catch(error => {
      console.error('DestinationManager: Failed to load destinations:', error);
      this.loadDefaultDestinations();
    });
    console.log('DestinationManager: Constructor completed, destinations count:', this.destinations.length);
  }

  private async loadDestinations(): Promise<void> {
    console.log('DestinationManager: loadDestinations called');
    
    if (typeof window !== 'undefined') {
      try {
        // Try IndexedDB first
        const stored = await storageManager.load('destinations');
        console.log('DestinationManager: IndexedDB data:', stored);
        
        if (stored && Array.isArray(stored) && stored.length > 0) {
          this.destinations = stored.map((destination: any) => ({
            ...destination,
            createdAt: new Date(destination.createdAt),
            updatedAt: new Date(destination.updatedAt)
          }));
          console.log('DestinationManager: Loaded', this.destinations.length, 'destinations from IndexedDB');
        } else {
          // Try localStorage fallback
          console.log('DestinationManager: No data in IndexedDB, checking localStorage...');
          await this.loadFromLocalStorage();
        }
      } catch (error) {
        console.error('DestinationManager: IndexedDB load failed, trying localStorage:', error);
        await this.loadFromLocalStorage();
      }
      
      this.initialized = true;
      console.log('DestinationManager: loadDestinations completed, total destinations:', this.destinations.length);
    } else {
      console.log('DestinationManager: Window is not defined (server-side), loading defaults for SSR');
      this.loadDefaultDestinations();
      this.initialized = true;
    }
  }

  private async loadFromLocalStorage(): Promise<void> {
    try {
      const stored = await storageManager.fallbackLoad('luxe-destinations');
      console.log('DestinationManager: localStorage data:', stored);
      
      if (stored && Array.isArray(stored) && stored.length > 0) {
        // Handle both old format and new compressed format
        this.destinations = stored.map((destination: any) => {
          // Check if it's the new compressed format (has 'i' key)
          if (destination.i) {
            return {
              id: destination.i,
              name: destination.n,
              image: destination.img,
              description: destination.d || '',
              featured: destination.f || false,
              createdAt: destination.c ? new Date(destination.c) : new Date(),
              updatedAt: destination.u ? new Date(destination.u) : new Date()
            };
          } else {
            // Old format - direct mapping
            return {
              ...destination,
              createdAt: new Date(destination.createdAt),
              updatedAt: new Date(destination.updatedAt)
            };
          }
        });
        console.log('DestinationManager: Loaded', this.destinations.length, 'destinations from localStorage');
      } else {
        console.log('DestinationManager: No valid destinations in localStorage, loading defaults');
        this.loadDefaultDestinations();
      }
    } catch (error) {
      console.error('DestinationManager: localStorage load failed:', error);
      this.loadDefaultDestinations();
    }
  }

  private loadDefaultDestinations(): void {
    console.log('DestinationManager: Loading default destinations');
    this.destinations = [
      {
        id: '1',
        name: 'Lonavala',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        description: 'Scenic hill station known for its caves, forts, and beautiful viewpoints',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Mahabaleshwar',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        description: 'Famous for strawberry farms, scenic valleys, and pleasant weather',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Goa',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        description: 'Tropical paradise with pristine beaches and Portuguese heritage',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Kerala',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        description: 'God\'s Own Country with backwaters, beaches, and lush greenery',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Mumbai',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        description: 'The City of Dreams with beaches, nightlife, and cultural heritage',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Pune',
        image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
        description: 'Oxford of the East with historical monuments and educational institutions',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.saveToStorage();
    console.log('DestinationManager: Loaded default destinations:', this.destinations.length);
  }

  private async saveToStorage(): Promise<void> {
    try {
      // Save to IndexedDB
      await storageManager.save('destinations', this.destinations);
      
      // Also save to localStorage as backup
      const compressedData = this.destinations.map(dest => ({
        i: dest.id,
        n: dest.name,
        img: dest.image,
        d: dest.description || '',
        f: dest.featured || false,
        c: dest.createdAt.toISOString(),
        u: dest.updatedAt.toISOString()
      }));
      
      await storageManager.fallbackSave('luxe-destinations', compressedData);
      console.log('DestinationManager: Saved destinations to storage');
    } catch (error) {
      console.error('DestinationManager: Error saving to storage:', error);
    }
  }

  getAllDestinations(): Destination[] {
    if (!this.initialized) {
      console.log('DestinationManager: Not initialized, returning current destinations');
      return [...this.destinations];
    }
    console.log('DestinationManager: Getting all destinations, count:', this.destinations.length);
    return [...this.destinations];
  }

  getFeaturedDestinations(): Destination[] {
    if (!this.initialized) {
      return this.destinations.filter(dest => dest.featured);
    }
    return this.destinations.filter(dest => dest.featured);
  }

  getDestinationById(id: string): Destination | undefined {
    if (!this.initialized) {
      return this.destinations.find(dest => dest.id === id);
    }
    return this.destinations.find(dest => dest.id === id);
  }

  async addDestination(destination: Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>): Promise<Destination> {
    const newDestination: Destination = {
      ...destination,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.destinations.push(newDestination);
    await this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DestinationManager: Added new destination:', newDestination.name);
    return newDestination;
  }

  async updateDestination(id: string, updates: Partial<Omit<Destination, 'id' | 'createdAt'>>): Promise<Destination | null> {
    const index = this.destinations.findIndex(dest => dest.id === id);
    if (index === -1) {
      console.error('DestinationManager: Destination not found for update:', id);
      return null;
    }
    
    this.destinations[index] = { 
      ...this.destinations[index], 
      ...updates,
      updatedAt: new Date()
    };
    
    await this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DestinationManager: Updated destination:', this.destinations[index].name);
    return this.destinations[index];
  }

  async deleteDestination(id: string): Promise<boolean> {
    const index = this.destinations.findIndex(dest => dest.id === id);
    if (index === -1) {
      console.error('DestinationManager: Destination not found for deletion:', id);
      return false;
    }
    
    const deletedDestination = this.destinations.splice(index, 1)[0];
    await this.saveToStorage();
    this.notifySubscribers();
    
    console.log('DestinationManager: Deleted destination:', deletedDestination.name);
    return true;
  }

  searchDestinations(query: string): Destination[] {
    if (!this.initialized) {
      return this.destinations.filter(dest => 
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        (dest.description && dest.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    const lowerQuery = query.toLowerCase();
    return this.destinations.filter(dest => 
      dest.name.toLowerCase().includes(lowerQuery) ||
      (dest.description && dest.description.toLowerCase().includes(lowerQuery))
    );
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Force refresh from storage
  async forceRefresh(): Promise<void> {
    console.log('DestinationManager: Force refreshing destinations');
    this.destinations = [];
    await this.loadDestinations();
  }
}

export const destinationManager = new DestinationManager();
