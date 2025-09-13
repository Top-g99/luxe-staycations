import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { user_id, jewels_to_redeem, redemption_reason } = await request.json();

    // Validate input
    if (!user_id || !jewels_to_redeem || jewels_to_redeem <= 0) {
      return NextResponse.json(
        { error: 'Invalid input: user_id and positive jewels_to_redeem are required' },
        { status: 400 }
      );
    }

    // Check user's current balance
    const { data: userSummary, error: userError } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError) {
      console.error('User summary fetch error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user loyalty summary' },
        { status: 500 }
      );
    }

    if (!userSummary || userSummary.active_jewels_balance < jewels_to_redeem) {
      return NextResponse.json(
        { error: 'Insufficient jewels balance for redemption' },
        { status: 400 }
      );
    }

    // Create redemption transaction
    const transactionData = {
      user_id,
      jewels_earned: 0,
      jewels_redeemed: jewels_to_redeem,
      reason: redemption_reason || 'manual_redemption',
      expires_at: null
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('Redemption transaction error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to process redemption' },
        { status: 500 }
      );
    }

    // Get updated user summary
    const { data: updatedUser, error: updatedUserError } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (updatedUserError) {
      console.error('Updated user fetch error:', updatedUserError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${jewels_to_redeem} jewels`,
      transaction_id: transaction.id,
      user_summary: updatedUser || userSummary,
      redemption_details: {
        jewels_redeemed: jewels_to_redeem,
        reason: redemption_reason || 'Manual redemption',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Loyalty redemption API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
