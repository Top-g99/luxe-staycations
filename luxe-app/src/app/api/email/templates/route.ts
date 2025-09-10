import { NextRequest, NextResponse } from 'next/server';
import { supabaseEmailManager } from '@/lib/supabaseEmailManager';
import { emailSecurityValidator } from '@/lib/security/emailSecurity';

// GET /api/email/templates - Get all email templates
export async function GET() {
  try {
    await supabaseEmailManager.initialize();
    const templates = supabaseEmailManager.getTemplates();
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

// POST /api/email/templates - Create a new email template
export async function POST(request: NextRequest) {
  const clientIP = emailSecurityValidator.getClientIP(request);
  
  try {
    const body = await request.json();
    const { name, type, subject, htmlContent, textContent, variables, isActive = true, isDefault = false } = body;

    if (!name || !type || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, subject, htmlContent' },
        { status: 400 }
      );
    }

    // Validate template content for security
    const htmlValidation = emailSecurityValidator.validateEmailContent(htmlContent, 'html');
    if (!htmlValidation.isValid) {
      emailSecurityValidator.logSecurityEvent('TEMPLATE_HTML_VALIDATION_FAILED', {
        clientIP,
        errors: htmlValidation.errors
      }, 'medium');
      
      return NextResponse.json(
        { 
          error: 'Invalid HTML content',
          details: htmlValidation.errors
        },
        { status: 400 }
      );
    }

    // Validate text content if provided
    let sanitizedTextContent = textContent;
    if (textContent) {
      const textValidation = emailSecurityValidator.validateEmailContent(textContent, 'text');
      if (!textValidation.isValid) {
        emailSecurityValidator.logSecurityEvent('TEMPLATE_TEXT_VALIDATION_FAILED', {
          clientIP,
          errors: textValidation.errors
        }, 'medium');
        
        return NextResponse.json(
          { 
            error: 'Invalid text content',
            details: textValidation.errors
          },
          { status: 400 }
        );
      }
      sanitizedTextContent = textValidation.sanitized || textContent;
    }

    // Validate template variables
    if (variables && Array.isArray(variables)) {
      const variablesObj = variables.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      const variablesValidation = emailSecurityValidator.validateTemplateVariables(variablesObj);
      if (!variablesValidation.isValid) {
        emailSecurityValidator.logSecurityEvent('TEMPLATE_VARIABLES_VALIDATION_FAILED', {
          clientIP,
          errors: variablesValidation.errors
        }, 'medium');
        
        return NextResponse.json(
          { 
            error: 'Invalid template variables',
            details: variablesValidation.errors
          },
          { status: 400 }
        );
      }
    }

    const templateId = await supabaseEmailManager.saveTemplate({
      name,
      type,
      subject,
      htmlContent: htmlValidation.sanitized || htmlContent,
      textContent: sanitizedTextContent || '',
      variables: variables || [],
      isActive,
      isDefault
    });

    if (!templateId) {
      return NextResponse.json(
        { error: 'Failed to create email template' },
        { status: 500 }
      );
    }

    // Log template creation
    emailSecurityValidator.logSecurityEvent('TEMPLATE_CREATED', {
      templateId,
      name,
      type,
      clientIP
    }, 'low');

    return NextResponse.json({ 
      success: true, 
      templateId,
      message: 'Email template created successfully' 
    });
  } catch (error) {
    emailSecurityValidator.logSecurityEvent('TEMPLATE_CREATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      clientIP
    }, 'high');

    console.error('Error creating email template:', error);
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}

// PUT /api/email/templates - Update an email template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: id, updates' },
        { status: 400 }
      );
    }

    const success = await supabaseEmailManager.updateTemplate(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update email template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email template updated successfully' 
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

// DELETE /api/email/templates - Delete an email template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const success = await supabaseEmailManager.deleteTemplate(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete email template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email template deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}
