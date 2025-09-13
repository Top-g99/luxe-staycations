import { NextRequest, NextResponse } from 'next/server';
import { brevoEmailService, BrevoConfig } from '@/lib/brevoEmailService';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      guestName, 
      guestEmail, 
      bookingId, 
      propertyName, 
      propertyLocation, 
      checkIn, 
      checkOut, 
      guests, 
      totalAmount, 
      transactionId, 
      paymentMethod,
      hostName,
      hostPhone,
      hostEmail,
      specialRequests,
      amenities
    } = body;

    console.log('Brevo Booking Confirmation email API called with:', { guestName, guestEmail, bookingId, propertyName });

    if (!guestName || !guestEmail || !bookingId || !propertyName || !checkIn || !checkOut || !totalAmount) {
      console.error('Missing required fields for booking confirmation email:', { guestName, guestEmail, bookingId, propertyName });
      return NextResponse.json(
        { success: false, message: 'Missing required fields for booking confirmation email' },
        { status: 400 }
      );
    }

    // Get Brevo configuration
    const supabase = getSupabaseClient();
    const { data: config, error } = await supabase
      .from('brevo_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error || !config || config.length === 0) {
      console.error('Brevo configuration not found:', error);
      return NextResponse.json(
        { success: false, message: 'Brevo not configured. Please configure Brevo settings first.' },
        { status: 400 }
      );
    }

    const brevoConfig: BrevoConfig = {
      apiKey: config[0].api_key,
      senderEmail: config[0].sender_email,
      senderName: config[0].sender_name,
      replyToEmail: config[0].reply_to_email
    };

    // Initialize Brevo service
    await brevoEmailService.initialize(brevoConfig);

    // Send booking confirmation email
    console.log('Sending booking confirmation email via Brevo service...');
    const result = await brevoEmailService.sendBookingConfirmation({
      guestName,
      guestEmail,
      bookingId,
      propertyName,
      propertyLocation: propertyLocation || 'Luxury Location',
      checkIn,
      checkOut,
      guests: guests || '2',
      totalAmount: Number(totalAmount),
      transactionId: transactionId || `TXN-${Date.now()}`,
      paymentMethod: paymentMethod || 'Online Payment',
      hostName: hostName || 'Luxe Staycations Team',
      hostPhone: hostPhone || '+91 98765 43210',
      hostEmail: hostEmail || 'info@luxestaycations.in',
      specialRequests: specialRequests || '',
      amenities: amenities || []
    });

    console.log('Booking confirmation email result from Brevo service:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error sending booking confirmation email via Brevo API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

