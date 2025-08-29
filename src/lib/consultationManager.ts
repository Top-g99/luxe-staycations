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

  constructor() {
    this.loadFromStorage();
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

  // Initialize with sample data if empty
  initialize() {
    if (this.consultations.length === 0) {
      const sampleConsultations: Omit<ConsultationRequest, 'id' | 'submittedDate' | 'status'>[] = [
        {
          name: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          phone: "+91 98765 43210",
          propertyType: "Villa",
          location: "Goa, India",
          bedrooms: 4,
          bathrooms: 3,
          maxGuests: 8,
          propertyDescription: "Luxury beachfront villa with private pool and ocean views. Perfect for high-end travelers seeking exclusivity.",
          consultationType: "video",
          preferredDate: "2024-02-15",
          preferredTime: "14:00",
          additionalNotes: "Interested in premium pricing strategy and marketing support."
        },
        {
          name: "Priya Sharma",
          email: "priya.sharma@email.com",
          phone: "+91 87654 32109",
          propertyType: "Apartment",
          location: "Mumbai, India",
          bedrooms: 2,
          bathrooms: 2,
          maxGuests: 4,
          propertyDescription: "Modern apartment in Bandra with city skyline views. Ideal for business travelers and couples.",
          consultationType: "phone",
          preferredDate: "2024-02-16",
          preferredTime: "10:00",
          additionalNotes: "Looking for guidance on property optimization and guest experience enhancement."
        }
      ];

      sampleConsultations.forEach(consultation => {
        this.addConsultation(consultation);
      });
    }
  }
}

export const consultationManager = new ConsultationManager();

