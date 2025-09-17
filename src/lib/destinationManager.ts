// Minimal destination manager for admin functionality
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

export class DestinationManager {
  private static instance: DestinationManager;
  private destinations: Destination[] = [];

  static getInstance(): DestinationManager {
    if (!DestinationManager.instance) {
      DestinationManager.instance = new DestinationManager();
    }
    return DestinationManager.instance;
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

  async getAllDestinations(): Promise<Destination[]> {
    return this.destinations;
  }

  async updateDestination(id: string, data: Partial<Destination>): Promise<Destination | null> {
    return this.update(id, data);
  }

  async deleteDestination(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async addDestination(data: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<Destination> {
    return this.create(data);
  }
}

export const destinationManager = DestinationManager.getInstance();
