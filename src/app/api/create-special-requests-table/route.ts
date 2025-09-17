import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Create the special_requests table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS special_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          booking_id TEXT NOT NULL,
          guest_email TEXT NOT NULL,
          guest_name TEXT,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          status TEXT DEFAULT 'pending',
          admin_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_special_requests_booking_id ON special_requests(booking_id);
        CREATE INDEX IF NOT EXISTS idx_special_requests_guest_email ON special_requests(guest_email);
        CREATE INDEX IF NOT EXISTS idx_special_requests_status ON special_requests(status);
      `
    });

    if (error) {
      console.error('Error creating special_requests table:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create table',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'special_requests table created successfully' 
    });
  } catch (error: any) {
    console.error('Error in create table API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

