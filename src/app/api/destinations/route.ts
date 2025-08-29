import { NextRequest, NextResponse } from 'next/server';
import { destinationManager } from '@/lib/destinationManager';

export async function GET(request: NextRequest) {
  try {
    // Use local destination manager for now
    const destinations = destinationManager.getAllDestinations();
    
    return NextResponse.json({
      success: true,
      data: destinations,
      count: destinations.length,
      source: 'local'
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: name' 
        },
        { status: 400 }
      );
    }
    
    // Use local destination manager for now
    const newDestination = destinationManager.addDestination(body);
    
    return NextResponse.json({
      success: true,
      data: newDestination,
      source: 'local'
    });
  } catch (error) {
    console.error('Error adding destination:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add destination' 
      },
      { status: 500 }
    );
  }
}
