import { NextRequest, NextResponse } from 'next/server';

// Mock data for destinations
const mockDestinations = [
  {
    id: '1',
    name: 'Lonavala',
    state: 'Maharashtra',
    description: 'Hill station known for its scenic beauty and pleasant weather',
    image_url: '/images/destinations/lonavala.jpg',
    is_popular: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Goa',
    state: 'Goa',
    description: 'Beach paradise with beautiful coastline and vibrant culture',
    image_url: '/images/destinations/goa.jpg',
    is_popular: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Kerala',
    state: 'Kerala',
    description: 'God\'s own country with backwaters and lush greenery',
    image_url: '/images/destinations/kerala.jpg',
    is_popular: true,
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z'
  }
];

let destinations = [...mockDestinations];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const destination = destinations.find(d => d.id === id);
      if (!destination) {
        return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
      }
      return NextResponse.json(destination);
    }
    
    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newDestination = {
      ...body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    destinations.push(newDestination);
    return NextResponse.json(newDestination, { status: 201 });
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const index = destinations.findIndex(d => d.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }
    
    destinations[index] = {
      ...destinations[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(destinations[index]);
  } catch (error) {
    console.error('Error updating destination:', error);
    return NextResponse.json({ error: 'Failed to update destination' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
    }
    
    const index = destinations.findIndex(d => d.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }
    
    destinations.splice(index, 1);
    return NextResponse.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 });
  }
}
