import { NextRequest, NextResponse } from 'next/server';
import { dealBannerManager } from '@/lib/dealBannerManager';

export async function GET(request: NextRequest) {
  try {
    const dealBanner = dealBannerManager.getDealBanner();
    
    if (!dealBanner) {
      return NextResponse.json(
        { success: false, message: 'No deal banner found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealBanner
    });
  } catch (error) {
    console.error('Error fetching deal banner:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Update the deal banner
    dealBannerManager.updateDealBanner(body);
    
    return NextResponse.json({
      success: true,
      message: 'Deal banner updated successfully'
    });
  } catch (error) {
    console.error('Error updating deal banner:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}






