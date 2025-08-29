import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/propertyManager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const properties = propertyManager.getAllProperties();
    const property = properties.find(p => p.id === id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: property,
      source: 'local'
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
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
    propertyManager.updateProperty(id, body);
    
    // Get the updated property
    const updatedProperty = propertyManager.getPropertyById(id);
    
    if (!updatedProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Property updated successfully:', updatedProperty);
    
    return NextResponse.json({
      success: true,
      data: updatedProperty,
      source: 'local'
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update property' 
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
    propertyManager.deleteProperty(id);
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      source: 'local'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete property' 
      },
      { status: 500 }
    );
  }
}
