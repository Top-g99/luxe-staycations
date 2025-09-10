import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { brevoEmailService } from '@/lib/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find the guest account
    const { data: guestAccount, error: findError } = await supabase
      .from('guest_accounts')
      .select('id, first_name, last_name, is_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !guestAccount) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email address' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (guestAccount.is_verified) {
      return NextResponse.json(
        { success: false, message: 'This email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);

    // Update the guest account with new token
    const { error: updateError } = await supabase
      .from('guest_accounts')
      .update({
        verification_token: verificationToken,
        updated_at: new Date().toISOString()
      })
      .eq('id', guestAccount.id);

    if (updateError) {
      console.error('Error updating verification token:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to generate new verification link. Please try again.' },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/guest/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      await brevoEmailService.sendEmail({
        to: email,
        subject: 'Verify Your Luxe Rewards Account',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email Address</h2>
            <p>Dear ${guestAccount.first_name},</p>
            <p>Please click the button below to verify your email address and activate your Luxe Rewards account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #5a3d35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>Best regards,<br>The Luxe Staycations Team</p>
          </div>
        `,
        textContent: `
Verify Your Email Address

Dear ${guestAccount.first_name},

Please click the link below to verify your email address and activate your Luxe Rewards account:

${verificationLink}

This link will expire in 24 hours.

If you didn't request this verification, please ignore this email.

Best regards,
The Luxe Staycations Team
        `,
        tags: ['verification', 'resend'],
        params: {
          guestName: `${guestAccount.first_name} ${guestAccount.last_name}`,
          verificationToken: verificationToken
        }
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A new verification email has been sent to your email address.'
    });

  } catch (error) {
    console.error('Error in resend verification:', error);
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

