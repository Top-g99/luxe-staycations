import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// PUT: Update redemption request status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { 
      status, 
      admin_notes, 
      admin_id 
    } = await request.json();

    // Validate input
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status: must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (!admin_id) {
      return NextResponse.json(
        { error: 'Admin ID is required for processing requests' },
        { status: 400 }
      );
    }

    // Get the redemption request
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: redemptionRequest, error: fetchError } = await supabase
      .from('loyalty_redemption_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !redemptionRequest) {
      return NextResponse.json(
        { error: 'Redemption request not found' },
        { status: 404 }
      );
    }

    if (redemptionRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Redemption request has already been processed' },
        { status: 400 }
      );
    }

    // Update the redemption request
    const updateData = {
      status,
      admin_notes: admin_notes || '',
      processed_at: new Date().toISOString(),
      processed_by: admin_id
    };

    const { data: updatedRequest, error: updateError } = await supabase
      .from('loyalty_redemption_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating redemption request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update redemption request' },
        { status: 500 }
      );
    }

    // If approved, process the actual redemption
    if (status === 'approved') {
      try {
        // Create redemption transaction
        const transactionData = {
          user_id: redemptionRequest.guest_id,
          jewels_earned: 0,
          jewels_redeemed: redemptionRequest.jewels_to_redeem,
          reason: `redemption_approved: ${redemptionRequest.redemption_reason}`,
          expires_at: null,
          redemption_request_id: id
        };

        const { error: transactionError } = await supabase
          .from('loyalty_transactions')
          .insert(transactionData);

        if (transactionError) {
          console.error('Error creating redemption transaction:', transactionError);
          // Note: The request is still marked as approved, but the transaction failed
          // In production, you might want to rollback the approval or handle this differently
        }
      } catch (transactionError) {
        console.error('Error processing approved redemption:', transactionError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Redemption request ${status} successfully`,
      redemption_request: updatedRequest
    });

  } catch (error) {
    console.error('Redemption request update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get specific redemption request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: redemptionRequest, error } = await supabase
      .from('loyalty_redemption_requests')
      .select(`
        *,
        guest:guest_id(id, email, name),
        loyalty_summary:user_loyalty_summary(active_jewels_balance)
      `)
      .eq('id', id)
      .single();

    if (error || !redemptionRequest) {
      return NextResponse.json(
        { error: 'Redemption request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: redemptionRequest
    });

  } catch (error) {
    console.error('Redemption request fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

