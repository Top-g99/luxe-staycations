import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get all loyalty rules
    const { data: rules, error } = await supabase
      .from('loyalty_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Rules fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch loyalty rules' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rules: rules || [],
      success: true
    });

  } catch (error) {
    console.error('Admin loyalty rules API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const ruleData = await request.json();

    // Validate required fields
    if (!ruleData.rule_name || !ruleData.jewels_earned || ruleData.jewels_earned <= 0) {
      return NextResponse.json(
        { error: 'Rule name and positive jewels earned are required' },
        { status: 400 }
      );
    }

    // Create new rule
    const { data: rule, error } = await supabase
      .from('loyalty_rules')
      .insert(ruleData)
      .select()
      .single();

    if (error) {
      console.error('Rule creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create loyalty rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rule,
      success: true,
      message: 'Loyalty rule created successfully'
    });

  } catch (error) {
    console.error('Admin loyalty rules POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


