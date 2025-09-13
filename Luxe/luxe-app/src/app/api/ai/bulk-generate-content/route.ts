import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

// Import the same content generation functions
const CONTENT_FILTERS = {
  blockedTerms: [
    'free', 'complimentary', 'no charge', 'gratis', 'discount', 'cheap', 'budget',
    'refund', 'money back', 'guarantee', 'warranty', 'insurance', 'liability',
    'legal', 'lawsuit', 'court', 'dispute', 'complaint', 'negative', 'bad',
    'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'unsatisfactory'
  ],
  requiredTerms: [
    'luxury', 'premium', 'exclusive', 'elegant', 'sophisticated', 'upscale',
    'quality', 'excellent', 'outstanding', 'exceptional', 'superior', 'first-class'
  ]
};

const CONTENT_TEMPLATES = {
  description: {
    villa: `Experience unparalleled luxury at {name}, a stunning {type} nestled in the heart of {location}. This exclusive property offers {maxGuests} guests the perfect blend of sophistication and comfort, featuring premium amenities and breathtaking surroundings.

Key highlights include {amenities_list}, ensuring every moment of your stay is exceptional. The property's prime location provides easy access to local attractions while maintaining the privacy and tranquility you desire.

Whether you're seeking a romantic getaway, family vacation, or corporate retreat, {name} delivers an unforgettable experience with world-class service and attention to detail.`,

    apartment: `Discover urban elegance at {name}, a beautifully appointed {type} in the vibrant {location} area. Designed for discerning travelers, this sophisticated space accommodates {maxGuests} guests with style and comfort.

The property features {amenities_list}, creating the perfect environment for both relaxation and productivity. Its strategic location offers convenient access to business districts, cultural attractions, and entertainment venues.

{name} represents the pinnacle of modern hospitality, combining contemporary design with exceptional service to create an extraordinary stay experience.`
  },

  highlights: [
    'Luxury {type} with premium amenities',
    'Prime {location} location',
    'Accommodates up to {maxGuests} guests comfortably',
    'Exceptional service and attention to detail',
    'Perfect for {purpose}',
    'Modern facilities with traditional charm',
    'Exclusive access to premium amenities',
    'Convenient location near major attractions'
  ],

  neighborhood: {
    attractions: [
      'Historic landmarks and cultural sites',
      'Scenic beaches and waterfront areas',
      'Premium shopping and dining districts',
      'Entertainment venues and nightlife',
      'Parks and recreational facilities',
      'Museums and art galleries',
      'Local markets and traditional experiences'
    ],
    restaurants: [
      'Fine dining establishments',
      'Local cuisine specialists',
      'International restaurants',
      'Cafes and casual dining',
      'Seafood and specialty cuisine',
      'Traditional local eateries'
    ],
    activities: [
      'Water sports and beach activities',
      'Cultural tours and experiences',
      'Shopping and entertainment',
      'Outdoor adventures and hiking',
      'Wellness and spa services',
      'Local festivals and events'
    ]
  },

  policies: {
    cancellation: 'We offer flexible cancellation policies to accommodate your travel needs. Free cancellation is available up to 7 days before your scheduled arrival. For cancellations made 3-7 days prior to arrival, a 50% refund will be provided. Cancellations within 3 days of arrival are non-refundable. We recommend travel insurance for additional protection.',
    checkIn: 'Check-in time is 3:00 PM. Early check-in may be available upon request and is subject to availability. Our concierge team will coordinate your arrival to ensure a seamless experience.',
    checkOut: 'Check-out time is 11:00 AM. Late check-out may be arranged upon request and is subject to availability and additional charges. We appreciate your cooperation in maintaining our high service standards.'
  }
};

function sanitizeContent(content: string): string {
  let sanitized = content;
  CONTENT_FILTERS.blockedTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  const hasRequiredTerms = CONTENT_FILTERS.requiredTerms.some(term => 
    sanitized.toLowerCase().includes(term.toLowerCase())
  );

  if (!hasRequiredTerms) {
    const randomPositive = CONTENT_FILTERS.requiredTerms[Math.floor(Math.random() * CONTENT_FILTERS.requiredTerms.length)];
    sanitized = `${randomPositive} ${sanitized}`;
  }

  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  return sanitized;
}

function generatePropertyDescription(propertyData: any): string {
  const propertyType = propertyData.type?.toLowerCase() as keyof typeof CONTENT_TEMPLATES.description;
  const template = CONTENT_TEMPLATES.description[propertyType] || CONTENT_TEMPLATES.description.villa;
  
  const amenitiesList = propertyData.amenities?.slice(0, 5).join(', ') || 'premium amenities and facilities';
  const purpose = propertyData.maxGuests > 6 ? 'large groups and events' : 
                  propertyData.maxGuests > 2 ? 'families and groups' : 'couples and romantic getaways';

  let description = template
    .replace(/{name}/g, propertyData.name || 'this exceptional property')
    .replace(/{type}/g, propertyData.type || 'villa')
    .replace(/{location}/g, propertyData.location || 'a prime location')
    .replace(/{maxGuests}/g, propertyData.maxGuests || 'multiple')
    .replace(/{amenities_list}/g, amenitiesList)
    .replace(/{purpose}/g, purpose);

  return sanitizeContent(description);
}

