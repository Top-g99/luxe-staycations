import { supabase, TABLES, PartnerRequest } from '../supabaseClient';
import { emailManager } from './EmailManager';

export class PartnerManager {
  // Get all partner requests
  async getAllPartnerRequests(): Promise<PartnerRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching partner requests:', error);
      return [];
    }
  }

  // Get partner request by ID
  async getPartnerRequestById(id: string): Promise<PartnerRequest | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching partner request:', error);
      return null;
    }
  }

  // Create new partner request
  async createPartnerRequest(partnerRequest: Omit<PartnerRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PartnerRequest | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .insert([partnerRequest])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating partner request:', error);
      return null;
    }
  }

  // Update partner request
  async updatePartnerRequest(id: string, updates: Partial<PartnerRequest>): Promise<PartnerRequest | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating partner request:', error);
      return null;
    }
  }

  // Delete partner request
  async deletePartnerRequest(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting partner request:', error);
      return false;
    }
  }

  // Get partner requests by status
  async getPartnerRequestsByStatus(status: PartnerRequest['status']): Promise<PartnerRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching partner requests by status:', error);
      return [];
    }
  }

  // Update partner request status
  async updatePartnerRequestStatus(id: string, status: PartnerRequest['status']): Promise<boolean> {
    try {
      const partnerRequest = await this.getPartnerRequestById(id);
      if (!partnerRequest) return false;

      const result = await this.updatePartnerRequest(id, { status });
      
      // Send email response if status is changed to approved or rejected
      if (status === 'approved' || status === 'rejected') {
        await emailManager.sendPartnerResponse({
          name: partnerRequest.name,
          email: partnerRequest.email,
          propertyName: partnerRequest.property_name,
          status: status
        });
      }
      
      return result !== null;
    } catch (error) {
      console.error('Error updating partner request status:', error);
      return false;
    }
  }

  // Get partner request statistics
  async getPartnerRequestStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    approved: number;
    rejected: number;
    byPropertyType: Record<string, number>;
    byLocation: Record<string, number>;
    dailyStats: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*');
      
      if (error) throw error;
      
      const partnerRequests = data || [];
      const stats = {
        total: partnerRequests.length,
        pending: partnerRequests.filter(p => p.status === 'pending').length,
        reviewed: partnerRequests.filter(p => p.status === 'reviewed').length,
        approved: partnerRequests.filter(p => p.status === 'approved').length,
        rejected: partnerRequests.filter(p => p.status === 'rejected').length,
        byPropertyType: {} as Record<string, number>,
        byLocation: {} as Record<string, number>,
        dailyStats: {} as Record<string, number>
      };
      
      partnerRequests.forEach(partnerRequest => {
        stats.byPropertyType[partnerRequest.property_type] = (stats.byPropertyType[partnerRequest.property_type] || 0) + 1;
        stats.byLocation[partnerRequest.location] = (stats.byLocation[partnerRequest.location] || 0) + 1;
        
        const date = new Date(partnerRequest.created_at).toISOString().substring(0, 10);
        stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching partner request stats:', error);
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        approved: 0,
        rejected: 0,
        byPropertyType: {},
        byLocation: {},
        dailyStats: {}
      };
    }
  }

  // Review partner request
  async reviewPartnerRequest(id: string): Promise<boolean> {
    return await this.updatePartnerRequestStatus(id, 'reviewed');
  }

  // Approve partner request
  async approvePartnerRequest(id: string): Promise<boolean> {
    return await this.updatePartnerRequestStatus(id, 'approved');
  }

  // Reject partner request
  async rejectPartnerRequest(id: string): Promise<boolean> {
    return await this.updatePartnerRequestStatus(id, 'rejected');
  }

  // Get recent partner requests
  async getRecentPartnerRequests(limit: number = 10): Promise<PartnerRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent partner requests:', error);
      return [];
    }
  }

  // Get partner requests by property type
  async getPartnerRequestsByPropertyType(propertyType: string): Promise<PartnerRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*')
        .eq('property_type', propertyType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching partner requests by property type:', error);
      return [];
    }
  }

  // Get partner requests by location
  async getPartnerRequestsByLocation(location: string): Promise<PartnerRequest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PARTNER_REQUESTS)
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching partner requests by location:', error);
      return [];
    }
  }
}

export const partnerManager = new PartnerManager();
