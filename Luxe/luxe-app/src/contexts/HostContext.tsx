"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseHostManager, Host as SupabaseHost, HostProperty as SupabaseHostProperty, HostBooking, HostRevenue, HostNotification } from '@/lib/supabaseHostManager';

export interface HostProperty extends SupabaseHostProperty {
  lastBooking?: Date | null;
}

export interface Host extends Omit<SupabaseHost, 'memberSince'> {
  memberSince: Date;
  properties: HostProperty[];
  totalProperties: number;
  totalRevenue: number;
}

interface HostContextType {
  host: Host | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getPropertyStats: (propertyId: string) => any;
  updateProperty: (propertyId: string, updates: Partial<HostProperty>) => Promise<boolean>;
  getBookings: (propertyId: string) => Promise<HostBooking[]>;
  getRevenueAnalytics: (propertyId: string, period: 'week' | 'month' | 'year') => any;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error('useHost must be used within a HostProvider');
  }
  return context;
};

interface HostProviderProps {
  children: ReactNode;
}

export const HostProvider: React.FC<HostProviderProps> = ({ children }) => {
  const [host, setHost] = useState<Host | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // No sample data needed - using Supabase

  useEffect(() => {
    // Check for existing host session
    const hostSession = localStorage.getItem('hostSession');
    if (hostSession) {
      try {
        const sessionData = JSON.parse(hostSession);
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxSessionAge) {
          // Convert memberSince back to Date object when restoring from localStorage
          const restoredHost = {
            ...sessionData.host,
            memberSince: new Date(sessionData.host.memberSince)
          };
          setHost(restoredHost);
          setIsAuthenticated(true);
        } else {
          // Session expired
          localStorage.removeItem('hostSession');
        }
      } catch (error) {
        console.error('Invalid host session data');
        localStorage.removeItem('hostSession');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await supabaseHostManager.login(email, password);
      
      if (result.success && result.host) {
        // Fetch additional data for the host
        const [properties, stats] = await Promise.all([
          supabaseHostManager.getHostProperties(result.host.id),
          supabaseHostManager.getHostDashboardStats(result.host.id)
        ]);

        const hostWithData: Host = {
          ...result.host,
          memberSince: new Date(result.host.memberSince), // Convert string to Date object
          properties: properties.map(prop => ({
            ...prop,
            lastBooking: null // Will be calculated from bookings
          })),
          totalProperties: stats.totalProperties,
          totalRevenue: stats.totalRevenue
        };

        setHost(hostWithData);
        setIsAuthenticated(true);
        
        // Save session
        localStorage.setItem('hostSession', JSON.stringify({
          host: hostWithData,
          timestamp: Date.now()
        }));
        
        return true;
      } else {
        console.error('Login failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setHost(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hostSession');
  };

  const getPropertyStats = async (propertyId: string) => {
    try {
      const [bookings, revenue] = await Promise.all([
        supabaseHostManager.getPropertyBookings(propertyId),
        supabaseHostManager.getHostRevenue(host!.id, 'month')
      ]);

      const property = host?.properties.find(p => p.id === propertyId);
      if (!property) return null;

      return {
        totalBookings: property.totalBookings,
        totalRevenue: property.totalRevenue,
        averageRating: property.averageRating,
        occupancyRate: 78, // Calculate based on availability
        monthlyBookings: [12, 15, 18, 22, 25, 28, 30, 32, 29, 26, 23, 20] // Will be calculated from bookings
      };
    } catch (error) {
      console.error('Error fetching property stats:', error);
      return null;
    }
  };

  const updateProperty = async (propertyId: string, updates: Partial<HostProperty>): Promise<boolean> => {
    try {
      const success = await supabaseHostManager.updateProperty(propertyId, updates);
      
      if (success) {
        // Refresh host data
        const updatedProperties = await supabaseHostManager.getHostProperties(host!.id);
        const stats = await supabaseHostManager.getHostDashboardStats(host!.id);
        
        setHost(prevHost => {
          if (!prevHost) return null;
          
          return {
            ...prevHost,
            properties: updatedProperties.map(prop => ({
              ...prop,
              lastBooking: null
            })),
            totalProperties: stats.totalProperties,
            totalRevenue: stats.totalRevenue
          };
        });
      }
      
      return success;
    } catch (error) {
      console.error('Property update failed:', error);
      return false;
    }
  };

  const getBookings = async (propertyId: string): Promise<HostBooking[]> => {
    try {
      return await supabaseHostManager.getPropertyBookings(propertyId);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  const getRevenueAnalytics = async (propertyId: string, period: 'week' | 'month' | 'year') => {
    try {
      const revenue = await supabaseHostManager.getHostRevenue(host!.id, period);
      const property = host?.properties.find(p => p.id === propertyId);
      
      if (!property) return null;

      return {
        period,
        totalRevenue: property.totalRevenue,
        totalBookings: property.totalBookings,
        averageBookingValue: property.totalRevenue / property.totalBookings,
        revenueTrend: revenue.map(r => r.amount),
        topRevenueMonths: ['December', 'January', 'February'] // Will be calculated from revenue data
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return null;
    }
  };

  const value: HostContextType = {
    host,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getPropertyStats,
    updateProperty,
    getBookings,
    getRevenueAnalytics
  };

  return (
    <HostContext.Provider value={value}>
      {children}
    </HostContext.Provider>
  );
};
