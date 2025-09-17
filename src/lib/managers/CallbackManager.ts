import { Callback as CallbackRequest } from '@/lib/supabaseClient';

export class CallbackManager {
  constructor() {
    // Initialization if needed
  }

  async getAllCallbacks(): Promise<CallbackRequest[]> {
    try {
      const response = await fetch('/api/admin/callbacks');
      if (!response.ok) throw new Error('Failed to fetch callbacks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching callbacks:', error);
      return [];
    }
  }

  async getCallback(id: string): Promise<CallbackRequest | null> {
    try {
      const response = await fetch(`/api/admin/callbacks?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch callback');
      return await response.json();
    } catch (error) {
      console.error('Error fetching callback:', error);
      return null;
    }
  }

  async createCallback(callback: Omit<CallbackRequest, 'id' | 'created_at' | 'updated_at'>): Promise<CallbackRequest | null> {
    try {
      const response = await fetch('/api/admin/callbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callback)
      });
      if (!response.ok) throw new Error('Failed to create callback');
      return await response.json();
    } catch (error) {
      console.error('Error creating callback:', error);
      return null;
    }
  }

  async updateCallback(id: string, callback: Partial<CallbackRequest>): Promise<CallbackRequest | null> {
    try {
      const response = await fetch('/api/admin/callbacks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...callback })
      });
      if (!response.ok) throw new Error('Failed to update callback');
      return await response.json();
    } catch (error) {
      console.error('Error updating callback:', error);
      return null;
    }
  }

  async deleteCallback(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/callbacks?id=${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting callback:', error);
      return false;
    }
  }

  async getCallbackStats(): Promise<{ total: number; pending: number; contacted: number; resolved: number; dailyStats: Record<string, number> }> {
    try {
      const callbacks = await this.getAllCallbacks();
      const dailyStats: Record<string, number> = {};
      
      callbacks.forEach(callback => {
        if (callback.created_at) {
          const date = new Date(callback.created_at).toISOString().substring(0, 10); // YYYY-MM-DD
          dailyStats[date] = (dailyStats[date] || 0) + 1;
        }
      });

      return {
        total: callbacks.length,
        pending: callbacks.filter(c => c.status === 'pending').length,
        contacted: callbacks.filter(c => c.status === 'contacted').length,
        resolved: callbacks.filter(c => c.status === 'resolved').length,
        dailyStats
      };
    } catch (error) {
      console.error('Error fetching callback stats:', error);
      return { total: 0, pending: 0, contacted: 0, resolved: 0, dailyStats: {} };
    }
  }

  async getRecentCallbacks(limit: number = 5): Promise<CallbackRequest[]> {
    try {
      const callbacks = await this.getAllCallbacks();
      return callbacks
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent callbacks:', error);
      return [];
    }
  }
}

export const callbackManager = new CallbackManager();