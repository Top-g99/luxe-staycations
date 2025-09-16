// WhatsApp Configuration API Route
// Handles CRUD operations for WhatsApp configuration

import { NextRequest, NextResponse } from 'next/server';
import { supabaseWhatsAppManager } from '@/lib/supabaseWhatsAppManager';
import { WhatsAppConfig } from '@/lib/whatsappService';

// GET - Retrieve WhatsApp configuration
export async function GET() {
  try {
    await supabaseWhatsAppManager.initialize();
    const config = await supabaseWhatsAppManager.loadConfiguration();
    
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: 'No WhatsApp configuration found' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      config 
    });
  } catch (error) {
    console.error('Error retrieving WhatsApp configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve WhatsApp configuration' 
    }, { status: 500 });
  }
}

// POST - Save WhatsApp configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: WhatsAppConfig = body.config;

    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration data is required' 
      }, { status: 400 });
    }

    // Validate required fields
    if (!config.business_account_id || !config.access_token || !config.phone_number_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Business Account ID, Access Token, and Phone Number ID are required' 
      }, { status: 400 });
    }

    await supabaseWhatsAppManager.initialize();
    const success = await supabaseWhatsAppManager.saveConfiguration(config);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp configuration saved successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to save WhatsApp configuration' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving WhatsApp configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to save WhatsApp configuration' 
    }, { status: 500 });
  }
}

// PUT - Update WhatsApp configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config: WhatsAppConfig = body.config;

    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration data is required' 
      }, { status: 400 });
    }

    await supabaseWhatsAppManager.initialize();
    const success = await supabaseWhatsAppManager.saveConfiguration(config);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp configuration updated successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update WhatsApp configuration' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating WhatsApp configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update WhatsApp configuration' 
    }, { status: 500 });
  }
}

// DELETE - Disable WhatsApp configuration
export async function DELETE() {
  try {
    await supabaseWhatsAppManager.initialize();
    
    // Create a disabled configuration to replace the current one
    const disabledConfig: Partial<WhatsAppConfig> = {
      business_account_id: '',
      access_token: '',
      phone_number_id: '',
      webhook_verify_token: '',
      is_active: false
    };

    const success = await supabaseWhatsAppManager.saveConfiguration(disabledConfig);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp configuration disabled successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to disable WhatsApp configuration' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error disabling WhatsApp configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to disable WhatsApp configuration' 
    }, { status: 500 });
  }
}
