// Brevo Automated Workflows for Luxe Staycations
// This service handles automated email sequences and triggers
// Integrates with existing email template management system

import { brevoEmailService } from './brevoEmailService';
import { integratedEmailService } from './integratedEmailService';
import { getSupabaseClient } from './supabase';
import { getEmailDomainUrl } from './domainConfig';

export interface BookingJourneyData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  propertyName: string;
  propertyLocation: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  totalAmount: number;
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  propertyAddress?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface LoyaltyJourneyData {
  guestName: string;
  guestEmail: string;
  currentPoints: number;
  tierLevel: string;
  nextTierPoints: number;
  recentBookings: number;
  totalSpent: number;
}

export class BrevoWorkflows {
  private static instance: BrevoWorkflows;

  private constructor() {}

  public static getInstance(): BrevoWorkflows {
    if (!BrevoWorkflows.instance) {
      BrevoWorkflows.instance = new BrevoWorkflows();
    }
    return BrevoWorkflows.instance;
  }

  // Automated Booking Journey - Step 1: Immediate Confirmation
  public async triggerBookingConfirmation(data: BookingJourneyData): Promise<boolean> {
    try {
      // Use integrated email service (Brevo with fallback)
      const result = await integratedEmailService.sendBookingConfirmation({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        bookingId: data.bookingId,
        propertyName: data.propertyName,
        propertyLocation: data.propertyLocation,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        totalAmount: data.totalAmount,
        transactionId: `TXN-${data.bookingId}`,
        paymentMethod: 'Online Payment',
        hostName: data.hostName,
        hostPhone: data.hostPhone,
        hostEmail: data.hostEmail
      });

      // Log the workflow trigger to Supabase
      await this.logWorkflowTrigger('booking_confirmation', data.guestEmail, result.success, {
        bookingId: data.bookingId,
        propertyName: data.propertyName,
        provider: result.provider
      });
      
      return result.success;
    } catch (error) {
      console.error('Error triggering booking confirmation workflow:', error);
      return false;
    }
  }

  // Automated Booking Journey - Step 2: Pre-arrival Reminder (24 hours before)
  public async triggerPreArrivalReminder(data: BookingJourneyData): Promise<boolean> {
    try {
      const result = await brevoEmailService.sendBookingReminder({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        bookingId: data.bookingId,
        propertyName: data.propertyName,
        checkInDate: data.checkIn,
        checkOutDate: data.checkOut,
        guestCount: data.guests,
        checkInTime: data.checkInTime || '3:00 PM',
        checkOutTime: data.checkOutTime || '11:00 AM',
        propertyAddress: data.propertyAddress || 'Property Address',
        hostPhone: data.hostPhone || '+91-9876543210',
        bookingLink: getEmailDomainUrl(`/booking/confirmation/${data.bookingId}`)
      });

      // Log the workflow trigger
      await this.logWorkflowTrigger('pre_arrival_reminder', data.guestEmail, result.success);
      
      return result.success;
    } catch (error) {
      console.error('Error triggering pre-arrival reminder workflow:', error);
      return false;
    }
  }

  // Automated Booking Journey - Step 3: Post-stay Follow-up (24 hours after checkout)
  public async triggerPostStayFollowUp(data: BookingJourneyData): Promise<boolean> {
    try {
      const result = await brevoEmailService.sendEmail({
        to: data.guestEmail,
        subject: `How was your stay at ${data.propertyName}? 🌟`,
        htmlContent: this.generatePostStayFollowUpHTML(data),
        textContent: this.generatePostStayFollowUpText(data),
        tags: ['post-stay', 'follow-up'],
        params: {
          guestName: data.guestName,
          propertyName: data.propertyName,
          bookingId: data.bookingId
        }
      });

      // Log the workflow trigger
      await this.logWorkflowTrigger('post_stay_followup', data.guestEmail, result.success);
      
      return result.success;
    } catch (error) {
      console.error('Error triggering post-stay follow-up workflow:', error);
      return false;
    }
  }

