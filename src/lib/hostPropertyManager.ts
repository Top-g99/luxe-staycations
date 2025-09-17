// Minimal host property manager for admin functionality
export interface HostProperty {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

export class HostPropertyManager {
  private static instance: HostPropertyManager;
  private properties: HostProperty[] = [];

  static getInstance(): HostPropertyManager {
    if (!HostPropertyManager.instance) {
      HostPropertyManager.instance = new HostPropertyManager();
    }
    return HostPropertyManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<HostProperty[]> {
    return this.properties;
  }

  async getById(id: string): Promise<HostProperty | null> {
    return this.properties.find(p => p.id === id) || null;
  }

  async create(property: Omit<HostProperty, 'id' | 'created_at' | 'updated_at'>): Promise<HostProperty> {
    const newProperty: HostProperty = {
      ...property,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.properties.push(newProperty);
    return newProperty;
  }

  async update(id: string, updates: Partial<HostProperty>): Promise<HostProperty | null> {
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
}

export const hostPropertyManager = HostPropertyManager.getInstance();
