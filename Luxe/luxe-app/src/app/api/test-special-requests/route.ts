import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Test if the special_requests table exists
    const { data, error } = await supabase
      .from('special_requests')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
        message: 'The special_requests table does not exist. Please run the migration SQL in Supabase.'
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: 'Special requests table exists and is accessible',
      count: data?.length || 0
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Error connecting to Supabase or table does not exist'
    }, { status: 200 });
  }
}

