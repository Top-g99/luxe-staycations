import { Destination } from '@/lib/supabaseClient';

export class DestinationManager {
  constructor() {
    // Initialization if needed
  }

  async getAllDestinations(): Promise<Destination[]> {
    try {
      const response = await fetch('/api/admin/destinations');
      if (!response.ok) throw new Error('Failed to fetch destinations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  async getDestination(id: string): Promise<Destination | null> {
    try {
      const response = await fetch(`/api/admin/destinations?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch destination');
      return await response.json();
    } catch (error) {
      console.error('Error fetching destination:', error);
      return null;
    }
  }

  async createDestination(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<Destination | null> {
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(destination)
      });
      if (!response.ok) throw new Error('Failed to create destination');
      return await response.json();
    } catch (error) {
      console.error('Error creating destination:', error);
      return null;
    }
  }

  async updateDestination(id: string, destination: Partial<Destination>): Promise<Destination | null> {
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...destination })
      });
      if (!response.ok) throw new Error('Failed to update destination');
      return await response.json();
    } catch (error) {
      console.error('Error updating destination:', error);
      return null;
    }
  }

  async deleteDestination(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/destinations?id=${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting destination:', error);
      return false;
    }
  }

  async getDestinationStats(): Promise<{ total: number; popular: number; byState: Record<string, number> }> {
    try {
      const destinations = await this.getAllDestinations();
      const byState: Record<string, number> = {};
      
      destinations.forEach(destination => {
        const state = destination.state || 'Unknown';
        byState[state] = (byState[state] || 0) + 1;
      });

      return {
        total: destinations.length,
        popular: destinations.filter(d => d.is_popular).length,
        byState
      };
    } catch (error) {
      console.error('Error fetching destination stats:', error);
      return { total: 0, popular: 0, byState: {} };
    }
  }

  async getPopularDestinations(): Promise<Destination[]> {
    try {
      const destinations = await this.getAllDestinations();
      return destinations.filter(d => d.is_popular);
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      return [];
    }
  }
}

export const destinationManager = new DestinationManager();