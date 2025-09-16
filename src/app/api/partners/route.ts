import { NextRequest, NextResponse } from 'next/server';
import { partnerManager } from '@/lib/partnerManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize PartnerManager safely for server-side
    partnerManager.initialize();
    
    // Get all partner applications
    const applications = await partnerManager.getAllApplications();
    
    return NextResponse.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching partner applications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch partner applications' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.propertyType || !body.location || !body.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, email, phone, propertyType, location, description' 
        },
        { status: 400 }
      );
    }
    
    // Create new partner application
    const newApplication = partnerManager.addApplication({
      name: body.name,
      email: body.email,
      phone: body.phone,
      companyName: body.companyName || '',
      propertyType: body.propertyType,
      location: body.location,
      propertyCount: body.propertyCount || 1,
      description: body.description,
      status: 'Pending',
      experience: body.experience || 'Beginner',
      expectedRevenue: body.expectedRevenue || 0,
      website: body.website || '',
      socialMedia: body.socialMedia || []
    });
    
    return NextResponse.json({
      success: true,
      data: newApplication,
      message: 'Partner application submitted successfully'
    });
  } catch (error) {
    console.error('Error creating partner application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create partner application' 
      },
      { status: 500 }
    );
  }
}

