// Minimal Supabase destination manager for admin functionality
export interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export class SupabaseDestinationManager {
  private static instance: SupabaseDestinationManager;
  private destinations: Destination[] = [];

  static getInstance(): SupabaseDestinationManager {
    if (!SupabaseDestinationManager.instance) {
      SupabaseDestinationManager.instance = new SupabaseDestinationManager();
    }
    return SupabaseDestinationManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Destination[]> {
    return this.destinations;
  }

  async getById(id: string): Promise<Destination | null> {
    return this.destinations.find(d => d.id === id) || null;
  }

  async create(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<Destination> {
    const newDestination: Destination = {
      ...destination,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.destinations.push(newDestination);
    return newDestination;
  }

  async update(id: string, updates: Partial<Destination>): Promise<Destination | null> {
    const index = this.destinations.findIndex(d => d.id === id);
    if (index !== -1) {
      this.destinations[index] = { ...this.destinations[index], ...updates, updated_at: new Date().toISOString() };
      return this.destinations[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.destinations.findIndex(d => d.id === id);
    if (index !== -1) {
      this.destinations.splice(index, 1);
      return true;
    }
    return false;
  }

  getAllDestinations(): Destination[] {
    return this.destinations;
  }

  isLoading(): boolean {
    return false;
  }

  isInitialized(): boolean {
    return true;
  }

  async addDestination(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<Destination> {
    const newDestination: Destination = {
      ...destination,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.destinations.push(newDestination);
    return newDestination;
  }
}

export const supabaseDestinationManager = SupabaseDestinationManager.getInstance();
