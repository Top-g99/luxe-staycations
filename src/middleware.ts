// DISABLED Middleware - No processing to prevent rate limiting
import { NextRequest, NextResponse } from 'next/server';

// Completely disabled middleware
export function middleware(request: NextRequest) {
  // Return immediately without any processing
  return NextResponse.next();
}

// Configure which routes the middleware should run on - DISABLED
export const config = {
  matcher: [],
};