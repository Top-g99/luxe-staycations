import { NextRequest, NextResponse } from 'next/server';

// Mock data for properties
const mockProperties = [
  {
    id: '1',
    name: 'Luxury Villa in Lonavala',
    description: 'Beautiful 3-bedroom villa with mountain views and private pool',
    location: 'Lonavala, Maharashtra',
    state: 'Maharashtra',
    city: 'Lonavala',
    price_per_night: 15000,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Swimming Pool', 'Garden', 'Kitchen', 'AC'],
    images: ['/images/properties/villa1.jpg'],
    is_active: true,
    property_type: 'luxury_villa',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Beach House in Goa',
    description: 'Modern beachfront property with ocean views and direct beach access',
    location: 'Calangute, Goa',
    state: 'Goa',
    city: 'Calangute',
    price_per_night: 12000,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Beach Access', 'Kitchen', 'AC', 'Balcony'],
    images: ['/images/properties/beach-house1.jpg'],
    is_active: true,
    property_type: 'villa',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

let properties = [...mockProperties];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const property = properties.find(p => p.id === id);
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      return NextResponse.json(property);
    }
    
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProperty = {
      ...body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    properties.push(newProperty);
    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    properties[index] = {
      ...properties[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(properties[index]);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }
    
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    properties.splice(index, 1);
    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
