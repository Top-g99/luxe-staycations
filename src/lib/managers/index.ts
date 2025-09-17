// Export all managers
export { PropertyManager, propertyManager } from './PropertyManager';
export { BookingManager, bookingManager } from './BookingManager';
export { DestinationManager, destinationManager } from './DestinationManager';
export { EmailManager, emailManager } from './EmailManager';
export { CallbackManager, callbackManager } from './CallbackManager';
export { ConsultationManager, consultationManager } from './ConsultationManager';
export { PartnerManager, partnerManager } from './PartnerManager';
export { OffersManager, offersManager } from './OffersManager';
export { LoyaltyManager, loyaltyManager } from './LoyaltyManager';
export { SpecialRequestsManager, specialRequestsManager } from './SpecialRequestsManager';
export { AnalyticsManager, analyticsManager } from './AnalyticsManager';

// Export Supabase client and types
export { supabase, TABLES } from '../supabaseClient';
export type {
  Property,
  Booking,
  Destination,
  Offer,
  LoyaltyMember,
  Callback,
  Consultation,
  PartnerRequest,
  SpecialRequest,
  EmailLog,
  Analytics
} from '../supabaseClient';
