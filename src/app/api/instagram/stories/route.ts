// Instagram Stories API Route
// Handles Instagram stories operations

import { NextRequest, NextResponse } from 'next/server';
import { supabaseInstagramManager } from '@/lib/supabaseInstagramManager';

// GET - Retrieve Instagram stories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '24');

    await supabaseInstagramManager.initialize();
    const stories = await supabaseInstagramManager.getStories(limit);

    return NextResponse.json({ 
      success: true, 
      stories: stories.map(story => ({
        id: story.instagram_story_id,
        mediaType: story.media_type,
        mediaUrl: story.media_url,
        permalink: story.permalink,
        timestamp: story.timestamp,
        thumbnailUrl: story.thumbnail_url,
        viewsCount: story.views_count
      }))
    });
  } catch (error) {
    console.error('Error retrieving Instagram stories:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve Instagram stories' 
    }, { status: 500 });
  }
}

// POST - Create Instagram story
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, caption, hashtags, duration } = body;

    if (!imageUrl) {
      return NextResponse.json({ 
        success: false, 
        message: 'Image URL is required' 
      }, { status: 400 });
    }

    // This would require Instagram Business API with publishing permissions
    // For now, we'll return a placeholder response
    return NextResponse.json({ 
      success: false, 
      message: 'Story creation requires Instagram Business API with publishing permissions. This feature is not yet implemented.' 
    }, { status: 501 });

  } catch (error) {
    console.error('Error creating Instagram story:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create Instagram story' 
    }, { status: 500 });
  }
}
