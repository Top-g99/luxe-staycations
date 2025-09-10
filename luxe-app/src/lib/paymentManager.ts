export interface PaymentTransaction {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Successful' | 'Failed' | 'Refunded' | 'Cancelled';
  paymentMethod: 'Razorpay' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI' | 'Wallet';
  transactionId?: string;
  paymentDate: string;
  refundDate?: string;
  refundAmount?: number;
  refundReason?: string;
  gatewayResponse?: any;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
}

class PaymentManager {
  private transactions: PaymentTransaction[] = [];
  private subscribers: (() => void)[] = [];

  initialize() {
    if (typeof window !== 'undefined') {
      // Force clear any existing transactions and start fresh
      localStorage.removeItem('luxePaymentTransactions');
      this.loadDefaultTransactions();
    }
  }

  private loadDefaultTransactions() {
    this.transactions = [];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxePaymentTransactions', JSON.stringify(this.transactions));
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  getAllTransactions(): PaymentTransaction[] {
    return this.transactions;
  }

  getTransactionById(id: string): PaymentTransaction | undefined {
    return this.transactions.find(txn => txn.id === id);
  }

  getTransactionsByStatus(status: PaymentTransaction['status']): PaymentTransaction[] {
    return this.transactions.filter(txn => txn.status === status);
  }

  getTransactionsByBooking(bookingId: string): PaymentTransaction[] {
    return this.transactions.filter(txn => txn.bookingId === bookingId);
  }

  getTransactionsByDateRange(startDate: string, endDate: string): PaymentTransaction[] {
    return this.transactions.filter(txn => 
      txn.paymentDate >= startDate && txn.paymentDate <= endDate
    );
  }

  addTransaction(transaction: Omit<PaymentTransaction, 'id' | 'paymentDate'>): PaymentTransaction {
    const newTransaction: PaymentTransaction = {
      ...transaction,
      id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentDate: new Date().toISOString().split('T')[0]
    };
    
    this.transactions.push(newTransaction);
    this.saveToStorage();
    this.notifySubscribers();
    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<PaymentTransaction>): boolean {
    const index = this.transactions.findIndex(txn => txn.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  deleteTransaction(id: string): boolean {
    const index = this.transactions.findIndex(txn => txn.id === id);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  processPayment(transactionId: string, gatewayResponse: any): boolean {
    const transaction = this.getTransactionById(transactionId);
    if (transaction) {
      if (gatewayResponse.success) {
        return this.updateTransaction(transactionId, {
          status: 'Successful',
          transactionId: gatewayResponse.transactionId,
          gatewayResponse
        });
      } else {
        return this.updateTransaction(transactionId, {
          status: 'Failed',
          failureReason: gatewayResponse.errorMessage,
          retryCount: transaction.retryCount + 1,
          gatewayResponse
        });
      }
    }
    return false;
  }

  retryPayment(transactionId: string): boolean {
    const transaction = this.getTransactionById(transactionId);
    if (transaction && transaction.retryCount < transaction.maxRetries) {
      return this.updateTransaction(transactionId, {
        status: 'Processing',
        retryCount: transaction.retryCount + 1
      });
    }
    return false;
  }

  refundPayment(transactionId: string, refundAmount: number, reason: string): boolean {
    const transaction = this.getTransactionById(transactionId);
    if (transaction && transaction.status === 'Successful') {
      return this.updateTransaction(transactionId, {
        status: 'Refunded',
        refundAmount,
        refundReason: reason,
        refundDate: new Date().toISOString().split('T')[0]
      });
    }
    return false;
  }

  cancelPayment(transactionId: string): boolean {
    const transaction = this.getTransactionById(transactionId);
    if (transaction && transaction.status === 'Pending') {
      return this.updateTransaction(transactionId, {
        status: 'Cancelled'
      });
    }
    return false;
  }

  getPaymentStats() {
    const total = this.transactions.length;
    const successful = this.transactions.filter(txn => txn.status === 'Successful').length;
    const pending = this.transactions.filter(txn => txn.status === 'Pending').length;
    const failed = this.transactions.filter(txn => txn.status === 'Failed').length;
    const refunded = this.transactions.filter(txn => txn.status === 'Refunded').length;
    const totalAmount = this.transactions
      .filter(txn => txn.status === 'Successful' && typeof txn.amount === 'number')
      .reduce((sum, txn) => sum + (txn.amount || 0), 0);
    const totalRefunded = this.transactions
      .filter(txn => txn.status === 'Refunded' && typeof txn.refundAmount === 'number')
      .reduce((sum, txn) => sum + (txn.refundAmount || 0), 0);

    return {
      total,
      successful,
      pending,
      failed,
      refunded,
      totalAmount,
      totalRefunded,
      netRevenue: totalAmount - totalRefunded
    };
  }

  getRevenueByDateRange(startDate: string, endDate: string) {
    const transactions = this.getTransactionsByDateRange(startDate, endDate);
    const successful = transactions.filter(txn => txn.status === 'Successful');
    const failed = transactions.filter(txn => txn.status === 'Failed');
    
    return {
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalRevenue: successful.reduce((sum, txn) => sum + txn.amount, 0),
      successRate: transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0
    };
  }
}

export const paymentManager = new PaymentManager();
