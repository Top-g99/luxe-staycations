// Instagram Test API Route
// Tests Instagram API connection

import { NextRequest, NextResponse } from 'next/server';
import { supabaseInstagramManager } from '@/lib/supabaseInstagramManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    // If config is not provided, try to load from Supabase
    let instagramConfig = config;
    if (!instagramConfig) {
      await supabaseInstagramManager.initialize();
      instagramConfig = await supabaseInstagramManager.loadConfiguration();
      
      if (!instagramConfig) {
        return NextResponse.json(
          { success: false, message: 'Instagram not configured' },
          { status: 400 }
        );
      }
    }

    // Validate Instagram configuration
    if (!instagramConfig.accessToken || !instagramConfig.businessAccountId || !instagramConfig.instagramAccountId) {
      return NextResponse.json(
        { success: false, message: 'Invalid Instagram configuration' },
        { status: 400 }
      );
    }

    // Test Instagram Business API connection
    const testUrl = `https://graph.facebook.com/v${instagramConfig.apiVersion || '18.0'}/${instagramConfig.instagramAccountId}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${instagramConfig.accessToken}`,
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Instagram API test failed:', result);
      return NextResponse.json(
        { 
          success: false, 
          message: result.error?.message || 'Failed to connect to Instagram Business API',
          error: result.error
        },
        { status: response.status }
      );
    }

    console.log('Instagram API connection test successful:', result);
    return NextResponse.json({
      success: true,
      message: 'Instagram Business API connection successful',
      accountInfo: {
        id: result.id,
        username: result.username,
        name: result.name,
        accountType: result.account_type,
        mediaCount: result.media_count
      }
    });

  } catch (error) {
    console.error('Error testing Instagram connection:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
