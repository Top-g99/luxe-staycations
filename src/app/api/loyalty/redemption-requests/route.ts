import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET: Fetch all redemption requests for admin review
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    let query = supabase
      .from('loyalty_redemption_requests')
      .select(`
        *,
        guest_accounts!inner(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching redemption requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch redemption requests', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requests || [],
      count: requests?.length || 0
    });

  } catch (error) {
    console.error('Redemption requests API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: 'System temporarily unavailable. Please try again later.',
      setup_required: true
    });
  }
}

// POST: Create a new redemption request
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { 
      guest_id, 
      jewels_to_redeem, 
      redemption_reason, 
      contact_preference, 
      special_notes 
    } = await request.json();

    // Validate input
    if (!guest_id || !jewels_to_redeem || jewels_to_redeem <= 0 || !redemption_reason) {
      return NextResponse.json(
        { error: 'Invalid input: guest_id, positive jewels_to_redeem, and redemption_reason are required' },
        { status: 400 }
      );
    }

    // Check if guest has sufficient jewels
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: loyaltySummary, error: loyaltyError } = await supabase
      .from('user_loyalty_summary')
      .select('active_jewels_balance')
      .eq('user_id', guest_id)
      .single();

    if (loyaltyError || !loyaltySummary) {
      return NextResponse.json(
        { error: 'Guest loyalty account not found' },
        { status: 404 }
      );
    }

    if (loyaltySummary.active_jewels_balance < jewels_to_redeem) {
      return NextResponse.json(
        { error: 'Insufficient jewels balance for redemption' },
        { status: 400 }
      );
    }

    // Create redemption request
    const requestData = {
      guest_id,
      jewels_to_redeem,
      redemption_reason,
      contact_preference: contact_preference || 'email',
      special_notes: special_notes || '',
      status: 'pending',
      admin_notes: '',
      processed_at: null,
      processed_by: null
    };

    const { data: redemptionRequest, error: requestError } = await supabase
      .from('loyalty_redemption_requests')
      .insert(requestData)
      .select()
      .single();

    if (requestError) {
      console.error('Redemption request creation error:', requestError);
      return NextResponse.json(
        { error: 'Failed to create redemption request', details: requestError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Redemption request submitted successfully and pending admin approval',
      request_id: redemptionRequest.id,
      redemption_request: redemptionRequest
    });

  } catch (error) {
    console.error('Redemption request creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
