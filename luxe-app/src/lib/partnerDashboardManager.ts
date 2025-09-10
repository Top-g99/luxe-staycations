interface PartnerProperty {
  id: string;
  partnerId: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PartnerBooking {
  id: string;
  partnerId: string;
  propertyId: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  commission: number;
  partnerRevenue: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface PartnerRevenue {
  id: string;
  partnerId: string;
  propertyId: string;
  month: string; // YYYY-MM format
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  partnerRevenue: number;
  occupancyRate: number;
  averageDailyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PartnerOccupancy {
  id: string;
  partnerId: string;
  propertyId: string;
  date: string; // YYYY-MM-DD format
  isOccupied: boolean;
  bookingId?: string;
  revenue?: number;
  createdAt: Date;
}

class PartnerDashboardManager {
  private partnerProperties: PartnerProperty[] = [];
  private partnerBookings: PartnerBooking[] = [];
  private partnerRevenue: PartnerRevenue[] = [];
  private partnerOccupancy: PartnerOccupancy[] = [];
  private subscribers: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const storedProperties = localStorage.getItem('luxe_partner_properties');
        const storedBookings = localStorage.getItem('luxe_partner_bookings');
        const storedRevenue = localStorage.getItem('luxe_partner_revenue');
        const storedOccupancy = localStorage.getItem('luxe_partner_occupancy');

        if (storedProperties) {
          this.partnerProperties = JSON.parse(storedProperties).map((prop: any) => ({
            ...prop,
            createdAt: new Date(prop.createdAt),
            updatedAt: new Date(prop.updatedAt)
          }));
        }

        if (storedBookings) {
          this.partnerBookings = JSON.parse(storedBookings).map((booking: any) => ({
            ...booking,
            checkIn: new Date(booking.checkIn),
            checkOut: new Date(booking.checkOut),
            createdAt: new Date(booking.createdAt),
            updatedAt: new Date(booking.updatedAt)
          }));
        }

        if (storedRevenue) {
          this.partnerRevenue = JSON.parse(storedRevenue).map((rev: any) => ({
            ...rev,
            createdAt: new Date(rev.createdAt),
            updatedAt: new Date(rev.updatedAt)
          }));
        }

        if (storedOccupancy) {
          this.partnerOccupancy = JSON.parse(storedOccupancy).map((occ: any) => ({
            ...occ,
            createdAt: new Date(occ.createdAt)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading partner dashboard data:', error);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxe_partner_properties', JSON.stringify(this.partnerProperties));
        localStorage.setItem('luxe_partner_bookings', JSON.stringify(this.partnerBookings));
        localStorage.setItem('luxe_partner_revenue', JSON.stringify(this.partnerRevenue));
        localStorage.setItem('luxe_partner_occupancy', JSON.stringify(this.partnerOccupancy));
      }
    } catch (error) {
      console.error('Error saving partner dashboard data:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Partner Properties Management
  addPartnerProperty(property: Omit<PartnerProperty, 'id' | 'createdAt' | 'updatedAt'>): PartnerProperty {
    const newProperty: PartnerProperty = {
      ...property,
      id: `partner_prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.partnerProperties.push(newProperty);
    this.saveToStorage();
    this.notifySubscribers();
    return newProperty;
  }

  getPartnerProperties(partnerId: string): PartnerProperty[] {
    return this.partnerProperties.filter(prop => prop.partnerId === partnerId);
  }

  updatePartnerProperty(id: string, updates: Partial<PartnerProperty>): PartnerProperty | null {
    const property = this.partnerProperties.find(p => p.id === id);
    if (property) {
      Object.assign(property, updates, { updatedAt: new Date() });
      this.saveToStorage();
      this.notifySubscribers();
      return property;
    }
    return null;
  }

  // Partner Bookings Management
  addPartnerBooking(booking: Omit<PartnerBooking, 'id' | 'createdAt' | 'updatedAt'>): PartnerBooking {
    const newBooking: PartnerBooking = {
      ...booking,
      id: `partner_booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.partnerBookings.push(newBooking);
    this.saveToStorage();
    this.notifySubscribers();
    return newBooking;
  }

  getPartnerBookings(partnerId: string, filters?: {
    status?: string;
    propertyId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): PartnerBooking[] {
    let bookings = this.partnerBookings.filter(booking => booking.partnerId === partnerId);

    if (filters) {
      if (filters.status) {
        bookings = bookings.filter(booking => booking.status === filters.status);
      }
      if (filters.propertyId) {
        bookings = bookings.filter(booking => booking.propertyId === filters.propertyId);
      }
      if (filters.dateFrom) {
        bookings = bookings.filter(booking => booking.checkIn >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        bookings = bookings.filter(booking => booking.checkOut <= filters.dateTo!);
      }
    }

    return bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateBookingStatus(bookingId: string, status: PartnerBooking['status']): PartnerBooking | null {
    const booking = this.partnerBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      booking.updatedAt = new Date();
      this.saveToStorage();
      this.notifySubscribers();
      return booking;
    }
    return null;
  }

  // Partner Revenue Management
  calculateMonthlyRevenue(partnerId: string, month: string): PartnerRevenue {
    const monthBookings = this.partnerBookings.filter(booking => 
      booking.partnerId === partnerId && 
      booking.checkIn.toISOString().substring(0, 7) === month &&
      booking.status === 'completed'
    );

    const totalBookings = monthBookings.length;
    const totalRevenue = monthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalCommission = monthBookings.reduce((sum, booking) => sum + booking.commission, 0);
    const partnerRevenue = monthBookings.reduce((sum, booking) => sum + booking.partnerRevenue, 0);

    // Calculate occupancy rate for the month
    const daysInMonth = new Date(month + '-01').getMonth() === 11 ? 31 : 
      new Date(new Date(month + '-01').getFullYear(), new Date(month + '-01').getMonth() + 1, 0).getDate();
    
    const totalNights = monthBookings.reduce((sum, booking) => {
      const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);

    const occupancyRate = (totalNights / daysInMonth) * 100;
    const averageDailyRate = totalBookings > 0 ? totalRevenue / totalNights : 0;

    const revenue: PartnerRevenue = {
      id: `revenue_${partnerId}_${month}`,
      partnerId,
      propertyId: '', // Will be set by caller
      month,
      totalBookings,
      totalRevenue,
      totalCommission,
      partnerRevenue,
      occupancyRate,
      averageDailyRate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update or add revenue record
    const existingIndex = this.partnerRevenue.findIndex(r => r.id === revenue.id);
    if (existingIndex >= 0) {
      this.partnerRevenue[existingIndex] = revenue;
    } else {
      this.partnerRevenue.push(revenue);
    }

    this.saveToStorage();
    this.notifySubscribers();
    return revenue;
  }

  getPartnerRevenue(partnerId: string, months: number = 12): PartnerRevenue[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return this.partnerRevenue
      .filter(revenue => revenue.partnerId === partnerId)
      .filter(revenue => {
        const revenueDate = new Date(revenue.month + '-01');
        return revenueDate >= startDate && revenueDate <= endDate;
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  // Partner Occupancy Management
  updateOccupancy(occupancy: Omit<PartnerOccupancy, 'id' | 'createdAt'>): PartnerOccupancy {
    const newOccupancy: PartnerOccupancy = {
      ...occupancy,
      id: `occupancy_${occupancy.partnerId}_${occupancy.propertyId}_${occupancy.date}`,
      createdAt: new Date()
    };

    // Update or add occupancy record
    const existingIndex = this.partnerOccupancy.findIndex(o => o.id === newOccupancy.id);
    if (existingIndex >= 0) {
      this.partnerOccupancy[existingIndex] = newOccupancy;
    } else {
      this.partnerOccupancy.push(newOccupancy);
    }

    this.saveToStorage();
    this.notifySubscribers();
    return newOccupancy;
  }

  getOccupancyData(partnerId: string, propertyId: string, dateFrom: string, dateTo: string): PartnerOccupancy[] {
    return this.partnerOccupancy.filter(occupancy => 
      occupancy.partnerId === partnerId &&
      occupancy.propertyId === propertyId &&
      occupancy.date >= dateFrom &&
      occupancy.date <= dateTo
    ).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Dashboard Statistics
  getDashboardStats(partnerId: string) {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthRevenue = this.calculateMonthlyRevenue(partnerId, currentMonth);
    
    const properties = this.getPartnerProperties(partnerId);
    const activeProperties = properties.filter(p => p.status === 'active').length;
    
    const recentBookings = this.getPartnerBookings(partnerId, { status: 'confirmed' })
      .slice(0, 5);

    const totalRevenue = this.partnerRevenue
      .filter(r => r.partnerId === partnerId)
      .reduce((sum, r) => sum + r.partnerRevenue, 0);

    return {
      currentMonthRevenue,
      activeProperties,
      recentBookings,
      totalRevenue,
      totalProperties: properties.length
    };
  }

  // Guest Details
  getGuestDetails(partnerId: string, filters?: {
    propertyId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    let bookings = this.getPartnerBookings(partnerId, filters);
    
    // Extract unique guest information
    const guestMap = new Map();
    bookings.forEach(booking => {
      const guestKey = booking.guestEmail;
      if (!guestMap.has(guestKey)) {
        guestMap.set(guestKey, {
          name: booking.guestName,
          email: booking.guestEmail,
          phone: booking.guestPhone,
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: booking.checkIn,
          firstBooking: booking.checkIn
        });
      }
      
      const guest = guestMap.get(guestKey);
      guest.totalBookings++;
      guest.totalSpent += booking.totalAmount;
      if (booking.checkIn > guest.lastBooking) {
        guest.lastBooking = booking.checkIn;
      }
      if (booking.checkIn < guest.firstBooking) {
        guest.firstBooking = booking.checkIn;
      }
    });

    return Array.from(guestMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
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

export const partnerDashboardManager = new PartnerDashboardManager();

