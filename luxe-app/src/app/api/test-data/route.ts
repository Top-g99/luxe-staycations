import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing data endpoints...');
    
    // Test Supabase connection
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not initialized'
      });
    }

    // Test bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from(TABLES.BOOKINGS)
      .select('*')
      .limit(5);

    console.log('Bookings query result:', { bookings, bookingsError });

    // Test properties table
    const { data: properties, error: propertiesError } = await supabase
      .from(TABLES.PROPERTIES)
      .select('*')
      .limit(5);

    console.log('Properties query result:', { properties, propertiesError });

    return NextResponse.json({
      success: true,
      data: {
        bookings: {
          count: bookings?.length || 0,
          data: bookings || [],
          error: bookingsError
        },
        properties: {
          count: properties?.length || 0,
          data: properties || [],
          error: propertiesError
        },
        supabaseConnected: !!supabase
      }
    });
  } catch (error) {
    console.error('Error testing data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
