// Minimal Supabase property manager for admin functionality
export interface Property {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  type: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  available: boolean;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
}

export class SupabasePropertyManager {
  private static instance: SupabasePropertyManager;
  private properties: Property[] = [];

  static getInstance(): SupabasePropertyManager {
    if (!SupabasePropertyManager.instance) {
      SupabasePropertyManager.instance = new SupabasePropertyManager();
    }
    return SupabasePropertyManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Property[]> {
    return this.properties;
  }

  async getById(id: string): Promise<Property | null> {
    return this.properties.find(p => p.id === id) || null;
  }

  async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.properties.push(newProperty);
    return newProperty;
  }

  async update(id: string, updates: Partial<Property>): Promise<Property | null> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index !== -1) {
      this.properties[index] = { ...this.properties[index], ...updates, updated_at: new Date().toISOString() };
      return this.properties[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index !== -1) {
      this.properties.splice(index, 1);
      return true;
    }
    return false;
  }

  getProperties(): Property[] {
    return this.properties;
  }

  isLoading(): boolean {
    return false;
  }

  isInitialized(): boolean {
    return true;
  }

  async addProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.properties.push(newProperty);
    return newProperty;
  }
}

export const supabasePropertyManager = SupabasePropertyManager.getInstance();
