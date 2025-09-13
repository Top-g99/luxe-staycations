import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET: Fetch all loyalty rules
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Check if the loyalty_rules table exists by attempting a simple query
    try {
      const { data: rules, error } = await supabase
        .from('loyalty_rules')
        .select('*')
        .order('priority', { ascending: true })
        .order('rule_name', { ascending: true });

      if (error) {
        // Table doesn't exist or other database error
        console.log('Loyalty rules table not found or error:', error.message);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'Loyalty rules system is being set up. No rules to display yet.',
          setup_required: true,
          setup_instructions: 'Run the SQL schema file: loyalty-rules-schema.sql'
        });
      }

      // Filter by type if specified
      const { searchParams } = new URL(request.url);
      const ruleType = searchParams.get('type');
      const activeOnly = searchParams.get('active') === 'true';

      let filteredRules = rules || [];

      if (ruleType) {
        filteredRules = filteredRules.filter((rule: any) => rule.rule_type === ruleType);
      }

      if (activeOnly) {
        filteredRules = filteredRules.filter((rule: any) => rule.is_active);
      }

      return NextResponse.json({
        success: true,
        data: filteredRules,
        count: filteredRules.length
      });

    } catch (tableError) {
      // Table definitely doesn't exist
      console.log('Loyalty rules table does not exist:', tableError);
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Loyalty rules system is being set up. Database table needs to be created.',
        setup_required: true,
        setup_instructions: 'Run the SQL schema file: loyalty-rules-schema.sql'
      });
    }

  } catch (error) {
    console.error('Loyalty rules API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: 'System temporarily unavailable. Please try again later.',
      setup_required: true
    });
  }
}

// POST: Create a new loyalty rule
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { 
      rule_name,
      rule_description,
      rule_type,
      rule_value,
      rule_unit,
      applies_to,
      min_value,
      max_value,
      priority,
      is_active
    } = await request.json();

    // Validate input
    if (!rule_name || !rule_description || !rule_type || rule_value === undefined || !rule_unit) {
      return NextResponse.json(
        { error: 'Missing required fields: rule_name, rule_description, rule_type, rule_value, rule_unit' },
        { status: 400 }
      );
    }

    // Validate rule type
    const validRuleTypes = ['earning', 'redemption', 'tier', 'bonus', 'expiry'];
    if (!validRuleTypes.includes(rule_type)) {
      return NextResponse.json(
        { error: `Invalid rule_type. Must be one of: ${validRuleTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the rule
    const ruleData = {
      rule_name,
      rule_description,
      rule_type,
      rule_value: parseFloat(rule_value),
      rule_unit,
      applies_to: applies_to || 'all',
      min_value: min_value ? parseFloat(min_value) : 0,
      max_value: max_value ? parseFloat(max_value) : null,
      priority: priority || 0,
      is_active: is_active !== undefined ? is_active : true
    };

    const { data: newRule, error } = await supabase
      .from('loyalty_rules')
      .insert(ruleData)
      .select()
      .single();

    if (error) {
      console.error('Error creating loyalty rule:', error);
      return NextResponse.json(
        { error: 'Failed to create loyalty rule', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loyalty rule created successfully',
      rule: newRule
    });

  } catch (error) {
    console.error('Loyalty rule creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
