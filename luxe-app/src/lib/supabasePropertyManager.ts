import { getSupabaseClient, isSupabaseAvailable } from './supabase';

export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  type: string;
  amenities: string[];
  featured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  hostName?: string;
  hostImage?: string;
  images?: string[];
  highlights?: string[];
  squareFootage?: number;
  yearBuilt?: number;
  distanceToBeach?: number;
  distanceToCity?: number;
  primaryView?: string;
  propertyStyle?: string;
  policies?: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  created_at?: string;
  updated_at?: string;
}

class SupabasePropertyManager {
  private properties: Property[] = [];
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
      console.error('SupabasePropertyManager: Error initializing:', error);
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
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SupabasePropertyManager: Error loading from Supabase:', error);
        throw error;
      }

      this.properties = data || [];
      console.log('SupabasePropertyManager: Loaded properties from Supabase:', this.properties.length);
      
      // If no properties in Supabase, load defaults
      if (this.properties.length === 0) {
        await this.loadDefaultProperties();
      }
    } catch (error) {
      console.error('SupabasePropertyManager: Failed to load from Supabase, falling back to localStorage:', error);
      await this.loadFromLocalStorage();
    }
  }

  private async loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedProperties = localStorage.getItem('luxeProperties');
      if (savedProperties) {
        try {
          this.properties = JSON.parse(savedProperties);
          console.log('SupabasePropertyManager: Loaded properties from localStorage:', this.properties.length);
        } catch (error) {
          console.error('SupabasePropertyManager: Error parsing saved properties, loading defaults');
          await this.loadDefaultProperties();
        }
      } else {
        await this.loadDefaultProperties();
      }
    } else {
      await this.loadDefaultProperties();
    }
  }

  private async loadDefaultProperties() {
    const defaultProperties: Property[] = [];

    this.properties = defaultProperties;
    console.log('SupabasePropertyManager: No default properties loaded - system is now fully dynamic');
    
    // Save to both Supabase and localStorage
    await this.saveToSupabase();
    this.saveToLocalStorage();
  }

  private async saveToSupabase() {
    if (!isSupabaseAvailable()) return;

    try {
      const supabase = getSupabaseClient();
      
      // Clear existing properties and insert new ones
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('SupabasePropertyManager: Error clearing properties:', deleteError);
      }

      // Insert new properties
      const { error: insertError } = await supabase
        .from('properties')
        .insert(this.properties);

      if (insertError) {
        console.error('SupabasePropertyManager: Error saving to Supabase:', insertError);
      } else {
        console.log('SupabasePropertyManager: Saved properties to Supabase');
      }
    } catch (error) {
      console.error('SupabasePropertyManager: Error saving to Supabase:', error);
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeProperties', JSON.stringify(this.properties));
      console.log('SupabasePropertyManager: Saved properties to localStorage');
    }
  }

  async addProperty(property: Omit<Property, 'id'>): Promise<Property> {
    const newProperty: Property = {
      ...property,
      id: crypto.randomUUID()
    };

    this.properties.push(newProperty);
    
    // Save to both Supabase and localStorage
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('properties')
          .insert(newProperty);

        if (error) {
          console.error('SupabasePropertyManager: Error adding property to Supabase:', error);
        }
      } catch (error) {
        console.error('SupabasePropertyManager: Error adding property to Supabase:', error);
      }
    }
    
    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return newProperty;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProperty = { ...this.properties[index], ...updates };
    this.properties[index] = updatedProperty;

    // Update in Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('SupabasePropertyManager: Error updating property in Supabase:', error);
        }
      } catch (error) {
        console.error('SupabasePropertyManager: Error updating property in Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.properties.splice(index, 1);

    // Delete from Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('SupabasePropertyManager: Error deleting property from Supabase:', error);
        }
      } catch (error) {
        console.error('SupabasePropertyManager: Error deleting property from Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return true;
  }

  getProperties(): Property[] {
    return [...this.properties];
  }

  getFeaturedProperties(): Property[] {
    return this.properties.filter(p => p.featured);
  }

  getPropertyById(id: string): Property | undefined {
    return this.properties.find(p => p.id === id);
  }

  searchProperties(query: string): Property[] {
    const lowerQuery = query.toLowerCase();
    return this.properties.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.location.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.type.toLowerCase().includes(lowerQuery)
    );
  }

  filterProperties(filters: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    location?: string;
  }): Property[] {
    return this.properties.filter(p => {
      if (filters.type && p.type !== filters.type) return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
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

export const supabasePropertyManager = new SupabasePropertyManager();
