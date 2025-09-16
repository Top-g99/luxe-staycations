// Instagram Analytics API Route
// Handles Instagram analytics operations

import { NextRequest, NextResponse } from 'next/server';
import { supabaseInstagramManager } from '@/lib/supabaseInstagramManager';

// GET - Retrieve Instagram analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    await supabaseInstagramManager.initialize();
    const analytics = await supabaseInstagramManager.getAnalytics();

    if (!analytics) {
      return NextResponse.json({ 
        success: true, 
        analytics: {
          impressions: 0,
          reach: 0,
          profileViews: 0,
          websiteClicks: 0,
          emailContacts: 0,
          phoneCalls: 0,
          textMessages: 0,
          getDirections: 0,
          period: period
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      analytics: {
        impressions: analytics.impressions,
        reach: analytics.reach,
        profileViews: analytics.profile_views,
        websiteClicks: analytics.website_clicks,
        emailContacts: analytics.email_contacts,
        phoneCalls: analytics.phone_calls,
        textMessages: analytics.text_messages,
        getDirections: analytics.get_directions,
        period: analytics.period
      }
    });
  } catch (error) {
    console.error('Error retrieving Instagram analytics:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve Instagram analytics' 
    }, { status: 500 });
  }
}
