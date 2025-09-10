import { NextResponse } from 'next/server';
import { seoManager } from '@/lib/seoManager';

export async function GET() {
  try {
    const sitemap = seoManager.generateSitemap();
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
