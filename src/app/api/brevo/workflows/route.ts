import { NextRequest, NextResponse } from 'next/server';
import { brevoWorkflows } from '@/lib/brevoWorkflows';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType, data } = body;

    if (!workflowType || !data) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: workflowType, data' },
        { status: 400 }
      );
    }

    let result = false;

    switch (workflowType) {
      case 'booking_confirmation':
        result = await brevoWorkflows.triggerWorkflow('booking_confirmation', data);
        break;
      
      case 'pre_arrival_reminder':
        result = await brevoWorkflows.triggerWorkflow('pre_arrival_reminder', data);
        break;
      
      case 'post_stay_followup':
        result = await brevoWorkflows.triggerWorkflow('post_stay_followup', data);
        break;
      
      case 'loyalty_welcome':
        result = await brevoWorkflows.triggerWorkflow('loyalty_welcome', data);
        break;
      
      case 'tier_upgrade':
        result = await brevoWorkflows.triggerWorkflow('tier_upgrade', data);
        break;
      
      case 'property_newsletter':
        result = await brevoWorkflows.triggerWorkflow('property_newsletter', data);
        break;
      
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid workflow type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message: result ? 'Workflow triggered successfully' : 'Failed to trigger workflow',
      workflowType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error triggering Brevo workflow:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // This would typically fetch from the database
    // For now, return available workflow types
    const availableWorkflows = [
      'booking_confirmation',
      'pre_arrival_reminder', 
      'post_stay_followup',
      'loyalty_welcome',
      'tier_upgrade',
      'property_newsletter'
    ];

    return NextResponse.json({
      success: true,
      data: {
        availableWorkflows,
        message: 'Brevo workflows are ready to use'
      }
    });

  } catch (error) {
    console.error('Error fetching Brevo workflows:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

