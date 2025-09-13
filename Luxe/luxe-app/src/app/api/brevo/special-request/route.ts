import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Special request received:', data);

    // Validate required fields
    if (!data.guestName || !data.guestEmail || !data.description) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: guestName, guestEmail, description' 
      }, { status: 400 });
    }

    // For now, just log the special request and return success
    // TODO: Implement actual email sending once email services are recreated
    console.log('Special Request Details:', {
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      bookingId: data.bookingId || 'N/A',
      propertyName: data.propertyName || 'N/A',
      requestType: data.requestType || 'General',
      description: data.description,
      urgency: data.urgency || 'medium'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Special request received and logged successfully',
      requestId: `SR-${Date.now()}`
    });

  } catch (error) {
    console.error('Error in special request API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
