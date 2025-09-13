interface BrevoEmailData {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { email: string; name: string };
  replyTo?: { email: string; name: string };
}

interface BrevoResponse {
  messageId: string;
}

class BrevoEmailService {
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3/smtp/email';
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@luxestaycations.in';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Luxe Staycations';
  }

  async sendEmail(emailData: BrevoEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        console.error('Brevo API key not configured');
        return { success: false, error: 'Email service not configured' };
      }

      const payload = {
        sender: emailData.sender || { email: this.senderEmail, name: this.senderName },
        to: emailData.to,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent || this.stripHtml(emailData.htmlContent),
        replyTo: emailData.replyTo || { email: this.senderEmail, name: this.senderName }
      };

      console.log('Sending email via Brevo:', {
        to: emailData.to.map(t => t.email).join(', '),
        subject: emailData.subject
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Brevo API error:', errorData);
        return { 
          success: false, 
          error: `Brevo API error: ${response.status} - ${errorData.message || 'Unknown error'}` 
        };
      }

      const result: BrevoResponse = await response.json();
      console.log('Email sent successfully:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId 
      };

    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Test email functionality
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const testEmailData: BrevoEmailData = {
      to: [{ email: toEmail, name: 'Test User' }],
      subject: 'Test Email from Luxe Staycations',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Test Email</h2>
          <p>This is a test email from Luxe Staycations to verify email functionality.</p>
          <p>If you received this email, the Brevo integration is working correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Sent from Luxe Staycations Email System
          </p>
        </div>
      `
    };

    return this.sendEmail(testEmailData);
  }
}

export const brevoEmailService = new BrevoEmailService();
export default brevoEmailService;
