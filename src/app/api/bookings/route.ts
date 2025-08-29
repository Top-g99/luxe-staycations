import { NextRequest, NextResponse } from 'next/server';
import { bookingManager } from '@/lib/bookingManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize BookingManager if not already done
    if (typeof window === 'undefined') {
      bookingManager.initialize();
    }
    
    // Get all bookings
    const bookings = bookingManager.getAllBookings();
    
    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.guestName || !body.guestEmail || !body.propertyId || !body.checkIn || !body.checkOut || !body.amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: guestName, guestEmail, propertyId, checkIn, checkOut, amount' 
        },
        { status: 400 }
      );
    }
    
    // Create new booking
    const newBooking = bookingManager.addBooking({
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone || '',
      propertyId: body.propertyId,
      propertyName: body.propertyName || '',
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests || 1,
      amount: body.amount,
      status: 'pending'
    });
    
    return NextResponse.json({
      success: true,
      data: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create booking' 
      },
      { status: 500 }
    );
  }
}

