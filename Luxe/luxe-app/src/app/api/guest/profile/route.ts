import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get guest account data by email
    const { data: guestAccount, error: guestError } = await supabase
      .from('guest_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (guestError || !guestAccount) {
      return NextResponse.json(
        { success: false, message: 'Guest account not found' },
        { status: 404 }
      );
    }

    // Get loyalty account data using existing structure
    const { data: loyaltyAccount, error: loyaltyError } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .eq('user_id', guestAccount.id)
      .single();

    if (loyaltyError) {
      console.error('Error fetching loyalty account:', loyaltyError);
    }

    // Get booking history
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        property_name,
        check_in_date,
        check_out_date,
        total_amount,
        status,
        points_earned
      `)
      .eq('guest_id', guestAccount.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    // Define tier benefits based on current tier
    const getTierBenefits = (tier: string) => {
      const benefits = {
        bronze: [
          'Earn 1 point per ₹100 spent',
          'Basic customer support',
          'Email notifications'
        ],
        silver: [
          'Earn 1.2 points per ₹100 spent',
          'Priority customer support',
          'Early access to new properties',
          'Welcome amenities'
        ],
        gold: [
          'Earn 1.5 points per ₹100 spent',
          'Dedicated concierge service',
          'Exclusive member rates',
          'Complimentary upgrades',
          'Late checkout'
        ],
        platinum: [
          'Earn 2 points per ₹100 spent',
          'Personal travel consultant',
          'VIP check-in/check-out',
          'Complimentary spa services',
          'Exclusive events access'
        ]
      };
      return benefits[tier.toLowerCase() as keyof typeof benefits] || benefits.bronze;
    };

    // Calculate next tier points
    const getNextTierPoints = (tier: string) => {
      const tierThresholds = {
        bronze: 1000,
        silver: 5000,
        gold: 15000,
        platinum: 50000
      };
      return tierThresholds[tier.toLowerCase() as keyof typeof tierThresholds] || 1000;
    };

    // Calculate totals from bookings
    const totalSpent = bookings?.reduce((sum: number, booking: any) => sum + (booking.total_amount || 0), 0) || 0;
    const totalBookings = bookings?.length || 0;

    const loyaltyData = loyaltyAccount ? {
      pointsBalance: loyaltyAccount.active_jewels_balance || 0,
      tier: loyaltyAccount.tier || 'bronze',
      totalSpent: totalSpent,
      totalBookings: totalBookings,
      nextTierPoints: getNextTierPoints(loyaltyAccount.tier || 'bronze'),
      tierBenefits: getTierBenefits(loyaltyAccount.tier || 'bronze'),
      totalJewelsEarned: loyaltyAccount.total_jewels_earned || 0,
      totalJewelsRedeemed: loyaltyAccount.total_jewels_redeemed || 0
    } : {
      pointsBalance: 0,
      tier: 'bronze',
      totalSpent: totalSpent,
      totalBookings: totalBookings,
      nextTierPoints: 1000,
      tierBenefits: getTierBenefits('bronze'),
      totalJewelsEarned: 0,
      totalJewelsRedeemed: 0
    };

    const guestData = {
      id: guestAccount.id,
      firstName: guestAccount.first_name,
      lastName: guestAccount.last_name,
      email: guestAccount.email,
      phone: guestAccount.phone,
      isVerified: guestAccount.is_verified,
      createdAt: guestAccount.created_at
    };

    const bookingHistory = bookings?.map((booking: any) => ({
      id: booking.id,
      propertyName: booking.property_name,
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      totalAmount: booking.total_amount,
      status: booking.status,
      pointsEarned: booking.points_earned || 0
    })) || [];

    return NextResponse.json({
      success: true,
      guest: guestData,
      loyalty: loyaltyData,
      bookings: bookingHistory
    });

  } catch (error) {
    console.error('Error in guest profile API:', error);
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