  // Loyalty Program Journey - Welcome New Member
  public async triggerLoyaltyWelcome(data: LoyaltyJourneyData): Promise<boolean> {
    try {
      const result = await brevoEmailService.sendLoyaltyWelcome({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        currentPoints: data.currentPoints,
        rewardsDashboardLink: getEmailDomainUrl('/loyalty')
      });

      // Log the workflow trigger
      await this.logWorkflowTrigger('loyalty_welcome', data.guestEmail, result.success);
      
      return result.success;
    } catch (error) {
      console.error('Error triggering loyalty welcome workflow:', error);
      return false;
    }
  }

  // Loyalty Program Journey - Tier Upgrade Notification
  public async triggerTierUpgrade(data: LoyaltyJourneyData): Promise<boolean> {
    try {
      const result = await brevoEmailService.sendEmail({
        to: data.guestEmail,
        subject: `🎉 Congratulations! You've reached ${data.tierLevel} status!`,
        htmlContent: this.generateTierUpgradeHTML(data),
        textContent: this.generateTierUpgradeText(data),
        tags: ['loyalty', 'tier-upgrade'],
        params: {
          guestName: data.guestName,
          tierLevel: data.tierLevel,
          currentPoints: data.currentPoints
        }
      });

      // Log the workflow trigger
      await this.logWorkflowTrigger('tier_upgrade', data.guestEmail, result.success);
      
      return result.success;
    } catch (error) {
      console.error('Error triggering tier upgrade workflow:', error);
      return false;
    }
  }

  // Newsletter Campaign - Property Updates
  public async triggerPropertyUpdateNewsletter(recipients: string[], propertyData: any): Promise<boolean> {
    try {
      const results = await Promise.all(
        recipients.map(async (email) => {
          const result = await brevoEmailService.sendMarketingNewsletter({
            guestName: 'Valued Guest',
            guestEmail: email,
            newsletterTitle: 'New Luxury Property Added!',
            newsletterContent: `We're excited to announce our latest addition to the Luxe Staycations collection. ${propertyData.name} offers unparalleled luxury and comfort.`,
            featuredPropertyName: propertyData.name,
            featuredPropertyDescription: propertyData.description,
            featuredPropertyPrice: propertyData.price,
            ctaText: 'View Property',
            ctaLink: getEmailDomainUrl(`/villas/${propertyData.id}`)
          });
          return result.success;
        })
      );

      const successCount = results.filter(r => r).length;
      console.log(`Newsletter sent to ${successCount}/${recipients.length} recipients`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Error triggering property update newsletter:', error);
      return false;
    }
  }

  // Log workflow triggers for analytics - saves to Supabase
  private async logWorkflowTrigger(workflowType: string, email: string, success: boolean, metadata?: any): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // First, ensure the table exists
      await this.ensureWorkflowLogsTable();
      
      const { error } = await supabase
        .from('brevo_workflow_logs')
        .insert([{
          workflow_type: workflowType,
          recipient_email: email,
          success: success,
          triggered_at: new Date().toISOString(),
          metadata: metadata || {},
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error logging workflow trigger to Supabase:', error);
      } else {
        console.log(`Workflow trigger logged: ${workflowType} for ${email}`);
      }
    } catch (error) {
      console.error('Error logging workflow trigger:', error);
    }
  }

  // Ensure workflow logs table exists in Supabase
  private async ensureWorkflowLogsTable(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      
      // Try to create the table if it doesn't exist
      const { error } = await supabase.rpc('create_brevo_workflow_logs_table');
      
      if (error && !error.message.includes('already exists')) {
        console.error('Error creating workflow logs table:', error);
      }
    } catch (error) {
      console.error('Error ensuring workflow logs table:', error);
    }
  }

  // Generate post-stay follow-up HTML
  private generatePostStayFollowUpHTML(data: BookingJourneyData): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🏖️ Luxe Staycations</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing us!</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">How was your stay? 🌟</h2>
          
          <p>Dear ${data.guestName},</p>
          
