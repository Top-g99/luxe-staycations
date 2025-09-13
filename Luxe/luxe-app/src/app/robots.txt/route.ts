import { NextResponse } from 'next/server';
import { seoManager } from '@/lib/seoManager';

export async function GET() {
  try {
    const robots = seoManager.generateRobotsTxt();
    
    return new NextResponse(robots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('Error generating robots.txt', { status: 500 });
  }
}
