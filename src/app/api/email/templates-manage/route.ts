import { NextRequest, NextResponse } from 'next/server';

// Comprehensive email templates for Luxe Staycations
const emailTemplates = [
  // BOOKING TEMPLATES
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    type: 'booking_confirmation',
    subject: '🎉 Booking Confirmed - {{propertyName}} | Luxe Staycations',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5a3d35 0%, #8b4513 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your luxury villa getaway is confirmed</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">Booking Details</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Property:</strong>
              <span>{{propertyName}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Check-in:</strong>
              <span>{{checkInDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Check-out:</strong>
              <span>{{checkOutDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Guests:</strong>
              <span>{{guestCount}} guests</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Total Amount:</strong>
              <span style="color: #5a3d35; font-weight: bold;">₹{{totalAmount}}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Booking ID:</strong>
              <span style="font-family: monospace;">{{bookingId}}</span>
            </div>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">What's Next?</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>You'll receive check-in instructions 24 hours before arrival</li>
            <li>Our concierge team will contact you to arrange any special requests</li>
            <li>Download our mobile app for easy access to your booking details</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{bookingLink}}" style="background: #5a3d35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking Details</a>
          </div>
        </div>

        <div style="background: #5a3d35; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Need assistance? Contact us at <strong>+91-9876543210</strong> or <strong>info@luxestaycations.in</strong></p>
        </div>
      </div>
    `,
    textContent: `Booking Confirmed - {{propertyName}}\n\nBooking Details:\nProperty: {{propertyName}}\nCheck-in: {{checkInDate}}\nCheck-out: {{checkOutDate}}\nGuests: {{guestCount}}\nTotal: ₹{{totalAmount}}\nBooking ID: {{bookingId}}\n\nView details: {{bookingLink}}`,
    variables: ['propertyName', 'checkInDate', 'checkOutDate', 'guestCount', 'totalAmount', 'bookingId', 'bookingLink'],
    isActive: true,
    isDefault: true
  },

  {
    id: 'booking_cancellation',
    name: 'Booking Cancellation',
    type: 'booking_cancellation',
    subject: 'Booking Cancelled - {{propertyName}} | Luxe Staycations',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: #dc3545; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Cancelled</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your booking has been cancelled</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">Cancellation Details</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Property:</strong>
              <span>{{propertyName}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Original Check-in:</strong>
              <span>{{checkInDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Original Check-out:</strong>
              <span>{{checkOutDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Booking ID:</strong>
              <span style="font-family: monospace;">{{bookingId}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Refund Amount:</strong>
              <span style="color: #28a745; font-weight: bold;">₹{{refundAmount}}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Refund Status:</strong>
              <span style="color: #28a745;">{{refundStatus}}</span>
            </div>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">Refund Information</h3>
          <p style="color: #333; line-height: 1.6;">{{refundMessage}}</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{bookingLink}}" style="background: #5a3d35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Cancellation Details</a>
          </div>
        </div>

        <div style="background: #5a3d35; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Questions about your cancellation? Contact us at <strong>+91-9876543210</strong></p>
        </div>
      </div>
    `,
    textContent: `Booking Cancelled - {{propertyName}}\n\nCancellation Details:\nProperty: {{propertyName}}\nCheck-in: {{checkInDate}}\nCheck-out: {{checkOutDate}}\nBooking ID: {{bookingId}}\nRefund: ₹{{refundAmount}}\nStatus: {{refundStatus}}\n\n{{refundMessage}}`,
    variables: ['propertyName', 'checkInDate', 'checkOutDate', 'bookingId', 'refundAmount', 'refundStatus', 'refundMessage', 'bookingLink'],
    isActive: true,
    isDefault: true
  },

  // PAYMENT TEMPLATES
  {
    id: 'payment_confirmation',
    name: 'Payment Confirmation',
    type: 'payment_confirmation',
    subject: 'Payment Confirmed - ₹{{amount}} | Luxe Staycations',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: #28a745; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your payment has been processed successfully</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">Payment Details</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Transaction ID:</strong>
              <span style="font-family: monospace;">{{transactionId}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Amount Paid:</strong>
              <span style="color: #28a745; font-weight: bold; font-size: 18px;">₹{{amount}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Payment Method:</strong>
              <span>{{paymentMethod}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Date:</strong>
              <span>{{paymentDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Status:</strong>
              <span style="color: #28a745; font-weight: bold;">{{paymentStatus}}</span>
            </div>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">Booking Reference</h3>
          <p style="color: #333; line-height: 1.6;">This payment is for booking <strong>{{bookingId}}</strong> at <strong>{{propertyName}}</strong></p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{receiptLink}}" style="background: #5a3d35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Receipt</a>
          </div>
        </div>

        <div style="background: #5a3d35; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Need help? Contact us at <strong>+91-9876543210</strong></p>
        </div>
      </div>
    `,
    textContent: `Payment Confirmed - ₹{{amount}}\n\nTransaction ID: {{transactionId}}\nAmount: ₹{{amount}}\nMethod: {{paymentMethod}}\nDate: {{paymentDate}}\nStatus: {{paymentStatus}}\n\nBooking: {{bookingId}} at {{propertyName}}\n\nReceipt: {{receiptLink}}`,
    variables: ['amount', 'transactionId', 'paymentMethod', 'paymentDate', 'paymentStatus', 'bookingId', 'propertyName', 'receiptLink'],
    isActive: true,
    isDefault: true
  },

  // GUEST TEMPLATES
  {
    id: 'guest_welcome',
    name: 'Guest Welcome',
    type: 'guest_welcome',
    subject: 'Welcome to {{propertyName}} - Check-in Instructions | Luxe Staycations',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5a3d35 0%, #8b4513 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏡 Welcome to {{propertyName}}!</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your luxury villa awaits</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">Check-in Instructions</h2>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">📍 Property Address</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">{{propertyAddress}}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #5a3d35; margin-top: 0;">🔑 Check-in Details</h3>
            <ul style="color: #333; line-height: 1.8;">
              <li><strong>Check-in Time:</strong> {{checkInTime}}</li>
              <li><strong>Check-out Time:</strong> {{checkOutTime}}</li>
              <li><strong>Key Collection:</strong> {{keyCollectionMethod}}</li>
              <li><strong>Contact Person:</strong> {{hostContact}}</li>
            </ul>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Important Reminders</h3>
            <ul style="color: #856404; line-height: 1.6;">
              <li>Please bring a valid ID for verification</li>
              <li>No smoking inside the property</li>
              <li>Respect the neighborhood quiet hours (10 PM - 7 AM)</li>
              <li>Report any issues immediately to our support team</li>
            </ul>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">🏖️ What's Included</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">🏊‍♀️</div>
              <div style="font-size: 14px; color: #333;">Private Pool</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">🚗</div>
              <div style="font-size: 14px; color: #333;">Parking</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">📶</div>
              <div style="font-size: 14px; color: #333;">WiFi</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">🍽️</div>
              <div style="font-size: 14px; color: #333;">Kitchen</div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{propertyLink}}" style="background: #5a3d35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">View Property</a>
            <a href="{{supportLink}}" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Support</a>
          </div>
        </div>

        <div style="background: #5a3d35; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Emergency Contact: <strong>+91-9876543210</strong> | <strong>info@luxestaycations.in</strong></p>
        </div>
      </div>
    `,
    textContent: `Welcome to {{propertyName}}!\n\nCheck-in Instructions:\nAddress: {{propertyAddress}}\nCheck-in: {{checkInTime}}\nCheck-out: {{checkOutTime}}\nKey Collection: {{keyCollectionMethod}}\nHost Contact: {{hostContact}}\n\nProperty Link: {{propertyLink}}\nSupport: {{supportLink}}`,
    variables: ['propertyName', 'propertyAddress', 'checkInTime', 'checkOutTime', 'keyCollectionMethod', 'hostContact', 'propertyLink', 'supportLink'],
    isActive: true,
    isDefault: true
  },

  // HOST TEMPLATES
  {
    id: 'host_booking_alert',
    name: 'Host Booking Alert',
    type: 'host_booking_alert',
    subject: 'New Booking Alert - {{propertyName}} | Luxe Staycations',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: #17a2b8; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔔 New Booking Alert</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">You have a new booking for your property</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">Booking Details</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Property:</strong>
              <span>{{propertyName}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Guest Name:</strong>
              <span>{{guestName}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Check-in:</strong>
              <span>{{checkInDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Check-out:</strong>
              <span>{{checkOutDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Guests:</strong>
              <span>{{guestCount}} guests</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Booking ID:</strong>
              <span style="font-family: monospace;">{{bookingId}}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Your Earnings:</strong>
              <span style="color: #28a745; font-weight: bold; font-size: 18px;">₹{{hostEarnings}}</span>
            </div>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">Guest Information</h3>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> {{guestName}}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> {{guestEmail}}</p>
            <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> {{guestPhone}}</p>
            <p style="margin: 0;"><strong>Special Requests:</strong> {{specialRequests}}</p>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">Next Steps</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Prepare the property for guest arrival</li>
            <li>Ensure all amenities are working properly</li>
            <li>Coordinate check-in details with the guest</li>
            <li>Review guest requirements and special requests</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{hostDashboardLink}}" style="background: #5a3d35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a>
          </div>
        </div>

        <div style="background: #5a3d35; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Need assistance? Contact our host support at <strong>+91-9876543210</strong></p>
        </div>
      </div>
    `,
    textContent: `New Booking Alert - {{propertyName}}\n\nBooking Details:\nProperty: {{propertyName}}\nGuest: {{guestName}}\nCheck-in: {{checkInDate}}\nCheck-out: {{checkOutDate}}\nGuests: {{guestCount}}\nBooking ID: {{bookingId}}\nYour Earnings: ₹{{hostEarnings}}\n\nGuest Info:\nName: {{guestName}}\nEmail: {{guestEmail}}\nPhone: {{guestPhone}}\nRequests: {{specialRequests}}\n\nDashboard: {{hostDashboardLink}}`,
    variables: ['propertyName', 'guestName', 'checkInDate', 'checkOutDate', 'guestCount', 'bookingId', 'hostEarnings', 'guestEmail', 'guestPhone', 'specialRequests', 'hostDashboardLink'],
    isActive: true,
    isDefault: true
  },

  // ADMIN TEMPLATES
  {
    id: 'admin_booking_notification',
    name: 'Admin Booking Notification',
    type: 'admin_booking_notification',
    subject: 'New Booking - {{propertyName}} | Admin Alert',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: #6f42c1; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📊 Admin Alert</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">New booking requires attention</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #5a3d35; margin-bottom: 20px;">Booking Summary</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Property:</strong>
              <span>{{propertyName}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Guest:</strong>
              <span>{{guestName}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Dates:</strong>
              <span>{{checkInDate}} - {{checkOutDate}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Total Revenue:</strong>
              <span style="color: #28a745; font-weight: bold;">₹{{totalRevenue}}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>Platform Fee:</strong>
              <span style="color: #6f42c1; font-weight: bold;">₹{{platformFee}}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Host Earnings:</strong>
              <span style="color: #17a2b8; font-weight: bold;">₹{{hostEarnings}}</span>
            </div>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 15px;">Revenue Breakdown</h3>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <div style="font-size: 24px; color: #28a745; font-weight: bold;">₹{{totalRevenue}}</div>
                <div style="font-size: 14px; color: #666;">Total Revenue</div>
              </div>
              <div>
                <div style="font-size: 24px; color: #6f42c1; font-weight: bold;">₹{{platformFee}}</div>
                <div style="font-size: 14px; color: #666;">Platform Fee ({{platformFeePercentage}}%)</div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{adminDashboardLink}}" style="background: #5a3d35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Panel</a>
          </div>
        </div>

        <div style="background: #5a3d35; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Luxe Staycations Admin System</p>
        </div>
      </div>
    `,
    textContent: `Admin Alert - New Booking\n\nProperty: {{propertyName}}\nGuest: {{guestName}}\nDates: {{checkInDate}} - {{checkOutDate}}\nTotal Revenue: ₹{{totalRevenue}}\nPlatform Fee: ₹{{platformFee}} ({{platformFeePercentage}}%)\nHost Earnings: ₹{{hostEarnings}}\n\nAdmin Panel: {{adminDashboardLink}}`,
    variables: ['propertyName', 'guestName', 'checkInDate', 'checkOutDate', 'totalRevenue', 'platformFee', 'platformFeePercentage', 'hostEarnings', 'adminDashboardLink'],
    isActive: true,
    isDefault: true
  },

  // MARKETING TEMPLATES
  {
    id: 'newsletter_welcome',
    name: 'Newsletter Welcome',
    type: 'newsletter_welcome',
    subject: 'Welcome to Luxe Staycations - Your Gateway to Luxury!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #5a3d35 0%, #8b4513 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🏖️ Welcome to Luxe Staycations!</h1>
          <p style="color: #f0f0f0; margin: 15px 0 0 0; font-size: 18px;">Your gateway to luxury villa experiences</p>
        </div>
        
        <div style="background: white; padding: 40px;">
          <h2 style="color: #5a3d35; margin-bottom: 25px; text-align: center;">Thank You for Joining Our Community!</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We're thrilled to have you as part of the Luxe Staycations family! Get ready to discover the most exclusive villa rentals and create unforgettable memories.
          </p>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #5a3d35; margin-top: 0; text-align: center;">🎁 Exclusive Member Benefits</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">💰</div>
                <div style="font-weight: bold; color: #5a3d35;">Early Bird Discounts</div>
                <div style="font-size: 14px; color: #666;">Up to 20% off bookings</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">⭐</div>
                <div style="font-weight: bold; color: #5a3d35;">Priority Access</div>
                <div style="font-size: 14px; color: #666;">First access to new properties</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                <div style="font-weight: bold; color: #5a3d35;">Personalized Recommendations</div>
                <div style="font-size: 14px; color: #666;">Curated just for you</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">🏆</div>
                <div style="font-weight: bold; color: #5a3d35;">VIP Concierge</div>
                <div style="font-size: 14px; color: #666;">24/7 luxury support</div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{exploreLink}}" style="background: #5a3d35; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">Explore Our Villas</a>
          </div>

          <h3 style="color: #5a3d35; margin-bottom: 20px; text-align: center;">What's Next?</h3>
          <ul style="color: #333; line-height: 1.8; font-size: 16px;">
            <li>Complete your profile to get personalized recommendations</li>
            <li>Browse our exclusive collection of luxury villas</li>
            <li>Follow us on social media for the latest updates</li>
            <li>Stay tuned for our weekly newsletter with special offers</li>
          </ul>
        </div>

        <div style="background: #5a3d35; color: white; padding: 30px; text-align: center;">
          <h3 style="margin-top: 0; color: white;">Connect With Us</h3>
          <div style="margin: 20px 0;">
            <a href="{{facebookLink}}" style="color: white; text-decoration: none; margin: 0 15px; font-size: 18px;">📘 Facebook</a>
            <a href="{{instagramLink}}" style="color: white; text-decoration: none; margin: 0 15px; font-size: 18px;">📷 Instagram</a>
            <a href="{{twitterLink}}" style="color: white; text-decoration: none; margin: 0 15px; font-size: 18px;">🐦 Twitter</a>
          </div>
          <p style="margin: 0; font-size: 14px;">© 2024 Luxe Staycations. All rights reserved.</p>
        </div>
      </div>
    `,
    textContent: `Welcome to Luxe Staycations!\n\nThank you for joining our community! We're thrilled to have you as part of the Luxe Staycations family.\n\nMember Benefits:\n- Early Bird Discounts (up to 20% off)\n- Priority Access to new properties\n- Personalized Recommendations\n- VIP Concierge (24/7 support)\n\nExplore our villas: {{exploreLink}}\n\nConnect with us:\nFacebook: {{facebookLink}}\nInstagram: {{instagramLink}}\nTwitter: {{twitterLink}}`,
    variables: ['exploreLink', 'facebookLink', 'instagramLink', 'twitterLink'],
    isActive: true,
    isDefault: true
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      templates: emailTemplates,
      count: emailTemplates.length
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, template } = await request.json();

    if (action === 'create') {
      // Add new template
      const newTemplate = {
        ...template,
        id: `template_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        template: newTemplate,
        message: 'Template created successfully'
      });
    }

    if (action === 'update') {
      // Update existing template
      const updatedTemplate = {
        ...template,
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        template: updatedTemplate,
        message: 'Template updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing email templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to manage template' },
      { status: 500 }
    );
  }
}
