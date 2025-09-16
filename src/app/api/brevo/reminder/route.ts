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
      checkInDate, 
      checkOutDate, 
      guestCount, 
      checkInTime, 
      checkOutTime, 
      propertyAddress, 
      hostPhone, 
      bookingLink 
    } = body;

    if (!guestName || !guestEmail || !bookingId || !propertyName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: guestName, guestEmail, bookingId, propertyName' },
        { status: 400 }
      );
    }

    // Get Brevo configuration
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: config, error } = await supabase
      .from('brevo_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error || !config || config.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Brevo not configured. Please configure Brevo settings first.' },
        { status: 400 }
      );
    }

    const brevoConfig: BrevoConfig = {
      apiKey: config[0].api_key,
      baseUrl: 'https://api.brevo.com',
      timeout: 30000,
      senderEmail: config[0].sender_email,
      senderName: config[0].sender_name,
      replyToEmail: config[0].reply_to_email
    };

    // Initialize Brevo service
    await brevoEmailService.initialize();

    // Send booking reminder email
    const result = await brevoEmailService.sendBookingReminder({
      guestName,
      guestEmail,
      bookingId,
      propertyName,
      checkInDate: checkInDate || 'TBD',
      checkOutDate: checkOutDate || 'TBD',
      guestCount: guestCount || '1',
      checkInTime: checkInTime || '3:00 PM',
      checkOutTime: checkOutTime || '11:00 AM',
      propertyAddress: propertyAddress || 'Property Address',
      hostPhone: hostPhone || '+91-9876543210',
      bookingLink: bookingLink || 'https://luxestaycations.in'
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error sending booking reminder via Brevo:', error);
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

