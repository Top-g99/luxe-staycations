import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get all guest accounts
    const { data: guests, error } = await supabase
      .from('guest_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guest accounts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch guest accounts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      guests: guests || []
    });

  } catch (error) {
    console.error('Admin guest accounts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

