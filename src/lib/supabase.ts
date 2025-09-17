// Minimal Supabase client for admin functionality
export interface SupabaseClient {
  from: (table: string) => any;
  auth: {
    getUser: () => Promise<any>;
    signIn: (credentials: any) => Promise<any>;
    signOut: () => Promise<any>;
  };
  rpc: (functionName: string, params?: any) => Promise<any>;
}

export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient | null = null;

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  from(table: string) {
    const queryBuilder = {
      select: (columns?: string) => queryBuilder,
      insert: (data: any) => queryBuilder,
      update: (data: any) => queryBuilder,
      delete: () => queryBuilder,
      eq: (column: string, value: any) => queryBuilder,
      in: (column: string, values: any[]) => queryBuilder,
      gte: (column: string, value: any) => queryBuilder,
      lte: (column: string, value: any) => queryBuilder,
      order: (column: string, options?: any) => queryBuilder,
      limit: (count: number) => queryBuilder,
      then: (resolve: any) => resolve({ data: [], error: null })
    };
    return queryBuilder as any;
  }

  async auth() {
    return {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    };
  }

  async rpc(functionName: string, params?: any) {
    return Promise.resolve({ data: null, error: null });
  }
}

export const supabase = SupabaseService.getInstance();

// Export additional functions for compatibility
export const getSupabaseClient = () => supabase.getClient();
export const isSupabaseAvailable = () => true;

export const TABLES = {
  PROPERTIES: 'properties',
  BOOKINGS: 'bookings',
  USERS: 'users',
  DESTINATIONS: 'destinations',
  DEAL_BANNERS: 'deal_banners',
  HERO_BACKGROUNDS: 'hero_backgrounds',
  CALLBACKS: 'callbacks',
  CONTACTS: 'contacts',
  CONSULTATIONS: 'consultations',
  PARTNERS: 'partners',
  PAYMENTS: 'payments',
  LOYALTY_RULES: 'loyalty_rules',
  LOYALTY_REDEMPTIONS: 'loyalty_redemptions',
  EMAIL_TEMPLATES: 'email_templates',
  EMAIL_TRIGGERS: 'email_triggers',
  EMAIL_CONFIGURATIONS: 'email_configurations',
  EMAIL_LOGS: 'email_logs',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  INSTAGRAM_POSTS: 'instagram_posts'
};
