import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getSupabaseClient();
    
    // Try multiple approaches to check if the table exists
    let tableExists = false;
    let lastError = null;
    
    // Method 1: Try to select from the table
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }
    const { data, error: selectError } = await supabase
      .from('brevo_configurations')
      .select('id')
      .limit(1);
    
    if (!selectError) {
      tableExists = true;
    } else {
      lastError = selectError;
      
      // Method 2: Try to insert a test record (this will create the table if it doesn't exist)
      if (selectError.code === 'PGRST116' || selectError.message.includes('does not exist')) {
        try {
          const { error: insertError } = await supabase
            .from('brevo_configurations')
            .insert([{
              api_key: 'test-key-for-verification',
              sender_email: 'test@example.com',
              sender_name: 'Test',
              is_active: false
            }]);
          
          if (!insertError) {
            // Table was created successfully, clean up test record
            await supabase
              .from('brevo_configurations')
              .delete()
              .eq('api_key', 'test-key-for-verification');
            
            tableExists = true;
          } else {
            lastError = insertError;
          }
        } catch (insertErr) {
          lastError = insertErr;
        }
      }
    }
    
    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: 'Brevo configurations table is accessible and ready to use!'
      });
    } else {
      // Table doesn't exist or there's a schema cache issue
      return NextResponse.json({
        success: false,
        message: `Table access issue: ${lastError?.message || 'Unknown error'}`,
        instructions: {
          step1: "Go to your Supabase Dashboard → SQL Editor",
          step2: "Run this SQL: CREATE TABLE IF NOT EXISTS brevo_configurations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), api_key TEXT NOT NULL, sender_email TEXT NOT NULL, sender_name TEXT NOT NULL, reply_to_email TEXT, is_active BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());",
          step3: "Wait 30 seconds for schema cache to refresh",
          step4: "Come back here and try again"
        }
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in Brevo setup:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
