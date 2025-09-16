import { supabase, TABLES, SpecialRequest } from '../supabaseClient';

export class SpecialRequestsManager {
  // Get all special requests
  async getAllSpecialRequests(): Promise<SpecialRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching special requests:', error);
      return [];
    }
  }

  // Get special request by ID
  async getSpecialRequestById(id: string): Promise<SpecialRequest | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching special request:', error);
      return null;
    }
  }

  // Create new special request
  async createSpecialRequest(specialRequest: Omit<SpecialRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SpecialRequest | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .insert([specialRequest])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating special request:', error);
      return null;
    }
  }

  // Update special request
  async updateSpecialRequest(id: string, updates: Partial<SpecialRequest>): Promise<SpecialRequest | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating special request:', error);
      return null;
    }
  }

  // Delete special request
  async deleteSpecialRequest(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting special request:', error);
      return false;
    }
  }

  // Get special requests by booking
  async getSpecialRequestsByBooking(bookingId: string): Promise<SpecialRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching special requests by booking:', error);
      return [];
    }
  }

  // Get special requests by status
  async getSpecialRequestsByStatus(status: SpecialRequest['status']): Promise<SpecialRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching special requests by status:', error);
      return [];
    }
  }

  // Get special requests by type
  async getSpecialRequestsByType(requestType: string): Promise<SpecialRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .eq('request_type', requestType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching special requests by type:', error);
      return [];
    }
  }

  // Update special request status
  async updateSpecialRequestStatus(id: string, status: SpecialRequest['status']): Promise<boolean> {
    try {
      const result = await this.updateSpecialRequest(id, { status });
      return result !== null;
    } catch (error) {
      console.error('Error updating special request status:', error);
      return false;
    }
  }

  // Approve special request
  async approveSpecialRequest(id: string): Promise<boolean> {
    return await this.updateSpecialRequestStatus(id, 'approved');
  }

  // Reject special request
  async rejectSpecialRequest(id: string): Promise<boolean> {
    return await this.updateSpecialRequestStatus(id, 'rejected');
  }

  // Get special request statistics
  async getSpecialRequestStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: Record<string, number>;
    dailyStats: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*');
      
      if (error) throw error;
      
      const requests = data || [];
      const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        byType: {} as Record<string, number>,
        dailyStats: {} as Record<string, number>
      };
      
      requests.forEach(request => {
        stats.byType[request.request_type] = (stats.byType[request.request_type] || 0) + 1;
        
        const date = new Date(request.created_at).toISOString().substring(0, 10);
        stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching special request stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        byType: {},
        dailyStats: {}
      };
    }
  }

  // Get recent special requests
  async getRecentSpecialRequests(limit: number = 10): Promise<SpecialRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent special requests:', error);
      return [];
    }
  }

  // Search special requests
  async searchSpecialRequests(query: string): Promise<SpecialRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*')
        .or(`request_type.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching special requests:', error);
      return [];
    }
  }

  // Get special requests with booking details
  async getSpecialRequestsWithBooking(): Promise<(SpecialRequest & { booking: any })[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select(`
          *,
          booking:${TABLES.BOOKINGS}(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching special requests with booking:', error);
      return [];
    }
  }

  // Get pending special requests count
  async getPendingSpecialRequestsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(TABLES.SPECIAL_REQUESTS)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching pending special requests count:', error);
      return 0;
    }
  }

  // Get common request types
  async getCommonRequestTypes(): Promise<{ type: string; count: number }[]> {
    try {
      const stats = await this.getSpecialRequestStats();
      return Object.entries(stats.byType)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching common request types:', error);
      return [];
    }
  }
}

export const specialRequestsManager = new SpecialRequestsManager();
