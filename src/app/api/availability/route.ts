import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const year = searchParams.get('year');

    console.log('Availability API called with:', { propertyId, startDate, endDate, month, year });

    if (!supabase) {
      console.error('Supabase connection not available');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection not available' 
        },
        { status: 500 }
      );
    }

    // If specific date range is requested
    if (startDate && endDate) {
      console.log('Fetching availability for property:', propertyId, 'from', startDate, 'to', endDate);
      
      const { data: bookings, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('id, check_in, check_out, status, property_id')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending'])
        .gte('check_out', startDate)
        .lte('check_in', endDate);

      console.log('Availability query result:', { bookings, error });

      if (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to fetch availability data' 
          },
          { status: 500 }
        );
      }

      // Generate availability data for the date range
      const availability = generateDateRangeAvailability(startDate, endDate, bookings || []);
      
      return NextResponse.json({
        success: true,
        data: {
          propertyId,
          startDate,
          endDate,
          availability,
          totalBookings: bookings?.length || 0
        }
      });
    }

    // If month/year is requested (for calendar view)
    if (month && year) {
      const startOfMonth = `${year}-${month}-01`;
      const endOfMonth = `${year}-${month}-31`;
      
      const { data: bookings, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('id, check_in, check_out, status, property_id, guest_name, amount')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending', 'completed'])
        .gte('check_out', startOfMonth)
        .lte('check_in', endOfMonth);

      if (error) {
        console.error('Error fetching monthly availability:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to fetch monthly availability data' 
          },
          { status: 500 }
        );
      }

      const monthlyAvailability = generateMonthlyAvailability(year, month, bookings || []);
      
      return NextResponse.json({
        success: true,
        data: {
          propertyId,
          month,
          year,
          availability: monthlyAvailability,
          bookings: bookings || [],
          occupancy: calculateOccupancyRate(monthlyAvailability)
        }
      });
    }

    // If no specific parameters, return all properties availability summary
    const { data: allBookings, error } = await supabase
      .from(TABLES.BOOKINGS)
      .select('id, check_in, check_out, status, property_id, property_name')
      .in('status', ['confirmed', 'pending'])
      .gte('check_out', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching all availability:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch availability data' 
        },
        { status: 500 }
      );
    }

    const propertiesAvailability = generatePropertiesAvailability(allBookings || []);
    
    return NextResponse.json({
      success: true,
      data: {
        properties: propertiesAvailability,
        totalActiveBookings: allBookings?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch availability data' 
      },
      { status: 500 }
    );
  }
}

// Helper function to generate availability for a date range
function generateDateRangeAvailability(startDate: string, endDate: string, bookings: any[]) {
  const availability: { [key: string]: { available: boolean; bookingId?: string; status?: string } } = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Initialize all dates as available
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    availability[dateStr] = { available: true };
  }
  
  // Mark booked dates as unavailable
  bookings.forEach(booking => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (availability[dateStr]) {
        availability[dateStr] = {
          available: false,
          bookingId: booking.id,
          status: booking.status
        };
      }
    }
  });
  
  return availability;
}

// Helper function to generate monthly availability
function generateMonthlyAvailability(year: string, month: string, bookings: any[]) {
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const availability: { [key: string]: { available: boolean; booking?: any; revenue?: number } } = {};
  
  // Initialize all days as available
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    availability[dateStr] = { available: true };
  }
  
  // Mark booked dates
  bookings.forEach(booking => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (availability[dateStr]) {
        availability[dateStr] = {
          available: false,
          booking: {
            id: booking.id,
            guestName: booking.guest_name,
            status: booking.status,
            amount: booking.amount
          },
          revenue: booking.amount
        };
      }
    }
  });
  
  return availability;
}

// Helper function to calculate occupancy rate
function calculateOccupancyRate(availability: any) {
  const totalDays = Object.keys(availability).length;
  const bookedDays = Object.values(availability).filter((day: any) => !day.available).length;
  const occupancyRate = totalDays > 0 ? (bookedDays / totalDays) * 100 : 0;
  
  return {
    totalDays,
    bookedDays,
    availableDays: totalDays - bookedDays,
    occupancyRate: Math.round(occupancyRate * 100) / 100
  };
}

// Helper function to generate properties availability summary
function generatePropertiesAvailability(bookings: any[]) {
  const propertiesMap: { [key: string]: { name: string; bookings: any[]; nextAvailable: string } } = {};
  
  bookings.forEach(booking => {
    if (!propertiesMap[booking.property_id]) {
      propertiesMap[booking.property_id] = {
        name: booking.property_name || `Property ${booking.property_id}`,
        bookings: [],
        nextAvailable: ''
      };
    }
    propertiesMap[booking.property_id].bookings.push(booking);
  });
  
  // Calculate next available date for each property
  Object.keys(propertiesMap).forEach(propertyId => {
    const propertyBookings = propertiesMap[propertyId].bookings;
    const sortedBookings = propertyBookings.sort((a, b) => new Date(a.check_out).getTime() - new Date(b.check_out).getTime());
    
    if (sortedBookings.length > 0) {
      const lastCheckout = new Date(sortedBookings[sortedBookings.length - 1].check_out);
      propertiesMap[propertyId].nextAvailable = lastCheckout.toISOString().split('T')[0];
    } else {
      propertiesMap[propertyId].nextAvailable = new Date().toISOString().split('T')[0];
    }
  });
  
  return propertiesMap;
}
