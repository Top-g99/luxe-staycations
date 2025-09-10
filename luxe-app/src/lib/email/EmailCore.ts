// Core Email Service with Supabase Integration
// Handles all email operations with proper error handling and retry logic

import { getSupabaseClient, TABLES } from '../supabase';
import nodemailer from 'nodemailer';
import { EmailTemplate, EmailConfig, EmailQueueItem, EmailLog } from './types';

export class EmailCore {
  private static instance: EmailCore;
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;
  private isInitialized = false;
  private retryAttempts = 3;
  private retryDelay = 5000; // 5 seconds

  private constructor() {}

  public static getInstance(): EmailCore {
    if (!EmailCore.instance) {
      EmailCore.instance = new EmailCore();
    }
    return EmailCore.instance;
  }

  // Initialize the email service
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing EmailCore...');
      
      // Load configuration from Supabase
      await this.loadConfiguration();
      
      if (!this.config) {
        console.error('No email configuration found');
        return false;
      }

      // Create transporter
      this.transporter = this.createTransporter();
      
      // Test connection
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('EmailCore initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize EmailCore:', error);
      return false;
    }
  }

  // Load configuration from Supabase
  private async loadConfiguration(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_CONFIGURATIONS)
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading email configuration:', error);
        throw error;
      }

      if (data) {
        this.config = {
          id: data.id,
          smtpHost: data.smtp_host,
          smtpPort: data.smtp_port,
          smtpUser: data.smtp_user,
          smtpPassword: data.smtp_password,
          enableSSL: data.enable_ssl,
          fromName: data.from_name,
          fromEmail: data.from_email,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        console.log('Email configuration loaded from Supabase');
      } else {
        throw new Error('No active email configuration found');
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
      throw error;
    }
  }

  // Create nodemailer transporter
  private createTransporter(): nodemailer.Transporter {
    if (!this.config) {
      throw new Error('Email configuration not loaded');
    }

    return nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.enableSSL,
      auth: {
        user: this.config.smtpUser,
        pass: this.config.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    });
  }

  // Test SMTP connection
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return { success: false, message: 'Email service not initialized' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `SMTP connection failed: ${errorMessage}` };
    }
  }

  // Send email with retry logic
  public async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
    templateId?: string,
    variables?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.config) {
      return { success: false, error: 'Email service not initialized' };
    }

    const emailData = {
      from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || this.stripHtml(html),
      headers: {
        'X-Mailer': 'Luxe Staycations Email System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    };

    // Log email attempt
    const logId = await this.logEmailAttempt(to, subject, templateId, variables);

    // Retry logic
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const info = await this.transporter.sendMail(emailData);
        
        // Log success
        await this.logEmailSuccess(logId, info.messageId);
        
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`Email send attempt ${attempt} failed:`, error);
        
        if (attempt === this.retryAttempts) {
          // Log final failure
          await this.logEmailFailure(logId, error);
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
        
        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }

    return { success: false, error: 'All retry attempts failed' };
  }

  // Send email using template
  public async sendTemplateEmail(
    to: string | string[],
    templateId: string,
    variables: Record<string, any> = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const processedContent = this.processTemplate(template, variables);
      
      return await this.sendEmail(
        to,
        processedContent.subject,
        processedContent.html,
        processedContent.text,
        templateId,
        variables
      );
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get template from Supabase
  private async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.EMAIL_TEMPLATES)
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        subject: data.subject,
        htmlContent: data.html_content,
        textContent: data.text_content,
        variables: data.variables || [],
        isActive: data.is_active,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  // Process template with variables
  private processTemplate(template: EmailTemplate, variables: Record<string, any>): {
    subject: string;
    html: string;
    text: string;
  } {
    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent || this.stripHtml(html);

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder, 'g');
      subject = subject.replace(regex, String(value));
      html = html.replace(regex, String(value));
      text = text.replace(regex, String(value));
    });

    return { subject, html, text };
  }

  // Log email attempt
  private async logEmailAttempt(
    to: string | string[],
    subject: string,
    templateId?: string,
    variables?: Record<string, any>
  ): Promise<string> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('email_logs')
        .insert({
          to_email: Array.isArray(to) ? to.join(', ') : to,
          subject,
          template_id: templateId,
          variables: variables || {},
          status: 'pending',
          attempt_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging email attempt:', error);
        return '';
      }

      return data.id;
    } catch (error) {
      console.error('Error logging email attempt:', error);
      return '';
    }
  }

  // Log email success
  private async logEmailSuccess(logId: string, messageId: string): Promise<void> {
    if (!logId) return;

    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          message_id: messageId,
          sent_at: new Date().toISOString()
        })
        .eq('id', logId);
    } catch (error) {
      console.error('Error logging email success:', error);
    }
  }

  // Log email failure
  private async logEmailFailure(logId: string, error: any): Promise<void> {
    if (!logId) return;

    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
          failed_at: new Date().toISOString()
        })
        .eq('id', logId);
    } catch (error) {
      console.error('Error logging email failure:', error);
    }
  }

  // Strip HTML tags for text content
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get configuration
  public getConfig(): EmailConfig | null {
    return this.config;
  }

  // Check if initialized
  public isReady(): boolean {
    return this.isInitialized && this.transporter !== null;
  }
}

// Export singleton instance
export const emailCore = EmailCore.getInstance();
