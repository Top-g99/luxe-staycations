import { supabase, TABLES, DatabaseConsultation } from './supabase';

// Base service class with common operations
class BaseSupabaseService {
  protected checkSupabase() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return supabase;
  }

  protected async handleError(error: any, operation: string): Promise<never> {
    console.error(`Supabase ${operation} error:`, error);
    const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || 'Unknown error';
    throw new Error(`Failed to ${operation}: ${errorMessage}`);
  }

  protected async executeQuery<T>(
    query: any,
    operation: string
  ): Promise<T> {
    const { data, error } = await query;
    if (error) {
      await this.handleError(error, operation);
    }
    if (!data) {
      throw new Error(`No data returned from ${operation}`);
    }
    return data;
  }
}

// Consultations Service
export class SupabaseConsultationService extends BaseSupabaseService {
  async getAllConsultations(): Promise<DatabaseConsultation[]> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.CONSULTATIONS)
      .select('*')
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch consultations');
  }

  async getConsultationById(id: string): Promise<DatabaseConsultation> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.CONSULTATIONS)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeQuery(query, 'fetch consultation');
  }

  async createConsultation(consultation: Omit<DatabaseConsultation, 'id' | 'submitted_date' | 'status' | 'created_at' | 'updated_at'>): Promise<DatabaseConsultation> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.CONSULTATIONS)
      .insert({
        ...consultation,
        status: 'pending',
        submitted_date: new Date().toISOString()
      })
      .select()
      .single();

    return this.executeQuery(query, 'create consultation');
  }

  async updateConsultation(id: string, updates: Partial<DatabaseConsultation>): Promise<DatabaseConsultation> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.CONSULTATIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return this.executeQuery(query, 'update consultation');
  }

  async deleteConsultation(id: string): Promise<boolean> {
    const supabaseClient = this.checkSupabase();
    
    const { error } = await supabaseClient
      .from(TABLES.CONSULTATIONS)
      .delete()
      .eq('id', id);

    if (error) {
      await this.handleError(error, 'delete consultation');
    }

    return true;
  }

  async getConsultationsByStatus(status: DatabaseConsultation['status']): Promise<DatabaseConsultation[]> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.CONSULTATIONS)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch consultations by status');
  }

  async getConsultationsByType(consultationType: DatabaseConsultation['consultation_type']): Promise<DatabaseConsultation[]> {
    const supabaseClient = this.checkSupabase();
    
    const query = supabaseClient
      .from(TABLES.CONSULTATIONS)
      .select('*')
      .eq('consultation_type', consultationType)
      .order('created_at', { ascending: false });

    return this.executeQuery(query, 'fetch consultations by type');
  }

  async getConsultationStats() {
    const allConsultations = await this.getAllConsultations();
    
    const total = allConsultations.length;
    const pending = allConsultations.filter(c => c.status === 'pending').length;
    const scheduled = allConsultations.filter(c => c.status === 'scheduled').length;
    const completed = allConsultations.filter(c => c.status === 'completed').length;
    const cancelled = allConsultations.filter(c => c.status === 'cancelled').length;

    return {
      total,
      pending,
      scheduled,
      completed,
      cancelled
    };
  }

  async clearAllConsultations(): Promise<boolean> {
    const supabaseClient = this.checkSupabase();
    
    const { error } = await supabaseClient
      .from(TABLES.CONSULTATIONS)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      await this.handleError(error, 'clear all consultations');
    }

    return true;
  }
}

// Export a single instance
export const supabaseConsultationService = new SupabaseConsultationService();
