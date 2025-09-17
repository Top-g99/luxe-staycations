// Minimal Instagram service for admin functionality
export interface InstagramConfig {
  id: string;
  access_token: string;
  user_id: string;
  username: string;
  businessAccountId?: string;
  instagramAccountId?: string;
  webhookVerifyToken?: string;
  apiVersion?: string;
  enabled?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export class InstagramService {
  private static instance: InstagramService;
  private config: InstagramConfig | null = null;
  private posts: InstagramPost[] = [];

  static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService();
    }
    return InstagramService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }


  async setConfig(config: Omit<InstagramConfig, 'id' | 'created_at' | 'updated_at'>): Promise<InstagramConfig> {
    const newConfig: InstagramConfig = {
      ...config,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.config = newConfig;
    return newConfig;
  }

  async getPosts(): Promise<InstagramPost[]> {
    return this.posts;
  }

  async createPost(post: Omit<InstagramPost, 'id' | 'created_at' | 'updated_at'>): Promise<InstagramPost> {
    const newPost: InstagramPost = {
      ...post,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.posts.push(newPost);
    return newPost;
  }

  async updatePost(id: string, updates: Partial<InstagramPost>): Promise<InstagramPost | null> {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updates, updated_at: new Date().toISOString() };
      return this.posts[index];
    }
    return null;
  }

  async deletePost(id: string): Promise<boolean> {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAnalytics(): Promise<any> {
    return {
      totalPosts: this.posts.length,
      totalLikes: 0,
      totalComments: 0,
      totalReach: 0,
      totalImpressions: 0
    };
  }

  getConfig(): InstagramConfig | null {
    return this.config;
  }

  isServiceConfigured(): boolean {
    return this.config !== null && this.config.access_token !== '';
  }

  async configure(config: InstagramConfig): Promise<boolean> {
    try {
      await this.setConfig(config);
      return true;
    } catch (error) {
      console.error('Error configuring Instagram service:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Mock connection test - in real app, this would test Instagram API connection
      if (!this.config || !this.config.access_token) {
        return {
          success: false,
          message: 'Instagram service not configured. Please provide access token.'
        };
      }
      
      return {
        success: true,
        message: 'Instagram connection test successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const instagramService = InstagramService.getInstance();
