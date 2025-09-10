import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { brevoEmailService } from '@/lib/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      bookingId, 
      propertyName, 
      totalAmount, 
      subscribeToNewsletter,
      loyaltyPoints
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !bookingId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if guest account already exists
    const { data: existingGuest } = await supabase
      .from('guest_accounts')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingGuest) {
      // Link the booking to existing guest account
      const earnedPoints = loyaltyPoints || Math.floor(totalAmount / 100);
      await supabase
        .from('guest_booking_links')
        .insert([{
          guest_id: existingGuest.id,
          booking_id: bookingId,
          property_name: propertyName,
          total_amount: totalAmount,
          points_earned: earnedPoints,
          created_at: new Date().toISOString()
        }]);

      return NextResponse.json({
        success: true,
        message: 'Booking linked to existing guest account',
        guestId: existingGuest.id,
        isNewAccount: false
      });
    }

    // Generate a temporary password (guest will set their own later)
    const tempPassword = Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create guest account
    const { data: guestAccount, error: guestError } = await supabase
      .from('guest_accounts')
      .insert([{
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password_hash: hashedPassword,
        verification_token: null, // Skip verification for booking-created accounts
        is_verified: true, // Auto-verify accounts created from bookings
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (guestError) {
      console.error('Error creating guest account:', guestError);
      return NextResponse.json(
        { success: false, message: 'Failed to create guest account' },
        { status: 500 }
      );
    }

    // Create loyalty account
    const earnedPoints = loyaltyPoints || Math.floor(totalAmount / 100);
    const { data: loyaltyAccount, error: loyaltyError } = await supabase
      .from('user_loyalty_summary')
      .insert([{
        user_id: guestAccount.id,
        total_jewels_balance: 0,
        total_jewels_earned: earnedPoints,
        total_jewels_redeemed: 0,
        active_jewels_balance: earnedPoints,
        tier: 'bronze',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (loyaltyError) {
      console.error('Error creating loyalty account:', loyaltyError);
      // Continue even if loyalty account creation fails
    }

    // Link the booking to the guest account
    await supabase
      .from('guest_booking_links')
      .insert([{
        guest_id: guestAccount.id,
        booking_id: bookingId,
        property_name: propertyName,
        total_amount: totalAmount,
        points_earned: earnedPoints,
        created_at: new Date().toISOString()
      }]);

    // Subscribe to newsletter if requested
    if (subscribeToNewsletter) {
      try {
        await supabase
          .from('newsletter_subscribers')
          .insert([{
            email: email.toLowerCase().trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            is_active: true,
            subscribed_at: new Date().toISOString()
          }])
          .select();
      } catch (newsletterError) {
        console.error('Error subscribing to newsletter:', newsletterError);
        // Continue even if newsletter subscription fails
      }
    }

    // Send loyalty welcome email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in';
      const response = await fetch('/api/brevo/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: `${firstName} ${lastName}`,
          guestEmail: email.toLowerCase().trim(),
          currentPoints: earnedPoints,
          rewardsDashboardLink: `${baseUrl}/guest/dashboard?guestId=${guestAccount.id}`
        }),
      });
      
      const emailResult = await response.json();
      console.log('Loyalty welcome email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Error sending loyalty welcome email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Guest account and loyalty account created successfully',
      data: {
        guestId: guestAccount.id,
        loyaltyAccountId: loyaltyAccount?.id,
        pointsEarned: earnedPoints,
        isNewAccount: true
      }
    });

  } catch (error) {
    console.error('Error in create-from-booking:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
