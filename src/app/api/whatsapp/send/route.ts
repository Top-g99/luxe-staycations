import { NextRequest, NextResponse } from 'next/server';
import { supabaseWhatsAppManager } from '@/lib/supabaseWhatsAppManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, message } = body;

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

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate WhatsApp configuration
    if (!whatsappConfig.businessAccountId || !whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      return NextResponse.json(
        { success: false, message: 'Invalid WhatsApp configuration' },
        { status: 400 }
      );
    }

    // Validate message
    if (!message.to || !message.type) {
      return NextResponse.json(
        { success: false, message: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Format phone number (ensure it starts with country code)
    let phoneNumber = message.to.replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber.startsWith('91')) {
      phoneNumber = '91' + phoneNumber;
    }

    // Prepare WhatsApp API request
    const whatsappApiUrl = `https://graph.facebook.com/v${whatsappConfig.apiVersion || '18.0'}/${whatsappConfig.phoneNumberId}/messages`;
    
    const requestBody = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      ...message
    };

    // Send message via WhatsApp Business API
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      return NextResponse.json(
        { 
          success: false, 
          message: result.error?.message || 'Failed to send WhatsApp message',
          error: result.error
        },
        { status: response.status }
      );
    }

    console.log('WhatsApp message sent successfully:', result);
    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      messageId: result.messages?.[0]?.id
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
