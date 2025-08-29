import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { user_id, jewels_to_redeem } = await request.json();

    if (!user_id || !jewels_to_redeem) {
      return NextResponse.json(
        { error: 'User ID and jewels to redeem are required' },
        { status: 400 }
      );
    }

    if (jewels_to_redeem < 100) {
      return NextResponse.json(
        { error: 'Minimum 100 jewels required for redemption' },
        { status: 400 }
      );
    }

    // Check current balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_loyalty_summary')
      .select('active_jewels_balance')
      .eq('user_id', user_id)
      .single();

    if (balanceError || !balanceData) {
      return NextResponse.json(
        { error: 'User loyalty summary not found' },
        { status: 404 }
      );
    }

    const currentBalance = balanceData.active_jewels_balance;

    if (currentBalance < jewels_to_redeem) {
      return NextResponse.json(
        { error: 'Insufficient jewels balance' },
        { status: 400 }
      );
    }

    // Calculate discount (₹100 per jewel)
    const discountAmount = jewels_to_redeem * 100;

    // Record the redemption transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id,
        jewels_redeemed: jewels_to_redeem,
        reason: 'redemption'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to record redemption transaction' },
        { status: 500 }
      );
    }

    // Get updated balance
    const { data: updatedBalanceData, error: updatedBalanceError } = await supabase
      .from('user_loyalty_summary')
      .select('active_jewels_balance')
      .eq('user_id', user_id)
      .single();

    const remainingBalance = updatedBalanceData?.active_jewels_balance || 0;

    return NextResponse.json({
      success: true,
      message: 'Jewels redeemed successfully',
      discount_amount: discountAmount,
      remaining_balance: remainingBalance,
      transaction_id: transactionData.id
    });

  } catch (error) {
    console.error('Loyalty redeem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
