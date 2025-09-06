export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BookingEmailData {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  bookingId: string;
  propertyAddress: string;
  hostName: string;
  hostPhone: string;
  hostEmail: string;
  specialRequests?: string;
  amenities?: string[];
}

export interface PartnerRequestData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  experience: string;
  message: string;
  requestId: string;
}

export interface ConsultationRequestData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  propertyType: string;
  budget: string;
  message: string;
  requestId: string;
}

export interface SpecialRequestData {
  guestName: string;
  email: string;
  phone: string;
  propertyName: string;
  requestType: string;
  description: string;
  urgency: string;
  requestId: string;
}

// Base email template with Luxe Staycations branding
const getBaseTemplate = (title: string, content: string, footerText?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 2px;
        }
        .header .tagline {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #8B4513;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 400;
        }
        .content p {
            margin-bottom: 16px;
            font-size: 16px;
        }
        .highlight-box {
            background-color: #f8f6f0;
            border-left: 4px solid #8B4513;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .booking-details {
            background-color: #f8f6f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .booking-details h3 {
            color: #8B4513;
            margin-top: 0;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #8B4513;
        }
        .detail-label {
            font-weight: 500;
            color: #666;
        }
        .detail-value {
            color: #333;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8B4513 0%, #2C1810 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #2C1810;
            color: white;
            padding: 30px 20px;
            text-align: center;
            font-size: 14px;
        }
        .footer p {
            margin: 8px 0;
            opacity: 0.9;
        }
        .footer a {
            color: #D4AF37;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #D4AF37;
            text-decoration: none;
            font-size: 16px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #8B4513, transparent);
            margin: 30px 0;
        }
        .urgency-high {
            background-color: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .urgency-medium {
            background-color: #d1ecf1;
            border-left-color: #17a2b8;
            color: #0c5460;
        }
        .urgency-low {
            background-color: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>LUXE STAYCATIONS</h1>
            <p class="tagline">Luxury Redefined • Premium Villa Experiences</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
            <p><strong>Luxe Staycations</strong></p>
            <p>Premium Villa Rental & Luxury Travel Experiences</p>
            <p>📧 info@luxestaycations.in | 📞 +91-8828279739</p>
            <p>🌐 www.luxestaycations.in</p>
            
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">Twitter</a>
                <a href="#">LinkedIn</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                This email was sent to you because you made a booking or request with Luxe Staycations.<br>
                If you have any questions, please contact us at info@luxestaycations.in
            </p>
            
            ${footerText ? `<p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">${footerText}</p>` : ''}
        </div>
    </div>
</body>
</html>`;
};

// Booking Confirmation Email Template
export const generateBookingConfirmationEmail = (data: BookingEmailData): EmailTemplate => {
  const content = `
    <h2>🎉 Booking Confirmed!</h2>
    
    <p>Dear <strong>${data.guestName}</strong>,</p>
    
    <p>Thank you for choosing <strong>Luxe Staycations</strong> for your upcoming getaway! We're thrilled to confirm your booking and look forward to providing you with an exceptional luxury experience.</p>
    
    <div class="booking-details">
        <h3>📋 Booking Details</h3>
        <div class="detail-row">
            <span class="detail-label">Booking ID:</span>
            <span class="detail-value">${data.bookingId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Property:</span>
            <span class="detail-value">${data.propertyName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span class="detail-value">${data.propertyAddress}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Check-in:</span>
            <span class="detail-value">${data.checkIn}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Check-out:</span>
            <span class="detail-value">${data.checkOut}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Guests:</span>
            <span class="detail-value">${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total Amount:</span>
            <span class="detail-value">₹${data.totalAmount.toLocaleString()}</span>
        </div>
    </div>
    
    <div class="highlight-box">
        <h3>🏠 Your Host</h3>
        <p><strong>${data.hostName}</strong></p>
        <p>📞 ${data.hostPhone}</p>
        <p>📧 ${data.hostEmail}</p>
        <p>Your host will be in touch 24 hours before your arrival with check-in instructions and any special arrangements.</p>
    </div>
    
    ${data.specialRequests ? `
    <div class="highlight-box">
        <h3>📝 Special Requests</h3>
        <p>${data.specialRequests}</p>
        <p><em>We'll do our best to accommodate your requests. Please contact your host if you need to make any changes.</em></p>
    </div>
    ` : ''}
    
    ${data.amenities && data.amenities.length > 0 ? `
    <div class="highlight-box">
        <h3>✨ Property Amenities</h3>
        <p>${data.amenities.join(' • ')}</p>
    </div>
    ` : ''}
    
    <div class="highlight-box">
        <h3>📱 What's Next?</h3>
        <ul>
            <li>Your host will contact you 24 hours before check-in</li>
            <li>You'll receive detailed directions and access instructions</li>
            <li>Our 24/7 concierge service is available for any assistance</li>
            <li>Check our cancellation policy if you need to make changes</li>
        </ul>
    </div>
    
    <p>We're committed to making your stay absolutely perfect. If you have any questions or special requirements, please don't hesitate to reach out to us or your host.</p>
    
    <p>Thank you for choosing <strong>Luxe Staycations</strong>. We can't wait to welcome you!</p>
    
    <p>Warm regards,<br>
    <strong>The Luxe Staycations Team</strong></p>
  `;

  return {
    subject: `🎉 Booking Confirmed - ${data.propertyName} | Luxe Staycations`,
    html: getBaseTemplate('Booking Confirmation', content),
    text: `Booking Confirmed for ${data.propertyName}. Booking ID: ${data.bookingId}. Check-in: ${data.checkIn}, Check-out: ${data.checkOut}. Total: ₹${data.totalAmount}. Contact: ${data.hostName} at ${data.hostPhone}.`
  };
};

// Partner Request Confirmation Email Template
export const generatePartnerRequestEmail = (data: PartnerRequestData): EmailTemplate => {
  const content = `
    <h2>🤝 Partnership Request Received</h2>
    
    <p>Dear <strong>${data.contactName}</strong>,</p>
    
    <p>Thank you for your interest in partnering with <strong>Luxe Staycations</strong>! We're excited about the possibility of working together to provide exceptional luxury travel experiences.</p>
    
    <div class="booking-details">
        <h3>📋 Your Partnership Request</h3>
        <div class="detail-row">
            <span class="detail-label">Request ID:</span>
            <span class="detail-value">${data.requestId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Business Name:</span>
            <span class="detail-value">${data.businessName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Contact Person:</span>
            <span class="detail-value">${data.contactName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${data.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Property Type:</span>
            <span class="detail-value">${data.propertyType}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${data.location}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Experience:</span>
            <span class="detail-value">${data.experience}</span>
        </div>
    </div>
    
    <div class="highlight-box">
        <h3>💬 Your Message</h3>
        <p>${data.message}</p>
    </div>
    
    <div class="highlight-box">
        <h3>📅 What Happens Next?</h3>
        <ul>
            <li>Our partnership team will review your request within 2-3 business days</li>
            <li>We'll contact you to discuss partnership opportunities and requirements</li>
            <li>If approved, we'll guide you through the onboarding process</li>
            <li>You'll receive access to our partner portal and resources</li>
        </ul>
    </div>
    
    <p>We're always looking for exceptional properties and partners who share our commitment to luxury and excellence. Your request is important to us, and we'll give it our full attention.</p>
    
    <p>If you have any immediate questions, please don't hesitate to contact our partnership team at <strong>partners@luxestaycations.in</strong> or call us at <strong>+91-8828279739</strong>.</p>
    
    <p>Thank you for considering <strong>Luxe Staycations</strong> as your partner in luxury hospitality.</p>
    
    <p>Best regards,<br>
    <strong>The Partnership Team<br>
    Luxe Staycations</strong></p>
  `;

  return {
    subject: `🤝 Partnership Request Received - ${data.businessName} | Luxe Staycations`,
    html: getBaseTemplate('Partnership Request', content),
    text: `Partnership request received from ${data.businessName}. Request ID: ${data.requestId}. We'll review and contact you within 2-3 business days.`
  };
};

// Consultation Request Confirmation Email Template
export const generateConsultationRequestEmail = (data: ConsultationRequestData): EmailTemplate => {
  const content = `
    <h2>💼 Consultation Request Confirmed</h2>
    
    <p>Dear <strong>${data.name}</strong>,</p>
    
    <p>Thank you for requesting a consultation with <strong>Luxe Staycations</strong>! We're delighted that you're considering us for your luxury travel needs and look forward to helping you plan the perfect getaway.</p>
    
    <div class="booking-details">
        <h3>📋 Consultation Details</h3>
        <div class="detail-row">
            <span class="detail-label">Request ID:</span>
            <span class="detail-value">${data.requestId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${data.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${data.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Preferred Date:</span>
            <span class="detail-value">${data.preferredDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Preferred Time:</span>
            <span class="detail-value">${data.preferredTime}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Property Type:</span>
            <span class="detail-value">${data.propertyType}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Budget Range:</span>
            <span class="detail-value">${data.budget}</span>
        </div>
    </div>
    
    <div class="highlight-box">
        <h3>💬 Your Requirements</h3>
        <p>${data.message}</p>
    </div>
    
    <div class="highlight-box">
        <h3>📅 Next Steps</h3>
        <ul>
            <li>Our travel consultant will contact you within 24 hours</li>
            <li>We'll confirm your consultation appointment</li>
            <li>Prepare a personalized proposal based on your requirements</li>
            <li>Discuss available properties and create your perfect itinerary</li>
        </ul>
    </div>
    
    <div class="highlight-box">
        <h3>🎯 What to Expect</h3>
        <p>During your consultation, we'll:</p>
        <ul>
            <li>Understand your travel preferences and requirements</li>
            <li>Show you curated luxury properties that match your needs</li>
            <li>Discuss amenities, locations, and special experiences</li>
            <li>Provide detailed pricing and availability information</li>
            <li>Answer all your questions about our services</li>
        </ul>
    </div>
    
    <p>Our team of luxury travel experts is dedicated to creating unforgettable experiences tailored specifically to your desires. We're excited to help you discover the perfect luxury getaway.</p>
    
    <p>If you need to reschedule or have any urgent questions, please contact us at <strong>consultations@luxestaycations.in</strong> or call <strong>+91-8828279739</strong>.</p>
    
    <p>We look forward to speaking with you soon!</p>
    
    <p>Warm regards,<br>
    <strong>The Consultation Team<br>
    Luxe Staycations</strong></p>
  `;

  return {
    subject: `💼 Consultation Request Confirmed - ${data.name} | Luxe Staycations`,
    html: getBaseTemplate('Consultation Request', content),
    text: `Consultation request confirmed for ${data.name}. Request ID: ${data.requestId}. We'll contact you within 24 hours to schedule your consultation.`
  };
};

// Special Request Confirmation Email Template
export const generateSpecialRequestEmail = (data: SpecialRequestData): EmailTemplate => {
  const urgencyClass = data.urgency.toLowerCase();
  const urgencyIcon = data.urgency === 'High' ? '🚨' : data.urgency === 'Medium' ? '⚠️' : 'ℹ️';
  
  const content = `
    <h2>${urgencyIcon} Special Request Received</h2>
    
    <p>Dear <strong>${data.guestName}</strong>,</p>
    
    <p>Thank you for reaching out to <strong>Luxe Staycations</strong> with your special request. We're committed to making your stay exceptional and will do everything possible to accommodate your needs.</p>
    
    <div class="booking-details">
        <h3>📋 Request Details</h3>
        <div class="detail-row">
            <span class="detail-label">Request ID:</span>
            <span class="detail-value">${data.requestId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Guest Name:</span>
            <span class="detail-value">${data.guestName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${data.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Property:</span>
            <span class="detail-value">${data.propertyName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Request Type:</span>
            <span class="detail-value">${data.requestType}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Urgency:</span>
            <span class="detail-value">${data.urgency}</span>
        </div>
    </div>
    
    <div class="highlight-box urgency-${urgencyClass}">
        <h3>💬 Request Description</h3>
        <p>${data.description}</p>
    </div>
    
    <div class="highlight-box">
        <h3>📅 What Happens Next?</h3>
        <ul>
            <li>Our concierge team will review your request immediately</li>
            <li>We'll contact you within ${data.urgency === 'High' ? '2 hours' : data.urgency === 'Medium' ? '6 hours' : '24 hours'} to discuss feasibility</li>
            <li>If approved, we'll coordinate with the property team</li>
            <li>You'll receive confirmation and any additional details needed</li>
        </ul>
    </div>
    
    <div class="highlight-box">
        <h3>🎯 Our Commitment</h3>
        <p>At <strong>Luxe Staycations</strong>, we believe that exceptional service means going above and beyond. Our team is dedicated to:</p>
        <ul>
            <li>Responding promptly to all special requests</li>
            <li>Finding creative solutions to make your stay memorable</li>
            <li>Maintaining the highest standards of luxury and service</li>
            <li>Ensuring your complete satisfaction</li>
        </ul>
    </div>
    
    <p>Please note that some requests may require additional charges or may not be possible due to property policies or local regulations. We'll discuss all details with you before proceeding.</p>
    
    <p>If you have any questions or need to modify your request, please contact our concierge team at <strong>concierge@luxestaycations.in</strong> or call <strong>+91-8828279739</strong>.</p>
    
    <p>Thank you for choosing <strong>Luxe Staycations</strong>. We're excited to make your stay extraordinary!</p>
    
    <p>Best regards,<br>
    <strong>The Concierge Team<br>
    Luxe Staycations</strong></p>
  `;

  return {
    subject: `${urgencyIcon} Special Request Received - ${data.propertyName} | Luxe Staycations`,
    html: getBaseTemplate('Special Request', content),
    text: `Special request received from ${data.guestName} for ${data.propertyName}. Request ID: ${data.requestId}. Urgency: ${data.urgency}. We'll contact you within ${data.urgency === 'High' ? '2 hours' : data.urgency === 'Medium' ? '6 hours' : '24 hours'}.`
  };
};

// Admin Notification Email Template
export const generateAdminNotificationEmail = (type: string, data: any): EmailTemplate => {
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'booking':
        return {
          title: 'New Booking Received',
          icon: '🎉',
          color: '#28a745'
        };
      case 'partner':
        return {
          title: 'New Partnership Request',
          icon: '🤝',
          color: '#17a2b8'
        };
      case 'consultation':
        return {
          title: 'New Consultation Request',
          icon: '💼',
          color: '#6f42c1'
        };
      case 'special':
        return {
          title: 'New Special Request',
          icon: '⭐',
          color: '#fd7e14'
        };
      default:
        return {
          title: 'New Request',
          icon: '📧',
          color: '#6c757d'
        };
    }
  };

  const typeInfo = getTypeInfo(type);
  
  const content = `
    <h2>${typeInfo.icon} ${typeInfo.title}</h2>
    
    <p>A new ${type} request has been received and requires your attention.</p>
    
    <div class="highlight-box" style="border-left-color: ${typeInfo.color};">
        <h3>📋 Request Summary</h3>
        <p><strong>Type:</strong> ${typeInfo.title}</p>
        <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> Pending Review</p>
    </div>
    
    <div class="highlight-box">
        <h3>📝 Action Required</h3>
        <p>Please log into the admin panel to review and process this request:</p>
        <a href="http://localhost:3000/admin" class="cta-button">View in Admin Panel</a>
    </div>
    
    <p>This is an automated notification from the Luxe Staycations system.</p>
  `;

  return {
    subject: `${typeInfo.icon} ${typeInfo.title} - Admin Notification | Luxe Staycations`,
    html: getBaseTemplate('Admin Notification', content, 'Admin notification email'),
    text: `${typeInfo.title} received. Please check the admin panel for details.`
  };
};
