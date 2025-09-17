// Minimal payment manager for admin functionality
export interface Payment {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export class PaymentManager {
  private static instance: PaymentManager;
  private payments: Payment[] = [];

  static getInstance(): PaymentManager {
    if (!PaymentManager.instance) {
      PaymentManager.instance = new PaymentManager();
    }
    return PaymentManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Payment[]> {
    return this.payments;
  }

  async getById(id: string): Promise<Payment | null> {
    return this.payments.find(p => p.id === id) || null;
  }

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.payments[index] = { ...this.payments[index], ...updates, updated_at: new Date().toISOString() };
      return this.payments[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.payments.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAllTransactions(): Promise<any[]> {
    return this.payments;
  }

  async addTransaction(data: any): Promise<any> {
    return this.create(data);
  }
}

export const paymentManager = PaymentManager.getInstance();
