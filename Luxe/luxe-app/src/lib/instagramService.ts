// Instagram Service for Luxe Staycations
// Handles Instagram Business API integration for content management and analytics

import { supabaseInstagramManager } from './supabaseInstagramManager';

export interface InstagramConfig {
  accessToken: string;
  businessAccountId: string;
  instagramAccountId: string;
  webhookVerifyToken: string;
  apiVersion: string;
  enabled: boolean;
}

export interface InstagramPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  permalink: string;
  caption: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  thumbnailUrl?: string;
}

export interface InstagramStory {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  thumbnailUrl?: string;
}

export interface InstagramAnalytics {
  impressions: number;
  reach: number;
  profileViews: number;
  websiteClicks: number;
  emailContacts: number;
  phoneCalls: number;
  textMessages: number;
  getDirections: number;
  period: string;
}

export interface InstagramInsights {
  followersCount: number;
  mediaCount: number;
  followsCount: number;
  engagement: number;
  avgLikes: number;
  avgComments: number;
  topHashtags: string[];
  bestPostingTimes: string[];
}

export interface CreatePostData {
  imageUrl: string;
  caption: string;
  hashtags: string[];
  location?: string;
  scheduledTime?: string;
}

export interface CreateStoryData {
  imageUrl: string;
  caption?: string;
  hashtags?: string[];
  duration?: number; // in seconds
}

export class InstagramService {
  private config: InstagramConfig | null = null;
  public isConfigured = false;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  // Initialize Instagram service
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await supabaseInstagramManager.initialize();
      await this.loadConfiguration();
      this.isInitialized = true;
      console.log('Instagram service initialized');
    } catch (error) {
      console.error('Error initializing Instagram service:', error);
    }
  }

  // Load configuration from Supabase
  private async loadConfiguration(): Promise<void> {
    try {
      const config = await supabaseInstagramManager.loadConfiguration();
      if (config) {
        this.config = config;
        this.isConfigured = config.enabled;
        console.log('Instagram configuration loaded from Supabase');
      }
    } catch (error) {
      console.error('Error loading Instagram configuration:', error);
    }
  }

  // Configure Instagram service
  public async configure(config: InstagramConfig): Promise<boolean> {
    try {
      const success = await supabaseInstagramManager.saveConfiguration(config);
      if (success) {
        this.config = config;
        this.isConfigured = config.enabled;
        console.log('Instagram configuration saved to Supabase');
      }
      return success;
    } catch (error) {
      console.error('Error saving Instagram configuration:', error);
      return false;
    }
  }

  // Get recent posts
  public async getRecentPosts(limit: number = 12): Promise<{ success: boolean; posts: InstagramPost[]; message?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, posts: [], message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/posts?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      return { success: false, posts: [], message: 'Failed to fetch Instagram posts' };
    }
  }

  // Get stories
  public async getStories(): Promise<{ success: boolean; stories: InstagramStory[]; message?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, stories: [], message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/stories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching Instagram stories:', error);
      return { success: false, stories: [], message: 'Failed to fetch Instagram stories' };
    }
  }

  // Get analytics
  public async getAnalytics(period: 'day' | 'week' | 'month' = 'week'): Promise<{ success: boolean; analytics: InstagramAnalytics | null; message?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, analytics: null, message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/analytics?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error);
      return { success: false, analytics: null, message: 'Failed to fetch Instagram analytics' };
    }
  }

  // Get insights
  public async getInsights(): Promise<{ success: boolean; insights: InstagramInsights | null; message?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, insights: null, message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching Instagram insights:', error);
      return { success: false, insights: null, message: 'Failed to fetch Instagram insights' };
    }
  }

  // Create a post (requires Instagram Business API with publishing permissions)
  public async createPost(data: CreatePostData): Promise<{ success: boolean; message: string; postId?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating Instagram post:', error);
      return { success: false, message: 'Failed to create Instagram post' };
    }
  }

  // Create a story
  public async createStory(data: CreateStoryData): Promise<{ success: boolean; message: string; storyId?: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating Instagram story:', error);
      return { success: false, message: 'Failed to create Instagram story' };
    }
  }

  // Test Instagram connection
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Instagram service not configured' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error testing Instagram connection:', error);
      return { success: false, message: 'Failed to test Instagram connection' };
    }
  }

  // Get current configuration
  public getConfig(): InstagramConfig | null {
    return this.config;
  }

  // Check if service is configured
  public isServiceConfigured(): boolean {
    return this.isConfigured && this.config !== null;
  }

  // Format Instagram handle for display
  public static formatHandle(handle: string): string {
    if (!handle) return '';
    return handle.startsWith('@') ? handle : `@${handle}`;
  }

  // Extract hashtags from caption
  public static extractHashtags(caption: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return caption.match(hashtagRegex) || [];
  }

  // Format engagement rate
  public static formatEngagementRate(rate: number): string {
    return `${(rate * 100).toFixed(2)}%`;
  }

  // Format number with K/M suffixes
  public static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// Export singleton instance
export const instagramService = new InstagramService();
