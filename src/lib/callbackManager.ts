export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  numberOfGuests: string;
  preferredTime: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

class CallbackManager {
  private callbacks: CallbackRequest[] = [];
  private subscribers: (() => void)[] = [];
  private initialized = false;

  initialize() {
    if (this.initialized) return;
    
    if (typeof window !== 'undefined') {
      const savedCallbacks = localStorage.getItem('luxeCallbacks');
      if (savedCallbacks) {
        try {
          this.callbacks = JSON.parse(savedCallbacks).map((callback: any) => ({
            ...callback,
            createdAt: new Date(callback.createdAt),
            updatedAt: new Date(callback.updatedAt)
          }));
          console.log('CallbackManager: Loaded callbacks from localStorage:', this.callbacks.length);
        } catch (error) {
          console.error('CallbackManager: Error parsing saved callbacks, starting fresh');
          this.callbacks = [];
        }
      }
    }
    
    this.initialized = true;
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeCallbacks', JSON.stringify(this.callbacks));
    }
  }

  getAllCallbacks(): CallbackRequest[] {
    if (!this.initialized) {
      this.initialize();
    }
    return [...this.callbacks];
  }

  getCallbackById(id: string): CallbackRequest | undefined {
    if (!this.initialized) {
      this.initialize();
    }
    return this.callbacks.find(callback => callback.id === id);
  }

  addCallback(callbackData: Omit<CallbackRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): CallbackRequest {
    if (!this.initialized) {
      this.initialize();
    }

    const newCallback: CallbackRequest = {
      ...callbackData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.callbacks.push(newCallback);
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('CallbackManager: Added new callback request:', newCallback.name);
    return newCallback;
  }

  updateCallback(id: string, updates: Partial<Omit<CallbackRequest, 'id' | 'createdAt'>>): CallbackRequest | null {
    if (!this.initialized) {
      this.initialize();
    }

    const index = this.callbacks.findIndex(callback => callback.id === id);
    if (index === -1) {
      console.error('CallbackManager: Callback not found for update:', id);
      return null;
    }
    
    this.callbacks[index] = { 
      ...this.callbacks[index], 
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('CallbackManager: Updated callback:', this.callbacks[index].name);
    return this.callbacks[index];
  }

  deleteCallback(id: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    const index = this.callbacks.findIndex(callback => callback.id === id);
    if (index === -1) {
      console.error('CallbackManager: Callback not found for deletion:', id);
      return false;
    }
    
    const deletedCallback = this.callbacks.splice(index, 1)[0];
    this.saveToStorage();
    this.notifySubscribers();
    
    console.log('CallbackManager: Deleted callback:', deletedCallback.name);
    return true;
  }

  getPendingCallbacks(): CallbackRequest[] {
    if (!this.initialized) {
      this.initialize();
    }
    return this.callbacks.filter(callback => callback.status === 'pending');
  }

  getCallbacksByStatus(status: CallbackRequest['status']): CallbackRequest[] {
    if (!this.initialized) {
      this.initialize();
    }
    return this.callbacks.filter(callback => callback.status === status);
  }

  searchCallbacks(query: string): CallbackRequest[] {
    if (!this.initialized) {
      this.initialize();
    }
    
    const lowerQuery = query.toLowerCase();
    return this.callbacks.filter(callback => 
      callback.name.toLowerCase().includes(lowerQuery) ||
      callback.phone.includes(query) ||
      callback.email.toLowerCase().includes(lowerQuery) ||
      callback.message.toLowerCase().includes(lowerQuery)
    );
  }

  subscribe(callback: () => void): () => void {
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

  // Statistics methods
  getStatistics() {
    if (!this.initialized) {
      this.initialize();
    }

    const total = this.callbacks.length;
    const pending = this.callbacks.filter(c => c.status === 'pending').length;
    const contacted = this.callbacks.filter(c => c.status === 'contacted').length;
    const completed = this.callbacks.filter(c => c.status === 'completed').length;
    const cancelled = this.callbacks.filter(c => c.status === 'cancelled').length;

    return {
      total,
      pending,
      contacted,
      completed,
      cancelled,
      responseRate: total > 0 ? ((contacted + completed) / total * 100).toFixed(1) : '0'
    };
  }

  // Clear all callbacks (for testing/reset)
  clearAllCallbacks(): void {
    this.callbacks = [];
    this.saveToStorage();
    this.notifySubscribers();
    console.log('CallbackManager: Cleared all callbacks');
  }
}

export const callbackManager = new CallbackManager();

