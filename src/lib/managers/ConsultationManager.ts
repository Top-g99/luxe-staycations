import { Consultation } from '@/lib/supabaseClient';

export class ConsultationManager {
  constructor() {
    // Initialization if needed
  }

  async getAllConsultations(): Promise<Consultation[]> {
    try {
      const response = await fetch('/api/admin/consultations');
      if (!response.ok) throw new Error('Failed to fetch consultations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    try {
      const response = await fetch(`/api/admin/consultations?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch consultation');
      return await response.json();
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return null;
    }
  }

  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation | null> {
    try {
      const response = await fetch('/api/admin/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultation)
      });
      if (!response.ok) throw new Error('Failed to create consultation');
      return await response.json();
    } catch (error) {
      console.error('Error creating consultation:', error);
      return null;
    }
  }

  async updateConsultation(id: string, consultation: Partial<Consultation>): Promise<Consultation | null> {
    try {
      const response = await fetch('/api/admin/consultations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...consultation })
      });
      if (!response.ok) throw new Error('Failed to update consultation');
      return await response.json();
    } catch (error) {
      console.error('Error updating consultation:', error);
      return null;
    }
  }

  async deleteConsultation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/consultations?id=${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      return false;
    }
  }

  async getConsultationStats(): Promise<{ total: number; pending: number; scheduled: number; completed: number; byPropertyType: Record<string, number>; byLocation: Record<string, number> }> {
    try {
      const consultations = await this.getAllConsultations();
      const byPropertyType: Record<string, number> = {};
      const byLocation: Record<string, number> = {};
      
      consultations.forEach(consultation => {
        const propertyType = consultation.property_type || 'Unknown';
        const location = consultation.location || 'Unknown';
        
        byPropertyType[propertyType] = (byPropertyType[propertyType] || 0) + 1;
        byLocation[location] = (byLocation[location] || 0) + 1;
      });

      return {
        total: consultations.length,
        pending: consultations.filter(c => c.status === 'pending').length,
        scheduled: consultations.filter(c => c.status === 'scheduled').length,
        completed: consultations.filter(c => c.status === 'completed').length,
        byPropertyType,
        byLocation
      };
    } catch (error) {
      console.error('Error fetching consultation stats:', error);
      return { total: 0, pending: 0, scheduled: 0, completed: 0, byPropertyType: {}, byLocation: {} };
    }
  }

  async getRecentConsultations(limit: number = 5): Promise<Consultation[]> {
    try {
      const consultations = await this.getAllConsultations();
      return consultations
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent consultations:', error);
      return [];
    }
  }
}

export const consultationManager = new ConsultationManager();