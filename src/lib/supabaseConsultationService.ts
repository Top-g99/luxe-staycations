// Minimal Supabase consultation service for admin functionality
export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_type?: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  property_description?: string;
  consultation_type?: string;
  preferred_date?: string;
  preferred_time?: string;
  additional_notes?: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export class SupabaseConsultationService {
  private static instance: SupabaseConsultationService;
  private consultations: Consultation[] = [];

  static getInstance(): SupabaseConsultationService {
    if (!SupabaseConsultationService.instance) {
      SupabaseConsultationService.instance = new SupabaseConsultationService();
    }
    return SupabaseConsultationService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Consultation[]> {
    return this.consultations;
  }

  async getById(id: string): Promise<Consultation | null> {
    return this.consultations.find(c => c.id === id) || null;
  }

  async create(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    const newConsultation: Consultation = {
      ...consultation,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.consultations.push(newConsultation);
    return newConsultation;
  }

  async update(id: string, updates: Partial<Consultation>): Promise<Consultation | null> {
    const index = this.consultations.findIndex(c => c.id === id);
    if (index !== -1) {
      this.consultations[index] = { ...this.consultations[index], ...updates, updated_at: new Date().toISOString() };
      return this.consultations[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.consultations.findIndex(c => c.id === id);
    if (index !== -1) {
      this.consultations.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAllConsultations(): Promise<Consultation[]> {
    return this.consultations;
  }

  async createConsultation(data: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    return this.create(data);
  }

  async clearAllConsultations(): Promise<boolean> {
    this.consultations = [];
    console.log('All consultations cleared');
    return true;
  }
}

export const supabaseConsultationService = SupabaseConsultationService.getInstance();
