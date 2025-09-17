// Minimal contact manager for admin functionality
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  address?: string;
  businessHours?: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export class ContactManager {
  private static instance: ContactManager;
  private contacts: Contact[] = [];

  static getInstance(): ContactManager {
    if (!ContactManager.instance) {
      ContactManager.instance = new ContactManager();
    }
    return ContactManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Contact[]> {
    return this.contacts;
  }

  async getById(id: string): Promise<Contact | null> {
    return this.contacts.find(c => c.id === id) || null;
  }

  async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.contacts.push(newContact);
    return newContact;
  }

  async update(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...updates, updated_at: new Date().toISOString() };
      return this.contacts[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contacts.splice(index, 1);
      return true;
    }
    return false;
  }

  getContactInfo(): ContactInfo {
    return {
      id: '1',
      name: 'Luxe Staycations',
      email: 'info@luxestaycations.in',
      phone: '+91-9876543210',
      subject: 'Contact Us',
      message: 'Get in touch with us',
      address: '123 Luxury Street, Mumbai, India 400001',
      businessHours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  subscribe(callback: (contactInfo: ContactInfo) => void): () => void {
    // Mock subscription
    return () => {};
  }

  syncWithBusinessProfile(profile: any): void {
    // Mock sync - in real app, this would update contact info from business profile
    console.log('Syncing contact info with business profile:', profile);
  }
}

export const contactManager = ContactManager.getInstance();
