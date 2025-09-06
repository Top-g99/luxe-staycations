import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Database table names
export const TABLES = {
  PROPERTIES: 'properties',
  DESTINATIONS: 'destinations',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  CALLBACK_REQUESTS: 'callback_requests',
  DEAL_BANNERS: 'deal_banners',
  SETTINGS: 'settings',
  SPECIAL_REQUESTS: 'special_requests',
  CONSULTATIONS: 'consultations',
  EMAIL_CONFIGURATIONS: 'email_configurations',
  EMAIL_TEMPLATES: 'email_templates',
  EMAIL_TRIGGERS: 'email_triggers',
  EMAIL_LOGS: 'email_logs',
  WHATSAPP_CONFIGURATIONS: 'whatsapp_configurations',
  WHATSAPP_TEMPLATES: 'whatsapp_templates',
  INSTAGRAM_CONFIGURATIONS: 'instagram_configurations',
  INSTAGRAM_POSTS: 'instagram_posts',
  INSTAGRAM_STORIES: 'instagram_stories',
  INSTAGRAM_ANALYTICS: 'instagram_analytics'
} as const;

// Types for database tables
export interface DatabaseProperty {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  type: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  available: boolean;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDestination {
  id: string;
  name: string;
  description: string;
  image: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBooking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  number_of_guests: number;
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface DatabaseDealBanner {
  id: string;
  title: string;
  description: string;
  video_url: string;
  button_text: string;
  button_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseConsultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  property_description: string;
  consultation_type: 'phone' | 'video' | 'in-person';
  preferred_date: string;
  preferred_time: string;
  additional_notes: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  submitted_date: string;
  scheduled_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSettings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSpecialRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmailConfiguration {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  enable_ssl: boolean;
  from_name: string;
  from_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmailTrigger {
  id: string;
  name: string;
  event_type: string;
  template_id: string;
  conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmailLog {
  id: string;
  template_id: string;
  recipient_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  sent_at: string;
  created_at: string;
}

export interface DatabaseWhatsAppConfiguration {
  id: string;
  business_account_id: string;
  access_token: string;
  phone_number_id: string;
  webhook_verify_token: string;
  api_version: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWhatsAppTemplate {
  id: string;
  name: string;
  type: string;
  language_code: string;
  template_content: any;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// Helper function to get Supabase client with error handling
export const getSupabaseClient = () => {
  if (!supabase) {
    // Return a mock client during build time to prevent build failures
    if (typeof window === 'undefined') {
      // Server-side (build time) - return mock client
      return {
        from: () => {
          const mockQuery = {
            data: [],
            error: null,
            select: () => mockQuery,
            insert: () => mockQuery,
            update: () => mockQuery,
            delete: () => mockQuery,
            eq: () => mockQuery,
            neq: () => mockQuery,
            gt: () => mockQuery,
            gte: () => mockQuery,
            lt: () => mockQuery,
            lte: () => mockQuery,
            like: () => mockQuery,
            ilike: () => mockQuery,
            is: () => mockQuery,
            in: () => mockQuery,
            contains: () => mockQuery,
            containedBy: () => mockQuery,
            rangeGt: () => mockQuery,
            rangeGte: () => mockQuery,
            rangeLt: () => mockQuery,
            rangeLte: () => mockQuery,
            rangeAdjacent: () => mockQuery,
            overlaps: () => mockQuery,
            textSearch: () => mockQuery,
            match: () => mockQuery,
            not: () => mockQuery,
            or: () => mockQuery,
            filter: () => mockQuery,
            order: () => mockQuery,
            limit: () => mockQuery,
            range: () => mockQuery,
            abortSignal: () => mockQuery,
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            csv: () => Promise.resolve({ data: '', error: null }),
            geojson: () => Promise.resolve({ data: null, error: null }),
            explain: () => Promise.resolve({ data: null, error: null }),
            rollback: () => mockQuery,
            returns: () => mockQuery,
            then: (onFulfilled: any) => Promise.resolve({ data: [], error: null }).then(onFulfilled),
            catch: (onRejected: any) => Promise.resolve({ data: [], error: null }).catch(onRejected),
          };
          return mockQuery;
        },
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
          signUp: () => Promise.resolve({ data: { user: null }, error: null }),
          signOut: () => Promise.resolve({ error: null }),
        },
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            download: () => Promise.resolve({ data: null, error: null }),
            remove: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      } as any;
    }
    // Client-side - throw error with more details
    const missingVars = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    throw new Error(`Supabase is not configured. Missing environment variables: ${missingVars.join(', ')}. Please add these to your Netlify environment variables.`);
  }
  return supabase;
};

