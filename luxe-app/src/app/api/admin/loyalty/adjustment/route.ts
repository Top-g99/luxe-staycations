import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { user_id, adjustment_type, amount, reason, admin_notes } = await request.json();

    // Validate input
    if (!user_id || !adjustment_type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid input: user_id, adjustment_type, and positive amount are required' },
        { status: 400 }
      );
    }

    if (!['add', 'remove'].includes(adjustment_type)) {
      return NextResponse.json(
        { error: 'adjustment_type must be either "add" or "remove"' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('User check error:', userError);
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      );
    }

    // Create the adjustment transaction
    const transactionData = {
      user_id,
      jewels_earned: adjustment_type === 'add' ? amount : 0,
      jewels_redeemed: adjustment_type === 'remove' ? amount : 0,
      reason: 'manual_adjustment',
      expires_at: adjustment_type === 'add' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create adjustment transaction' },
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
      message: `Successfully ${adjustment_type === 'add' ? 'added' : 'removed'} ${amount} jewels`,
      transaction_id: transaction.id,
      user_summary: updatedUser || {
        user_id,
        total_jewels_balance: 0,
        total_jewels_earned: 0,
        total_jewels_redeemed: 0,
        active_jewels_balance: 0
      },
      adjustment_details: {
        type: adjustment_type,
        amount,
        reason: reason || 'Manual adjustment',
        admin_notes: admin_notes || '',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Admin loyalty adjustment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
