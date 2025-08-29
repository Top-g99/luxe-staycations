import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/admin/loyalty/rules - Get all loyalty rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 1000;

    const { data: rules, error } = await supabase
      .from('loyalty_rules')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch loyalty rules' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rules: rules || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/loyalty/rules - Create new loyalty rule
export async function POST(request: NextRequest) {
  try {
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

    // Check if rule name already exists
    const { data: existingRule, error: checkError } = await supabase
      .from('loyalty_rules')
      .select('id')
      .eq('rule_name', rule_name)
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

    // Create the rule
    const { data: newRule, error: createError } = await supabase
      .from('loyalty_rules')
      .insert({
        rule_name,
        rule_description,
        rule_type,
        rule_value,
        is_active,
        applies_to,
        start_date: start_date ? new Date(start_date).toISOString() : new Date().toISOString(),
        end_date: end_date ? new Date(end_date).toISOString() : null
      })
      .select()
      .single();

    if (createError) {
      console.error('Create rule error:', createError);
      return NextResponse.json(
        { error: 'Failed to create loyalty rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rule: newRule,
      message: 'Loyalty rule created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


