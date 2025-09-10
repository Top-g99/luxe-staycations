// Brevo Email Templates for Luxe Staycations
// Professional branded templates for different email types

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: 'booking' | 'marketing' | 'support' | 'loyalty';
}

export const LUXE_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    subject: '🎉 Booking Confirmed - {{bookingId}} | Luxe Staycations',
    category: 'booking',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Luxe Staycations</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .logo-section { text-align: center; margin: 20px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; }
        .logo-section img { width: 100px; height: 100px; margin: 0 auto; display: block; }
        .booking-details { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-label { font-weight: 600; color: #5a3d35; }
        .detail-value { color: #333333; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
        .property-image { width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 8px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Luxe Staycations</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your Luxury Getaway Awaits</p>
        </div>
        
        <div class="content">
            <div class="logo-section">
                <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">🏖️</span>
                </div>
                <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE STAYCATIONS</h3>
                <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">LUXURY GETAWAYS</p>
            </div>
            
            <h2 style="color: #5a3d35; margin-bottom: 20px;">Booking Confirmed! 🎉</h2>
            
            <p>Dear {{guestName}},</p>
            
            <p>We're thrilled to confirm your booking with Luxe Staycations! Your luxury getaway is all set, and we can't wait to welcome you.</p>
            
            <div class="booking-details">
                <h3 style="color: #5a3d35; margin-top: 0;">Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">{{bookingId}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Property:</span>
                    <span class="detail-value">{{propertyName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-in:</span>
                    <span class="detail-value">{{checkInDate}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-out:</span>
                    <span class="detail-value">{{checkOutDate}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guests:</span>
                    <span class="detail-value">{{guestCount}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value" style="font-weight: 600; color: #d97706;">₹{{totalAmount}}</span>
                </div>
            </div>
            
            <h3 style="color: #5a3d35;">What's Next?</h3>
            <ul>
                <li>You'll receive check-in instructions 24 hours before arrival</li>
                <li>Our concierge team will contact you for any special requests</li>
                <li>Download our mobile app for easy communication during your stay</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 20px; font-weight: bold;">🏖️</span>
                </div>
                <a href="{{bookingLink}}" class="cta-button">View Booking Details</a>
            </div>
            
            <p>If you have any questions or special requests, don't hesitate to reach out to our team.</p>
            
            <p>Thank you for choosing Luxe Staycations. We look forward to making your stay unforgettable!</p>
            
            <p>Best regards,<br>
            <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
            <p><a href="https://luxestaycations.in">luxestaycations.in</a></p>
            <p style="font-size: 12px; margin-top: 20px;">
                This email was sent to {{guestEmail}}. If you no longer wish to receive these emails, 
                <a href="{{unsubscribeLink}}">unsubscribe here</a>.
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
BOOKING CONFIRMED - Luxe Staycations

Dear {{guestName}},

We're thrilled to confirm your booking with Luxe Staycations!

BOOKING DETAILS:
- Booking ID: {{bookingId}}
- Property: {{propertyName}}
- Check-in: {{checkInDate}}
- Check-out: {{checkOutDate}}
- Guests: {{guestCount}}
- Total Amount: ₹{{totalAmount}}

WHAT'S NEXT:
- Check-in instructions will be sent 24 hours before arrival
- Our concierge team will contact you for special requests
- Download our mobile app for easy communication

View your booking: {{bookingLink}}

Questions? Contact us at info@luxestaycations.in or +91-9876543210

Thank you for choosing Luxe Staycations!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
luxestaycations.in
    `
  },
  
  {
    id: 'welcome_series_1',
    name: 'Welcome Series - Day 1',
    subject: 'Welcome to Luxe Staycations! Your journey begins here ✨',
    category: 'marketing',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Luxe Staycations</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .highlight-box { background: linear-gradient(45deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Luxe Staycations</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Welcome to Luxury</p>
        </div>
        
        <div class="content">
            <div class="logo-section">
                <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">🏖️</span>
                </div>
                <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE STAYCATIONS</h3>
                <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">LUXURY GETAWAYS</p>
            </div>
            
            <h2 style="color: #5a3d35; margin-bottom: 20px;">Welcome to the Family! ✨</h2>
            
            <p>Dear {{guestName}},</p>
            
            <p>Welcome to Luxe Staycations! We're absolutely delighted to have you join our community of luxury travel enthusiasts.</p>
            
            <div class="highlight-box">
                <h3 style="color: #5a3d35; margin-top: 0;">What makes us special?</h3>
                <ul>
                    <li>🏆 Curated luxury properties across India</li>
                    <li>🎯 Personalized concierge services</li>
                    <li>💎 Exclusive member benefits</li>
                    <li>🌟 24/7 dedicated support</li>
                </ul>
            </div>
            
            <h3 style="color: #5a3d35;">Your Luxe Journey Starts Here</h3>
            <p>As a new member, you'll receive:</p>
            <ul>
                <li>Early access to new properties</li>
                <li>Exclusive member-only deals</li>
                <li>Personalized travel recommendations</li>
                <li>Priority booking assistance</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 20px; font-weight: bold;">🏖️</span>
                </div>
                <a href="{{explorePropertiesLink}}" class="cta-button">Explore Our Properties</a>
            </div>
            
            <p>Ready to plan your first luxury getaway? Our team is here to help you find the perfect property for your next adventure.</p>
            
            <p>Welcome aboard!</p>
            
            <p>Best regards,<br>
            <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
            <p><a href="https://luxestaycations.in">luxestaycations.in</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
WELCOME TO LUXE STAYCATIONS!

Dear {{guestName}},

Welcome to Luxe Staycations! We're delighted to have you join our community.

WHAT MAKES US SPECIAL:
- Curated luxury properties across India
- Personalized concierge services  
- Exclusive member benefits
- 24/7 dedicated support

YOUR LUXE JOURNEY:
- Early access to new properties
- Exclusive member-only deals
- Personalized travel recommendations
- Priority booking assistance

Explore our properties: {{explorePropertiesLink}}

Ready to plan your first luxury getaway? Our team is here to help!

Welcome aboard!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
luxestaycations.in
    `
  },

  {
    id: 'special_request_confirmation',
    name: 'Special Request Confirmation',
    subject: 'Special Request Received - {{requestId}} | Luxe Staycations',
    category: 'support',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Request Confirmation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .request-details { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-label { font-weight: 600; color: #5a3d35; }
        .detail-value { color: #333333; }
        .status-badge { display: inline-block; background-color: #d97706; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Luxe Staycations</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Special Request Received</p>
        </div>
        
        <div class="content">
            <div class="logo-section">
                <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">🏖️</span>
                </div>
                <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE STAYCATIONS</h3>
                <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">LUXURY GETAWAYS</p>
            </div>
            
            <h2 style="color: #5a3d35; margin-bottom: 20px;">Special Request Confirmed! 📋</h2>
            
            <p>Dear {{guestName}},</p>
            
            <p>Thank you for your special request! We've received it and our team is already working on it.</p>
            
            <div class="request-details">
                <h3 style="color: #5a3d35; margin-top: 0;">Request Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Request ID:</span>
                    <span class="detail-value">{{requestId}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Property:</span>
                    <span class="detail-value">{{propertyName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Request Type:</span>
                    <span class="detail-value">{{requestType}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Urgency:</span>
                    <span class="detail-value">
                        <span class="status-badge">{{urgency}}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">{{description}}</span>
                </div>
            </div>
            
            <h3 style="color: #5a3d35;">What Happens Next?</h3>
            <ul>
                <li>Our team will review your request within 2 hours</li>
                <li>We'll contact you if we need any additional information</li>
                <li>You'll receive updates on the progress</li>
                <li>We'll confirm completion once resolved</li>
            </ul>
            
            <p>If you have any questions or need to modify your request, please don't hesitate to contact us.</p>
            
            <p>Thank you for choosing Luxe Staycations!</p>
            
            <p>Best regards,<br>
            <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
            <p><a href="https://luxestaycations.in">luxestaycations.in</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
SPECIAL REQUEST CONFIRMED - Luxe Staycations

Dear {{guestName}},

Thank you for your special request! We've received it and our team is working on it.

REQUEST DETAILS:
- Request ID: {{requestId}}
- Property: {{propertyName}}
- Request Type: {{requestType}}
- Urgency: {{urgency}}
- Description: {{description}}

WHAT HAPPENS NEXT:
- Our team will review your request within 2 hours
- We'll contact you if we need additional information
- You'll receive updates on the progress
- We'll confirm completion once resolved

Questions? Contact us at info@luxestaycations.in or +91-9876543210

Thank you for choosing Luxe Staycations!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
luxestaycations.in
    `
  },

  {
    id: 'loyalty_welcome',
    name: 'Loyalty Program Welcome',
    subject: 'Welcome to Luxe Rewards! Your journey to exclusive benefits starts now 🎁',
    category: 'loyalty',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Luxe Rewards</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .rewards-box { background: linear-gradient(45deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Luxe Staycations</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Luxe Rewards Program</p>
        </div>
        
        <div class="content">
            <div class="logo-section">
                <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">🎁</span>
                </div>
                <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE REWARDS</h3>
                <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">EXCLUSIVE BENEFITS</p>
            </div>
            
            <h2 style="color: #5a3d35; margin-bottom: 20px;">Welcome to Luxe Rewards! 🎁</h2>
            
            <p>Dear {{guestName}},</p>
            
            <p>Congratulations! You're now a member of our exclusive Luxe Rewards program. Get ready to unlock amazing benefits and earn points with every stay!</p>
            
            <div class="rewards-box">
                <h3 style="color: #5a3d35; margin-top: 0;">Your Rewards Benefits</h3>
                <ul>
                    <li>🏆 Earn 1 point for every ₹100 spent</li>
                    <li>💎 Exclusive member-only rates</li>
                    <li>🎯 Priority booking and upgrades</li>
                    <li>🌟 Complimentary amenities and services</li>
                    <li>📱 Early access to new properties</li>
                </ul>
            </div>
            
            <h3 style="color: #5a3d35;">Current Points Balance</h3>
            <div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
                <div style="font-size: 36px; font-weight: bold; color: #d97706;">{{currentPoints}}</div>
                <p style="color: #5a3d35; margin: 5px 0;">Luxe Points</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 20px; font-weight: bold;">🎁</span>
                </div>
                <a href="{{rewardsDashboardLink}}" class="cta-button">View Rewards Dashboard</a>
            </div>
            
            <p>Start earning points on your next booking and unlock exclusive rewards!</p>
            
            <p>Best regards,<br>
            <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
            <p><a href="https://luxestaycations.in">luxestaycations.in</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
WELCOME TO LUXE REWARDS - Luxe Staycations

Dear {{guestName}},

Congratulations! You're now a member of our exclusive Luxe Rewards program.

YOUR REWARDS BENEFITS:
- Earn 1 point for every ₹100 spent
- Exclusive member-only rates
- Priority booking and upgrades
- Complimentary amenities and services
- Early access to new properties

CURRENT POINTS BALANCE: {{currentPoints}} Luxe Points

View your rewards dashboard: {{rewardsDashboardLink}}

Start earning points on your next booking and unlock exclusive rewards!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
luxestaycations.in
    `
  },

  {
    id: 'marketing_newsletter',
    name: 'Marketing Newsletter',
    subject: '{{newsletterTitle}} | Luxe Staycations',
    category: 'marketing',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{newsletterTitle}} - Luxe Staycations</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .featured-property { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Luxe Staycations</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">{{newsletterTitle}}</p>
        </div>
        
        <div class="content">
            <div class="logo-section">
                <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">🏖️</span>
                </div>
                <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE STAYCATIONS</h3>
                <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">LUXURY GETAWAYS</p>
            </div>
            
            <h2 style="color: #5a3d35; margin-bottom: 20px;">{{newsletterTitle}}</h2>
            
            <p>Dear {{guestName}},</p>
            
            <p>{{newsletterContent}}</p>
            
            <div class="featured-property">
                <h3 style="color: #5a3d35; margin-top: 0;">Featured Property</h3>
                <h4>{{featuredPropertyName}}</h4>
                <p>{{featuredPropertyDescription}}</p>
                <p><strong>Starting from:</strong> ₹{{featuredPropertyPrice}}/night</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 20px; font-weight: bold;">🏖️</span>
                </div>
                <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
            </div>
            
            <p>Thank you for being part of the Luxe Staycations family!</p>
            
            <p>Best regards,<br>
            <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
            <p><a href="https://luxestaycations.in">luxestaycations.in</a></p>
            <p style="font-size: 12px; margin-top: 20px;">
                This email was sent to {{guestEmail}}. If you no longer wish to receive these emails, 
                <a href="{{unsubscribeLink}}">unsubscribe here</a>.
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
{{newsletterTitle}} - Luxe Staycations

Dear {{guestName}},

{{newsletterContent}}

FEATURED PROPERTY:
{{featuredPropertyName}}
{{featuredPropertyDescription}}
Starting from: ₹{{featuredPropertyPrice}}/night

{{ctaText}}: {{ctaLink}}

Thank you for being part of the Luxe Staycations family!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
luxestaycations.in

This email was sent to {{guestEmail}}. If you no longer wish to receive these emails, unsubscribe here: {{unsubscribeLink}}
    `
  },

  {
    id: 'booking_reminder',
    name: 'Booking Reminder',
    subject: 'Your stay is coming up! Check-in details for {{propertyName}} 📅',
    category: 'booking',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Reminder - Luxe Staycations</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #5a3d35 0%, #d97706 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .booking-details { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-label { font-weight: 600; color: #5a3d35; }
        .detail-value { color: #333333; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #5a3d35, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #5a3d35; color: #ffffff; padding: 30px; text-align: center; }
        .footer a { color: #d97706; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Luxe Staycations</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your Stay is Coming Up!</p>
        </div>
        
        <div class="content">
            <div class="logo-section">
                <div style="width: 100px; height: 100px; margin: 0 auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">📅</span>
                </div>
                <h3 style="color: #5a3d35; margin: 15px 0 0 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">LUXE STAYCATIONS</h3>
                <p style="color: #d97706; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 2px;">LUXURY GETAWAYS</p>
            </div>
            
            <h2 style="color: #5a3d35; margin-bottom: 20px;">Your Stay is Coming Up! 📅</h2>
            
            <p>Dear {{guestName}},</p>
            
            <p>We're excited to welcome you to {{propertyName}}! Your luxury getaway is just around the corner.</p>
            
            <div class="booking-details">
                <h3 style="color: #5a3d35; margin-top: 0;">Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">{{bookingId}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Property:</span>
                    <span class="detail-value">{{propertyName}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-in:</span>
                    <span class="detail-value">{{checkInDate}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-out:</span>
                    <span class="detail-value">{{checkOutDate}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guests:</span>
                    <span class="detail-value">{{guestCount}}</span>
                </div>
            </div>
            
            <h3 style="color: #5a3d35;">Important Information</h3>
            <ul>
                <li>Check-in time: {{checkInTime}}</li>
                <li>Check-out time: {{checkOutTime}}</li>
                <li>Property address: {{propertyAddress}}</li>
                <li>Host contact: {{hostPhone}}</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px solid #f0f0f0;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid #2F4F4F;">
                    <span style="color: #2F4F4F; font-size: 20px; font-weight: bold;">🏖️</span>
                </div>
                <a href="{{bookingLink}}" class="cta-button">View Full Booking Details</a>
            </div>
            
            <p>If you have any questions or special requests, please don't hesitate to contact us.</p>
            
            <p>We look forward to making your stay unforgettable!</p>
            
            <p>Best regards,<br>
            <strong>The Luxe Staycations Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>📧 info@luxestaycations.in | 📱 +91-9876543210</p>
            <p><a href="https://luxestaycations.in">luxestaycations.in</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
BOOKING REMINDER - Luxe Staycations

Dear {{guestName}},

We're excited to welcome you to {{propertyName}}! Your luxury getaway is just around the corner.

BOOKING DETAILS:
- Booking ID: {{bookingId}}
- Property: {{propertyName}}
- Check-in: {{checkInDate}}
- Check-out: {{checkOutDate}}
- Guests: {{guestCount}}

IMPORTANT INFORMATION:
- Check-in time: {{checkInTime}}
- Check-out time: {{checkOutTime}}
- Property address: {{propertyAddress}}
- Host contact: {{hostPhone}}

View full booking details: {{bookingLink}}

If you have any questions or special requests, please don't hesitate to contact us.

We look forward to making your stay unforgettable!

Best regards,
The Luxe Staycations Team

---
Luxe Staycations
info@luxestaycations.in | +91-9876543210
luxestaycations.in
    `
  }
];

// Template variable replacement function
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return result;
}

// Get template by ID
export function getTemplateById(templateId: string): EmailTemplate | undefined {
  return LUXE_EMAIL_TEMPLATES.find(template => template.id === templateId);
}

// Get templates by category
export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return LUXE_EMAIL_TEMPLATES.filter(template => template.category === category);
}
