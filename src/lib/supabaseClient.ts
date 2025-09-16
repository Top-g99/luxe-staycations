import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okphwjvhzofxevtmlapn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcGh3anZoem9meGV2dG1sYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODU4NjMsImV4cCI6MjA3MTQ2MTg2M30.xwb10Ff-7nCothbmnL8Kesp4n8TYyJLcdehPgrXLsUw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  PROPERTIES: 'properties',
  BOOKINGS: 'bookings',
  DESTINATIONS: 'destinations',
  OFFERS: 'offers',
  LOYALTY_MEMBERS: 'loyalty_members',
  CALLBACKS: 'callbacks',
  CONSULTATIONS: 'consultations',
  PARTNER_REQUESTS: 'partner_requests',
  SPECIAL_REQUESTS: 'special_requests',
  EMAIL_LOGS: 'email_logs',
  ANALYTICS: 'analytics',
  USERS: 'users',
  HOSTS: 'hosts'
} as const;

// Types for database tables
export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  state: string;
  city: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  host_id?: string;
  property_type: 'villa' | 'homestay' | 'cottage' | 'bungalow' | 'pool_villa' | 'luxury_villa';
}

export interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  description: string;
  image_url: string;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyMember {
  id: string;
  email: string;
  name: string;
  phone: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export interface Callback {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_type: string;
  location: string;
  budget: string;
  message: string;
  status: 'pending' | 'scheduled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface PartnerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_name: string;
  location: string;
  property_type: string;
  message: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SpecialRequest {
  id: string;
  booking_id: string;
  request_type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  template_type: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at?: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  metric_name: string;
  metric_value: number;
  date: string;
  created_at: string;
}
