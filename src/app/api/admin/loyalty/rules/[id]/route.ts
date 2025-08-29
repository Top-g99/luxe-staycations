import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PUT /api/admin/loyalty/rules/[id] - Update loyalty rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      rule_name,
      rule_description,
      rule_type,
      rule_value,
      is_active,
      applies_to,
      start_date,
      end_date
    } = body;

    // Validation
    if (!rule_name || !rule_type || rule_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if rule name already exists for other rules
    const { data: existingRule, error: checkError } = await supabase
      .from('loyalty_rules')
      .select('id')
      .eq('rule_name', rule_name)
      .neq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check existing rule error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing rule' },
        { status: 500 }
      );
    }

    if (existingRule) {
      return NextResponse.json(
        { error: 'Rule name already exists' },
        { status: 400 }
      );
    }

    // Update the rule
    const { data: updatedRule, error: updateError } = await supabase
      .from('loyalty_rules')
      .update({
        rule_name,
        rule_description,
        rule_type,
        rule_value,
        is_active,
        applies_to,
        start_date: start_date ? new Date(start_date).toISOString() : new Date().toISOString(),
        end_date: end_date ? new Date(end_date).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update rule error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update loyalty rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rule: updatedRule,
      message: 'Loyalty rule updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/loyalty/rules/[id] - Delete loyalty rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the rule
    const { error: deleteError } = await supabase
      .from('loyalty_rules')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete rule error:', deleteError);
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
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
