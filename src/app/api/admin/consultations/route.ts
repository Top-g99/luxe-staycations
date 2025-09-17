import { NextRequest, NextResponse } from 'next/server';

// Mock data for consultations
const mockConsultations = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+91 98765 43212',
    property_type: 'Luxury Villa',
    location: 'Lonavala',
    budget: '₹50,000 - ₹1,00,000',
    message: 'Looking for a luxury villa for a family reunion',
    status: 'pending',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+91 98765 43213',
    property_type: 'Beach House',
    location: 'Goa',
    budget: '₹30,000 - ₹60,000',
    message: 'Need a beach house for a romantic getaway',
    status: 'scheduled',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

let consultations = [...mockConsultations];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const consultation = consultations.find(c => c.id === id);
      if (!consultation) {
        return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
      }
      return NextResponse.json(consultation);
    }
    
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newConsultation = {
      ...body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    consultations.push(newConsultation);
    return NextResponse.json(newConsultation, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const index = consultations.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }
    
    consultations[index] = {
      ...consultations[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(consultations[index]);
  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json({ error: 'Failed to update consultation' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });
    }
    
    const index = consultations.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }
    
    consultations.splice(index, 1);
    return NextResponse.json({ message: 'Consultation deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    return NextResponse.json({ error: 'Failed to delete consultation' }, { status: 500 });
  }
}
