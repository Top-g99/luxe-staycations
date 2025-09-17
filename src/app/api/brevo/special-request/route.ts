import { NextRequest, NextResponse } from 'next/server';
import { brevoEmailService, BrevoConfig } from '@/lib/brevoEmailService';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      guestName, 
      guestEmail, 
      phone, 
      propertyName, 
      requestType, 
      description, 
      urgency, 
      requestId 
    } = body;

    console.log('Special request email API called with:', { 
      guestName, 
      guestEmail, 
      propertyName, 
      requestType, 
      urgency, 
      requestId 
    });

    if (!guestName || !guestEmail || !propertyName || !description) {
      console.error('Missing required fields:', { guestName, guestEmail, propertyName, description });
      return NextResponse.json(
        { success: false, message: 'Missing required fields: guestName, guestEmail, propertyName, description' },
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

    // Send special request confirmation email
    console.log('Sending special request confirmation email via Brevo...');
    const result = await brevoEmailService.sendSpecialRequestConfirmation({
      guestName,
      guestEmail,
      bookingId: requestId || `SR-${Date.now()}`, // Use requestId as bookingId for now
      propertyName,
      requests: [{
        type: requestType || 'Special Request',
        description,
        priority: (urgency || 'Medium').toLowerCase()
      }],
      urgency: urgency || 'Medium',
      requestId: requestId || `SR-${Date.now()}`
    });

    console.log('Special request email result:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error sending special request confirmation email via Brevo:', error);
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
