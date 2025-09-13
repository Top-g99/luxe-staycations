// Supabase Instagram Manager for Luxe Staycations
// Handles Instagram configuration and content storage in Supabase

import { supabase } from './supabase';
import { InstagramConfig } from './instagramService';

export interface DatabaseInstagramConfiguration {
  id: string;
  access_token: string;
  business_account_id: string;
  instagram_account_id: string;
  webhook_verify_token: string;
  api_version: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInstagramPost {
  id: string;
  instagram_post_id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  caption: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  thumbnail_url?: string;
  hashtags: string[];
  engagement_rate: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInstagramStory {
  id: string;
  instagram_story_id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInstagramAnalytics {
  id: string;
  period: string;
  impressions: number;
  reach: number;
  profile_views: number;
  website_clicks: number;
  email_contacts: number;
  phone_calls: number;
  text_messages: number;
  get_directions: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseInstagramManager {
  private static instance: SupabaseInstagramManager;
  private isInitialized = false;

  public static getInstance(): SupabaseInstagramManager {
    if (!SupabaseInstagramManager.instance) {
      SupabaseInstagramManager.instance = new SupabaseInstagramManager();
    }
    return SupabaseInstagramManager.instance;
  }

  // Initialize the manager
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      // Test connection by checking if tables exist
      const { error } = await supabase
        .from('instagram_configurations')
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(`Instagram tables not found: ${error.message}`);
      }
      
      this.isInitialized = true;
      console.log('SupabaseInstagramManager initialized successfully');
    } catch (error) {
      console.error('Error initializing SupabaseInstagramManager:', error);
      throw error;
    }
  }

  // Load Instagram configuration from Supabase
  public async loadConfiguration(): Promise<InstagramConfig | null> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('instagram_configurations')
        .select('*')
        .eq('enabled', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No Instagram configuration found');
          return null;
        }
        throw error;
      }

      const config: InstagramConfig = {
        accessToken: data.access_token,
        businessAccountId: data.business_account_id,
        instagramAccountId: data.instagram_account_id,
        webhookVerifyToken: data.webhook_verify_token,
        apiVersion: data.api_version,
        enabled: data.enabled
      };

      console.log('Instagram configuration loaded from Supabase');
      return config;
    } catch (error) {
      console.error('Error loading Instagram configuration:', error);
      return null;
    }
  }

  // Save Instagram configuration to Supabase
  public async saveConfiguration(config: InstagramConfig): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      // First, disable all existing configurations
      await supabase
        .from('instagram_configurations')
        .update({ enabled: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

      // Insert new configuration
      const { error } = await supabase
        .from('instagram_configurations')
        .insert({
          access_token: config.accessToken,
          business_account_id: config.businessAccountId,
          instagram_account_id: config.instagramAccountId,
          webhook_verify_token: config.webhookVerifyToken,
          api_version: config.apiVersion,
          enabled: config.enabled
        });

      if (error) {
        throw error;
      }

      console.log('Instagram configuration saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving Instagram configuration:', error);
      return false;
    }
  }

  // Save Instagram post to database
  public async savePost(post: Omit<DatabaseInstagramPost, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .upsert(post, { onConflict: 'instagram_post_id' });

      if (error) {
        throw error;
      }

      console.log('Instagram post saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving Instagram post:', error);
      return false;
    }
  }

  // Get Instagram posts from database
  public async getPosts(limit: number = 12): Promise<DatabaseInstagramPost[]> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading Instagram posts:', error);
      return [];
    }
  }

  // Save Instagram story to database
  public async saveStory(story: Omit<DatabaseInstagramStory, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { error } = await supabase
        .from('instagram_stories')
        .upsert(story, { onConflict: 'instagram_story_id' });

      if (error) {
        throw error;
      }

      console.log('Instagram story saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving Instagram story:', error);
      return false;
    }
  }

  // Get Instagram stories from database
  public async getStories(limit: number = 24): Promise<DatabaseInstagramStory[]> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('instagram_stories')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading Instagram stories:', error);
      return [];
    }
  }

  // Save Instagram analytics to database
  public async saveAnalytics(analytics: Omit<DatabaseInstagramAnalytics, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { error } = await supabase
        .from('instagram_analytics')
        .upsert(analytics, { onConflict: 'period' });

      if (error) {
        throw error;
      }

      console.log('Instagram analytics saved to Supabase');
      return true;
    } catch (error) {
      console.error('Error saving Instagram analytics:', error);
      return false;
    }
  }

  // Get Instagram analytics from database
  public async getAnalytics(period: string): Promise<DatabaseInstagramAnalytics | null> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { data, error } = await supabase
        .from('instagram_analytics')
        .select('*')
        .eq('period', period)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error loading Instagram analytics:', error);
      return null;
    }
  }

  // Get configuration status
  public async isConfigured(): Promise<boolean> {
    try {
      const config = await this.loadConfiguration();
      return config !== null && config.enabled;
    } catch (error) {
      console.error('Error checking Instagram configuration status:', error);
      return false;
    }
  }

  // Get recent posts count
  public async getPostsCount(): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { count, error } = await supabase
        .from('instagram_posts')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting posts count:', error);
      return 0;
    }
  }

  // Get stories count
  public async getStoriesCount(): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const { count, error } = await supabase
        .from('instagram_stories')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting stories count:', error);
      return 0;
    }
  }

  // Clear old data (older than 30 days)
  public async clearOldData(): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clear old posts
      await supabase
        .from('instagram_posts')
        .delete()
        .lt('timestamp', thirtyDaysAgo.toISOString());

      // Clear old stories
      await supabase
        .from('instagram_stories')
        .delete()
        .lt('timestamp', thirtyDaysAgo.toISOString());

      console.log('Old Instagram data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing old Instagram data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supabaseInstagramManager = SupabaseInstagramManager.getInstance();
