import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { success: false, message: 'Token and email are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find the guest account with the verification token
    const { data: guestAccount, error: findError } = await supabase
      .from('guest_accounts')
      .select('id, verification_token, created_at, is_verified')
      .eq('email', email.toLowerCase())
      .eq('verification_token', token)
      .single();

    if (findError || !guestAccount) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token or email' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (guestAccount.is_verified) {
      return NextResponse.json(
        { success: true, message: 'Email is already verified' }
      );
    }

    // Check if token is expired (24 hours)
    const tokenCreatedAt = new Date(guestAccount.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return NextResponse.json(
        { success: false, message: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update the guest account to mark as verified
    const { error: updateError } = await supabase
      .from('guest_accounts')
      .update({
        is_verified: true,
        verification_token: null, // Clear the token
        updated_at: new Date().toISOString()
      })
      .eq('id', guestAccount.id);

    if (updateError) {
      console.error('Error updating guest account:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to verify email. Please try again.' },
        { status: 500 }
      );
    }

    // Update loyalty account to active status
    const { error: loyaltyError } = await supabase
      .from('loyalty_accounts')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('guest_id', guestAccount.id);

    if (loyaltyError) {
      console.error('Error updating loyalty account:', loyaltyError);
      // Continue even if loyalty update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        guestId: guestAccount.id,
        email: email
      }
    });

  } catch (error) {
    console.error('Error in email verification:', error);
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

