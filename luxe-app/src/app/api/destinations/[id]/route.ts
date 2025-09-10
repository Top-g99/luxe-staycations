import { NextRequest, NextResponse } from 'next/server';
import { destinationManager } from '@/lib/destinationManager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const destinations = destinationManager.getAllDestinations();
    const destination = destinations.find(d => d.id === id);
    
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: destination,
      source: 'local'
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destination' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updatedDestination = destinationManager.updateDestination(id, body);
    
    if (!updatedDestination) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Destination updated successfully:', updatedDestination);
    
    return NextResponse.json({
      success: true,
      data: updatedDestination,
      source: 'local'
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update destination' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    destinationManager.deleteDestination(id);
    
    return NextResponse.json({
      success: true,
      message: 'Destination deleted successfully',
      source: 'local'
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete destination' 
      },
      { status: 500 }
    );
  }
}
