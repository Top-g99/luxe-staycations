import { NextRequest, NextResponse } from 'next/server';

// Security and business safety measures
const CONTENT_FILTERS = {
  // Blocked terms that could compromise business safety
  blockedTerms: [
    'free', 'complimentary', 'no charge', 'gratis', 'discount', 'cheap', 'budget',
    'refund', 'money back', 'guarantee', 'warranty', 'insurance', 'liability',
    'legal', 'lawsuit', 'court', 'dispute', 'complaint', 'negative', 'bad',
    'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'unsatisfactory'
  ],
  
  // Required business-positive terms
  requiredTerms: [
    'luxury', 'premium', 'exclusive', 'elegant', 'sophisticated', 'upscale',
    'quality', 'excellent', 'outstanding', 'exceptional', 'superior', 'first-class'
  ],
  
  // SEO-friendly terms for hospitality
  seoTerms: [
    'villa', 'accommodation', 'stay', 'vacation', 'holiday', 'getaway',
    'experience', 'destination', 'location', 'amenities', 'facilities'
  ]
};

// Content templates for different property types
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
  // Remove blocked terms
  let sanitized = content;
  CONTENT_FILTERS.blockedTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Ensure required positive terms are present
  const hasRequiredTerms = CONTENT_FILTERS.requiredTerms.some(term => 
    sanitized.toLowerCase().includes(term.toLowerCase())
  );

  if (!hasRequiredTerms) {
    // Add a positive term if none are present
    const randomPositive = CONTENT_FILTERS.requiredTerms[Math.floor(Math.random() * CONTENT_FILTERS.requiredTerms.length)];
    sanitized = `${randomPositive} ${sanitized}`;
  }

  // Clean up extra spaces and formatting
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

  // Add property-specific highlights
  if (propertyData.amenities?.includes('Swimming Pool')) {
    highlights.push('Private swimming pool with premium amenities');
  }
  if (propertyData.amenities?.includes('WiFi')) {
    highlights.push('High-speed WiFi throughout the property');
  }
  if (propertyData.price > 10000) {
    highlights.push('Ultra-luxury experience with premium service');
  }

  return highlights.slice(0, 6); // Limit to 6 highlights
}

function generateNeighborhoodContent(propertyData: any): any {
  const location = propertyData.location?.toLowerCase() || '';
  
  // Customize based on location
  let attractions = [...CONTENT_TEMPLATES.neighborhood.attractions];
  let restaurants = [...CONTENT_TEMPLATES.neighborhood.restaurants];
  let activities = [...CONTENT_TEMPLATES.neighborhood.activities];

  // Add location-specific content
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
    const { propertyData, contentType } = body;

    // Validate input
    if (!propertyData || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const rateLimitKey = request.headers.get('x-forwarded-for') || 'unknown';
    // In production, implement proper rate limiting with Redis or similar

    let generatedContent: any;

    switch (contentType) {
      case 'description':
        generatedContent = generatePropertyDescription(propertyData);
        break;
      
      case 'highlights':
        generatedContent = generateHighlights(propertyData);
        break;
      
      case 'neighborhood':
        generatedContent = generateNeighborhoodContent(propertyData);
        break;
      
      case 'policies':
        generatedContent = generatePoliciesContent(propertyData);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid content type' },
          { status: 400 }
        );
    }

    // Log the generation for monitoring (without sensitive data)
    console.log(`AI content generated for ${contentType} - Property: ${propertyData.name || 'Unknown'}`);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      contentType,
      timestamp: new Date().toISOString(),
      source: 'ai-content-generator'
    });

  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Content Generator API is operational',
    version: '1.0.0',
    features: ['description', 'highlights', 'neighborhood', 'policies'],
    timestamp: new Date().toISOString()
  });
}
