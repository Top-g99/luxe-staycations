import { NextRequest, NextResponse } from 'next/server';
import { setupSupabaseDatabase } from '@/lib/setupSupabaseDatabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up Supabase database...');
    const result = await setupSupabaseDatabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database setup completed successfully',
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database setup failed',
        error: result.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in setup-database API:', error);
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to setup database',
    endpoint: '/api/setup-database'
  });
}
