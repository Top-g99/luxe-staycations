// Email Service for Luxe Staycations
// This service handles sending confirmation emails to guests

export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableSSL: boolean;
}

export interface BookingEmailData {
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
}

export class EmailService {
  private config: EmailConfig | null = null;
  private isConfigured = false;

  // Initialize email configuration
  configure(config: EmailConfig): void {
    this.config = config;
    this.isConfigured = true;
    console.log('Email service configured successfully');
  }

  // Check if email service is configured
  isEmailConfigured(): boolean {
    return this.isConfigured && this.config !== null;
  }

  // Get current configuration
  getConfig(): EmailConfig | null {
    return this.config;
  }

  // Send booking confirmation email
  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    if (!this.isConfigured || !this.config) {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      // For now, we'll simulate email sending
      // In production, this would integrate with a real email service like SendGrid, AWS SES, etc.
      
      const emailContent = this.generateBookingConfirmationEmail(data);
      
      // Simulate email sending process
      await this.simulateEmailSending(data.guestEmail, emailContent);
      
      console.log(`Booking confirmation email sent to ${data.guestEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return false;
    }
  }

  // Generate booking confirmation email content
  private generateBookingConfirmationEmail(data: BookingEmailData): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Luxe Staycations</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f3f4f6;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #5a3d35;
            margin-bottom: 10px;
        }
        .tagline {
            color: #d97706;
            font-size: 16px;
            font-style: italic;
        }
        .success-icon {
            font-size: 48px;
            color: #4caf50;
            margin-bottom: 20px;
        }
        .booking-id {
            background-color: #f8f9fa;
            border: 2px solid #4caf50;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .booking-id-label {
            color: #4caf50;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .booking-id-value {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #5a3d35;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .section-title {
            color: #d97706;
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-title::before {
            content: "📋";
            margin-right: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-label {
            font-weight: 600;
            color: #5a3d35;
        }
        .info-value {
            color: #333;
        }
        .payment-summary {
            background-color: #e8f5e8;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #4caf50;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f3f4f6;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(45deg, #5a3d35, #d97706);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover {
            background: linear-gradient(45deg, #4a332c, #b45309);
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">LUXE STAYCATIONS</div>
            <div class="tagline">Luxury Redefined</div>
        </div>

        <div style="text-align: center;">
            <div class="success-icon">✅</div>
            <h1 style="color: #5a3d35; margin-bottom: 10px;">Booking Confirmed!</h1>
            <p style="color: #666; font-size: 18px;">Thank you for choosing Luxe Staycations</p>
        </div>

        <div class="booking-id">
            <div class="booking-id-label">Your Booking ID</div>
            <div class="booking-id-value">${data.bookingId}</div>
        </div>

        <div class="section">
            <div class="section-title">Property Details</div>
            <div class="info-row">
                <span class="info-label">Property Name:</span>
                <span class="info-value">${data.propertyName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${data.propertyLocation}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Stay Details</div>
            <div class="info-row">
                <span class="info-label">Check-in Date:</span>
                <span class="info-value">${formatDate(data.checkIn)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Check-out Date:</span>
                <span class="info-value">${formatDate(data.checkOut)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Number of Guests:</span>
                <span class="info-value">${data.guests}</span>
            </div>
        </div>

        <div class="payment-summary">
            <div class="section-title">Payment Summary</div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${data.paymentMethod}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${data.transactionId}</span>
            </div>
            <div class="total-amount">
                Total Amount: ₹${data.totalAmount.toLocaleString()}
            </div>
        </div>

        <div class="contact-info">
            <div class="section-title">Important Information</div>
            <p><strong>Check-in Instructions:</strong></p>
            <ul>
                <li>Check-in time: 3:00 PM</li>
                <li>Please bring a valid government-issued ID</li>
                <li>Contact the host 1 hour before arrival</li>
                <li>Early check-in is subject to availability</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/guest/dashboard" class="btn">
                Manage My Booking
            </a>
            <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}" class="btn">
                Visit Our Website
            </a>
        </div>

        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>Email: support@luxestaycations.com</p>
            <p>Phone: +91-98765-43210</p>
            <p>Available 24/7 for urgent matters</p>
            <br>
            <p>© 2024 Luxe Staycations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    return emailContent;
  }

  // Simulate email sending (replace with actual email service integration)
  private async simulateEmailSending(toEmail: string, content: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, replace this with actual email service integration:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Mailgun
    // - etc.
    
    console.log('📧 Email Simulation:');
    console.log(`To: ${toEmail}`);
    console.log('Subject: Booking Confirmation - Luxe Staycations');
    console.log('Content: HTML email with booking details');
    console.log('Status: Email sent successfully (simulated)');
  }

  // Send test email to verify configuration
  async sendTestEmail(toEmail: string): Promise<boolean> {
    if (!this.isConfigured || !this.config) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const testData: BookingEmailData = {
        guestName: 'Test User',
        guestEmail: toEmail,
        bookingId: 'TEST_BOOKING_123',
        propertyName: 'Test Villa',
        propertyLocation: 'Test Location',
        checkIn: '2025-01-15',
        checkOut: '2025-01-17',
        guests: '2',
        totalAmount: 50000,
        transactionId: 'TEST_TXN_123',
        paymentMethod: 'Credit Card'
      };

      return await this.sendBookingConfirmation(testData);
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }
}

// Create singleton instance
export const emailService = new EmailService();

// Default configuration (to be updated in production)
export const defaultEmailConfig: EmailConfig = {
  fromEmail: 'noreply@luxestaycations.com',
  fromName: 'Luxe Staycations',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'your-email@gmail.com',
  smtpPassword: 'your-app-password',
  enableSSL: true
};


