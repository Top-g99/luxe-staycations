import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use anon key for client-side operations, service role key for admin operations
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');

    let query = supabase
      .from('special_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching special requests:', error);
      return NextResponse.json({ error: 'Failed to fetch special requests' }, { status: 500 });
    }

    return NextResponse.json({ specialRequests: data || [] });
  } catch (error) {
    console.error('Error in special requests GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Special requests POST called');
    const supabase = getSupabaseClient();
    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      bookingId,
      guestEmail,
      guestName,
      category,
      title,
      description,
      priority = 'medium',
      status = 'pending'
    } = body;

    if (!bookingId || !guestEmail || !title || !description) {
      console.log('Missing required fields:', { bookingId, guestEmail, title, description });
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, guestEmail, title, description' },
        { status: 400 }
      );
    }

    console.log('Attempting to insert special request into Supabase...');
    const { data, error } = await supabase
      .from('special_requests')
      .insert([
        {
          booking_id: bookingId,
          guest_email: guestEmail,
          guest_name: guestName,
          category,
          title,
          description,
          priority,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating special request:', error);
      return NextResponse.json({ 
        error: 'Failed to save special request',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('Special request created successfully:', data);
    return NextResponse.json({ specialRequest: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in special requests POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
