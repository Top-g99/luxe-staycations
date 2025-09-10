"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationsService, NotificationData } from '@/lib/notificationsService';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  triggerCheck: () => Promise<void>;
  getStatistics: () => Promise<any>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize notifications service and start monitoring
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationsService.initialize();
        notificationsService.startMonitoring();
        
        // Subscribe to real-time notifications
        const unsubscribe = notificationsService.subscribe((newNotifications: NotificationData[]) => {
          setNotifications(prev => {
            // Convert NotificationData to Notification format
            const convertedNotifications = newNotifications.map(n => ({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              timestamp: n.timestamp,
              read: n.read,
              actionUrl: n.actionUrl
            }));
            
            // Add new notifications to the beginning of the list
            return [...convertedNotifications, ...prev];
          });
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error initializing notifications service:', error);
      }
    };

    const cleanup = initializeNotifications();
    
    return () => {
      notificationsService.stopMonitoring();
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('luxeAdminNotifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('luxeAdminNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Generate sample notifications on first load
  useEffect(() => {
    if (notifications.length === 0) {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          title: 'Welcome to Luxe Admin',
          message: 'Your admin dashboard is ready. Start managing your properties!',
          timestamp: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'success',
          title: 'New Booking Received',
          message: 'A new booking has been made for Casa Alphonso villa.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: '/admin/bookings'
        },
        {
          id: '3',
          type: 'warning',
          title: 'Low Inventory Alert',
          message: 'Some properties are running low on available dates.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          actionUrl: '/admin/properties'
        },
        {
          id: '4',
          type: 'error',
          title: 'Payment Failed',
          message: 'A payment transaction failed for booking #12345.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          read: false,
          actionUrl: '/admin/payments'
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, [notifications.length]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const triggerCheck = async () => {
    await notificationsService.triggerCheck();
  };

  const getStatistics = async () => {
    return await notificationsService.getStatistics();
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAll,
    triggerCheck,
    getStatistics
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
