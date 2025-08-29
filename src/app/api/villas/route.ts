import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/propertyManager';

export async function GET(request: NextRequest) {
  try {
    // Use local property manager for now
    const properties = propertyManager.getAllProperties();
    
    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
      source: 'local'
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
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
    
    // Use local property manager for now
    const newProperty = propertyManager.addProperty(body);
    
    return NextResponse.json({
      success: true,
      data: newProperty,
      source: 'local'
    });
  } catch (error) {
    console.error('Error adding property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add property' 
      },
      { status: 500 }
    );
  }
}
