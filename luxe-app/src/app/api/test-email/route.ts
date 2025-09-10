import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Email API test endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Email API test POST endpoint is working',
    timestamp: new Date().toISOString()
  });
}
