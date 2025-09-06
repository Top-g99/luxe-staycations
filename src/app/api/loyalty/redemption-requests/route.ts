import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET: Fetch all redemption requests for admin review
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // For now, return empty data with a setup message
    // This prevents the error while the database is being set up
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: 'Loyalty redemption system is being set up. No requests to display yet.',
      setup_required: true,
      setup_instructions: 'Run the SQL schema file: loyalty-redemption-requests-schema.sql'
    });

    /* 
    // Uncomment this section once the database table is created
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('loyalty_redemption_requests')
      .select('*')
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
    */

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
    // For now, return a setup required message
    // This prevents errors while the database is being set up
    return NextResponse.json(
      { 
        error: 'Loyalty redemption system is being set up. Please try again later.',
        setup_required: true,
        setup_instructions: 'Database table needs to be created first'
      },
      { status: 503 }
    );

    /* 
    // Uncomment this section once the database table is created
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
    */

  } catch (error) {
    console.error('Redemption request creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
