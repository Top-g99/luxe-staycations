// Email System Types and Interfaces

export interface EmailConfig {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableSSL: boolean;
  fromName: string;
  fromEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailQueueItem {
  id: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  variables?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  maxRetries: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  toEmail: string;
  subject: string;
  templateId?: string;
  variables?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened' | 'clicked';
  messageId?: string;
  errorMessage?: string;
  attemptCount: number;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTrigger {
  id: string;
  name: string;
  event: string;
  templateId: string;
  conditions?: Record<string, any>;
  isActive: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  delay?: number; // Delay in minutes
  createdAt: string;
  updatedAt: string;
}

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  failureRate: number;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface EmailOptions {
  to: string | string[] | EmailRecipient[];
  cc?: string | string[] | EmailRecipient[];
  bcc?: string | string[] | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  variables?: Record<string, any>;
  attachments?: EmailAttachment[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  logId?: string;
}

export interface EmailTemplateData {
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
}

export interface EmailTriggerData {
  name: string;
  event: string;
  templateId: string;
  conditions?: Record<string, any>;
  isActive: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  delay?: number;
}

// Business Flow Email Types
export interface BookingEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  propertyLocation: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paymentStatus: string;
  specialRequests?: string;
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  amenities?: string[];
  cancellationPolicy?: string;
  checkInInstructions?: string;
  propertyAddress?: string;
  propertyImages?: string[];
}

export interface PartnerRequestEmailData {
  requestId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  experience: string;
  message: string;
  propertyCount?: number;
  expectedRevenue?: number;
  preferredContactTime?: string;
  website?: string;
  socialMedia?: string;
}

export interface ConsultationRequestEmailData {
  requestId: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  propertyDetails?: string;
  budget?: string;
  timeline?: string;
  specialRequirements?: string;
}

export interface SpecialRequestEmailData {
  requestId: string;
  name: string;
  email: string;
  phone: string;
  requestType: string;
  description: string;
  preferredDate?: string;
  budget?: number;
  urgency: 'low' | 'medium' | 'high';
  additionalNotes?: string;
}

export interface ContactFormEmailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredContactMethod: string;
  inquiryType: string;
  propertyInterest?: string;
  budget?: string;
  travelDates?: string;
  guestCount?: number;
}

export interface LoyaltyEmailData {
  userId: string;
  userName: string;
  userEmail: string;
  action: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  totalPoints: number;
  description: string;
  expiryDate?: string;
  redemptionCode?: string;
  propertyName?: string;
  bookingId?: string;
}

export interface AdminNotificationEmailData {
  type: 'booking' | 'payment' | 'cancellation' | 'partner_request' | 'consultation' | 'special_request' | 'contact_form' | 'loyalty' | 'system';
  title: string;
  description: string;
  data: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionRequired: boolean;
  actionUrl?: string;
  adminEmails: string[];
}
