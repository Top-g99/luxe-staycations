// Instagram Posts API Route
// Handles Instagram posts operations

import { NextRequest, NextResponse } from 'next/server';
import { supabaseInstagramManager } from '@/lib/supabaseInstagramManager';

// GET - Retrieve Instagram posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    await supabaseInstagramManager.initialize();
    const posts = await supabaseInstagramManager.getPosts(limit);

    return NextResponse.json({ 
      success: true, 
      posts: posts.map(post => ({
        id: post.instagram_post_id,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        permalink: post.permalink,
        caption: post.caption,
        timestamp: post.timestamp,
        likeCount: post.like_count,
        commentsCount: post.comments_count,
        thumbnailUrl: post.thumbnail_url,
        hashtags: post.hashtags,
        engagementRate: post.engagement_rate
      }))
    });
  } catch (error) {
    console.error('Error retrieving Instagram posts:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve Instagram posts' 
    }, { status: 500 });
  }
}

// POST - Create Instagram post (requires Instagram Business API with publishing permissions)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, caption, hashtags, location, scheduledTime } = body;

    if (!imageUrl || !caption) {
      return NextResponse.json({ 
        success: false, 
        message: 'Image URL and caption are required' 
      }, { status: 400 });
    }

    // This would require Instagram Business API with publishing permissions
    // For now, we'll return a placeholder response
    return NextResponse.json({ 
      success: false, 
      message: 'Post creation requires Instagram Business API with publishing permissions. This feature is not yet implemented.' 
    }, { status: 501 });

  } catch (error) {
    console.error('Error creating Instagram post:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create Instagram post' 
    }, { status: 500 });
  }
}
