import { NextRequest, NextResponse } from 'next/server';
import { initializeEmailSystem } from '@/lib/email/initializeEmailSystem';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting email system initialization...');
    
    const result = await initializeEmailSystem();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

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
