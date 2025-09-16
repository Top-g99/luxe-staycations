import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize the property manager
    await propertyManager.initialize();
    
    // Get all properties
    const properties = await propertyManager.getAll();
    
    // Check if we have any properties
    if (properties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No properties found in database',
        count: 0,
        properties: [],
        source: 'dataManager'
      });
    }
    
    // Analyze property data structure
    const analysis = {
      totalProperties: properties.length,
      propertiesWithEnrichedData: 0,
      enrichmentBreakdown: {
        images: 0,
        specifications: 0,
        neighborhood: 0,
        pricing: 0,
        highlights: 0,
        policies: 0,
        virtualTour: 0,
        floorPlan: 0
      },
      sampleProperty: properties[0] // First property as sample
    };
    
    // Count enriched properties
    properties.forEach(property => {
      let hasEnrichedData = false;
      
      if (property.images && property.images.length > 0) {
        analysis.enrichmentBreakdown.images++;
        hasEnrichedData = true;
      }
      
      // Check for description enrichment
      if (property.description && property.description.length > 100) {
        analysis.enrichmentBreakdown.specifications++;
        hasEnrichedData = true;
      }
      
      // Check for amenities enrichment
      if (property.amenities && property.amenities.length > 3) {
        analysis.enrichmentBreakdown.neighborhood++;
        hasEnrichedData = true;
      }
      
      // Check for price enrichment
      if (property.price && property.price > 0) {
        analysis.enrichmentBreakdown.pricing++;
        hasEnrichedData = true;
      }
      
      // Check for amenities enrichment
      if (property.amenities && property.amenities.length > 0) {
        analysis.enrichmentBreakdown.highlights++;
        hasEnrichedData = true;
      }
      
      // Check for location enrichment
      if (property.location && property.location.length > 10) {
        analysis.enrichmentBreakdown.policies++;
        hasEnrichedData = true;
      }
      
      // Check for featured status
      if (property.featured) {
        analysis.enrichmentBreakdown.virtualTour++;
        hasEnrichedData = true;
      }
      
      // Check for maxGuests
      if (property.max_guests && property.max_guests > 0) {
        analysis.enrichmentBreakdown.floorPlan++;
        hasEnrichedData = true;
      }
      
      if (hasEnrichedData) {
        analysis.propertiesWithEnrichedData++;
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Supabase properties analysis completed',
      analysis,
      source: 'dataManager'
    });
    
  } catch (error) {
    console.error('Error testing Supabase properties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test Supabase properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, testData } = body;
    
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // Initialize property manager
    await propertyManager.initialize();
    
    // Get the property
    const properties = await propertyManager.getAll();
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Test data to add (if provided)
    const testEnrichmentData = testData || {
      highlights: ['Test highlight 1', 'Test highlight 2'],
      neighborhood: {
        attractions: ['Test attraction 1', 'Test attraction 2'],
        restaurants: ['Test restaurant 1'],
        distanceToAirport: 25,
        distanceToBeach: 2,
        nearbyActivities: ['Test activity 1', 'Test activity 2']
      }
    };
    
    // Update the property with test data
    const updatedProperty = {
      ...property,
      ...testEnrichmentData,
      updatedAt: new Date().toISOString()
    };
    
    // Save to Supabase
    const result = await propertyManager.update(propertyId, updatedProperty);
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test data successfully saved to Supabase',
        property: result,
        source: 'dataManager'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save test data' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error testing Supabase save:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test Supabase save',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
