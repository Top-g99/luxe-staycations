import { NextRequest, NextResponse } from 'next/server';
import { supabaseConsultationService } from '@/lib/supabaseConsultationService';
import { emailService } from '@/lib/emailService';

export async function GET() {
  try {
    const consultations = await supabaseConsultationService.getAllConsultations();
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
    const consultation = await supabaseConsultationService.createConsultation({
      name: body.name,
      email: body.email,
      phone: body.phone,
      property_type: body.propertyType,
      location: body.location,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      max_guests: parseInt(body.maxGuests),
      property_description: body.propertyDescription,
      consultation_type: body.consultationType,
      preferred_date: body.preferredDate,
      preferred_time: body.preferredTime,
      additional_notes: body.additionalNotes || ''
    });

    // Send consultation confirmation email
    try {
      if (emailService.isConfigured) {
        // Use delivery tracking service for better monitoring
        const { emailDeliveryService } = await import('@/lib/emailDeliveryService');
        const emailResult = await emailDeliveryService.sendConsultationRequestWithTracking({
          requestId: consultation.id,
          name: consultation.name,
          email: consultation.email,
          phone: consultation.phone,
          propertyType: consultation.property_type,
          location: consultation.location,
          preferredDate: consultation.preferred_date,
          preferredTime: consultation.preferred_time,
          consultationType: consultation.consultation_type
        });

        if (emailResult.success) {
          console.log('Consultation confirmation email sent successfully');
        } else {
          console.error('Failed to send consultation confirmation email:', emailResult.error);
        }
      } else {
        console.log('Email service not configured, skipping consultation confirmation email');
      }
    } catch (emailError) {
      console.error('Error sending consultation confirmation email:', emailError);
      // Don't fail the consultation creation if email fails
    }

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { error: 'Failed to create consultation' },
      { status: 500 }
    );
  }
}

