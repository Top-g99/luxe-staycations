import { NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function GET() {
  try {
    // Initialize the property manager
    await propertyManager.initialize();
    
    // Get current properties from the manager
    const currentProperties = await propertyManager.getAll();
    
    if (currentProperties.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Found ${currentProperties.length} properties already loaded`,
        count: currentProperties.length,
        properties: currentProperties
      });
    }
    
    // If no properties found, try to load from localStorage (client-side only)
    // For server-side, we'll return instructions
    return NextResponse.json({
      success: true,
      message: 'No properties found. Please refresh the admin panel to load existing data.',
      count: 0,
      instructions: 'The properties exist in localStorage but need to be loaded by the client-side DataManager. Refresh the admin properties page to sync the data.'
    });
    
  } catch (error) {
    console.error('Error syncing properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync properties' },
      { status: 500 }
    );
  }
}
