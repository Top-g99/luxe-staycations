interface OwnerBooking {
  id: string;
  partnerId: string;
  propertyId: string;
  propertyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  purpose: string;
  specialRequests?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OwnerBookingRequest {
  partnerId: string;
  propertyId: string;
  propertyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  purpose: string;
  specialRequests?: string;
}

class OwnerBookingManager {
  private ownerBookings: OwnerBooking[] = [];
  private subscribers: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('luxe_owner_bookings');
        if (stored) {
          this.ownerBookings = JSON.parse(stored).map((booking: any) => ({
            ...booking,
            checkIn: new Date(booking.checkIn),
            checkOut: new Date(booking.checkOut),
            createdAt: new Date(booking.createdAt),
            updatedAt: new Date(booking.updatedAt)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading owner bookings:', error);
      this.ownerBookings = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxe_owner_bookings', JSON.stringify(this.ownerBookings));
      }
    } catch (error) {
      console.error('Error saving owner bookings:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Create owner booking request
  createOwnerBooking(bookingData: OwnerBookingRequest): OwnerBooking {
    const newBooking: OwnerBooking = {
      id: `owner_booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partnerId: bookingData.partnerId,
      propertyId: bookingData.propertyId,
      propertyName: bookingData.propertyName,
      ownerName: bookingData.ownerName,
      ownerEmail: bookingData.ownerEmail,
      ownerPhone: bookingData.ownerPhone,
      checkIn: new Date(bookingData.checkIn),
      checkOut: new Date(bookingData.checkOut),
      guests: bookingData.guests,
      purpose: bookingData.purpose,
      specialRequests: bookingData.specialRequests,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.ownerBookings.push(newBooking);
    this.saveToStorage();
    this.notifySubscribers();

    // Notify admin system
    this.notifyAdmin(newBooking);

    return newBooking;
  }

  // Notify admin about owner booking
  private notifyAdmin(booking: OwnerBooking) {
    try {
      // Add to admin notifications
      const adminNotification = {
        id: `admin_notification_${Date.now()}`,
        type: 'owner_booking_request',
        title: 'Property Owner Booking Request',
        message: `${booking.ownerName} has requested to book their property "${booking.propertyName}" from ${booking.checkIn.toLocaleDateString()} to ${booking.checkOut.toLocaleDateString()}`,
        data: booking,
        isRead: false,
        createdAt: new Date()
      };

      // Store in admin notifications
      const existingNotifications = JSON.parse(localStorage.getItem('luxe_admin_notifications') || '[]');
      existingNotifications.unshift(adminNotification);
      localStorage.setItem('luxe_admin_notifications', JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  }

  // Get all owner bookings
  getAllOwnerBookings(): OwnerBooking[] {
    return [...this.ownerBookings];
  }

  // Get owner bookings by partner ID
  getOwnerBookingsByPartner(partnerId: string): OwnerBooking[] {
    return this.ownerBookings.filter(booking => booking.partnerId === partnerId);
  }

  // Get owner bookings by property ID
  getOwnerBookingsByProperty(propertyId: string): OwnerBooking[] {
    return this.ownerBookings.filter(booking => booking.propertyId === propertyId);
  }

  // Get pending owner bookings (for admin)
  getPendingOwnerBookings(): OwnerBooking[] {
    return this.ownerBookings.filter(booking => booking.status === 'pending');
  }

  // Update booking status (admin function)
  updateBookingStatus(bookingId: string, status: OwnerBooking['status'], adminNotes?: string): OwnerBooking | null {
    const booking = this.ownerBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      booking.adminNotes = adminNotes;
      booking.updatedAt = new Date();
      this.saveToStorage();
      this.notifySubscribers();

      // If approved, update property availability
      if (status === 'approved') {
        this.updatePropertyAvailability(booking);
      }

      return booking;
    }
    return null;
  }

  // Update property availability when owner booking is approved
  private updatePropertyAvailability(booking: OwnerBooking) {
    try {
      // Get existing availability data
      const availabilityKey = `luxe_property_availability_${booking.propertyId}`;
      const existingAvailability = JSON.parse(localStorage.getItem(availabilityKey) || '[]');

      // Add blocked dates for the booking period
      const startDate = new Date(booking.checkIn);
      const endDate = new Date(booking.checkOut);
      
      for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0];
        const existingBlock = existingAvailability.find((block: any) => block.date === dateString);
        
        if (!existingBlock) {
          existingAvailability.push({
            date: dateString,
            isBlocked: true,
            reason: 'owner_booking',
            bookingId: booking.id,
            createdAt: new Date()
          });
        }
      }

      localStorage.setItem(availabilityKey, JSON.stringify(existingAvailability));
    } catch (error) {
      console.error('Error updating property availability:', error);
    }
  }

  // Check if property is available for owner booking
  isPropertyAvailableForOwner(propertyId: string, checkIn: string, checkOut: string): boolean {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    // Check existing owner bookings
    const conflictingBookings = this.ownerBookings.filter(booking => 
      booking.propertyId === propertyId &&
      booking.status !== 'rejected' &&
      (
        (startDate >= booking.checkIn && startDate < booking.checkOut) ||
        (endDate > booking.checkIn && endDate <= booking.checkOut) ||
        (startDate <= booking.checkIn && endDate >= booking.checkOut)
      )
    );

    if (conflictingBookings.length > 0) {
      return false;
    }

    // Check regular bookings (from booking manager)
    try {
      const { bookingManager } = require('./bookingManager');
      const regularBookings = bookingManager.getAllBookings().filter((booking: any) => 
        booking.propertyId === propertyId &&
        booking.status !== 'cancelled' &&
        (
          (startDate >= new Date(booking.checkIn) && startDate < new Date(booking.checkOut)) ||
          (endDate > new Date(booking.checkIn) && endDate <= new Date(booking.checkOut)) ||
          (startDate <= new Date(booking.checkIn) && endDate >= new Date(booking.checkOut))
        )
      );

      return regularBookings.length === 0;
    } catch (error) {
      console.error('Error checking regular bookings:', error);
      return true;
    }
  }

  // Get owner booking by ID
  getOwnerBookingById(bookingId: string): OwnerBooking | undefined {
    return this.ownerBookings.find(booking => booking.id === bookingId);
  }

  // Delete owner booking
  deleteOwnerBooking(bookingId: string): boolean {
    const index = this.ownerBookings.findIndex(booking => booking.id === bookingId);
    if (index !== -1) {
      this.ownerBookings.splice(index, 1);
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Get owner booking statistics
  getOwnerBookingStatistics() {
    const total = this.ownerBookings.length;
    const pending = this.ownerBookings.filter(b => b.status === 'pending').length;
    const approved = this.ownerBookings.filter(b => b.status === 'approved').length;
    const rejected = this.ownerBookings.filter(b => b.status === 'rejected').length;
    const completed = this.ownerBookings.filter(b => b.status === 'completed').length;

    return {
      total,
      pending,
      approved,
      rejected,
      completed,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  }

  // Subscribe to changes
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}

export const ownerBookingManager = new OwnerBookingManager();

