// WhatsApp Templates API Route
// Handles CRUD operations for WhatsApp message templates

import { NextRequest, NextResponse } from 'next/server';
import { supabaseWhatsAppManager } from '@/lib/supabaseWhatsAppManager';
import { DatabaseWhatsAppTemplate } from '@/lib/supabaseWhatsAppManager';

// GET - Retrieve WhatsApp templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    await supabaseWhatsAppManager.initialize();
    
    let templates: DatabaseWhatsAppTemplate[];
    if (type) {
      templates = await supabaseWhatsAppManager.getTemplatesByType(type);
    } else {
      templates = await supabaseWhatsAppManager.getTemplates();
    }

    return NextResponse.json({ 
      success: true, 
      templates 
    });
  } catch (error) {
    console.error('Error retrieving WhatsApp templates:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve WhatsApp templates' 
    }, { status: 500 });
  }
}

// POST - Create new WhatsApp template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template: Omit<DatabaseWhatsAppTemplate, 'id' | 'created_at' | 'updated_at'> = body.template;

    if (!template) {
      return NextResponse.json({ 
        success: false, 
        message: 'Template data is required' 
      }, { status: 400 });
    }

    // Validate required fields
    if (!template.name || !template.type || !template.template_content) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, type, and template content are required' 
      }, { status: 400 });
    }

    await supabaseWhatsAppManager.initialize();
    const success = await supabaseWhatsAppManager.saveTemplate(template);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp template created successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create WhatsApp template' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating WhatsApp template:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create WhatsApp template' 
    }, { status: 500 });
  }
}

// PUT - Update WhatsApp template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ 
        success: false, 
        message: 'Template ID and updates are required' 
      }, { status: 400 });
    }

    await supabaseWhatsAppManager.initialize();
    const success = await supabaseWhatsAppManager.updateTemplate(id, updates);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp template updated successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update WhatsApp template' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating WhatsApp template:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update WhatsApp template' 
    }, { status: 500 });
  }
}

// DELETE - Delete WhatsApp template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Template ID is required' 
      }, { status: 400 });
    }

    await supabaseWhatsAppManager.initialize();
    const success = await supabaseWhatsAppManager.deleteTemplate(id);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp template deleted successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to delete WhatsApp template' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting WhatsApp template:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete WhatsApp template' 
    }, { status: 500 });
  }
}