          <p>We hope you had an amazing time at <strong>${data.propertyName}</strong>! Your feedback is incredibly valuable to us and helps us improve our services.</p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #5a3d35;">We'd love to hear from you!</h3>
            <p>Please take a moment to share your experience with us.</p>
            <a href="${getEmailDomainUrl(`/review/${data.bookingId}`)}" 
               style="background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin: 10px;">
              Leave a Review
            </a>
          </div>
          
          <p>Your review helps other guests discover the perfect luxury getaway and helps us maintain our high standards.</p>
          
          <p>Thank you for choosing Luxe Staycations. We look forward to welcoming you back soon!</p>
          
          <p>Best regards,<br>
          <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div style="background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center;">
          <p><strong>Luxe Staycations</strong></p>
          <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
          <p><a href="${getEmailDomainUrl()}" style="color: #d97706; text-decoration: none;">${getEmailDomainUrl().replace('https://', '')}</a></p>
        </div>
      </div>
    `;
  }

  // Generate post-stay follow-up text
  private generatePostStayFollowUpText(data: BookingJourneyData): string {
    return `
POST-STAY FOLLOW-UP - Luxe Staycations

Dear ${data.guestName},

We hope you had an amazing time at ${data.propertyName}!

We'd love to hear from you! Please take a moment to share your experience with us.

Leave a review: ${getEmailDomainUrl(`/review/${data.bookingId}`)}

Your review helps other guests discover the perfect luxury getaway and helps us maintain our high standards.

Thank you for choosing Luxe Staycations. We look forward to welcoming you back soon!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
${getEmailDomainUrl().replace('https://', '')}
    `;
  }

  // Generate tier upgrade HTML
  private generateTierUpgradeHTML(data: LoyaltyJourneyData): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🏖️ Luxe Staycations</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Loyalty Program</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">🎉 Congratulations! You've reached ${data.tierLevel} status!</h2>
          
          <p>Dear ${data.guestName},</p>
          
          <p>We're thrilled to announce that you've been upgraded to <strong>${data.tierLevel}</strong> status in our Luxe Rewards program!</p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 36px; font-weight: bold; color: #d97706;">${data.currentPoints}</div>
            <p style="color: #5a3d35; margin: 5px 0;">Luxe Points</p>
            <p style="color: #666;">You're now a ${data.tierLevel} member!</p>
          </div>
          
          <h3 style="color: #5a3d35;">Your New Benefits:</h3>
          <ul>
            <li>🎯 Priority booking and upgrades</li>
            <li>💎 Exclusive member-only rates</li>
            <li>🌟 Complimentary amenities and services</li>
            <li>📱 Early access to new properties</li>
            <li>🎁 Special birthday and anniversary offers</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getEmailDomainUrl('/loyalty')}" 
               style="background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Your Rewards
            </a>
          </div>
          
          <p>Thank you for your loyalty and continued trust in Luxe Staycations!</p>
          
          <p>Best regards,<br>
          <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div style="background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center;">
          <p><strong>Luxe Staycations</strong></p>
          <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
          <p><a href="${getEmailDomainUrl()}" style="color: #d97706; text-decoration: none;">${getEmailDomainUrl().replace('https://', '')}</a></p>
        </div>
      </div>
    `;
  }

  // Generate tier upgrade text
  private generateTierUpgradeText(data: LoyaltyJourneyData): string {
    return `
TIER UPGRADE - Luxe Staycations

Dear ${data.guestName},

Congratulations! You've been upgraded to ${data.tierLevel} status in our Luxe Rewards program!

Your current points: ${data.currentPoints} Luxe Points

YOUR NEW BENEFITS:
- Priority booking and upgrades
- Exclusive member-only rates
- Complimentary amenities and services
- Early access to new properties
- Special birthday and anniversary offers

View your rewards: ${getEmailDomainUrl('/loyalty')}

Thank you for your loyalty and continued trust in Luxe Staycations!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
${getEmailDomainUrl().replace('https://', '')}
    `;
  }
}

// Create singleton instance
export const brevoWorkflows = BrevoWorkflows.getInstance();
