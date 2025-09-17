import { NextRequest, NextResponse } from 'next/server';

// Mock data for bookings
const mockBookings = [
  {
    id: '1',
    property_id: '1',
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '+91 98765 43210',
    check_in: '2024-02-01',
    check_out: '2024-02-03',
    total_amount: 30000,
    status: 'confirmed',
    payment_status: 'paid',
    special_requests: 'Late check-in requested',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    property_id: '2',
    guest_name: 'Jane Smith',
    guest_email: 'jane@example.com',
    guest_phone: '+91 98765 43211',
    check_in: '2024-02-05',
    check_out: '2024-02-07',
    total_amount: 24000,
    status: 'pending',
    payment_status: 'pending',
    special_requests: 'Vegetarian meals only',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

let bookings = [...mockBookings];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const booking = bookings.find(b => b.id === id);
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json(booking);
    }
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newBooking = {
      ...body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    bookings[index] = {
      ...bookings[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(bookings[index]);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    bookings.splice(index, 1);
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
