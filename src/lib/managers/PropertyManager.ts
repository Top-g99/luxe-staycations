import { supabase, TABLES, Property } from '../supabaseClient';

export class PropertyManager {
  // Get all properties
  async getAllProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  // Create new property
  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .insert([property])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      return null;
    }
  }

  // Update property
  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating property:', error);
      return null;
    }
  }

  // Delete property
  async deleteProperty(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.PROPERTIES)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  // Get properties by type
  async getPropertiesByType(type: Property['property_type']): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*')
        .eq('property_type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties by type:', error);
      return [];
    }
  }

  // Get properties by location
  async getPropertiesByLocation(state: string, city?: string): Promise<Property[]> {
    try {
      let query = supabase
        .from(TABLES.PROPERTIES)
        .select('*')
        .eq('state', state)
        .eq('is_active', true);
      
      if (city) {
        query = query.eq('city', city);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties by location:', error);
      return [];
    }
  }

  // Get property statistics
  async getPropertyStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    byState: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*');
      
      if (error) throw error;
      
      const properties = data || [];
      const stats = {
        total: properties.length,
        active: properties.filter(p => p.is_active).length,
        inactive: properties.filter(p => !p.is_active).length,
        byType: {} as Record<string, number>,
        byState: {} as Record<string, number>
      };
      
      properties.forEach(property => {
        stats.byType[property.property_type] = (stats.byType[property.property_type] || 0) + 1;
        stats.byState[property.state] = (stats.byState[property.state] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching property stats:', error);
      return { total: 0, active: 0, inactive: 0, byType: {}, byState: {} };
    }
  }

  // Toggle property status
  async togglePropertyStatus(id: string): Promise<boolean> {
    try {
      const property = await this.getPropertyById(id);
      if (!property) return false;
      
      return await this.updateProperty(id, { is_active: !property.is_active }) !== null;
    } catch (error) {
      console.error('Error toggling property status:', error);
      return false;
    }
  }
}

export const propertyManager = new PropertyManager();
