import { NextRequest, NextResponse } from 'next/server';
import { LUXE_EMAIL_TEMPLATES, getTemplateById, getTemplatesByCategory } from '@/lib/brevoTemplates';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const category = searchParams.get('category');

    if (templateId) {
      // Get specific template
      const template = getTemplateById(templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: template
      });
    }

    if (category) {
      // Get templates by category
      const templates = getTemplatesByCategory(category as any);
      return NextResponse.json({
        success: true,
        data: templates
      });
    }

    // Get all templates
    return NextResponse.json({
      success: true,
      data: LUXE_EMAIL_TEMPLATES
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, variables } = body;

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Template not found' },
        { status: 404 }
      );
    }

    // Add default variables if not provided
    const defaultVariables = {
      logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/images/luxe-logo.svg`,
      unsubscribeLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/unsubscribe`,
      ...variables
    };

    // Replace variables in template
    const templateData = await template;
    if (!templateData) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    const processedTemplate = {
      ...templateData,
      htmlContent: templateData.htmlContent?.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return defaultVariables[key] || match;
      }) || '',
      textContent: templateData.textContent?.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return defaultVariables[key] || match;
      }) || '',
      subject: templateData.subject?.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return defaultVariables[key] || match;
      }) || ''
    };

    return NextResponse.json({
      success: true,
      data: processedTemplate
    });

  } catch (error) {
    console.error('Error processing template:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
