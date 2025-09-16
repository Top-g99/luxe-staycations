// Instagram Configuration API Route
// Handles CRUD operations for Instagram configuration

import { NextRequest, NextResponse } from 'next/server';
import { supabaseInstagramManager } from '@/lib/supabaseInstagramManager';
import { InstagramConfig } from '@/lib/instagramService';

// GET - Retrieve Instagram configuration
export async function GET() {
  try {
    await supabaseInstagramManager.initialize();
    const config = await supabaseInstagramManager.loadConfiguration();
    
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: 'No Instagram configuration found' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      config 
    });
  } catch (error) {
    console.error('Error retrieving Instagram configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve Instagram configuration' 
    }, { status: 500 });
  }
}

// POST - Save Instagram configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: InstagramConfig = body.config;

    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration data is required' 
      }, { status: 400 });
    }

    // Validate required fields
    if (!config.access_token || !config.businessAccountId || !config.instagramAccountId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access Token, Business Account ID, and Instagram Account ID are required' 
      }, { status: 400 });
    }

    await supabaseInstagramManager.initialize();
    const success = await supabaseInstagramManager.saveConfiguration(config);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Instagram configuration saved successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to save Instagram configuration' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving Instagram configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to save Instagram configuration' 
    }, { status: 500 });
  }
}

// PUT - Update Instagram configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config: InstagramConfig = body.config;

    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration data is required' 
      }, { status: 400 });
    }

    await supabaseInstagramManager.initialize();
    const success = await supabaseInstagramManager.saveConfiguration(config);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Instagram configuration updated successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update Instagram configuration' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating Instagram configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update Instagram configuration' 
    }, { status: 500 });
  }
}

// DELETE - Disable Instagram configuration
export async function DELETE() {
  try {
    await supabaseInstagramManager.initialize();
    
    // Create a disabled configuration to replace the current one
    const disabledConfig: Partial<InstagramConfig> = {
      access_token: '',
      businessAccountId: '',
      instagramAccountId: '',
      webhookVerifyToken: '',
      apiVersion: '18.0',
      enabled: false
    };

    const success = await supabaseInstagramManager.saveConfiguration(disabledConfig);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Instagram configuration disabled successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to disable Instagram configuration' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error disabling Instagram configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to disable Instagram configuration' 
    }, { status: 500 });
  }
}
