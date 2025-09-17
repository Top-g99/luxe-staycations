import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    // First try to get the property from in-memory data
    let existingProperty = propertyManager.getById(id);
    
    // If not found in memory, try to fetch from Supabase directly
    if (!existingProperty) {
      try {
        const { supabase } = await import('@/lib/supabase');
        if (!supabase) {
          return NextResponse.json(
            { success: false, error: 'Database connection not available' },
            { status: 500 }
          );
        }
        
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error || !data) {
          return NextResponse.json(
            { success: false, error: 'Property not found in database' },
            { status: 404 }
          );
        }
        
        existingProperty = data;
      } catch (error) {
        console.error('Error fetching property from Supabase:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch property' },
          { status: 500 }
        );
      }
    }
    
    // Validate enriched data structure
    const enrichedData = validateEnrichedData(body);
    
    // Merge with existing property data
    const updatedProperty = {
      ...existingProperty,
      ...enrichedData,
      updatedAt: new Date().toISOString()
    };
    
    // Update the property
    console.log('Updating property with enriched data:', updatedProperty);
    const result = await propertyManager.update(id, updatedProperty);
    
    if (!result) {
      console.error('Failed to update property:', id);
      return NextResponse.json(
        { success: false, error: 'Failed to update property' },
        { status: 500 }
      );
    }
    
    console.log('✅ Property enriched successfully:', result);
    
    // Trigger global refresh event for frontend
    if (typeof global !== 'undefined') {
      global.dispatchEvent?.(new CustomEvent('dataUpdated', { 
        detail: { type: 'properties', action: 'updated' }
      }));
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Property enriched successfully',
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error enriching property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to enrich property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    const properties = await propertyManager.getAll();
    const property = properties.find(p => p.id === id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Return only the enriched fields that exist in the Property interface
    const enrichedFields = {
      images: property.images,
      description: property.description,
      amenities: property.amenities,
      price: property.price,
      location: property.location,
      maxGuests: property.max_guests,
      featured: property.featured
    };
    
    return NextResponse.json({
      success: true,
      data: enrichedFields,
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error fetching enriched property data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enriched property data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function validateEnrichedData(data: any) {
  const validated: any = {};
  
  // Validate images array
  if (data.images && Array.isArray(data.images)) {
    validated.images = data.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  }
  
  // Validate virtual tour URL
  if (data.virtualTour && typeof data.virtualTour === 'string') {
    validated.virtualTour = data.virtualTour.trim();
  }
  
  // Validate floor plan URL
  if (data.floorPlan && typeof data.floorPlan === 'string') {
    validated.floorPlan = data.floorPlan.trim();
  }
  
  // Validate specifications
  if (data.specifications && typeof data.specifications === 'object') {
    const specs = data.specifications;
    validated.specifications = {
      bedrooms: typeof specs.bedrooms === 'number' ? specs.bedrooms : undefined,
      bathrooms: typeof specs.bathrooms === 'number' ? specs.bathrooms : undefined,
      sqft: typeof specs.sqft === 'number' ? specs.sqft : undefined,
      propertyType: typeof specs.propertyType === 'string' ? specs.propertyType.trim() : undefined,
      checkInTime: typeof specs.checkInTime === 'string' ? specs.checkInTime.trim() : undefined,
      checkOutTime: typeof specs.checkOutTime === 'string' ? specs.checkOutTime.trim() : undefined,
      houseRules: Array.isArray(specs.houseRules) ? specs.houseRules.filter((rule: any) => typeof rule === 'string') : undefined
    };
  }
  
  // Validate neighborhood
  if (data.neighborhood && typeof data.neighborhood === 'object') {
    const neighborhood = data.neighborhood;
    validated.neighborhood = {
      attractions: Array.isArray(neighborhood.attractions) ? neighborhood.attractions.filter((attr: any) => typeof attr === 'string') : undefined,
      restaurants: Array.isArray(neighborhood.restaurants) ? neighborhood.restaurants.filter((rest: any) => typeof rest === 'string') : undefined,
      distanceToAirport: typeof neighborhood.distanceToAirport === 'number' ? neighborhood.distanceToAirport : undefined,
      distanceToBeach: typeof neighborhood.distanceToBeach === 'number' ? neighborhood.distanceToBeach : undefined,
      nearbyActivities: Array.isArray(neighborhood.nearbyActivities) ? neighborhood.nearbyActivities.filter((activity: any) => typeof activity === 'string') : undefined
    };
  }
  
  // Validate pricing
  if (data.pricing && typeof data.pricing === 'object') {
    const pricing = data.pricing;
    validated.pricing = {
      basePrice: typeof pricing.basePrice === 'number' ? pricing.basePrice : undefined,
      weekendPrice: typeof pricing.weekendPrice === 'number' ? pricing.weekendPrice : undefined,
      seasonalRates: typeof pricing.seasonalRates === 'object' ? pricing.seasonalRates : undefined,
      offers: typeof pricing.offers === 'object' ? {
        earlyBird: typeof pricing.offers.earlyBird === 'number' ? pricing.offers.earlyBird : undefined,
        longStay: typeof pricing.offers.longStay === 'number' ? pricing.offers.longStay : undefined,
        groupDiscount: typeof pricing.offers.groupDiscount === 'number' ? pricing.offers.groupDiscount : undefined
      } : undefined
    };
  }
  
  // Validate reviews
  if (data.propertyReviews && Array.isArray(data.propertyReviews)) {
    validated.propertyReviews = data.propertyReviews.filter((review: any) => 
      review && 
      typeof review.id === 'string' &&
      typeof review.guestName === 'string' &&
      typeof review.rating === 'number' &&
      typeof review.comment === 'string' &&
      typeof review.date === 'string' &&
      typeof review.verified === 'boolean'
    );
  }
  
  // Validate highlights
  if (data.highlights && Array.isArray(data.highlights)) {
    validated.highlights = data.highlights.filter((highlight: any) => typeof highlight === 'string' && highlight.trim().length > 0);
  }
  
  // Validate policies
  if (data.policies && typeof data.policies === 'object') {
    const policies = data.policies;
    validated.policies = {
      cancellation: typeof policies.cancellation === 'string' ? policies.cancellation.trim() : undefined,
      checkIn: typeof policies.checkIn === 'string' ? policies.checkIn.trim() : undefined,
      checkOut: typeof policies.checkOut === 'string' ? policies.checkOut.trim() : undefined,
      smoking: typeof policies.smoking === 'boolean' ? policies.smoking : undefined,
      pets: typeof policies.pets === 'boolean' ? policies.pets : undefined,
      parties: typeof policies.parties === 'boolean' ? policies.parties : undefined
    };
  }
  
  return validated;
}
