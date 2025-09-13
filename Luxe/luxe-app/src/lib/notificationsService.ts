"use client";

import { createClient } from '@supabase/supabase-js';
import { 
  propertyManager, 
  destinationManager, 
  bookingManager, 
  callbackManager, 
  dealBannerManager,
  userManager,
  reviewManager,
  paymentManager,
  loyaltyManager,
  couponManager,
  specialRequestManager
} from './dataManager';

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  source: 'properties' | 'bookings' | 'callbacks' | 'destinations' | 'deals' | 'users' | 'reviews' | 'payments' | 'loyalty' | 'coupons' | 'requests';
}

class NotificationsService {
  private supabase: any;
  private isInitialized = false;
  private lastCheckTimes: Record<string, Date> = {};
  private checkInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(notifications: NotificationData[]) => void> = new Set();

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase() {
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      }
    }
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize all managers
      await Promise.all([
        propertyManager.initialize(),
        destinationManager.initialize(),
        bookingManager.initialize(),
        callbackManager.initialize(),
        dealBannerManager.initialize(),
        userManager.initialize(),
        reviewManager.initialize(),
        paymentManager.initialize(),
        loyaltyManager.initialize(),
        couponManager.initialize(),
        specialRequestManager.initialize()
      ]);

      // Set initial check times
      const now = new Date();
      this.lastCheckTimes = {
        properties: now,
        bookings: now,
        callbacks: now,
        destinations: now,
        deals: now,
        users: now,
        reviews: now,
        payments: now,
        loyalty: now,
        coupons: now,
        requests: now
      };

      this.isInitialized = true;
      console.log('NotificationsService initialized successfully');
    } catch (error) {
      console.error('Error initializing NotificationsService:', error);
    }
  }

  startMonitoring() {
    if (this.checkInterval) return;
    
    // Check for updates every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000);

    console.log('NotificationsService monitoring started');
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('NotificationsService monitoring stopped');
  }

  subscribe(callback: (notifications: NotificationData[]) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(notifications: NotificationData[]) {
    this.subscribers.forEach(callback => callback(notifications));
  }

  private async checkForUpdates() {
    if (!this.isInitialized || !this.supabase) return;

    try {
      const notifications: NotificationData[] = [];

      // Check for new bookings
      const newBookings = await this.checkNewBookings();
      notifications.push(...newBookings);

      // Check for new callback requests
      const newCallbacks = await this.checkNewCallbacks();
      notifications.push(...newCallbacks);

      // Check for new properties
      const newProperties = await this.checkNewProperties();
      notifications.push(...newProperties);

      // Check for new reviews
      const newReviews = await this.checkNewReviews();
      notifications.push(...newReviews);

      // Check for new payments
      const newPayments = await this.checkNewPayments();
      notifications.push(...newPayments);

      // Check for new users
      const newUsers = await this.checkNewUsers();
      notifications.push(...newUsers);

      // Check for special requests
      const newRequests = await this.checkNewSpecialRequests();
      notifications.push(...newRequests);

      // Check for loyalty transactions
      const newLoyalty = await this.checkNewLoyaltyTransactions();
      notifications.push(...newLoyalty);

      // Check for low inventory
      const lowInventory = await this.checkLowInventory();
      notifications.push(...lowInventory);

      // Check for payment failures
      const paymentFailures = await this.checkPaymentFailures();
      notifications.push(...paymentFailures);

      if (notifications.length > 0) {
        this.notifySubscribers(notifications);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  private async checkNewBookings(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .select('*')
        .gte('created_at', this.lastCheckTimes.bookings.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.bookings = new Date();

      return (data || []).map((booking: any) => ({
        id: `booking_${booking.id}`,
        type: 'success' as const,
        title: 'New Booking Received',
        message: `${booking.guest_name} booked ${booking.property_name || 'a property'} for ${booking.check_in} to ${booking.check_out}`,
        timestamp: new Date(booking.created_at),
        read: false,
        actionUrl: '/admin/bookings',
        source: 'bookings' as const
      }));
    } catch (error) {
      console.error('Error checking new bookings:', error);
      return [];
    }
  }

  private async checkNewCallbacks(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('callback_requests')
        .select('*')
        .gte('created_at', this.lastCheckTimes.callbacks.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.callbacks = new Date();

      return (data || []).map((callback: any) => ({
        id: `callback_${callback.id}`,
        type: 'info' as const,
        title: 'New Callback Request',
        message: `${callback.name} requested a callback. Phone: ${callback.phone || 'Not provided'}`,
        timestamp: new Date(callback.created_at),
        read: false,
        actionUrl: '/admin/callback-requests',
        source: 'callbacks' as const
      }));
    } catch (error) {
      console.error('Error checking new callbacks:', error);
      return [];
    }
  }

  private async checkNewProperties(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('properties')
        .select('*')
        .gte('created_at', this.lastCheckTimes.properties.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.properties = new Date();

      return (data || []).map((property: any) => ({
        id: `property_${property.id}`,
        type: 'success' as const,
        title: 'New Property Added',
        message: `Property "${property.name}" has been added to the system`,
        timestamp: new Date(property.created_at),
        read: false,
        actionUrl: '/admin/properties',
        source: 'properties' as const
      }));
    } catch (error) {
      console.error('Error checking new properties:', error);
      return [];
    }
  }

  private async checkNewReviews(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('*')
        .gte('created_at', this.lastCheckTimes.reviews.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.reviews = new Date();

      return (data || []).map((review: any) => ({
        id: `review_${review.id}`,
        type: 'info' as const,
        title: 'New Review Received',
        message: `New ${review.rating}-star review received for property`,
        timestamp: new Date(review.created_at),
        read: false,
        actionUrl: '/admin/properties',
        source: 'reviews' as const
      }));
    } catch (error) {
      console.error('Error checking new reviews:', error);
      return [];
    }
  }

  private async checkNewPayments(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .gte('created_at', this.lastCheckTimes.payments.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.payments = new Date();

      return (data || []).map((payment: any) => ({
        id: `payment_${payment.id}`,
        type: payment.status === 'completed' ? 'success' : 'warning',
        title: payment.status === 'completed' ? 'Payment Received' : 'Payment Pending',
        message: `Payment of ₹${payment.amount} ${payment.status === 'completed' ? 'completed' : 'pending'} for booking`,
        timestamp: new Date(payment.created_at),
        read: false,
        actionUrl: '/admin/payments',
        source: 'payments' as const
      }));
    } catch (error) {
      console.error('Error checking new payments:', error);
      return [];
    }
  }

  private async checkNewUsers(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .gte('created_at', this.lastCheckTimes.users.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.users = new Date();

      return (data || []).map((user: any) => ({
        id: `user_${user.id}`,
        type: 'info' as const,
        title: 'New User Registered',
        message: `New user "${user.name}" (${user.email}) has registered`,
        timestamp: new Date(user.created_at),
        read: false,
        actionUrl: '/admin/users',
        source: 'users' as const
      }));
    } catch (error) {
      console.error('Error checking new users:', error);
      return [];
    }
  }

  private async checkNewSpecialRequests(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('special_requests')
        .select('*')
        .gte('created_at', this.lastCheckTimes.requests.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.requests = new Date();

      return (data || []).map((request: any) => ({
        id: `request_${request.id}`,
        type: 'info' as const,
        title: 'New Special Request',
        message: `Special request received: ${request.request_type}`,
        timestamp: new Date(request.created_at),
        read: false,
        actionUrl: '/admin/special-requests',
        source: 'requests' as const
      }));
    } catch (error) {
      console.error('Error checking new special requests:', error);
      return [];
    }
  }

  private async checkNewLoyaltyTransactions(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('loyalty_transactions')
        .select('*')
        .gte('created_at', this.lastCheckTimes.loyalty.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.loyalty = new Date();

      return (data || []).map((transaction: any) => ({
        id: `loyalty_${transaction.id}`,
        type: 'info' as const,
        title: 'Loyalty Transaction',
        message: `${transaction.type} of ${transaction.points} points`,
        timestamp: new Date(transaction.created_at),
        read: false,
        actionUrl: '/admin/loyalty',
        source: 'loyalty' as const
      }));
    } catch (error) {
      console.error('Error checking new loyalty transactions:', error);
      return [];
    }
  }

  private async checkLowInventory(): Promise<NotificationData[]> {
    try {
      // Check for properties with low availability
      const { data, error } = await this.supabase
        .from('properties')
        .select('*')
        .eq('available', true);

      if (error) throw error;

      const lowInventoryProperties = (data || []).filter((property: any) => {
        // This is a simplified check - in a real app you'd check actual availability
        return property.max_guests < 4; // Example: properties with less than 4 max guests
      });

      if (lowInventoryProperties.length > 0) {
        return [{
          id: 'low_inventory',
          type: 'warning' as const,
          title: 'Low Inventory Alert',
          message: `${lowInventoryProperties.length} properties have limited availability`,
          timestamp: new Date(),
          read: false,
          actionUrl: '/admin/properties',
          source: 'properties' as const
        }];
      }

      return [];
    } catch (error) {
      console.error('Error checking low inventory:', error);
      return [];
    }
  }

  private async checkPaymentFailures(): Promise<NotificationData[]> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('status', 'failed')
        .gte('created_at', this.lastCheckTimes.payments.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.lastCheckTimes.payments = new Date();

      return (data || []).map((payment: any) => ({
        id: `payment_failed_${payment.id}`,
        type: 'error' as const,
        title: 'Payment Failed',
        message: `Payment of ₹${payment.amount} failed for booking ${payment.booking_id}`,
        timestamp: new Date(payment.created_at),
        read: false,
        actionUrl: '/admin/payments',
        source: 'payments' as const
      }));
    } catch (error) {
      console.error('Error checking payment failures:', error);
      return [];
    }
  }

  // Manual trigger for immediate check
  async triggerCheck() {
    await this.checkForUpdates();
  }

  // Get current statistics
  async getStatistics() {
    if (!this.supabase) return null;

    try {
      const [
        propertiesResult,
        bookingsResult,
        callbacksResult,
        usersResult,
        reviewsResult,
        paymentsResult
      ] = await Promise.all([
        this.supabase.from('properties').select('*', { count: 'exact' }),
        this.supabase.from('bookings').select('*', { count: 'exact' }),
        this.supabase.from('callback_requests').select('*', { count: 'exact' }),
        this.supabase.from('users').select('*', { count: 'exact' }),
        this.supabase.from('reviews').select('*', { count: 'exact' }),
        this.supabase.from('payments').select('*', { count: 'exact' })
      ]);

      return {
        properties: propertiesResult.count || 0,
        bookings: bookingsResult.count || 0,
        callbacks: callbacksResult.count || 0,
        users: usersResult.count || 0,
        reviews: reviewsResult.count || 0,
        payments: paymentsResult.count || 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService();
