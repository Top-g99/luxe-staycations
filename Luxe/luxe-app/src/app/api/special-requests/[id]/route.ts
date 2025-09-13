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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { data, error } = await supabase
      .from('special_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching special request:', error);
      return NextResponse.json({ error: 'Special request not found' }, { status: 404 });
    }

    return NextResponse.json({ specialRequest: data });
  } catch (error) {
    console.error('Error in special request GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      adminNotes,
      priority,
      title,
      description
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
    if (priority) updateData.priority = priority;
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const { data, error } = await supabase
      .from('special_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating special request:', error);
      return NextResponse.json({ error: 'Failed to update special request' }, { status: 500 });
    }

    return NextResponse.json({ specialRequest: data });
  } catch (error) {
    console.error('Error in special request PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { error } = await supabase
      .from('special_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting special request:', error);
      return NextResponse.json({ error: 'Failed to delete special request' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Special request deleted successfully' });
  } catch (error) {
    console.error('Error in special request DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
