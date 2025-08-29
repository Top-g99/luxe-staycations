import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('user_loyalty_summary')
      .select('*')
      .order('total_jewels_earned', { ascending: false });

    // Add search filter if provided
    if (search.trim()) {
      query = query.ilike('user_id', `%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('user_loyalty_summary')
      .select('*', { count: 'exact', head: true });

    if (search.trim()) {
      countQuery = countQuery.ilike('user_id', `%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count error:', countError);
    }

    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.user_id,
      user_id: user.user_id,
      total_balance: user.total_jewels_balance,
      active_balance: user.active_jewels_balance,
      total_earned: user.total_jewels_earned,
      total_redeemed: user.total_jewels_redeemed,
      tier: calculateTier(user.total_jewels_earned),
      last_activity: user.last_calculated_at,
      created_at: user.created_at
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin loyalty users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateTier(totalEarned: number): string {
  if (totalEarned >= 1000) return 'Diamond';
  if (totalEarned >= 500) return 'Platinum';
  if (totalEarned >= 250) return 'Gold';
  if (totalEarned >= 100) return 'Silver';
  return 'Bronze';
}
