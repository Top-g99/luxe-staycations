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
  SPECIAL_REQUESTS: 'special_requests'
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
  payment_status: 'pending' | 'paid' | 'failed';
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

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// Helper function to get Supabase client with error handling
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
};

