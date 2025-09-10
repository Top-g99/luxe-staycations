import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;

    // Get specific loyalty rule
    const { data: rule, error } = await supabase
      .from('loyalty_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Rule fetch error:', error);
      return NextResponse.json(
        { error: 'Loyalty rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      rule,
      success: true
    });

  } catch (error) {
    console.error('Admin loyalty rule GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const updateData = await request.json();

    // Update loyalty rule
    const { data: rule, error } = await supabase
      .from('loyalty_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Rule update error:', error);
      return NextResponse.json(
        { error: 'Failed to update loyalty rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rule,
      success: true,
      message: 'Loyalty rule updated successfully'
    });

  } catch (error) {
    console.error('Admin loyalty rule PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;

    // Delete loyalty rule
    const { error } = await supabase
      .from('loyalty_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Rule deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete loyalty rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loyalty rule deleted successfully'
    });

  } catch (error) {
    console.error('Admin loyalty rule DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
