'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SearchFormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  amenities?: string[];
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  specialRequests?: string;
  createLoyaltyAccount?: boolean;
  subscribeToNewsletter?: boolean;
}

interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: string;
  totalNights: number;
  total: number;
  propertyId?: string;
  propertyName?: string;
  propertyLocation?: string;
  propertyImage?: string;
  propertyPrice?: number;
}

interface CompleteBooking {
  id: string;
  guestInfo: GuestInfo;
  bookingDetails: BookingDetails;
  searchFormData: SearchFormData;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  loyaltyPoints?: number;
  jewelsEarned?: number;
  loyaltyAccountCreated?: boolean;
}

interface BookingContextType {
  searchFormData: SearchFormData | null;
  setSearchFormData: (data: SearchFormData) => void;
  guestInfo: GuestInfo;
  setGuestInfo: (info: GuestInfo) => void;
  bookingDetails: BookingDetails;
  setBookingDetails: (details: BookingDetails) => void;
  completeBooking: CompleteBooking | null;
  setCompleteBooking: (booking: CompleteBooking | null) => void;
  allBookings: CompleteBooking[];
  addBooking: (booking: CompleteBooking) => void;
  updateBooking: (id: string, updates: Partial<CompleteBooking>) => void;
  getBookingById: (id: string) => CompleteBooking | undefined;
  clearBookingData: () => void;
  syncToAdminDashboard: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [searchFormData, setSearchFormData] = useState<SearchFormData | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    specialRequests: ''
  });
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    checkIn: '',
    checkOut: '',
    guests: '',
    totalNights: 0,
    total: 0,
    propertyId: '',
    propertyName: '',
    propertyLocation: '',
    propertyImage: '',
    propertyPrice: 0
  });
  const [completeBooking, setCompleteBooking] = useState<CompleteBooking | null>(null);
  const [allBookings, setAllBookings] = useState<CompleteBooking[]>([]);

  // Load bookings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookings = localStorage.getItem('luxeBookings');
      if (savedBookings) {
        try {
          setAllBookings(JSON.parse(savedBookings));
        } catch (error) {
          console.error('Error loading bookings from localStorage:', error);
        }
      }
    }
  }, []);

  // Save bookings to localStorage whenever allBookings changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeBookings', JSON.stringify(allBookings));
    }
  }, [allBookings]);

  const addBooking = async (booking: CompleteBooking) => {
    setAllBookings(prev => [...prev, booking]);
    console.log('Booking added:', booking);
    
    // Also save to Supabase via API
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
          guestEmail: booking.guestInfo.email,
          guestPhone: booking.guestInfo.phone,
          propertyId: booking.bookingDetails.propertyId,
          propertyName: booking.bookingDetails.propertyName,
          checkIn: booking.bookingDetails.checkIn,
          checkOut: booking.bookingDetails.checkOut,
          guests: parseInt(booking.bookingDetails.guests),
          amount: booking.bookingDetails.total,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          specialRequests: booking.guestInfo.specialRequests
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Booking saved to Supabase:', result);
      } else {
        console.error('Failed to save booking to Supabase:', await response.text());
      }
    } catch (error) {
      console.error('Error saving booking to Supabase:', error);
    }
  };

  const updateBooking = (id: string, updates: Partial<CompleteBooking>) => {
    setAllBookings(prev => prev.map(booking => 
      booking.id === id 
        ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
        : booking
    ));
    console.log('Booking updated:', id, updates);
    
    // Also sync with DataManager-based bookingManager for admin dashboard
    if (typeof window !== 'undefined') {
      import('@/lib/dataManager').then(({ bookingManager }) => {
        try {
          const existingBooking = bookingManager.getById(id);
          if (existingBooking) {
            // Update the booking in bookingManager (automatically saves to Supabase)
            bookingManager.update(id, {
              guestName: updates.guestInfo ? `${updates.guestInfo.firstName || ''} ${updates.guestInfo.lastName || ''}`.trim() : existingBooking.guestName,
              guestEmail: updates.guestInfo?.email || existingBooking.guestEmail,
              guestPhone: updates.guestInfo?.phone || existingBooking.guestPhone,
              propertyId: updates.bookingDetails?.propertyId || existingBooking.propertyId,
              checkIn: updates.bookingDetails?.checkIn || existingBooking.checkIn,
              checkOut: updates.bookingDetails?.checkOut || existingBooking.checkOut,
              guests: updates.bookingDetails?.guests ? parseInt(updates.bookingDetails.guests) : (typeof existingBooking.guests === 'string' ? parseInt(existingBooking.guests) : existingBooking.guests),
              totalAmount: updates.bookingDetails?.total || existingBooking.totalAmount,
              status: 'confirmed',
              specialRequests: updates.guestInfo?.specialRequests || existingBooking.specialRequests || ''
            });
            console.log('Successfully synced booking update to admin dashboard via DataManager');
          }
        } catch (error) {
          console.error('Error syncing booking update to admin dashboard:', error);
        }
      });
    }
  };

  const getBookingById = (id: string) => {
    return allBookings.find(booking => booking.id === id);
  };

  const clearBookingData = () => {
    setSearchFormData(null);
    setGuestInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      specialRequests: ''
    });
    setBookingDetails({
      checkIn: '',
      checkOut: '',
      guests: '',
      totalNights: 0,
      total: 0,
      propertyId: '',
      propertyName: '',
      propertyLocation: '',
      propertyImage: '',
      propertyPrice: 0
    });
    setCompleteBooking(null);
  };

  const syncToAdminDashboard = () => {
    // This will trigger real-time updates to admin dashboard
    console.log('Syncing booking data to admin dashboard...');
    
    // The DataManager-based managers automatically sync to Supabase
    // and notify subscribers, so no manual sync is needed
    console.log('DataManager automatically handles Supabase sync and real-time updates');
  };

  return (
    <BookingContext.Provider value={{
      searchFormData,
      setSearchFormData,
      guestInfo,
      setGuestInfo,
      bookingDetails,
      setBookingDetails,
      completeBooking,
      setCompleteBooking,
      allBookings,
      addBooking,
      updateBooking,
      getBookingById,
      clearBookingData,
      syncToAdminDashboard
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}