function generateHighlights(propertyData: any): string[] {
  const highlights = CONTENT_TEMPLATES.highlights.map(highlight => {
    const purpose = propertyData.maxGuests > 6 ? 'large groups and events' : 
                    propertyData.maxGuests > 2 ? 'families and groups' : 'couples and romantic getaways';

    return highlight
      .replace(/{type}/g, propertyData.type || 'villa')
      .replace(/{location}/g, propertyData.location || 'prime location')
      .replace(/{maxGuests}/g, propertyData.maxGuests || 'multiple')
      .replace(/{purpose}/g, purpose);
  });

  if (propertyData.amenities?.includes('Swimming Pool')) {
    highlights.push('Private swimming pool with premium amenities');
  }
  if (propertyData.amenities?.includes('WiFi')) {
    highlights.push('High-speed WiFi throughout the property');
  }
  if (propertyData.price > 10000) {
    highlights.push('Ultra-luxury experience with premium service');
  }

  return highlights.slice(0, 6);
}

function generateNeighborhoodContent(propertyData: any): any {
  const location = propertyData.location?.toLowerCase() || '';
  
  let attractions = [...CONTENT_TEMPLATES.neighborhood.attractions];
  let restaurants = [...CONTENT_TEMPLATES.neighborhood.restaurants];
  let activities = [...CONTENT_TEMPLATES.neighborhood.activities];

  if (location.includes('goa')) {
    attractions.unshift('Famous beaches and coastal attractions');
    restaurants.unshift('Authentic Goan cuisine and seafood');
    activities.unshift('Water sports and beach activities');
  } else if (location.includes('mumbai')) {
    attractions.unshift('Historic landmarks and cultural sites');
    restaurants.unshift('Fine dining and street food experiences');
    activities.unshift('Shopping and entertainment districts');
  } else if (location.includes('delhi')) {
    attractions.unshift('Historic monuments and cultural heritage');
    restaurants.unshift('Traditional Indian cuisine and modern dining');
    activities.unshift('Cultural tours and shopping experiences');
  }

  return {
    attractions: attractions.slice(0, 5),
    restaurants: restaurants.slice(0, 5),
    nearbyActivities: activities.slice(0, 6)
  };
}

function generatePoliciesContent(propertyData: any): any {
  return {
    cancellation: CONTENT_TEMPLATES.policies.cancellation,
    checkIn: CONTENT_TEMPLATES.policies.checkIn,
    checkOut: CONTENT_TEMPLATES.policies.checkOut
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyIds, contentTypes = ['description', 'highlights', 'neighborhood', 'policies'] } = body;

    // Validate input
    if (!propertyIds || !Array.isArray(propertyIds)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid property IDs' },
        { status: 400 }
      );
    }

    // Initialize property manager
    await propertyManager.initialize();
    const allProperties = propertyManager.getAll();

    const results = [];
    const errors = [];

    for (const propertyId of propertyIds) {
      try {
        const property = allProperties.find(p => p.id === propertyId);
        
        if (!property) {
          errors.push({ propertyId, error: 'Property not found' });
          continue;
        }

        const generatedContent: any = {};

        // Generate content for each requested type
        for (const contentType of contentTypes) {
          switch (contentType) {
            case 'description':
              generatedContent.description = generatePropertyDescription(property);
              break;
            
            case 'highlights':
              generatedContent.highlights = generateHighlights(property);
              break;
            
            case 'neighborhood':
              generatedContent.neighborhood = generateNeighborhoodContent(property);
              break;
            
            case 'policies':
              generatedContent.policies = generatePoliciesContent(property);
              break;
          }
        }

        // Apply the generated content to the property
        const updatedProperty = {
          ...property,
          ...generatedContent,
          updatedAt: new Date().toISOString()
        };

        // Update the property
        const result = await propertyManager.update(propertyId, updatedProperty);

        if (result) {
          results.push({ 
            propertyId, 
            propertyName: property.name,
            success: true, 
            generatedContent,
            data: result 
          });
        } else {
          errors.push({ propertyId, propertyName: property.name, error: 'Failed to update property' });
        }

      } catch (error) {
        errors.push({ 
          propertyId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`Bulk AI content generation completed: ${results.length} successful, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: propertyIds.length,
        successful: results.length,
        failed: errors.length,
        contentTypes
      },
      timestamp: new Date().toISOString(),
      source: 'bulk-ai-content-generator'
    });

  } catch (error) {
    console.error('Error in bulk AI content generation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process bulk content generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
