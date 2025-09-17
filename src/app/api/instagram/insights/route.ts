// Instagram Insights API Route
// Handles Instagram insights operations

import { NextRequest, NextResponse } from 'next/server';
import { supabaseInstagramManager } from '@/lib/supabaseInstagramManager';

// GET - Retrieve Instagram insights
export async function GET() {
  try {
    await supabaseInstagramManager.initialize();
    
    // Get posts for insights calculation
    const posts = await supabaseInstagramManager.getPosts(50);
    
    // Calculate insights from posts data
    const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments_count, 0);
    const avgLikes = posts.length > 0 ? totalLikes / posts.length : 0;
    const avgComments = posts.length > 0 ? totalComments / posts.length : 0;
    
    // Calculate engagement rate (simplified)
    const totalEngagement = totalLikes + totalComments;
    const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;
    
    // Extract hashtags
    const allHashtags = posts.flatMap(post => post.hashtags);
    const hashtagCounts = allHashtags.reduce((acc, hashtag) => {
      acc[hashtag] = (acc[hashtag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topHashtags = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([hashtag]) => hashtag);
    
    // Mock data for other insights (would come from Instagram API in real implementation)
    const insights = {
      followersCount: 1250, // This would come from Instagram API
      mediaCount: posts.length,
      followsCount: 890, // This would come from Instagram API
      engagement: avgEngagement,
      avgLikes: Math.round(avgLikes),
      avgComments: Math.round(avgComments),
      topHashtags,
      bestPostingTimes: ['9:00 AM', '12:00 PM', '6:00 PM'] // Mock data
    };

    return NextResponse.json({ 
      success: true, 
      insights 
    });
  } catch (error) {
    console.error('Error retrieving Instagram insights:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to retrieve Instagram insights' 
    }, { status: 500 });
  }
}
