import { NextRequest, NextResponse } from 'next/server';
import { supabaseBookingManager } from '@/lib/supabaseBookingManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize SupabaseBookingManager
    await supabaseBookingManager.initialize();
    
    // Get all bookings from Supabase
    const bookings = await supabaseBookingManager.getAllBookings();
    
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
    
    // Initialize SupabaseBookingManager
    await supabaseBookingManager.initialize();
    
    // Create new booking in Supabase
    const newBooking = await supabaseBookingManager.createBooking({
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone || '',
      propertyId: body.propertyId,
      propertyName: body.propertyName || '',
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests || 1,
      amount: body.amount,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: body.specialRequests || ''
    });
    
    if (!newBooking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create booking in database' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: newBooking,
      message: 'Booking created successfully and saved to Supabase'
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking ID is required' 
        },
        { status: 400 }
      );
    }
    
    // Initialize SupabaseBookingManager
    await supabaseBookingManager.initialize();
    
    // Update booking in Supabase
    const updatedBooking = await supabaseBookingManager.updateBooking(id, updates);
    
    if (!updatedBooking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update booking' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update booking' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Try to get ID from query params first, then from request body
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    
    // If not in query params, try to get from request body
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (error) {
        console.log('Could not parse request body for DELETE');
      }
    }
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking ID is required' 
        },
        { status: 400 }
      );
    }
    
    // Initialize SupabaseBookingManager
    await supabaseBookingManager.initialize();
    
    // Delete booking from Supabase
    const success = await supabaseBookingManager.deleteBooking(id);
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete booking' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete booking' 
      },
      { status: 500 }
    );
  }
}

