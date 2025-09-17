import { supabase, TABLES, Property } from '@/lib/supabaseClient';

export class PropertyManager {
  constructor() {
    // Initialization if needed
  }

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

  async getProperty(id: string): Promise<Property | null> {
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

  async updateProperty(id: string, property: Partial<Property>): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .update({ ...property, updated_at: new Date().toISOString() })
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

  async getPropertyStats(): Promise<{ total: number; active: number; inactive: number; byType: Record<string, number>; byState: Record<string, number> }> {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*', { count: 'exact', head: true });
      if (totalError) throw totalError;

      const { count: activeCount, error: activeError } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (activeError) throw activeError;

      // Get properties by type
      const { data: typeData, error: typeError } = await supabase
        .from(TABLES.PROPERTIES)
        .select('property_type');
      if (typeError) throw typeError;

      const byType: Record<string, number> = {};
      typeData?.forEach(property => {
        const type = property.property_type || 'Unknown';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Get properties by state
      const { data: stateData, error: stateError } = await supabase
        .from(TABLES.PROPERTIES)
        .select('state');
      if (stateError) throw stateError;

      const byState: Record<string, number> = {};
      stateData?.forEach(property => {
        const state = property.state || 'Unknown';
        byState[state] = (byState[state] || 0) + 1;
      });

      return {
        total: totalCount || 0,
        active: activeCount || 0,
        inactive: (totalCount || 0) - (activeCount || 0),
        byType,
        byState
      };
    } catch (error) {
      console.error('Error fetching property stats:', error);
      return { total: 0, active: 0, inactive: 0, byType: {}, byState: {} };
    }
  }

  async getRecentProperties(limit: number = 5): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROPERTIES)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent properties:', error);
      return [];
    }
  }
}

export const propertyManager = new PropertyManager();