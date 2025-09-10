import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    const properties = propertyManager.getAll();
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
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    const updatedProperty = await propertyManager.update(id, body);
    
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
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update property',
        details: error instanceof Error ? error.message : 'Unknown error'
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
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    const deleted = await propertyManager.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
