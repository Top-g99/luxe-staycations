import { supabase, TABLES, Consultation } from '../supabaseClient';
import { emailManager } from './EmailManager';

export class ConsultationManager {
  // Get all consultations
  async getAllConsultations(): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
  }

  // Get consultation by ID
  async getConsultationById(id: string): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return null;
    }
  }

  // Create new consultation
  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .insert([consultation])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      return null;
    }
  }

  // Update consultation
  async updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating consultation:', error);
      return null;
    }
  }

  // Delete consultation
  async deleteConsultation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      return false;
    }
  }

  // Get consultations by status
  async getConsultationsByStatus(status: Consultation['status']): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consultations by status:', error);
      return [];
    }
  }

  // Update consultation status
  async updateConsultationStatus(id: string, status: Consultation['status']): Promise<boolean> {
    try {
      const consultation = await this.getConsultationById(id);
      if (!consultation) return false;

      const result = await this.updateConsultation(id, { status });
      
      // Send email confirmation if status is changed to scheduled
      if (status === 'scheduled') {
        await emailManager.sendConsultationConfirmation({
          name: consultation.name,
          email: consultation.email,
          propertyType: consultation.property_type,
          location: consultation.location
        });
      }
      
      return result !== null;
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return false;
    }
  }

  // Get consultation statistics
  async getConsultationStats(): Promise<{
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
    byPropertyType: Record<string, number>;
    byLocation: Record<string, number>;
    dailyStats: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*');
      
      if (error) throw error;
      
      const consultations = data || [];
      const stats = {
        total: consultations.length,
        pending: consultations.filter(c => c.status === 'pending').length,
        scheduled: consultations.filter(c => c.status === 'scheduled').length,
        completed: consultations.filter(c => c.status === 'completed').length,
        byPropertyType: {} as Record<string, number>,
        byLocation: {} as Record<string, number>,
        dailyStats: {} as Record<string, number>
      };
      
      consultations.forEach(consultation => {
        stats.byPropertyType[consultation.property_type] = (stats.byPropertyType[consultation.property_type] || 0) + 1;
        stats.byLocation[consultation.location] = (stats.byLocation[consultation.location] || 0) + 1;
        
        const date = new Date(consultation.created_at).toISOString().substring(0, 10);
        stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching consultation stats:', error);
      return {
        total: 0,
        pending: 0,
        scheduled: 0,
        completed: 0,
        byPropertyType: {},
        byLocation: {},
        dailyStats: {}
      };
    }
  }

  // Schedule consultation
  async scheduleConsultation(id: string): Promise<boolean> {
    return await this.updateConsultationStatus(id, 'scheduled');
  }

  // Complete consultation
  async completeConsultation(id: string): Promise<boolean> {
    return await this.updateConsultationStatus(id, 'completed');
  }

  // Get recent consultations
  async getRecentConsultations(limit: number = 10): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent consultations:', error);
      return [];
    }
  }

  // Get consultations by property type
  async getConsultationsByPropertyType(propertyType: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*')
        .eq('property_type', propertyType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consultations by property type:', error);
      return [];
    }
  }

  // Get consultations by location
  async getConsultationsByLocation(location: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONSULTATIONS)
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consultations by location:', error);
      return [];
    }
  }
}

export const consultationManager = new ConsultationManager();
