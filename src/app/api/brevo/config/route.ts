import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // Get Brevo configuration from database
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data: config, error } = await supabase
      .from('brevo_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error fetching Brevo configuration:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch Brevo configuration' },
        { status: 500 }
      );
    }

    if (!config || config.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No Brevo configuration found' },
        { status: 404 }
      );
    }

    // Don't return the API key for security
    const safeConfig = {
      senderEmail: config[0].sender_email,
      senderName: config[0].sender_name,
      replyToEmail: config[0].reply_to_email,
      isActive: config[0].is_active,
      createdAt: config[0].created_at,
      updatedAt: config[0].updated_at
    };

    return NextResponse.json({
      success: true,
      data: safeConfig
    });

  } catch (error) {
    console.error('Error in Brevo config GET:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, senderEmail, senderName, replyToEmail } = body;

    if (!apiKey || !senderEmail || !senderName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: apiKey, senderEmail, senderName' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    // First, try to create the table if it doesn't exist
    try {
      if (supabase) {
        await supabase.rpc('create_brevo_configurations_table');
      }
    } catch (tableError) {
      console.log('Table might already exist or creation failed:', tableError);
      // Continue anyway, the table might already exist
    }
    
    // Deactivate existing configurations
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { error: deactivateError } = await supabase
      .from('brevo_configurations')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.log('No existing configurations to deactivate:', deactivateError);
    }

    // Insert new configuration
    const { data, error } = await supabase
      .from('brevo_configurations')
      .insert([{
        api_key: apiKey,
        sender_email: senderEmail,
        sender_name: senderName,
        reply_to_email: replyToEmail || senderEmail,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error saving Brevo configuration:', error);
      
      // If table doesn't exist, try to create it manually
      if (error.code === 'PGRST116' || error.message.includes('relation "brevo_configurations" does not exist')) {
        try {
          // Create table manually using SQL
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS brevo_configurations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              api_key TEXT NOT NULL,
              sender_email TEXT NOT NULL,
              sender_name TEXT NOT NULL,
              reply_to_email TEXT,
              is_active BOOLEAN NOT NULL DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `;
          
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
          
          if (createError) {
            console.error('Failed to create table manually:', createError);
            return NextResponse.json(
              { success: false, message: 'Failed to create Brevo configurations table. Please run the migration manually.' },
              { status: 500 }
            );
          }
          
          // Try inserting again
          const { data: retryData, error: retryError } = await supabase
            .from('brevo_configurations')
            .insert([{
              api_key: apiKey,
              sender_email: senderEmail,
              sender_name: senderName,
              reply_to_email: replyToEmail || senderEmail,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select();

          if (retryError) {
            console.error('Error saving Brevo configuration after table creation:', retryError);
            return NextResponse.json(
              { success: false, message: `Failed to save Brevo configuration: ${retryError.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'Brevo configuration saved successfully (table created)',
            data: {
              id: retryData[0].id,
              senderEmail: retryData[0].sender_email,
              senderName: retryData[0].sender_name,
              replyToEmail: retryData[0].reply_to_email,
              isActive: retryData[0].is_active
            }
          });
          
        } catch (manualError) {
          console.error('Manual table creation failed:', manualError);
          return NextResponse.json(
            { success: false, message: 'Failed to create table and save configuration. Please check your Supabase setup.' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, message: `Failed to save Brevo configuration: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brevo configuration saved successfully',
      data: {
        id: data[0].id,
        senderEmail: data[0].sender_email,
        senderName: data[0].sender_name,
        replyToEmail: data[0].reply_to_email,
        isActive: data[0].is_active
      }
    });

  } catch (error) {
    console.error('Error in Brevo config POST:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
