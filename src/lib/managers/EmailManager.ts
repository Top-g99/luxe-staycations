import { supabase, TABLES, EmailLog } from '../supabaseClient';

export class EmailManager {
  // Get all email logs
  async getAllEmailLogs(): Promise<EmailLog[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email logs:', error);
      return [];
    }
  }

  // Get email log by ID
  async getEmailLogById(id: string): Promise<EmailLog | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email log:', error);
      return null;
    }
  }

  // Log email
  async logEmail(emailLog: Omit<EmailLog, 'id' | 'created_at'>): Promise<EmailLog | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .insert([emailLog])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging email:', error);
      return null;
    }
  }

  // Get emails by status
  async getEmailsByStatus(status: EmailLog['status']): Promise<EmailLog[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emails by status:', error);
      return [];
    }
  }

  // Get emails by template type
  async getEmailsByTemplate(templateType: string): Promise<EmailLog[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .select('*')
        .eq('template_type', templateType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emails by template:', error);
      return [];
    }
  }

  // Update email status
  async updateEmailStatus(id: string, status: EmailLog['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .update({ 
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating email status:', error);
      return false;
    }
  }

  // Get email statistics
  async getEmailStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byTemplate: Record<string, number>;
    dailyStats: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_LOGS)
        .select('*');
      
      if (error) throw error;
      
      const emails = data || [];
      const stats = {
        total: emails.length,
        sent: emails.filter(e => e.status === 'sent').length,
        failed: emails.filter(e => e.status === 'failed').length,
        pending: emails.filter(e => e.status === 'pending').length,
        byTemplate: {} as Record<string, number>,
        dailyStats: {} as Record<string, number>
      };
      
      emails.forEach(email => {
        stats.byTemplate[email.template_type] = (stats.byTemplate[email.template_type] || 0) + 1;
        
        const date = new Date(email.created_at).toISOString().substring(0, 10);
        stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      return {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        byTemplate: {},
        dailyStats: {}
      };
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(bookingData: {
    guestName: string;
    guestEmail: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  }): Promise<boolean> {
    try {
      // Log the email attempt
      const emailLog = await this.logEmail({
        to_email: bookingData.guestEmail,
        subject: `Booking Confirmation - ${bookingData.propertyName}`,
        template_type: 'booking_confirmation',
        status: 'pending'
      });

      if (!emailLog) return false;

      // Here you would integrate with your email service (Brevo, SendGrid, etc.)
      // For now, we'll simulate success
      const success = Math.random() > 0.1; // 90% success rate
      
      await this.updateEmailStatus(emailLog.id, success ? 'sent' : 'failed');
      
      return success;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return false;
    }
  }

  // Send callback response email
  async sendCallbackResponse(callbackData: {
    name: string;
    email: string;
    message: string;
  }): Promise<boolean> {
    try {
      const emailLog = await this.logEmail({
        to_email: callbackData.email,
        subject: 'Thank you for your inquiry - Luxe Staycations',
        template_type: 'callback_response',
        status: 'pending'
      });

      if (!emailLog) return false;

      const success = Math.random() > 0.1;
      await this.updateEmailStatus(emailLog.id, success ? 'sent' : 'failed');
      
      return success;
    } catch (error) {
      console.error('Error sending callback response:', error);
      return false;
    }
  }

  // Send consultation confirmation email
  async sendConsultationConfirmation(consultationData: {
    name: string;
    email: string;
    propertyType: string;
    location: string;
  }): Promise<boolean> {
    try {
      const emailLog = await this.logEmail({
        to_email: consultationData.email,
        subject: 'Consultation Scheduled - Luxe Staycations',
        template_type: 'consultation_confirmation',
        status: 'pending'
      });

      if (!emailLog) return false;

      const success = Math.random() > 0.1;
      await this.updateEmailStatus(emailLog.id, success ? 'sent' : 'failed');
      
      return success;
    } catch (error) {
      console.error('Error sending consultation confirmation:', error);
      return false;
    }
  }

  // Send partner response email
  async sendPartnerResponse(partnerData: {
    name: string;
    email: string;
    propertyName: string;
    status: 'approved' | 'rejected';
  }): Promise<boolean> {
    try {
      const emailLog = await this.logEmail({
        to_email: partnerData.email,
        subject: `Partnership Application ${partnerData.status === 'approved' ? 'Approved' : 'Update'} - Luxe Staycations`,
        template_type: 'partner_response',
        status: 'pending'
      });

      if (!emailLog) return false;

      const success = Math.random() > 0.1;
      await this.updateEmailStatus(emailLog.id, success ? 'sent' : 'failed');
      
      return success;
    } catch (error) {
      console.error('Error sending partner response:', error);
      return false;
    }
  }
}

export const emailManager = new EmailManager();
