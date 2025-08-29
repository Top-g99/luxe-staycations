import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get all user loyalty summaries
    const { data: users, error } = await supabase
      .from('user_loyalty_summary')
      .select('*')
      .order('total_jewels_earned', { ascending: false });

    if (error) {
      console.error('Users fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user loyalty data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
      success: true
    });

  } catch (error) {
    console.error('Admin loyalty users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
