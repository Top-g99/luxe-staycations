import { brevoEmailService } from './brevoService';
import { EmailTemplates } from './emailTemplates';

interface BookingConfirmationData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  propertyName: string;
  propertyLocation: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
  hostName: string;
  hostPhone: string;
  hostEmail: string;
  specialRequests?: string;
}

interface SpecialRequestData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  propertyName: string;
  requestType: string;
  description: string;
  urgency: string;
  requestId: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export class EmailService {
  private adminEmail: string;

  constructor() {
    this.adminEmail = process.env.BREVO_ADMIN_EMAIL || 'admin@luxestaycations.in';
  }

  async sendBookingConfirmation(data: BookingConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('Sending booking confirmation email to:', data.guestEmail);
      
      const htmlContent = EmailTemplates.getBookingConfirmationTemplate(data);
      
      const result = await brevoEmailService.sendEmail({
        to: [{ email: data.guestEmail, name: data.guestName }],
        subject: `Booking Confirmed - ${data.propertyName} | ${data.bookingId}`,
        htmlContent
      });

      if (result.success) {
        console.log('Booking confirmation email sent successfully:', result.messageId);
      } else {
        console.error('Failed to send booking confirmation email:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error in sendBookingConfirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendSpecialRequestConfirmation(data: SpecialRequestData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('Sending special request confirmation email to:', data.guestEmail);
      
      const htmlContent = EmailTemplates.getSpecialRequestTemplate(data);
      
      const result = await brevoEmailService.sendEmail({
        to: [{ email: data.guestEmail, name: data.guestName }],
        subject: `Special Request Received - ${data.propertyName} | ${data.requestId}`,
        htmlContent
      });

      if (result.success) {
        console.log('Special request confirmation email sent successfully:', result.messageId);
        
        // Also send admin notification
        await this.sendAdminNotification({
          to: [{ email: this.adminEmail, name: 'Admin' }],
          subject: `New Special Request - ${data.propertyName}`,
          htmlContent: `
            <h2>New Special Request</h2>
            <p><strong>Guest:</strong> ${data.guestName} (${data.guestEmail})</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Request Type:</strong> ${data.requestType}</p>
            <p><strong>Urgency:</strong> ${data.urgency}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Request ID:</strong> ${data.requestId}</p>
          `
        });
      } else {
        console.error('Failed to send special request confirmation email:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error in sendSpecialRequestConfirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendContactFormNotification(data: ContactFormData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('Sending contact form notification to admin');
      
      const htmlContent = EmailTemplates.getContactFormTemplate(data);
      
      const result = await brevoEmailService.sendEmail({
        to: [{ email: this.adminEmail, name: 'Admin' }],
        subject: `New Contact Form: ${data.subject}`,
        htmlContent
      });

      if (result.success) {
        console.log('Contact form notification sent successfully:', result.messageId);
      } else {
        console.error('Failed to send contact form notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error in sendContactFormNotification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendTestEmail(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('Sending test email to:', toEmail);
      return await brevoEmailService.sendTestEmail(toEmail);
    } catch (error) {
      console.error('Error in sendTestEmail:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async sendAdminNotification(data: { to: Array<{ email: string; name: string }>; subject: string; htmlContent: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      return await brevoEmailService.sendEmail({
        to: data.to,
        subject: data.subject,
        htmlContent: data.htmlContent
      });
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
