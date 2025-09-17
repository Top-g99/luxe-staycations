import { NextRequest, NextResponse } from 'next/server';
import { supabaseBookingManager } from '@/lib/supabaseBookingManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize SupabaseBookingManager
    await supabaseBookingManager.initialize();
    
    // Get comprehensive analytics data
    const analytics = await supabaseBookingManager.getAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Analytics data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data' 
      },
      { status: 500 }
    );
  }
}
