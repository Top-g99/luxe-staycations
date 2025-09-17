import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user loyalty summary
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: userSummary, error: summaryError } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      console.error('User summary fetch error:', summaryError);
      return NextResponse.json(
        { error: 'Failed to fetch user loyalty summary' },
        { status: 500 }
      );
    }

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Transactions fetch error:', transactionsError);
    }

    return NextResponse.json({
      user_summary: userSummary || {
        user_id,
        total_jewels_balance: 0,
        total_jewels_earned: 0,
        total_jewels_redeemed: 0,
        active_jewels_balance: 0
      },
      recent_transactions: transactions || [],
      success: true
    });

  } catch (error) {
    console.error('User loyalty API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
