import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { brevoEmailService } from '@/lib/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, subscribeToNewsletter } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if user already exists
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: existingUser } = await supabase
      .from('guest_accounts')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);

    // Create guest account
    const { data: guestAccount, error: guestError } = await supabase
      .from('guest_accounts')
      .insert([{
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password_hash: hashedPassword,
        verification_token: verificationToken,
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (guestError) {
      console.error('Error creating guest account:', guestError);
      return NextResponse.json(
        { success: false, message: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Create loyalty account using existing structure
    const { data: loyaltyAccount, error: loyaltyError } = await supabase
      .from('user_loyalty_summary')
      .insert([{
        user_id: guestAccount.id,
        total_jewels_balance: 0,
        total_jewels_earned: 0,
        total_jewels_redeemed: 0,
        active_jewels_balance: 0,
        tier: 'bronze',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (loyaltyError) {
      console.error('Error creating loyalty account:', loyaltyError);
      // Continue without loyalty account for now
    }

    // Send welcome email with verification
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/guest/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      await brevoEmailService.sendLoyaltyWelcome({
        guestName: `${firstName} ${lastName}`,
        guestEmail: email,
        currentPoints: 0,
        rewardsDashboardLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/guest/dashboard`
      });

      // Send verification email
      await brevoEmailService.sendEmail(email, 'Verify Your Luxe Rewards Account', `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Luxe Rewards!</h2>
            <p>Dear ${firstName},</p>
            <p>Thank you for joining our exclusive loyalty program! To complete your account setup, please verify your email address.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #5a3d35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The Luxe Staycations Team</p>
          </div>
        `);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue even if email fails
    }

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

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        guestId: guestAccount.id,
        email: email,
        loyaltyAccountId: loyaltyAccount?.id
      }
    });

  } catch (error) {
    console.error('Error in guest signup:', error);
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
