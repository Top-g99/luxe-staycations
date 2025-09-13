// Email System Fixer - Comprehensive solution to fix all email delivery issues
// This service ensures email system is properly configured and working

import { getSupabaseClient } from './supabase';
import { emailService } from './emailService';
import { emailDeliveryService } from './emailDeliveryService';

export interface EmailSystemStatus {
  isConfigured: boolean;
  isWorking: boolean;
  issues: string[];
  fixes: string[];
  lastTested: string;
}

export class EmailSystemFixer {
  private static instance: EmailSystemFixer;
  private status: EmailSystemStatus = {
    isConfigured: false,
    isWorking: false,
    issues: [],
    fixes: [],
    lastTested: new Date().toISOString()
  };

  private constructor() {}

  public static getInstance(): EmailSystemFixer {
    if (!EmailSystemFixer.instance) {
      EmailSystemFixer.instance = new EmailSystemFixer();
    }
    return EmailSystemFixer.instance;
  }

  // Run comprehensive email system check and fix
  async runSystemCheck(): Promise<EmailSystemStatus> {
    console.log('🔍 Starting comprehensive email system check...');
    
    this.status = {
      isConfigured: false,
      isWorking: false,
      issues: [],
      fixes: [],
      lastTested: new Date().toISOString()
    };

    try {
      // Step 1: Check Supabase connection
      await this.checkSupabaseConnection();
      
      // Step 2: Check email configuration
      await this.checkEmailConfiguration();
      
      // Step 3: Test SMTP connection
      await this.testSMTPConnection();
      
      // Step 4: Test email sending
      await this.testEmailSending();
      
      // Step 5: Check email templates
      await this.checkEmailTemplates();
      
      // Step 6: Fix any issues found
      await this.fixIssues();
      
      // Determine overall status
      this.status.isConfigured = this.status.issues.length === 0 || 
        !this.status.issues.some(issue => issue.includes('configuration'));
      this.status.isWorking = this.status.issues.length === 0;
      
      console.log('✅ Email system check completed:', this.status);
      return this.status;
      
    } catch (error) {
      console.error('❌ Email system check failed:', error);
      this.status.issues.push(`System check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.status;
    }
  }

  private async checkSupabaseConnection(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('email_configurations').select('id').limit(1);
      
      if (error) {
        this.status.issues.push(`Supabase connection failed: ${error.message}`);
      } else {
        console.log('✅ Supabase connection OK');
      }
    } catch (error) {
      this.status.issues.push(`Supabase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkEmailConfiguration(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data: configs, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        this.status.issues.push(`Failed to load email configuration: ${error.message}`);
        return;
      }

      if (!configs || configs.length === 0) {
        this.status.issues.push('No active email configuration found');
        this.status.fixes.push('Create email configuration in Admin → Settings → Email Settings');
        return;
      }

      const config = configs[0];
      const missingFields = [];

      if (!config.smtp_host) missingFields.push('SMTP Host');
      if (!config.smtp_user) missingFields.push('SMTP User');
      if (!config.smtp_password) missingFields.push('SMTP Password');
      if (!config.from_email) missingFields.push('From Email');
      if (!config.from_name) missingFields.push('From Name');

      if (missingFields.length > 0) {
        this.status.issues.push(`Missing configuration fields: ${missingFields.join(', ')}`);
        this.status.fixes.push('Complete email configuration with all required fields');
      } else {
        console.log('✅ Email configuration complete');
      }
    } catch (error) {
      this.status.issues.push(`Configuration check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testSMTPConnection(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data: configs, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error || !configs || configs.length === 0) {
        this.status.issues.push('Cannot test SMTP - no configuration found');
        return;
      }

      const config = configs[0];
      
      // Test connection using the email service
      const result = await emailService.testConnection();
      
      if (!result.success) {
        this.status.issues.push(`SMTP connection failed: ${result.message}`);
        
        // Add specific fixes based on error
        if (result.message.includes('authentication')) {
          this.status.fixes.push('Check SMTP username and password');
          this.status.fixes.push('For Gmail, generate App Password in Google Account settings');
        } else if (result.message.includes('connection')) {
          this.status.fixes.push('Check SMTP host and port settings');
          this.status.fixes.push('Verify network connectivity');
        } else if (result.message.includes('TLS') || result.message.includes('SSL')) {
          this.status.fixes.push('Check SSL/TLS settings');
          this.status.fixes.push('Try port 587 for TLS or 465 for SSL');
        }
      } else {
        console.log('✅ SMTP connection OK');
      }
    } catch (error) {
      this.status.issues.push(`SMTP test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testEmailSending(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data: configs, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error || !configs || configs.length === 0) {
        this.status.issues.push('Cannot test email sending - no configuration found');
        return;
      }

      const config = configs[0];
      
      // Test sending to the configured email address
      const testResult = await emailService.sendTestEmail(config.from_email);
      
      if (!testResult) {
        this.status.issues.push('Test email sending failed');
        this.status.fixes.push('Check email sending permissions');
        this.status.fixes.push('Verify SMTP server allows sending from this address');
        this.status.fixes.push('Check for rate limiting or spam filters');
      } else {
        console.log('✅ Email sending test OK');
      }
    } catch (error) {
      this.status.issues.push(`Email sending test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkEmailTemplates(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data: templates, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        this.status.issues.push(`Failed to load email templates: ${error.message}`);
        return;
      }

      if (!templates || templates.length === 0) {
        this.status.issues.push('No active email templates found');
        this.status.fixes.push('Create email templates in Admin → Email Templates');
      } else {
        console.log(`✅ Found ${templates.length} active email templates`);
      }
    } catch (error) {
      this.status.issues.push(`Template check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fixIssues(): Promise<void> {
    console.log('🔧 Attempting to fix identified issues...');
    
    // Fix 1: Create default email configuration if missing
    if (this.status.issues.some(issue => issue.includes('No active email configuration'))) {
      await this.createDefaultEmailConfiguration();
    }

    // Fix 2: Create default email templates if missing
    if (this.status.issues.some(issue => issue.includes('No active email templates'))) {
      await this.createDefaultEmailTemplates();
    }

    // Fix 3: Retry failed emails
    if (this.status.issues.some(issue => issue.includes('email sending'))) {
      await this.retryFailedEmails();
    }
  }

  private async createDefaultEmailConfiguration(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // Check if any configuration exists
      const { data: existing } = await supabase
        .from('email_configurations')
        .select('id')
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('Email configuration already exists');
        return;
      }

      // Create default configuration
      const { error } = await supabase
        .from('email_configurations')
        .insert([{
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_user: 'your-email@gmail.com',
          smtp_password: 'your-app-password',
          enable_ssl: false,
          from_name: 'Luxe Staycations',
          from_email: 'info@luxestaycations.in',
          is_active: false, // Set to false so user must configure
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Failed to create default email configuration:', error);
      } else {
        console.log('✅ Created default email configuration');
        this.status.fixes.push('Default email configuration created - please configure in Admin → Settings → Email Settings');
      }
    } catch (error) {
      console.error('Error creating default email configuration:', error);
    }
  }

  private async createDefaultEmailTemplates(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // Check if templates exist
      const { data: existing } = await supabase
        .from('email_templates')
        .select('id')
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('Email templates already exist');
        return;
      }

      // Create default templates
      const defaultTemplates = [
        {
          name: 'Booking Confirmation',
          type: 'booking_confirmation',
          subject: '🎉 Booking Confirmed - {{bookingId}} | Luxe Staycations',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B4513;">Booking Confirmed!</h2>
              <p>Dear {{guestName}},</p>
              <p>Your booking has been confirmed. Booking ID: {{bookingId}}</p>
              <p>Property: {{propertyName}}</p>
              <p>Check-in: {{checkIn}}</p>
              <p>Check-out: {{checkOut}}</p>
              <p>Total Amount: {{totalAmount}}</p>
            </div>
          `,
          text_content: 'Booking Confirmed - {{bookingId}}. Property: {{propertyName}}. Check-in: {{checkIn}}. Check-out: {{checkOut}}. Total: {{totalAmount}}.',
          variables: ['guestName', 'bookingId', 'propertyName', 'checkIn', 'checkOut', 'totalAmount'],
          is_active: true,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          name: 'Contact Form Thank You',
          type: 'contact_form',
          subject: '🙏 Thank You for Contacting Us - {{subject}} | Luxe Staycations',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B4513;">Thank You for Contacting Us!</h2>
              <p>Dear {{name}},</p>
              <p>Thank you for your message. We will get back to you within 24 hours.</p>
              <p>Subject: {{subject}}</p>
              <p>Message: {{message}}</p>
            </div>
          `,
          text_content: 'Thank you for contacting us. Subject: {{subject}}. Message: {{message}}. We will respond within 24 hours.',
          variables: ['name', 'subject', 'message'],
          is_active: true,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('email_templates')
        .insert(defaultTemplates);

      if (error) {
        console.error('Failed to create default email templates:', error);
      } else {
        console.log('✅ Created default email templates');
        this.status.fixes.push('Default email templates created');
      }
    } catch (error) {
      console.error('Error creating default email templates:', error);
    }
  }

  private async retryFailedEmails(): Promise<void> {
    try {
      const result = await emailDeliveryService.retryFailedEmails();
      if (result.retried > 0) {
        console.log(`✅ Retried ${result.retried} failed emails, ${result.successful} successful`);
        this.status.fixes.push(`Retried ${result.retried} failed emails`);
      }
    } catch (error) {
      console.error('Error retrying failed emails:', error);
    }
  }

  // Get current system status
  getStatus(): EmailSystemStatus {
    return this.status;
  }

  // Force refresh status
  async refreshStatus(): Promise<EmailSystemStatus> {
    return await this.runSystemCheck();
  }
}

// Create singleton instance
export const emailSystemFixer = EmailSystemFixer.getInstance();
