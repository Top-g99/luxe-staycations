import { supabase, TABLES, Callback } from '../supabaseClient';
import { emailManager } from './EmailManager';

export class CallbackManager {
  // Get all callbacks
  async getAllCallbacks(): Promise<Callback[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching callbacks:', error);
      return [];
    }
  }

  // Get callback by ID
  async getCallbackById(id: string): Promise<Callback | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching callback:', error);
      return null;
    }
  }

  // Create new callback
  async createCallback(callback: Omit<Callback, 'id' | 'created_at' | 'updated_at'>): Promise<Callback | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .insert([callback])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating callback:', error);
      return null;
    }
  }

  // Update callback
  async updateCallback(id: string, updates: Partial<Callback>): Promise<Callback | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating callback:', error);
      return null;
    }
  }

  // Delete callback
  async deleteCallback(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.CALLBACKS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting callback:', error);
      return false;
    }
  }

  // Get callbacks by status
  async getCallbacksByStatus(status: Callback['status']): Promise<Callback[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching callbacks by status:', error);
      return [];
    }
  }

  // Update callback status
  async updateCallbackStatus(id: string, status: Callback['status']): Promise<boolean> {
    try {
      const callback = await this.getCallbackById(id);
      if (!callback) return false;

      const result = await this.updateCallback(id, { status });
      
      // Send email response if status is changed to contacted or resolved
      if (status === 'contacted' || status === 'resolved') {
        await emailManager.sendCallbackResponse({
          name: callback.name,
          email: callback.email,
          message: callback.message
        });
      }
      
      return result !== null;
    } catch (error) {
      console.error('Error updating callback status:', error);
      return false;
    }
  }

  // Get callback statistics
  async getCallbackStats(): Promise<{
    total: number;
    pending: number;
    contacted: number;
    resolved: number;
    dailyStats: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .select('*');
      
      if (error) throw error;
      
      const callbacks = data || [];
      const stats = {
        total: callbacks.length,
        pending: callbacks.filter(c => c.status === 'pending').length,
        contacted: callbacks.filter(c => c.status === 'contacted').length,
        resolved: callbacks.filter(c => c.status === 'resolved').length,
        dailyStats: {} as Record<string, number>
      };
      
      callbacks.forEach(callback => {
        const date = new Date(callback.created_at).toISOString().substring(0, 10);
        stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching callback stats:', error);
      return {
        total: 0,
        pending: 0,
        contacted: 0,
        resolved: 0,
        dailyStats: {}
      };
    }
  }

  // Mark as contacted
  async markAsContacted(id: string): Promise<boolean> {
    return await this.updateCallbackStatus(id, 'contacted');
  }

  // Mark as resolved
  async markAsResolved(id: string): Promise<boolean> {
    return await this.updateCallbackStatus(id, 'resolved');
  }

  // Get recent callbacks
  async getRecentCallbacks(limit: number = 10): Promise<Callback[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CALLBACKS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent callbacks:', error);
      return [];
    }
  }
}

export const callbackManager = new CallbackManager();
