import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    // Use data manager property manager for consistency
    const properties = await propertyManager.getAll();
    
    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    console.log('Creating property with data:', body);
    
    // Use data manager property manager for consistency
    const newProperty = await propertyManager.create(body);
    
    console.log('Property created successfully:', newProperty);
    
    // Trigger global refresh event for frontend
    if (typeof global !== 'undefined') {
      global.dispatchEvent?.(new CustomEvent('dataUpdated', { 
        detail: { type: 'properties', action: 'created' }
      }));
    }
    
    return NextResponse.json({
      success: true,
      data: newProperty,
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error adding property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add property', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
