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

export class EmailTemplates {
  static getBookingConfirmationTemplate(data: BookingConfirmationData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your luxury staycation awaits</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${data.guestName}!</h2>
          <p>We're thrilled to confirm your booking at <strong>${data.propertyName}</strong>. Here are your booking details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Property:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.propertyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.propertyLocation}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Check-in:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.checkIn}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Check-out:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.checkOut}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.guests}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">₹${data.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
                <td style="padding: 8px 0;">${data.transactionId}</td>
              </tr>
            </table>
          </div>

          ${data.specialRequests ? `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #2c3e50; margin-top: 0;">Special Requests</h4>
              <p style="margin: 0;">${data.specialRequests}</p>
            </div>
          ` : ''}

          <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information</h3>
            <p><strong>Host:</strong> ${data.hostName}</p>
            <p><strong>Phone:</strong> ${data.hostPhone}</p>
            <p><strong>Email:</strong> ${data.hostEmail}</p>
          </div>

          <p>We look forward to providing you with an exceptional staycation experience. If you have any questions or need assistance, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://luxestaycations.in" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Visit Our Website</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
            © 2024 Luxe Staycations. All rights reserved.<br>
            This email was sent to ${data.guestEmail}
          </p>
        </div>
      </div>
    `;
  }

  static getSpecialRequestTemplate(data: SpecialRequestData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Special Request Received</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">We'll review your request shortly</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${data.guestName}!</h2>
          <p>Thank you for submitting your special request. We've received the following details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Request ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.requestId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Property:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.propertyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Request Type:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.requestType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Urgency:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.urgency}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2c3e50; margin-top: 0;">Your Request</h4>
            <p style="margin: 0;">${data.description}</p>
          </div>

          <p>Our team will review your request and get back to you within 24 hours. We'll do our best to accommodate your needs and make your stay as comfortable as possible.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://luxestaycations.in" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Visit Our Website</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
            © 2024 Luxe Staycations. All rights reserved.<br>
            This email was sent to ${data.guestEmail}
          </p>
        </div>
      </div>
    `;
  }

  static getContactFormTemplate(data: ContactFormData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">From website contact form</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #2c3e50; margin-top: 0;">Contact Form Details</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.email}</td>
              </tr>
              ${data.phone ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.phone}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.subject}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2c3e50; margin-top: 0;">Message</h4>
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>

          <p><strong>Action Required:</strong> Please respond to this inquiry as soon as possible.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
            © 2024 Luxe Staycations. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}
