import { supabase, TABLES, Analytics } from '../supabaseClient';
import { propertyManager } from './PropertyManager';
import { bookingManager } from './BookingManager';
import { destinationManager } from './DestinationManager';
import { callbackManager } from './CallbackManager';
import { consultationManager } from './ConsultationManager';
import { partnerManager } from './PartnerManager';
import { emailManager } from './EmailManager';

export class AnalyticsManager {
  // Get comprehensive dashboard analytics
  async getDashboardAnalytics(): Promise<{
    properties: {
      total: number;
      active: number;
      inactive: number;
      byType: Record<string, number>;
      byState: Record<string, number>;
    };
    bookings: {
      total: number;
      pending: number;
      confirmed: number;
      cancelled: number;
      completed: number;
      totalRevenue: number;
      averageBookingValue: number;
      monthlyBookings: Record<string, number>;
    };
    destinations: {
      total: number;
      popular: number;
      byState: Record<string, number>;
    };
    callbacks: {
      total: number;
      pending: number;
      contacted: number;
      resolved: number;
      dailyStats: Record<string, number>;
    };
    consultations: {
      total: number;
      pending: number;
      scheduled: number;
      completed: number;
      byPropertyType: Record<string, number>;
      byLocation: Record<string, number>;
    };
    partnerRequests: {
      total: number;
      pending: number;
      reviewed: number;
      approved: number;
      rejected: number;
      byPropertyType: Record<string, number>;
      byLocation: Record<string, number>;
    };
    emails: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
      byTemplate: Record<string, number>;
      dailyStats: Record<string, number>;
    };
  }> {
    try {
      const [
        propertyStats,
        bookingStats,
        destinationStats,
        callbackStats,
        consultationStats,
        partnerStats,
        emailStats
      ] = await Promise.all([
        propertyManager.getPropertyStats(),
        bookingManager.getBookingStats(),
        destinationManager.getDestinationStats(),
        callbackManager.getCallbackStats(),
        consultationManager.getConsultationStats(),
        partnerManager.getPartnerRequestStats(),
        emailManager.getEmailStats()
      ]);

      return {
        properties: propertyStats,
        bookings: bookingStats,
        destinations: destinationStats,
        callbacks: callbackStats,
        consultations: consultationStats,
        partnerRequests: partnerStats,
        emails: emailStats
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return {
        properties: { total: 0, active: 0, inactive: 0, byType: {}, byState: {} },
        bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0, totalRevenue: 0, averageBookingValue: 0, monthlyBookings: {} },
        destinations: { total: 0, popular: 0, byState: {} },
        callbacks: { total: 0, pending: 0, contacted: 0, resolved: 0, dailyStats: {} },
        consultations: { total: 0, pending: 0, scheduled: 0, completed: 0, byPropertyType: {}, byLocation: {} },
        partnerRequests: { total: 0, pending: 0, reviewed: 0, approved: 0, rejected: 0, byPropertyType: {}, byLocation: {} },
        emails: { total: 0, sent: 0, failed: 0, pending: 0, byTemplate: {}, dailyStats: {} }
      };
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: Record<string, number>;
    averageBookingValue: number;
    revenueByPropertyType: Record<string, number>;
    revenueByState: Record<string, number>;
  }> {
    try {
      const bookingStats = await bookingManager.getBookingStats();
      const properties = await propertyManager.getAllProperties();
      
      // Calculate revenue by property type
      const revenueByPropertyType: Record<string, number> = {};
      const revenueByState: Record<string, number> = {};
      
      const bookings = await bookingManager.getAllBookings();
      const bookingsWithProperty = await bookingManager.getBookingsWithProperty();
      
      bookingsWithProperty.forEach(booking => {
        if (booking.property) {
          const propertyType = booking.property.property_type;
          const state = booking.property.state;
          
          revenueByPropertyType[propertyType] = (revenueByPropertyType[propertyType] || 0) + booking.total_amount;
          revenueByState[state] = (revenueByState[state] || 0) + booking.total_amount;
        }
      });
      
      return {
        totalRevenue: bookingStats.totalRevenue,
        monthlyRevenue: bookingStats.monthlyBookings, // This would need to be calculated differently for revenue
        averageBookingValue: bookingStats.averageBookingValue,
        revenueByPropertyType,
        revenueByState
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return {
        totalRevenue: 0,
        monthlyRevenue: {},
        averageBookingValue: 0,
        revenueByPropertyType: {},
        revenueByState: {}
      };
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<{
    conversionRate: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    systemUptime: number;
  }> {
    try {
      // Calculate conversion rate (bookings / total inquiries)
      const callbacks = await callbackManager.getAllCallbacks();
      const consultations = await consultationManager.getAllConsultations();
      const bookings = await bookingManager.getAllBookings();
      
      const totalInquiries = callbacks.length + consultations.length;
      const conversionRate = totalInquiries > 0 ? (bookings.length / totalInquiries) * 100 : 0;
      
      // Calculate average response time (mock data for now)
      const averageResponseTime = 2.5; // hours
      
      // Calculate customer satisfaction (mock data for now)
      const customerSatisfaction = 4.7; // out of 5
      
      // Calculate system uptime (mock data for now)
      const systemUptime = 99.9; // percentage
      
      return {
        conversionRate,
        averageResponseTime,
        customerSatisfaction,
        systemUptime
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {
        conversionRate: 0,
        averageResponseTime: 0,
        customerSatisfaction: 0,
        systemUptime: 0
      };
    }
  }

  // Get growth metrics
  async getGrowthMetrics(): Promise<{
    monthlyGrowth: Record<string, number>;
    yearOverYearGrowth: number;
    userGrowth: number;
    propertyGrowth: number;
  }> {
    try {
      const properties = await propertyManager.getAllProperties();
      const bookings = await bookingManager.getAllBookings();
      
      // Calculate monthly growth
      const monthlyGrowth: Record<string, number> = {};
      const currentDate = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toISOString().substring(0, 7);
        
        const monthBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getFullYear() === date.getFullYear() && 
                 bookingDate.getMonth() === date.getMonth();
        });
        
        monthlyGrowth[monthKey] = monthBookings.length;
      }
      
      // Calculate year-over-year growth
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      
      const currentYearBookings = bookings.filter(b => 
        new Date(b.created_at).getFullYear() === currentYear
      ).length;
      
      const lastYearBookings = bookings.filter(b => 
        new Date(b.created_at).getFullYear() === lastYear
      ).length;
      
      const yearOverYearGrowth = lastYearBookings > 0 ? 
        ((currentYearBookings - lastYearBookings) / lastYearBookings) * 100 : 0;
      
      // Calculate user growth (mock data for now)
      const userGrowth = 15.5; // percentage
      
      // Calculate property growth
      const propertyGrowth = properties.length > 0 ? 
        (properties.filter(p => {
          const createdDate = new Date(p.created_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return createdDate >= sixMonthsAgo;
        }).length / properties.length) * 100 : 0;
      
      return {
        monthlyGrowth,
        yearOverYearGrowth,
        userGrowth,
        propertyGrowth
      };
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
      return {
        monthlyGrowth: {},
        yearOverYearGrowth: 0,
        userGrowth: 0,
        propertyGrowth: 0
      };
    }
  }

  // Log custom analytics
  async logAnalytics(metricName: string, metricValue: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.ANALYTICS)
        .insert([{
          metric_name: metricName,
          metric_value: metricValue,
          date: new Date().toISOString().substring(0, 10)
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging analytics:', error);
      return false;
    }
  }

  // Get custom analytics
  async getCustomAnalytics(metricName: string, days: number = 30): Promise<Analytics[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from(TABLES.ANALYTICS)
        .select('*')
        .eq('metric_name', metricName)
        .gte('date', startDate.toISOString().substring(0, 10))
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching custom analytics:', error);
      return [];
    }
  }
}

export const analyticsManager = new AnalyticsManager();
