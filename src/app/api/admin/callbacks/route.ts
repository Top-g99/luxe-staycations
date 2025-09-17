import { NextRequest, NextResponse } from 'next/server';

// Mock data for callbacks
const mockCallbacks = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    message: 'Interested in booking a villa for next month',
    status: 'pending',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 98765 43211',
    message: 'Need information about group bookings',
    status: 'contacted',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

let callbacks = [...mockCallbacks];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const callback = callbacks.find(c => c.id === id);
      if (!callback) {
        return NextResponse.json({ error: 'Callback not found' }, { status: 404 });
      }
      return NextResponse.json(callback);
    }
    
    return NextResponse.json(callbacks);
  } catch (error) {
    console.error('Error fetching callbacks:', error);
    return NextResponse.json({ error: 'Failed to fetch callbacks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCallback = {
      ...body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    callbacks.push(newCallback);
    return NextResponse.json(newCallback, { status: 201 });
  } catch (error) {
    console.error('Error creating callback:', error);
    return NextResponse.json({ error: 'Failed to create callback' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const index = callbacks.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Callback not found' }, { status: 404 });
    }
    
    callbacks[index] = {
      ...callbacks[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(callbacks[index]);
  } catch (error) {
    console.error('Error updating callback:', error);
    return NextResponse.json({ error: 'Failed to update callback' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Callback ID is required' }, { status: 400 });
    }
    
    const index = callbacks.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Callback not found' }, { status: 404 });
    }
    
    callbacks.splice(index, 1);
    return NextResponse.json({ message: 'Callback deleted successfully' });
  } catch (error) {
    console.error('Error deleting callback:', error);
    return NextResponse.json({ error: 'Failed to delete callback' }, { status: 500 });
  }
}
