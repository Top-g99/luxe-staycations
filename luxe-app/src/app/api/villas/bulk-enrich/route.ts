import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.properties || !Array.isArray(body.properties)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body. Expected array of properties with enrichment data.' 
        },
        { status: 400 }
      );
    }
    
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    const results = [];
    const errors = [];
    
    for (const propertyData of body.properties) {
      try {
        const { id, ...enrichedData } = propertyData;
        
        if (!id) {
          errors.push({ id: 'unknown', error: 'Missing property ID' });
          continue;
        }
        
        // Get the existing property
        const properties = propertyManager.getAll();
        const existingProperty = properties.find(p => p.id === id);
        
        if (!existingProperty) {
          errors.push({ id, error: 'Property not found' });
          continue;
        }
        
        // Validate enriched data structure
        const validatedData = validateEnrichedData(enrichedData);
        
        // Merge with existing property data
        const updatedProperty = {
          ...existingProperty,
          ...validatedData,
          updatedAt: new Date().toISOString()
        };
        
        // Update the property
        const result = await propertyManager.update(id, updatedProperty);
        
        if (result) {
          results.push({ id, success: true, data: result });
        } else {
          errors.push({ id, error: 'Failed to update property' });
        }
      } catch (error) {
        errors.push({ 
          id: propertyData.id || 'unknown', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    console.log(`✅ Bulk enrichment completed: ${results.length} successful, ${errors.length} errors`);
    
    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: body.properties.length,
        successful: results.length,
        failed: errors.length
      },
      source: 'dataManager'
    });
  } catch (error) {
    console.error('Error in bulk enrichment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process bulk enrichment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
