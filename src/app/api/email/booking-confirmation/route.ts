import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Booking confirmation email request received:', data);

    // Validate required fields
    const requiredFields = ['guestName', 'guestEmail', 'bookingId', 'propertyName', 'checkIn', 'checkOut', 'guests', 'totalAmount'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Send booking confirmation email
    const emailResult = await emailService.sendBookingConfirmation({
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone || '+91-9876543210',
      bookingId: data.bookingId,
      propertyName: data.propertyName,
      propertyLocation: data.propertyLocation || 'Luxe Staycations',
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      totalAmount: data.totalAmount,
      paymentStatus: data.paymentStatus || 'Confirmed',
      specialRequests: data.specialRequests
    });

    if (emailResult.success) {
      console.log('Booking confirmation email sent successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Booking confirmation email sent successfully'
      });
    } else {
      console.error('Failed to send booking confirmation email:', emailResult.error);
      return NextResponse.json({ 
        success: false, 
        message: `Booking confirmation email failed: ${emailResult.error}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in booking confirmation API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
