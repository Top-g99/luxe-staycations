import { getSupabaseClient, isSupabaseAvailable } from './supabase';

export interface CallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  status: 'pending' | 'contacted' | 'resolved' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

class SupabaseCallbackManager {
  private callbacks: CallbackRequest[] = [];
  private subscribers: (() => void)[] = [];
  private initialized = false;
  private loading = false;

  async initialize() {
    if (this.initialized) return;
    
    this.loading = true;
    
    try {
      if (isSupabaseAvailable()) {
        await this.loadFromSupabase();
      } else {
        await this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('SupabaseCallbackManager: Error initializing:', error);
      await this.loadFromLocalStorage();
    }
    
    this.initialized = true;
    this.loading = false;
    this.notifySubscribers();
  }

  private async loadFromSupabase() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('callback_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SupabaseCallbackManager: Error loading from Supabase:', error);
        throw error;
      }

      this.callbacks = data || [];
      console.log('SupabaseCallbackManager: Loaded callbacks from Supabase:', this.callbacks.length);
    } catch (error) {
      console.error('SupabaseCallbackManager: Failed to load from Supabase, falling back to localStorage:', error);
      await this.loadFromLocalStorage();
    }
  }

  private async loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedCallbacks = localStorage.getItem('luxeCallbacks');
      if (savedCallbacks) {
        try {
          this.callbacks = JSON.parse(savedCallbacks);
          console.log('SupabaseCallbackManager: Loaded callbacks from localStorage:', this.callbacks.length);
        } catch (error) {
          console.error('SupabaseCallbackManager: Error parsing saved callbacks');
          this.callbacks = [];
        }
      } else {
        this.callbacks = [];
      }
    } else {
      this.callbacks = [];
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeCallbacks', JSON.stringify(this.callbacks));
      console.log('SupabaseCallbackManager: Saved callbacks to localStorage');
    }
  }

  async submitCallback(callback: Omit<CallbackRequest, 'id' | 'status'>): Promise<CallbackRequest> {
    const newCallback: CallbackRequest = {
      ...callback,
      id: crypto.randomUUID(),
      status: 'pending'
    };

    this.callbacks.push(newCallback);
    
    // Save to both Supabase and localStorage
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('callback_requests')
          .insert(newCallback);

        if (error) {
          console.error('SupabaseCallbackManager: Error submitting callback to Supabase:', error);
        } else {
          console.log('SupabaseCallbackManager: Callback submitted to Supabase');
        }
      } catch (error) {
        console.error('SupabaseCallbackManager: Error submitting callback to Supabase:', error);
      }
    }
    
    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return newCallback;
  }

  async updateCallback(id: string, updates: Partial<CallbackRequest>): Promise<CallbackRequest | null> {
    const index = this.callbacks.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedCallback = { ...this.callbacks[index], ...updates };
    this.callbacks[index] = updatedCallback;

    // Update in Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('callback_requests')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('SupabaseCallbackManager: Error updating callback in Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseCallbackManager: Error updating callback in Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return updatedCallback;
  }

  async deleteCallback(id: string): Promise<boolean> {
    const index = this.callbacks.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.callbacks.splice(index, 1);

    // Delete from Supabase
    if (isSupabaseAvailable()) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('callback_requests')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('SupabaseCallbackManager: Error deleting callback from Supabase:', error);
        }
      } catch (error) {
        console.error('SupabaseCallbackManager: Error deleting callback from Supabase:', error);
      }
    }

    this.saveToLocalStorage();
    this.notifySubscribers();
    
    return true;
  }

  getAllCallbacks(): CallbackRequest[] {
    return [...this.callbacks];
  }

  getCallbackById(id: string): CallbackRequest | undefined {
    return this.callbacks.find(c => c.id === id);
  }

  getCallbacksByStatus(status: CallbackRequest['status']): CallbackRequest[] {
    return this.callbacks.filter(c => c.status === status);
  }

  getPendingCallbacks(): CallbackRequest[] {
    return this.getCallbacksByStatus('pending');
  }

  getContactedCallbacks(): CallbackRequest[] {
    return this.getCallbacksByStatus('contacted');
  }

  getResolvedCallbacks(): CallbackRequest[] {
    return this.getCallbacksByStatus('resolved');
  }

  getCancelledCallbacks(): CallbackRequest[] {
    return this.getCallbacksByStatus('cancelled');
  }

  async markAsContacted(id: string): Promise<CallbackRequest | null> {
    return this.updateCallback(id, { status: 'contacted' });
  }

  async markAsResolved(id: string): Promise<CallbackRequest | null> {
    return this.updateCallback(id, { status: 'resolved' });
  }

  async markAsCancelled(id: string): Promise<CallbackRequest | null> {
    return this.updateCallback(id, { status: 'cancelled' });
  }

  getCallbacksByEmail(email: string): CallbackRequest[] {
    return this.callbacks.filter(c => c.email === email);
  }

  getCallbacksByPhone(phone: string): CallbackRequest[] {
    return this.callbacks.filter(c => c.phone === phone);
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  isLoading(): boolean {
    return this.loading;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async refresh() {
    this.initialized = false;
    await this.initialize();
  }
}

export const supabaseCallbackManager = new SupabaseCallbackManager();
