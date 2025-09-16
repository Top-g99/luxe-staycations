import { supabase, TABLES, Destination } from '../supabaseClient';

export class DestinationManager {
  // Get all destinations
  async getAllDestinations(): Promise<Destination[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  // Get destination by ID
  async getDestinationById(id: string): Promise<Destination | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      return null;
    }
  }

  // Create new destination
  async createDestination(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<Destination | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .insert([destination])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating destination:', error);
      return null;
    }
  }

  // Update destination
  async updateDestination(id: string, updates: Partial<Destination>): Promise<Destination | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating destination:', error);
      return null;
    }
  }

  // Delete destination
  async deleteDestination(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.DESTINATIONS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting destination:', error);
      return false;
    }
  }

  // Get destinations by state
  async getDestinationsByState(state: string): Promise<Destination[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .eq('state', state)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching destinations by state:', error);
      return [];
    }
  }

  // Get popular destinations
  async getPopularDestinations(): Promise<Destination[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .eq('is_popular', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      return [];
    }
  }

  // Toggle popular status
  async togglePopularStatus(id: string): Promise<boolean> {
    try {
      const destination = await this.getDestinationById(id);
      if (!destination) return false;
      
      return await this.updateDestination(id, { is_popular: !destination.is_popular }) !== null;
    } catch (error) {
      console.error('Error toggling popular status:', error);
      return false;
    }
  }

  // Get destination statistics
  async getDestinationStats(): Promise<{
    total: number;
    popular: number;
    byState: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*');
      
      if (error) throw error;
      
      const destinations = data || [];
      const stats = {
        total: destinations.length,
        popular: destinations.filter(d => d.is_popular).length,
        byState: {} as Record<string, number>
      };
      
      destinations.forEach(destination => {
        stats.byState[destination.state] = (stats.byState[destination.state] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching destination stats:', error);
      return { total: 0, popular: 0, byState: {} };
    }
  }

  // Search destinations
  async searchDestinations(query: string): Promise<Destination[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .or(`name.ilike.%${query}%,state.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }
}

export const destinationManager = new DestinationManager();
