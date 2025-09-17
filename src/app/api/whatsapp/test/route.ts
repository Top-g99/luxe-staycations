import { NextRequest, NextResponse } from 'next/server';
import { supabaseWhatsAppManager } from '@/lib/supabaseWhatsAppManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    // If config is not provided, try to load from Supabase
    let whatsappConfig = config;
    if (!whatsappConfig) {
      await supabaseWhatsAppManager.initialize();
      whatsappConfig = await supabaseWhatsAppManager.loadConfiguration();
      
      if (!whatsappConfig) {
        return NextResponse.json(
          { success: false, message: 'WhatsApp not configured' },
          { status: 400 }
        );
      }
    }

    // Validate WhatsApp configuration
    if (!whatsappConfig.businessAccountId || !whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      return NextResponse.json(
        { success: false, message: 'Invalid WhatsApp configuration' },
        { status: 400 }
      );
    }

    // Test WhatsApp Business API connection
    const testUrl = `https://graph.facebook.com/v${whatsappConfig.apiVersion || '18.0'}/${whatsappConfig.businessAccountId}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API test failed:', result);
      return NextResponse.json(
        { 
          success: false, 
          message: result.error?.message || 'Failed to connect to WhatsApp Business API',
          error: result.error
        },
        { status: response.status }
      );
    }

    console.log('WhatsApp API connection test successful:', result);
    return NextResponse.json({
      success: true,
      message: 'WhatsApp Business API connection successful',
      businessInfo: {
        name: result.name,
        id: result.id,
        status: result.health_status
      }
    });

  } catch (error) {
    console.error('Error testing WhatsApp connection:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
