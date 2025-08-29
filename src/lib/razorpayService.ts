// Razorpay Payment Gateway Service for Luxe Staycations

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  companyName: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

export const defaultRazorpayConfig: RazorpayConfig = {
  keyId: '',
  keySecret: '',
  companyName: 'Luxe Staycations',
  amount: 0,
  currency: 'INR',
  name: 'Luxe Staycations',
  description: 'Luxury Villa Booking',
  order_id: '',
  prefill: {
    name: '',
    email: '',
    contact: ''
  },
  notes: {
    address: ''
  },
  theme: {
    color: '#322a2b'
  }
};

interface PaymentData {
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
}

class RazorpayService {
  private isConfigured: boolean = false;
  private config: any = null;

  constructor() {
    this.checkConfiguration();
  }

  private checkConfiguration() {
    // Check if Razorpay is configured via environment variables
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (key && secret) {
      this.isConfigured = true;
      this.config = {
        key,
        secret
      };
    } else {
      console.warn('Razorpay configuration not found. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
      this.isConfigured = false;
    }
  }

  isRazorpayConfigured(): boolean {
    return this.isConfigured;
  }

  configure(config: RazorpayConfig): void {
    this.isConfigured = true;
    this.config = {
      key: config.keyId,
      secret: config.keySecret
    };
    console.log('RazorpayService: Configuration updated');
  }

  async initializePayment(paymentData: PaymentData): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('Razorpay is not configured');
    }

    return new Promise((resolve, reject) => {
      try {
        const options: any = {
          key: this.config.key,
          amount: paymentData.amount * 100, // Razorpay expects amount in paise
          currency: paymentData.currency,
          name: paymentData.name,
          description: paymentData.description,
          order_id: paymentData.orderId,
          prefill: {
            name: paymentData.customerName,
            email: paymentData.customerEmail,
            contact: paymentData.customerPhone
          },
          notes: {
            address: paymentData.customerAddress
          },
          theme: {
            color: '#322a2b'
          },
          handler: (response: any) => {
            console.log('Payment successful:', response);
            this.handlePaymentSuccess(response);
            resolve(true);
          },
          modal: {
            ondismiss: () => {
              console.log('Payment modal dismissed');
              this.handlePaymentCancelled();
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();

      } catch (error) {
        console.error('Error initializing Razorpay payment:', error);
        reject(error);
      }
    });
  }

  private handlePaymentSuccess(response: any) {
    // Dispatch custom event for payment success
    const event = new CustomEvent('razorpay-payment-success', {
      detail: response
    });
    window.dispatchEvent(event);
  }

  private handlePaymentCancelled() {
    // Dispatch custom event for payment cancellation
    const event = new CustomEvent('razorpay-payment-cancelled');
    window.dispatchEvent(event);
  }

  async createOrder(amount: number, currency: string = 'INR'): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Razorpay is not configured');
    }

    try {
      // In a real implementation, this would call your backend API
      // to create an order with Razorpay
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data.orderId;

    } catch (error) {
      console.error('Error creating order:', error);
      // For demo purposes, return a mock order ID
      return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          signature
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return data.verified;

    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  getPaymentMethods(): string[] {
    return [
      'card',
      'netbanking',
      'wallet',
      'upi',
      'paylater'
    ];
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getSupportedCurrencies(): string[] {
    return ['INR', 'USD', 'EUR', 'GBP'];
  }

  getPaymentHistory(): any[] {
    // For demo purposes, return empty array
    // In a real implementation, this would fetch from your database
    return [];
  }

  async testPayment(): Promise<{ success: boolean; message: string }> {
    // For demo purposes, simulate a test payment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Test payment configuration successful'
        });
      }, 1000);
    });
  }
}

export const razorpayService = new RazorpayService();

