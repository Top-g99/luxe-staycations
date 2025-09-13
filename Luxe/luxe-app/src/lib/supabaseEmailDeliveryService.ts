// Supabase-integrated Email Delivery Service for Luxe Staycations
// This service provides real-time email delivery tracking with Supabase

import { getSupabaseClient } from './supabase';

export interface EmailDeliveryStatus {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  recipient: string;
  subject: string;
  deliveryAttempts: number;
}

export interface EmailDeliveryLog {
  id: string;
  type: 'booking_confirmation' | 'consultation_request' | 'contact_form' | 'partner_request' | 'special_request' | 'booking_cancellation' | 'admin_notification';
  recipient: string;
  subject: string;
  status: EmailDeliveryStatus;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export class SupabaseEmailDeliveryService {
  private static instance: SupabaseEmailDeliveryService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SupabaseEmailDeliveryService {
    if (!SupabaseEmailDeliveryService.instance) {
      SupabaseEmailDeliveryService.instance = new SupabaseEmailDeliveryService();
    }
    return SupabaseEmailDeliveryService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure the email_delivery_logs table exists
      await this.createTableIfNotExists();
      
      // No migration needed - using Supabase only
      
      this.isInitialized = true;
      console.log('SupabaseEmailDeliveryService initialized successfully');
    } catch (error) {
      console.error('Error initializing SupabaseEmailDeliveryService:', error);
      // Still mark as initialized
      this.isInitialized = true;
    }
  }

  private async createTableIfNotExists(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // First, try to query the table to see if it exists
      const { data, error: queryError } = await supabase
        .from('email_delivery_logs')
        .select('id')
        .limit(1);
      
      if (queryError && queryError.code === 'PGRST116') {
        // Table doesn't exist, try to create it
        console.log('email_delivery_logs table does not exist, creating...');
        
        const { error } = await supabase.rpc('create_email_delivery_logs_table');
        
        if (error && !error.message.includes('already exists')) {
          console.error('Error creating email_delivery_logs table:', error);
          // Fallback: try to create table manually
          await this.createTableManually();
        } else {
          console.log('✅ email_delivery_logs table created successfully');
        }
      } else if (queryError) {
        console.error('Error checking table existence:', queryError);
        await this.createTableManually();
      } else {
        console.log('✅ email_delivery_logs table already exists');
      }
    } catch (error) {
      console.error('Error in createTableIfNotExists:', error);
      await this.createTableManually();
    }
  }

  private async createTableManually(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // Try to create the table using direct SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS email_delivery_logs (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN (
            'booking_confirmation',
            'consultation_request', 
            'contact_form',
            'partner_request',
            'special_request',
            'booking_cancellation',
            'admin_notification'
          )),
          recipient TEXT NOT NULL,
          subject TEXT NOT NULL,
          status JSONB NOT NULL DEFAULT '{}',
          data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (error) {
        console.warn('Could not create table via RPC:', error.message);
      } else {
        console.log('✅ email_delivery_logs table created manually');
      }
    } catch (error) {
      console.error('Error creating table manually:', error);
    }
  }

  private async migrateLocalStorageData(): Promise<void> {
    // No migration needed - we're using Supabase only
    console.log('Using Supabase only for email delivery logs - no migration needed');
  }

  // Log email delivery attempt
  async logEmailDelivery(
    type: EmailDeliveryLog['type'],
    recipient: string,
    subject: string,
    data: any,
    status: EmailDeliveryStatus
  ): Promise<string> {
    try {
      const supabase = getSupabaseClient();
      
      const logId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const log: EmailDeliveryLog = {
        id: logId,
        type,
        recipient,
        subject,
        status,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try to save to Supabase first
      try {
        const { error } = await supabase
          .from('email_delivery_logs')
          .insert([{
            id: log.id,
            type: log.type,
            recipient: log.recipient,
            subject: log.subject,
            status: log.status,
            data: log.data,
            created_at: log.createdAt,
            updated_at: log.updatedAt
          }]);

        if (error) {
          console.error('Failed to save to Supabase:', error);
        } else {
          console.log('Email delivery logged to Supabase:', logId);
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }

      return logId;
    } catch (error) {
      console.error('Error logging email delivery:', error);
      return '';
    }
  }


  // Get delivery statistics
  async getDeliveryStatistics(): Promise<{
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    recentFailures: EmailDeliveryLog[];
  }> {
    try {
      const supabase = getSupabaseClient();
      
      // Try to get from Supabase first
      try {
        const { data: logs, error } = await supabase
          .from('email_delivery_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch from Supabase:', error);
          return {
            total: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
            recentFailures: []
          };
        }

        const total = logs?.length || 0;
        const successful = logs?.filter((log: any) => log.status?.success).length || 0;
        const failed = total - successful;
        const successRate = total > 0 ? (successful / total) * 100 : 0;
        
        const recentFailures = logs
          ?.filter((log: any) => !log.status?.success)
          ?.slice(0, 10) || [];

        return {
          total,
          successful,
          failed,
          successRate: Math.round(successRate * 100) / 100,
          recentFailures: recentFailures as EmailDeliveryLog[]
        };
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0,
          recentFailures: []
        };
      }
    } catch (error) {
      console.error('Error getting delivery statistics:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        recentFailures: []
      };
    }
  }


  // Get recent delivery logs
  async getRecentDeliveryLogs(limit: number = 50): Promise<EmailDeliveryLog[]> {
    try {
      const supabase = getSupabaseClient();
      
      // Try to get from Supabase first
      try {
        const { data: logs, error } = await supabase
          .from('email_delivery_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Failed to fetch from Supabase:', error);
          return [];
        }

        return (logs || []) as EmailDeliveryLog[];
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return [];
      }
    } catch (error) {
      console.error('Error getting recent delivery logs:', error);
      return [];
    }
  }


  // Get delivery logs by type
  async getDeliveryLogsByType(type: EmailDeliveryLog['type']): Promise<EmailDeliveryLog[]> {
    try {
      const supabase = getSupabaseClient();
      
      // Try to get from Supabase first
      try {
        const { data: logs, error } = await supabase
          .from('email_delivery_logs')
          .select('*')
          .eq('type', type)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch from Supabase:', error);
          return [];
        }

        return (logs || []) as EmailDeliveryLog[];
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return [];
      }
    } catch (error) {
      console.error('Error getting delivery logs by type:', error);
      return [];
    }
  }


  // Update delivery status
  async updateDeliveryStatus(logId: string, status: Partial<EmailDeliveryStatus>): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      
      // Try to update in Supabase first
      try {
        const { error } = await supabase
          .from('email_delivery_logs')
          .update({
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', logId);

        if (error) {
          console.error('Failed to update in Supabase:', error);
          return false;
        }

        return true;
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return false;
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      return false;
    }
  }


  // Clear old delivery logs (older than 30 days)
  async clearOldLogs(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Try to clear from Supabase first
      try {
        const { error } = await supabase
          .from('email_delivery_logs')
          .delete()
          .lt('created_at', thirtyDaysAgo.toISOString());

        if (error) {
          console.error('Failed to clear from Supabase:', error);
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    } catch (error) {
      console.error('Error clearing old logs:', error);
    }
  }

}

// Create singleton instance
export const supabaseEmailDeliveryService = SupabaseEmailDeliveryService.getInstance();


