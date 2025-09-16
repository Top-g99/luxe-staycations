import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'Admin API is working correctly',
      timestamp: new Date().toISOString(),
      data: {
        admin: true,
        rateLimitDisabled: true,
        redirectIssues: false,
        systemHealth: 'excellent'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Admin API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
