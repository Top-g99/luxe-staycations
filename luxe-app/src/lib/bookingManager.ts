export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

class BookingManager {
  private bookings: Booking[] = [];
  private subscribers: (() => void)[] = [];

  initialize() {
    // Load existing bookings from localStorage instead of clearing
    if (typeof window !== 'undefined') {
      const savedBookings = localStorage.getItem('luxeBookings');
      if (savedBookings) {
        try {
          this.bookings = JSON.parse(savedBookings);
          console.log('Loaded existing bookings:', this.bookings.length);
        } catch (error) {
          console.error('Error loading bookings from localStorage:', error);
          this.bookings = [];
        }
      }
    }
  }

  getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find(booking => booking.id === id);
  }

  addBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.bookings.push(newBooking);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeBookings', JSON.stringify(this.bookings));
    }
    
    this.notifySubscribers();
    return newBooking;
  }

  updateBooking(id: string, updates: Partial<Omit<Booking, 'id' | 'createdAt'>>): Booking | null {
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index === -1) return null;

    this.bookings[index] = {
      ...this.bookings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeBookings', JSON.stringify(this.bookings));
    }

    this.notifySubscribers();
    return this.bookings[index];
  }

  deleteBooking(id: string): boolean {
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index === -1) return false;

    this.bookings.splice(index, 1);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeBookings', JSON.stringify(this.bookings));
    }
    
    this.notifySubscribers();
    return true;
  }

  getBookingsByProperty(propertyId: string): Booking[] {
    return this.bookings.filter(booking => booking.propertyId === propertyId);
  }

  getBookingsByStatus(status: Booking['status']): Booking[] {
    return this.bookings.filter(booking => booking.status === status);
  }

  getBookingsByGuest(guestEmail: string): Booking[] {
    return this.bookings.filter(booking => booking.guestEmail === guestEmail);
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

export const bookingManager = new BookingManager();
