import { NextRequest, NextResponse } from 'next/server';
import { consultationManager } from '@/lib/consultationManager';

export async function GET() {
  try {
    const consultations = consultationManager.getAllConsultations();
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'name', 'email', 'phone', 'propertyType', 'location', 
      'bedrooms', 'bathrooms', 'maxGuests', 'propertyDescription',
      'consultationType', 'preferredDate', 'preferredTime'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Add consultation
    const consultation = consultationManager.addConsultation({
      name: body.name,
      email: body.email,
      phone: body.phone,
      propertyType: body.propertyType,
      location: body.location,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      maxGuests: parseInt(body.maxGuests),
      propertyDescription: body.propertyDescription,
      consultationType: body.consultationType,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      additionalNotes: body.additionalNotes || ''
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { error: 'Failed to create consultation' },
      { status: 500 }
    );
  }
}

