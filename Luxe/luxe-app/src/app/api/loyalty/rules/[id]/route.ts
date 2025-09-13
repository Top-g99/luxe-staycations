import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET: Get specific loyalty rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;

    const { data: rule, error } = await supabase
      .from('loyalty_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !rule) {
      return NextResponse.json(
        { error: 'Loyalty rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rule
    });

  } catch (error) {
    console.error('Loyalty rule fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update loyalty rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { 
      rule_value,
      rule_unit,
      applies_to,
      min_value,
      max_value,
      priority,
      is_active,
      effective_until,
      change_reason,
      admin_id
    } = await request.json();

    // Get the current rule to compare values
    const { data: currentRule, error: fetchError } = await supabase
      .from('loyalty_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentRule) {
      return NextResponse.json(
        { error: 'Loyalty rule not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (rule_value !== undefined) updateData.rule_value = parseFloat(rule_value);
    if (rule_unit !== undefined) updateData.rule_unit = rule_unit;
    if (applies_to !== undefined) updateData.applies_to = applies_to;
    if (min_value !== undefined) updateData.min_value = min_value ? parseFloat(min_value) : 0;
    if (max_value !== undefined) updateData.max_value = max_value ? parseFloat(max_value) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (effective_until !== undefined) updateData.effective_until = effective_until;
    if (admin_id) updateData.updated_by = admin_id;

    // Update the rule
    const { data: updatedRule, error: updateError } = await supabase
      .from('loyalty_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating loyalty rule:', updateError);
      return NextResponse.json(
        { error: 'Failed to update loyalty rule', details: updateError.message },
        { status: 500 }
      );
    }

    // Create audit trail entry if values changed
    if (change_reason && (
      currentRule.rule_value !== updatedRule.rule_value ||
      currentRule.rule_unit !== updatedRule.rule_unit
    )) {
      const auditData = {
        rule_id: id,
        old_value: currentRule.rule_value,
        new_value: updatedRule.rule_value,
        old_unit: currentRule.rule_unit,
        new_unit: updatedRule.rule_unit,
        change_reason,
        changed_by: admin_id
      };

      const { error: auditError } = await supabase
        .from('loyalty_rule_history')
        .insert(auditData);

      if (auditError) {
        console.error('Error creating audit trail:', auditError);
        // Don't fail the update if audit trail fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Loyalty rule updated successfully',
      rule: updatedRule
    });

  } catch (error) {
    console.error('Loyalty rule update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete loyalty rule (soft delete by setting is_active to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { admin_id, reason } = await request.json();

    // Soft delete by setting is_active to false
    const { data: deletedRule, error } = await supabase
      .from('loyalty_rules')
      .update({ 
        is_active: false, 
        updated_by: admin_id,
        effective_until: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting loyalty rule:', error);
      return NextResponse.json(
        { error: 'Failed to delete loyalty rule', details: error.message },
        { status: 500 }
      );
    }

    // Create audit trail entry
    if (reason) {
      const auditData = {
        rule_id: id,
        old_value: deletedRule.rule_value,
        new_value: 0,
        old_unit: deletedRule.rule_unit,
        new_unit: 'deleted',
        change_reason: `Rule deactivated: ${reason}`,
        changed_by: admin_id
      };

      const { error: auditError } = await supabase
        .from('loyalty_rule_history')
        .insert(auditData);

      if (auditError) {
        console.error('Error creating audit trail:', auditError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Loyalty rule deactivated successfully',
      rule: deletedRule
    });

  } catch (error) {
    console.error('Loyalty rule deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

