export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  whatsapp?: string;
  supportEmail?: string;
  salesEmail?: string;
}

class ContactManager {
  private contactInfo: ContactInfo | null = null;
  private subscribers: ((contactInfo: ContactInfo) => void)[] = [];

  initialize() {
    if (typeof window !== 'undefined') {
      const savedContactInfo = localStorage.getItem('luxeContactInfo');
      if (savedContactInfo) {
        this.contactInfo = JSON.parse(savedContactInfo);
      } else {
        this.loadDefaultContactInfo();
      }
    }
  }

  private loadDefaultContactInfo() {
    this.contactInfo = {
      phone: '+91 98765 43210',
      email: 'info@luxestaycations.com',
      address: 'Mumbai, Maharashtra, India',
      businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
      whatsapp: '+91 98765 43210',
      supportEmail: 'support@luxestaycations.com',
      salesEmail: 'sales@luxestaycations.com'
    };
    this.saveContactInfo();
  }

  private saveContactInfo() {
    if (typeof window !== 'undefined' && this.contactInfo) {
      localStorage.setItem('luxeContactInfo', JSON.stringify(this.contactInfo));
    }
  }

  getContactInfo(): ContactInfo {
    if (!this.contactInfo) {
      this.initialize();
    }
    return this.contactInfo || {
      phone: '+91 98765 43210',
      email: 'info@luxestaycations.com',
      address: 'Mumbai, Maharashtra, India',
      businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
      whatsapp: '+91 98765 43210',
      supportEmail: 'support@luxestaycations.com',
      salesEmail: 'sales@luxestaycations.com'
    };
  }

  updateContactInfo(updates: Partial<ContactInfo>): boolean {
    try {
      if (!this.contactInfo) {
        this.initialize();
      }
      
      if (this.contactInfo) {
        this.contactInfo = { ...this.contactInfo, ...updates };
        this.saveContactInfo();
        
        // Notify all subscribers
        this.subscribers.forEach(callback => callback(this.contactInfo!));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating contact info:', error);
      return false;
    }
  }

  // Subscribe to contact info changes
  subscribe(callback: (contactInfo: ContactInfo) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Sync with business profile from settings manager
  syncWithBusinessProfile(businessProfile: any) {
    if (businessProfile) {
      const updates: Partial<ContactInfo> = {};
      
      if (businessProfile.phone) {
        updates.phone = businessProfile.phone;
      }
      
      if (businessProfile.email) {
        updates.email = businessProfile.email;
      }
      
      if (businessProfile.address) {
        updates.address = businessProfile.address;
      }
      
      if (Object.keys(updates).length > 0) {
        this.updateContactInfo(updates);
      }
    }
  }
}

export const contactManager = new ContactManager();
