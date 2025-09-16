import { NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function GET() {
  try {
    // Force reinitialize the property manager
    await propertyManager.initialize();
    
    // Get the properties
    const properties = await propertyManager.getAll();
    
    return NextResponse.json({
      success: true,
      message: `Refreshed properties: ${properties.length} found`,
      count: properties.length,
      properties: properties,
      source: 'localStorage'
    });
    
  } catch (error) {
    console.error('Error refreshing properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh properties' },
      { status: 500 }
    );
  }
}
