export interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyDescription: string;
  consultationType: 'phone' | 'video' | 'in-person';
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  submittedDate: string;
  scheduledDate?: string;
  notes?: string;
}

class ConsultationManager {
  private consultations: ConsultationRequest[] = [];
  private subscribers: (() => void)[] = [];
  private storageKey = 'luxe_consultations';
  
  // Singleton instance for server-side persistence
  private static instance: ConsultationManager;

  constructor() {
    this.loadFromStorage();
  }

  // Get singleton instance
  static getInstance(): ConsultationManager {
    if (!ConsultationManager.instance) {
      ConsultationManager.instance = new ConsultationManager();
    }
    return ConsultationManager.instance;
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          this.consultations = JSON.parse(stored);
        } catch (error) {
          console.error('Error loading consultations from storage:', error);
          this.consultations = [];
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.consultations));
    } else {
      // Server-side: store in memory (this will be lost on server restart)
      // In production, you'd want to use a database
      console.log('Server-side storage - consultations saved to memory:', this.consultations.length);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // CRUD Operations
  getAllConsultations(): ConsultationRequest[] {
    return [...this.consultations];
  }

  getConsultationById(id: string): ConsultationRequest | null {
    return this.consultations.find(consultation => consultation.id === id) || null;
  }

  addConsultation(consultation: Omit<ConsultationRequest, 'id' | 'submittedDate' | 'status'>): ConsultationRequest {
    const newConsultation: ConsultationRequest = {
      ...consultation,
      id: `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedDate: new Date().toISOString(),
      status: 'pending'
    };

    this.consultations.push(newConsultation);
    this.saveToStorage();
    this.notifySubscribers();
    return newConsultation;
  }

  updateConsultation(id: string, updates: Partial<ConsultationRequest>): ConsultationRequest | null {
    const index = this.consultations.findIndex(consultation => consultation.id === id);
    if (index === -1) return null;

    this.consultations[index] = { ...this.consultations[index], ...updates };
    this.saveToStorage();
    this.notifySubscribers();
    return this.consultations[index];
  }

  deleteConsultation(id: string): boolean {
    const index = this.consultations.findIndex(consultation => consultation.id === id);
    if (index === -1) return false;

    this.consultations.splice(index, 1);
    this.saveToStorage();
    this.notifySubscribers();
    return true;
  }

  // Clear all consultations (useful for resetting the system)
  clearAllConsultations(): void {
    this.consultations = [];
    this.saveToStorage();
    this.notifySubscribers();
  }

  // Reset to empty state (removes all data including sample data)
  reset(): void {
    this.consultations = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      // Also clear any other consultation-related data
      localStorage.removeItem('luxe_consultations');
      localStorage.removeItem('consultation_requests');
    }
    this.notifySubscribers();
  }

  // Force clear all consultation data (for debugging)
  forceClearAll(): void {
    this.consultations = [];
    if (typeof window !== 'undefined') {
      // Clear all possible consultation storage keys
      const keysToRemove = [
        this.storageKey,
        'luxe_consultations',
        'consultation_requests',
        'consultations',
        'consultation_data'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('All consultation data cleared from localStorage');
    }
    this.notifySubscribers();
  }

  // Status Management
  scheduleConsultation(id: string, scheduledDate: string, notes?: string): ConsultationRequest | null {
    return this.updateConsultation(id, {
      status: 'scheduled',
      scheduledDate,
      notes
    });
  }

  completeConsultation(id: string, notes?: string): ConsultationRequest | null {
    return this.updateConsultation(id, {
      status: 'completed',
      notes
    });
  }

  cancelConsultation(id: string, notes?: string): ConsultationRequest | null {
    return this.updateConsultation(id, {
      status: 'cancelled',
      notes
    });
  }

  // Filtering and Statistics
  getConsultationsByStatus(status: ConsultationRequest['status']): ConsultationRequest[] {
    return this.consultations.filter(consultation => consultation.status === status);
  }

  getConsultationsByType(consultationType: ConsultationRequest['consultationType']): ConsultationRequest[] {
    return this.consultations.filter(consultation => consultation.consultationType === consultationType);
  }

  getConsultationsByLocation(location: string): ConsultationRequest[] {
    return this.consultations.filter(consultation => 
      consultation.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  getConsultationStats() {
    const total = this.consultations.length;
    const pending = this.getConsultationsByStatus('pending').length;
    const scheduled = this.getConsultationsByStatus('scheduled').length;
    const completed = this.getConsultationsByStatus('completed').length;
    const cancelled = this.getConsultationsByStatus('cancelled').length;

    return {
      total,
      pending,
      scheduled,
      completed,
      cancelled,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    };
  }

  // Initialize consultation manager
  initialize() {
    // Only load from storage, no sample data
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }
}

export const consultationManager = ConsultationManager.getInstance();

