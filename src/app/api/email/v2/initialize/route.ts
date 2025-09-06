import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting email system initialization...');
    
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required environment variables for Supabase connection',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Create Supabase client inside the function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check if email system is already initialized
    const { data: configData, error: configError } = await supabase
      .from('email_configurations_v2')
      .select('*')
      .eq('is_active', true)
      .single();

    const { data: templatesData, error: templatesError } = await supabase
      .from('email_templates_v2')
      .select('*')
      .eq('is_active', true);

    const { data: triggersData, error: triggersError } = await supabase
      .from('email_triggers')
      .select('*')
      .eq('is_active', true);

    if (configError && configError.code !== 'PGRST116') {
      console.error('Error fetching email configuration:', configError);
    }

    if (templatesError) {
      console.error('Error fetching email templates:', templatesError);
    }

    if (triggersError) {
      console.error('Error fetching email triggers:', triggersError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email system initialized successfully',
      config: configData,
      templates: templatesData || [],
      triggers: triggersData || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email system initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
