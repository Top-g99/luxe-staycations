// Minimal Supabase callback manager for admin functionality
export interface CallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export class SupabaseCallbackManager {
  private static instance: SupabaseCallbackManager;
  private callbacks: CallbackRequest[] = [];

  static getInstance(): SupabaseCallbackManager {
    if (!SupabaseCallbackManager.instance) {
      SupabaseCallbackManager.instance = new SupabaseCallbackManager();
    }
    return SupabaseCallbackManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<CallbackRequest[]> {
    return this.callbacks;
  }

  async getById(id: string): Promise<CallbackRequest | null> {
    return this.callbacks.find(c => c.id === id) || null;
  }

  async create(callback: Omit<CallbackRequest, 'id' | 'created_at' | 'updated_at'>): Promise<CallbackRequest> {
    const newCallback: CallbackRequest = {
      ...callback,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.callbacks.push(newCallback);
    return newCallback;
  }

  async update(id: string, updates: Partial<CallbackRequest>): Promise<CallbackRequest | null> {
    const index = this.callbacks.findIndex(c => c.id === id);
    if (index !== -1) {
      this.callbacks[index] = { ...this.callbacks[index], ...updates, updated_at: new Date().toISOString() };
      return this.callbacks[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.callbacks.findIndex(c => c.id === id);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  getAllCallbacks(): CallbackRequest[] {
    return this.callbacks;
  }

  isLoading(): boolean {
    return false;
  }

  isInitialized(): boolean {
    return true;
  }

  async submitCallback(callback: Omit<CallbackRequest, 'id' | 'created_at' | 'updated_at'>): Promise<CallbackRequest> {
    const newCallback: CallbackRequest = {
      ...callback,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.callbacks.push(newCallback);
    return newCallback;
  }
}

export const supabaseCallbackManager = SupabaseCallbackManager.getInstance();
