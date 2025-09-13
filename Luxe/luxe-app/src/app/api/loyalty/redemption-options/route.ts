import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: options, error } = await supabase
      .from('loyalty_redemption_options')
      .select('*')
      .eq('is_active', true)
      .order('jewels_required', { ascending: true });

    if (error) {
      console.error('Error fetching redemption options:', error);
      return NextResponse.json(
        { error: 'Failed to fetch redemption options', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: options || [],
      count: options?.length || 0
    });

  } catch (error) {
    console.error('Redemption options API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
