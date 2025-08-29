import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user loyalty summary
    const { data: summaryData, error: summaryError } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      console.error('Summary fetch error:', summaryError);
      return NextResponse.json(
        { error: 'Failed to fetch loyalty summary' },
        { status: 500 }
      );
    }

    // Get user loyalty transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transactionsError) {
      console.error('Transactions fetch error:', transactionsError);
      return NextResponse.json(
        { error: 'Failed to fetch loyalty transactions' },
        { status: 500 }
      );
    }

    // If no summary exists, create one from transactions
    let userSummary = summaryData;
    if (!summaryData) {
      // Calculate summary from transactions
      const totalEarned = transactionsData
        .filter(t => t.jewels_earned > 0)
        .reduce((sum, t) => sum + t.jewels_earned, 0);
      
      const totalRedeemed = transactionsData
        .filter(t => t.jewels_redeemed > 0)
        .reduce((sum, t) => sum + t.jewels_redeemed, 0);
      
      const activeEarned = transactionsData
        .filter(t => t.jewels_earned > 0 && (!t.expires_at || new Date(t.expires_at) > new Date()))
        .reduce((sum, t) => sum + t.jewels_earned, 0);
      
      const activeBalance = activeEarned - totalRedeemed;
      
      userSummary = {
        user_id,
        total_jewels_balance: totalEarned - totalRedeemed,
        total_jewels_earned: totalEarned,
        total_jewels_redeemed: totalRedeemed,
        active_jewels_balance: Math.max(0, activeBalance),
        last_calculated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the calculated summary
      const { error: insertError } = await supabase
        .from('user_loyalty_summary')
        .insert(userSummary);

      if (insertError) {
        console.error('Failed to insert calculated summary:', insertError);
      }
    }

    // Format transactions for response
    const formattedTransactions = transactionsData.map(transaction => ({
      id: transaction.id,
      type: transaction.jewels_earned > 0 ? 'earned' : 'redeemed',
      amount: transaction.jewels_earned > 0 ? transaction.jewels_earned : transaction.jewels_redeemed,
      reason: formatReason(transaction.reason),
      date: transaction.created_at,
      expires_at: transaction.expires_at,
      booking_id: transaction.booking_id
    }));

    return NextResponse.json({
      user_id,
      summary: userSummary,
      transactions: formattedTransactions,
      tier: calculateTier(userSummary?.total_jewels_earned || 0)
    });

  } catch (error) {
    console.error('User loyalty API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatReason(reason: string): string {
  const reasonMap: { [key: string]: string } = {
    'booking_completion': 'Completed Stay',
    'review_submission': 'Review Submitted',
    'referral': 'Referral Bonus',
    'redemption': 'Jewels Redeemed',
    'manual_adjustment': 'Manual Adjustment',
    'expiration': 'Jewels Expired'
  };
  
  return reasonMap[reason] || reason;
}

function calculateTier(totalEarned: number): string {
  if (totalEarned >= 1000) return 'Diamond';
  if (totalEarned >= 500) return 'Platinum';
  if (totalEarned >= 250) return 'Gold';
  if (totalEarned >= 100) return 'Silver';
  return 'Bronze';
}
