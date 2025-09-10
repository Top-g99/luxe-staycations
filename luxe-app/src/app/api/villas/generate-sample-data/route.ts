import { NextRequest, NextResponse } from 'next/server';
import { propertyManager } from '@/lib/dataManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, dataType } = body;
    
    // Initialize the property manager if needed
    await propertyManager.initialize();
    
    const properties = propertyManager.getAll();
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    let sampleData: any = {};
    
    switch (dataType) {
      case 'images':
        sampleData.image = property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
        sampleData.virtualTour = 'https://my.matterport.com/show/?m=example123';
        sampleData.floorPlan = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop';
        break;
        
      case 'specifications':
        sampleData.specifications = {
          bedrooms: Math.floor(Math.random() * 4) + 2, // 2-5 bedrooms
          bathrooms: Math.floor(Math.random() * 3) + 2, // 2-4 bathrooms
          sqft: Math.floor(Math.random() * 2000) + 1500, // 1500-3500 sqft
          propertyType: 'Luxury Villa',
          checkInTime: '3:00 PM',
          checkOutTime: '11:00 AM',
          houseRules: [
            'No smoking inside the property',
            'No parties or events without prior approval',
            'Pets allowed with additional fee',
            'Quiet hours from 10 PM to 7 AM',
            'Maximum occupancy as per booking'
          ]
        };
        break;
        
      case 'neighborhood':
        sampleData.neighborhood = {
          attractions: [
            'Goa Beach (2 km)',
            'Fort Aguada (5 km)',
            'Dudhsagar Falls (45 km)',
            'Old Goa Churches (15 km)',
            'Spice Plantations (20 km)'
          ],
          restaurants: [
            'Fisherman\'s Wharf (1 km)',
            'Pousada by the Beach (2 km)',
            'Gunpowder (3 km)',
            'Thalassa (4 km)',
            'Bomra\'s (5 km)'
          ],
          distanceToAirport: 35,
          distanceToBeach: 2,
          nearbyActivities: [
            'Water Sports',
            'Scuba Diving',
            'Yoga Classes',
            'Cooking Classes',
            'Market Shopping',
            'Temple Visits'
          ]
        };
        break;
        
      case 'pricing':
        const basePrice = property.price;
        sampleData.pricing = {
          basePrice: basePrice,
          weekendPrice: Math.round(basePrice * 1.3),
          seasonalRates: {
            'Peak Season (Dec-Mar)': Math.round(basePrice * 1.5),
            'Monsoon (Jun-Sep)': Math.round(basePrice * 0.7),
            'Shoulder Season (Apr-May, Oct-Nov)': Math.round(basePrice * 1.1)
          },
          offers: {
            earlyBird: 15,
            longStay: 20,
            groupDiscount: 10
          }
        };
        break;
        
      case 'reviews':
        sampleData.propertyReviews = [
          {
            id: 'review-1',
            guestName: 'Sarah Johnson',
            rating: 5,
            comment: 'Absolutely stunning villa with breathtaking views. The pool was perfect and the staff was incredibly helpful. Will definitely come back!',
            date: '2024-01-15',
            verified: true
          },
          {
            id: 'review-2',
            guestName: 'Michael Chen',
            rating: 4.5,
            comment: 'Great location and beautiful property. The amenities were top-notch. Only minor issue was the WiFi speed in some areas.',
            date: '2024-01-08',
            verified: true
          },
          {
            id: 'review-3',
            guestName: 'Emily Rodriguez',
            rating: 5,
            comment: 'Perfect for our family vacation. Kids loved the pool and the beach access was amazing. Highly recommended!',
            date: '2023-12-22',
            verified: true
          },
          {
            id: 'review-4',
            guestName: 'David Thompson',
            rating: 4,
            comment: 'Beautiful villa with great amenities. The location is perfect for exploring Goa. Would stay again.',
            date: '2023-12-10',
            verified: true
          }
        ];
        break;
        
      case 'highlights':
        sampleData.highlights = [
          '4.8★ Highly Rated (127 reviews)',
          'Private Pool Access',
          'Beachfront Location',
          'Premium Amenities',
          '24/7 Concierge Service',
          'Free WiFi & Parking'
        ];
        break;
        
      case 'policies':
        sampleData.policies = {
          cancellation: 'Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before. No refund for cancellations within 3 days.',
          checkIn: 'Check-in time is 3:00 PM. Early check-in may be available upon request and subject to availability.',
          checkOut: 'Check-out time is 11:00 AM. Late check-out may be available upon request and subject to additional charges.',
          smoking: false,
          pets: true,
          parties: false
        };
        break;
        
      case 'all':
        // Generate all sample data
        const allData = await generateAllSampleData(property);
        sampleData = allData;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid data type. Supported types: images, specifications, neighborhood, pricing, reviews, highlights, policies, all' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: sampleData,
      propertyId,
      dataType,
      source: 'sampleGenerator'
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate sample data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateAllSampleData(property: any) {
  return {
    images: [
      `${property.image}`,
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=example123',
    floorPlan: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    specifications: {
      bedrooms: Math.floor(Math.random() * 4) + 2,
      bathrooms: Math.floor(Math.random() * 3) + 2,
      sqft: Math.floor(Math.random() * 2000) + 1500,
      propertyType: 'Luxury Villa',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: [
        'No smoking inside the property',
        'No parties or events without prior approval',
        'Pets allowed with additional fee',
        'Quiet hours from 10 PM to 7 AM',
        'Maximum occupancy as per booking'
      ]
    },
    neighborhood: {
      attractions: [
        'Goa Beach (2 km)',
        'Fort Aguada (5 km)',
        'Dudhsagar Falls (45 km)',
        'Old Goa Churches (15 km)',
        'Spice Plantations (20 km)'
      ],
      restaurants: [
        'Fisherman\'s Wharf (1 km)',
        'Pousada by the Beach (2 km)',
        'Gunpowder (3 km)',
        'Thalassa (4 km)',
        'Bomra\'s (5 km)'
      ],
      distanceToAirport: 35,
      distanceToBeach: 2,
      nearbyActivities: [
        'Water Sports',
        'Scuba Diving',
        'Yoga Classes',
        'Cooking Classes',
        'Market Shopping',
        'Temple Visits'
      ]
    },
    pricing: {
      basePrice: property.price,
      weekendPrice: Math.round(property.price * 1.3),
      seasonalRates: {
        'Peak Season (Dec-Mar)': Math.round(property.price * 1.5),
        'Monsoon (Jun-Sep)': Math.round(property.price * 0.7),
        'Shoulder Season (Apr-May, Oct-Nov)': Math.round(property.price * 1.1)
      },
      offers: {
        earlyBird: 15,
        longStay: 20,
        groupDiscount: 10
      }
    },
    propertyReviews: [
      {
        id: 'review-1',
        guestName: 'Sarah Johnson',
        rating: 5,
        comment: 'Absolutely stunning villa with breathtaking views. The pool was perfect and the staff was incredibly helpful. Will definitely come back!',
        date: '2024-01-15',
        verified: true
      },
      {
        id: 'review-2',
        guestName: 'Michael Chen',
        rating: 4.5,
        comment: 'Great location and beautiful property. The amenities were top-notch. Only minor issue was the WiFi speed in some areas.',
        date: '2024-01-08',
        verified: true
      },
      {
        id: 'review-3',
        guestName: 'Emily Rodriguez',
        rating: 5,
        comment: 'Perfect for our family vacation. Kids loved the pool and the beach access was amazing. Highly recommended!',
        date: '2023-12-22',
        verified: true
      }
    ],
    highlights: [
      '4.8★ Highly Rated (127 reviews)',
      'Private Pool Access',
      'Beachfront Location',
      'Premium Amenities',
      '24/7 Concierge Service',
      'Free WiFi & Parking'
    ],
    policies: {
      cancellation: 'Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before. No refund for cancellations within 3 days.',
      checkIn: 'Check-in time is 3:00 PM. Early check-in may be available upon request and subject to availability.',
      checkOut: 'Check-out time is 11:00 AM. Late check-out may be available upon request and subject to additional charges.',
      smoking: false,
      pets: true,
      parties: false
    }
  };
}
