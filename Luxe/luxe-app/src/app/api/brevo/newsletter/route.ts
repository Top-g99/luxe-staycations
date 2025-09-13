import { NextRequest, NextResponse } from 'next/server';
import { brevoEmailService, BrevoConfig } from '@/lib/brevoEmailService';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      guestName, 
      guestEmail, 
      newsletterTitle, 
      newsletterContent, 
      featuredPropertyName, 
      featuredPropertyDescription, 
      featuredPropertyPrice, 
      ctaText, 
      ctaLink 
    } = body;

    if (!guestName || !guestEmail || !newsletterTitle || !newsletterContent) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: guestName, guestEmail, newsletterTitle, newsletterContent' },
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

    // Send marketing newsletter email
    const result = await brevoEmailService.sendMarketingNewsletter({
      guestName,
      guestEmail,
      newsletterTitle,
      newsletterContent,
      featuredPropertyName: featuredPropertyName || 'Featured Property',
      featuredPropertyDescription: featuredPropertyDescription || 'Discover our latest luxury property',
      featuredPropertyPrice: featuredPropertyPrice || 0,
      ctaText: ctaText || 'Explore Now',
      ctaLink: ctaLink || 'https://luxestaycations.in'
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error sending marketing newsletter via Brevo:', error);
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

