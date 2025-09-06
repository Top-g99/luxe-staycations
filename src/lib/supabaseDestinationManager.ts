import { getSupabaseClient, isSupabaseAvailable } from './supabase';

export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  highlights: string[];
  images: string[];
  created_at?: string;
  updated_at?: string;
}

class SupabaseDestinationManager {
  private destinations: Destination[] = [];
  private subscribers: (() => void)[] = [];
  private initialized = false;
  private loading = false;

  async initialize() {
    if (this.initialized) return;
    
    this.loading = true;
    
    try {
      if (isSupabaseAvailable()) {
        await this.loadFromSupabase();
      } else {
        await this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('SupabaseDestinationManager: Error initializing:', error);
      await this.loadFromLocalStorage();
    }
    
    this.initialized = true;
    this.loading = false;
    this.notifySubscribers();
  }

  private async loadFromSupabase() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SupabaseDestinationManager: Error loading from Supabase:', error);
        throw error;
      }

      this.destinations = data || [];
      console.log('SupabaseDestinationManager: Loaded destinations from Supabase:', this.destinations.length);
      
      // If no destinations in Supabase, load defaults
      if (this.destinations.length === 0) {
        await this.loadDefaultDestinations();
      }
    } catch (error) {
      console.error('SupabaseDestinationManager: Failed to load from Supabase, falling back to localStorage:', error);
      await this.loadFromLocalStorage();
    }
  }

  private async loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedDestinations = localStorage.getItem('luxeDestinations');
      if (savedDestinations) {
        try {
          this.destinations = JSON.parse(savedDestinations);
          console.log('SupabaseDestinationManager: Loaded destinations from localStorage:', this.destinations.length);
        } catch (error) {
          console.error('SupabaseDestinationManager: Error parsing saved destinations, loading defaults');
          await this.loadDefaultDestinations();
        }
      } else {
        await this.loadDefaultDestinations();
      }
    } else {
      await this.loadDefaultDestinations();
    }
  }

  private async loadDefaultDestinations() {
    const defaultDestinations: Destination[] = [
      {
        id: '1',
        name: 'Lonavala',
        location: 'Maharashtra, India',
        description: 'A beautiful hill station known for its scenic beauty, waterfalls, and adventure activities. Perfect for weekend getaways and family vacations.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        rating: 4.7,
        reviews: 234,
        highlights: ['Scenic Views', 'Waterfalls', 'Adventure Sports', 'Family Friendly'],
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
        ]
      },
      {
        id: '2',
        name: 'Mahabaleshwar',
        location: 'Maharashtra, India',
        description: 'Famous for its strawberry farms, scenic valleys, and pleasant weather throughout the year. A romantic getaway destination.',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        rating: 4.5,
        reviews: 189,
        highlights: ['Strawberry Farms', 'Valley Views', 'Romantic Getaway', 'Pleasant Weather'],
        images: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'
        ]
      },
      {
        id: '3',
        name: 'Goa',
        location: 'India',
        description: 'Beach paradise with pristine beaches, vibrant nightlife, and Portuguese heritage. Perfect for beach lovers and party enthusiasts.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        rating: 4.8,
        reviews: 456,
        highlights: ['Beach Paradise', 'Nightlife', 'Portuguese Heritage', 'Water Sports'],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
        ]
      }
    ];

    this.destinations = defaultDestinations;
    console.log('SupabaseDestinationManager: Loaded default destinations:', this.destinations.length);
    
    // Save to both Supabase and localStorage
    await this.saveToSupabase();
    this.saveToLocalStorage();
  }

  private async saveToSupabase() {
    if (!isSupabaseAvailable()) return;

    try {
      const supabase = getSupabaseClient();
      
      // Clear existing destinations and insert new ones
      const { error: deleteError } = await supabase
        .from('destinations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('SupabaseDestinationManager: Error clearing destinations:', deleteError);
      }

      // Insert new destinations
      const { error: insertError } = await supabase
        .from('destinations')
        .insert(this.destinations);

      if (insertError) {
        console.error('SupabaseDestinationManager: Error saving to Supabase:', insertError);
      } else {
        console.log('SupabaseDestinationManager: Saved destinations to Supabase');
      }
    } catch (error) {
      console.error('SupabaseDestinationManager: Error saving to Supabase:', error);
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeDestinations', JSON.stringify(this.destinations));
      console.log('SupabaseDestinationManager: Saved destinations to localStorage');
    }
  }

  async addDestination(destination: Omit<Destination, 'id'>): Promise<Destination> {
    const newDestination: Destination = {
      ...destination,
      id: crypto.randomUUID()
    };

    this.destinations.push(newDestination);
    
    // Save to both Supabase and localStorage
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('destinations')
          .insert(newDestination);

        if (error) {
          console.error('SupabaseDestinationManager: Error adding destination to Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseDestinationManager: Error adding destination to Supabase:', error);
      }
    }
    
    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return newDestination;
  }

  async updateDestination(id: string, updates: Partial<Destination>): Promise<Destination | null> {
    const index = this.destinations.findIndex(d => d.id === id);
    if (index === -1) return null;

    const updatedDestination = { ...this.destinations[index], ...updates };
    this.destinations[index] = updatedDestination;

    // Update in Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('destinations')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('SupabaseDestinationManager: Error updating destination in Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseDestinationManager: Error updating destination in Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return updatedDestination;
  }

  async deleteDestination(id: string): Promise<boolean> {
    const index = this.destinations.findIndex(d => d.id === id);
    if (index === -1) return false;

    this.destinations.splice(index, 1);

    // Delete from Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('destinations')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('SupabaseDestinationManager: Error deleting destination from Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseDestinationManager: Error deleting destination from Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return true;
  }

  getAllDestinations(): Destination[] {
    return [...this.destinations];
  }

  getDestinationById(id: string): Destination | undefined {
    return this.destinations.find(d => d.id === id);
  }

  searchDestinations(query: string): Destination[] {
    const lowerQuery = query.toLowerCase();
    return this.destinations.filter(d => 
      d.name.toLowerCase().includes(lowerQuery) ||
      d.location.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery)
    );
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  isLoading(): boolean {
    return this.loading;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async refresh() {
    this.initialized = false;
    await this.initialize();
  }
}

export const supabaseDestinationManager = new SupabaseDestinationManager();
