'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  LocationOn,
  People,
  Payment,
  CheckCircle,
  LocalOffer,
  ContentCopy
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { propertyManager, bookingManager, Property, dealManager, DealBanner, couponManagerInstance, offersBannerManager, OffersBanner } from '@/lib/dataManager';
import GuestInfoForm from '@/components/GuestInfoForm';
import BookingSummary from '@/components/BookingSummary';
import PaymentForm from '@/components/PaymentForm';
// import DatePickerWithAvailability from '@/components/DatePickerWithAvailability'; // Removed - causing availability errors
import { emailService } from '@/lib/emailService';

const steps = ['Guest Information', 'Booking Summary', 'Payment'];

function BookingCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    bookingDetails, 
    setBookingDetails, 
    guestInfo, 
    setGuestInfo, 
    searchFormData,
    setSearchFormData,
    addBooking,
    syncToAdminDashboard 
  } = useBookingContext();
  
  const [activeStep, setActiveStep] = useState(0);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DealBanner | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [availableDeals, setAvailableDeals] = useState<DealBanner[]>([]);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyId = searchParams.get('property');
        if (propertyId) {
          if (typeof window !== 'undefined') {
            propertyManager.initialize();
          }
          const propertyData = await propertyManager.getById(propertyId);
          setProperty(propertyData || null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading property:', error);
        setLoading(false);
      }
    };

    loadProperty();
  }, [searchParams]);

  // Load available deals
  useEffect(() => {
    const loadDeals = async () => {
      try {
        await dealManager.initialize();
        const deals = await dealManager.getAll();
        // Filter only active deals that are currently valid
        const activeDeals = deals.filter((deal: DealBanner) => {
          const now = new Date();
          const validFrom = new Date(deal.startDate || new Date());
          const validUntil = new Date(deal.endDate || new Date());
          return deal.isActive && now >= validFrom && now <= validUntil;
        });
        setAvailableDeals(activeDeals);
      } catch (error) {
        console.error('Error loading deals:', error);
      }
    };

    loadDeals();
  }, []);

  // Calculate booking details from search data when component loads
  useEffect(() => {
    console.log('Checkout page - searchFormData:', searchFormData);
    console.log('Checkout page - property:', property);
    console.log('Checkout page - current bookingDetails:', bookingDetails);

    if (searchFormData && property) {
      const calculateBookingDetails = () => {
        const checkIn = new Date(searchFormData.checkIn);
        const checkOut = new Date(searchFormData.checkOut);
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const total = totalNights * property.price;

        const newBookingDetails = {
          checkIn: searchFormData.checkIn,
          checkOut: searchFormData.checkOut,
          guests: searchFormData.guests,
          totalNights: totalNights,
          total: total,
          property_id: property.id,
          propertyName: property.name,
          propertyLocation: property.location,
          propertyImage: property.images?.[0] || '',
          propertyPrice: property.price
        };

        setBookingDetails(newBookingDetails);

        console.log('Booking details calculated and set:', newBookingDetails);
      };

      calculateBookingDetails();
    } else {
      console.log('Missing data for booking calculation:', {
        hasSearchFormData: !!searchFormData,
        hasProperty: !!property,
        searchFormDataKeys: searchFormData ? Object.keys(searchFormData) : [],
        propertyKeys: property ? Object.keys(property) : []
      });
    }
  }, [searchFormData, property, setBookingDetails]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate guest information
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        setSnackbar({
          open: true,
          message: 'Please fill in all guest information fields',
          severity: 'error'
        });
        return;
      }
    }
    
    // Move to next step (payment is handled separately)
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Create loyalty account from booking
  const createLoyaltyAccountFromBooking = async (booking: any, guestInfo: any, loyaltyPoints: number) => {
    try {
      const response = await fetch('/api/guest/create-from-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          bookingId: booking.id,
          propertyName: booking.bookingDetails.propertyName,
          totalAmount: booking.bookingDetails.total,
          subscribeToNewsletter: guestInfo.subscribeToNewsletter || false,
          loyaltyPoints: loyaltyPoints
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Loyalty account created successfully:', data);
        // Send welcome email with loyalty benefits
        try {
          await fetch('/api/brevo/loyalty', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
              guestEmail: guestInfo.email,
              currentPoints: loyaltyPoints,
              rewardsDashboardLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://luxestaycations.in'}/guest/dashboard`
            }),
          });
        } catch (emailError) {
          console.error('Error sending loyalty welcome email:', emailError);
        }
      } else {
        console.error('Failed to create loyalty account:', data.message);
      }
    } catch (error) {
      console.error('Error creating loyalty account:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      if (!property || !bookingDetails || !searchFormData) {
        throw new Error('Missing property, booking details, or search data');
      }

      // Calculate final amount with coupon discount
      const baseTotal = bookingDetails.total || 0;
      const serviceFee = baseTotal * 0.1;
      const subtotal = baseTotal + serviceFee;
      const finalAmount = Math.max(0, subtotal - appliedDiscount);

      // Create complete booking with payment details
      // Calculate loyalty points (1 point per ₹100 spent)
      const loyaltyPoints = Math.floor(bookingDetails.total / 100);
      const jewelsEarned = loyaltyPoints; // 1 jewel = 1 point

      const completeBooking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        guestInfo: {
          ...guestInfo,
        },
        bookingDetails: {
          ...bookingDetails,
          property_id: property.id,
          propertyName: property.name,
          propertyLocation: property.location,
          propertyImage: property.images?.[0] || '',
          propertyPrice: property.price
        },
        searchFormData: searchFormData,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
        loyaltyPoints,
        jewelsEarned,
        loyaltyAccountCreated: guestInfo.createLoyaltyAccount || false,
        updatedAt: new Date().toISOString(),
        paymentStatus: 'paid' as const,
        paymentMethod: paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        paymentDetails: {
          ...paymentDetails,
          finalAmount: finalAmount,
          couponDiscount: appliedDiscount,
          couponCode: appliedCoupon ? couponCode : undefined,
          baseAmount: baseTotal,
          serviceFee: serviceFee,
          subtotal: subtotal
        }
      };

      // Add booking to context (this will also save to localStorage and Supabase)
      await addBooking(completeBooking);

      // Redeem coupon if one was applied
      if (appliedCoupon && couponCode) {
        try {
          const redemption = await couponManagerInstance.redeemCoupon(
            couponCode,
            bookingDetails.total || 0,
            completeBooking.id,
            guestInfo.email,
            `${guestInfo.firstName} ${guestInfo.lastName}`
          );
          console.log('Coupon redeemed:', redemption);
        } catch (error) {
          console.error('Error redeeming coupon:', error);
          // Don't fail the booking if coupon redemption fails
        }
      }

      // Also save to Supabase BookingManager for admin dashboard
      await bookingManager.initialize();
      
      const supabaseBooking = await bookingManager.create({
        id: Date.now().toString(),
        property_id: property.id,
        user_id: 'guest',
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        guests: parseInt(bookingDetails.guests),
        totalAmount: bookingDetails.total,
        status: 'confirmed',
        specialRequests: guestInfo.specialRequests || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('Supabase booking created:', supabaseBooking);

      // Sync to admin dashboard
      syncToAdminDashboard();

      // Send confirmation email via Brevo
      try {
        const emailData = {
          guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
          guestEmail: guestInfo.email,
          bookingId: completeBooking.id,
          propertyName: property.name,
          propertyLocation: property.location,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          totalAmount: bookingDetails.total,
          transactionId: paymentDetails.transactionId,
          paymentMethod: paymentDetails.method,
          specialRequests: completeBooking.guestInfo?.specialRequests || ''
        };

        console.log('Sending booking confirmation email via Brevo...');
        const response = await fetch('/api/brevo/booking-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });
        
        const emailResult = await response.json();
        
        if (emailResult.success) {
          console.log('📧 Booking confirmation email sent successfully to', guestInfo.email, 'MessageId:', emailResult.messageId);
        } else {
          console.warn('⚠️ Booking confirmation email failed:', emailResult.message);
        }
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
        // Don't fail the booking process if email fails
      }
      
      setSnackbar({
        open: true,
        message: 'Payment successful! Booking confirmed and confirmation email sent.',
        severity: 'success'
      });
      
      // Create loyalty account if requested
      if (guestInfo.createLoyaltyAccount) {
        try {
          await createLoyaltyAccountFromBooking(completeBooking, guestInfo, loyaltyPoints);
        } catch (loyaltyError) {
          console.error('Error creating loyalty account:', loyaltyError);
          // Don't fail the booking if loyalty account creation fails
        }
      }

      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/booking/confirmation/${completeBooking.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setSnackbar({
        open: true,
        message: 'Error creating booking. Please try again.',
        severity: 'error'
      });
    }
  };

  const handlePaymentError = (error: string) => {
    setSnackbar({
      open: true,
      message: error,
      severity: 'error'
    });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      // Use the proper coupon manager for validation
      const currentTotal = bookingDetails.total || 0;
      const validation = await couponManagerInstance.validateCoupon(couponCode, currentTotal);

      if (!validation.isValid) {
        setCouponError(validation.message);
        return;
      }

      // Create a deal object from the validated banner
      const validatedBanner = validation.banner!;
      const mockDeal: DealBanner = {
        id: validatedBanner.id,
        title: validatedBanner.title,
        description: validatedBanner.description || '',
        subtitle: `${validatedBanner.discountValue}${validatedBanner.discountType === 'percentage' ? '%' : '₹'} off`,
        image: validatedBanner.image || '',
        link: validatedBanner.link || '',
        buttonText: 'Applied',
        buttonLink: validatedBanner.buttonLink,
        fallbackImageUrl: validatedBanner.backgroundImageUrl,
        isActive: validatedBanner.isActive,
        startDate: validatedBanner.startDate || new Date().toISOString(),
        endDate: validatedBanner.endDate || new Date().toISOString(),
        created_at: validatedBanner.created_at,
        updated_at: validatedBanner.updated_at
      };

      setAppliedCoupon(mockDeal);
      setAppliedDiscount(validation.discount);
      setCouponError('');
      setSnackbar({
        open: true,
        message: validation.message,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Error validating coupon. Please try again.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  const getFinalTotal = (baseTotal: number) => {
    const serviceFee = baseTotal * 0.1;
    const subtotal = baseTotal + serviceFee;
    return Math.max(0, subtotal - appliedDiscount);
  };

  const handleGuestInfoChange = (field: string, value: string | boolean) => {
    setGuestInfo({
      ...guestInfo,
      [field]: value
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading booking information...</Typography>
      </Container>
    );
  }

  if (!property || !bookingDetails) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          Booking information not found. Please start a new booking.
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push('/villas')}
          sx={{ mt: 2 }}
        >
          Browse Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Stepper */}
      <Box sx={{ mb: 6 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <GuestInfoForm 
                  guestInfo={guestInfo}
                  onGuestInfoChange={handleGuestInfoChange}
                />
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Card>
              <CardContent>
                <BookingSummary 
                  guestInfo={guestInfo}
                  bookingDetails={bookingDetails}
                  property={property}
                />
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card>
              <CardContent>
                <PaymentForm
                  totalAmount={getFinalTotal(bookingDetails.total || 0)} // Include service fee and discount
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  bookingData={{
                    bookingId: `temp-${Date.now()}`,
                    guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
                    propertyName: property.name,
                    guestEmail: guestInfo.email,
                    guestPhone: guestInfo.phone
                  }}
                />
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Booking Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'}
                  alt={property.name}
                  style={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {property.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {property.location}
                </Typography>
              </Box>

              {/* Date Selection - Simplified without availability checking */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Modify Dates
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Check-in Date"
                      value={searchFormData?.checkIn || ''}
                      onChange={(e) => {
                        const newSearchData = {
                          destination: searchFormData?.destination || '',
                          checkIn: e.target.value,
                          checkOut: searchFormData?.checkOut || '',
                          guests: searchFormData?.guests || '1',
                          amenities: searchFormData?.amenities || []
                        };
                        setSearchFormData(newSearchData);
                        
                        // Update booking details
                        if (e.target.value && searchFormData?.checkOut) {
                          const checkInDate = new Date(e.target.value);
                          const checkOutDate = new Date(searchFormData.checkOut);
                          const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                          const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          const total = totalNights * property.price;
                          
                          setBookingDetails({
                            ...bookingDetails,
                            checkIn: e.target.value,
                            totalNights,
                            total
                          });
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Check-out Date"
                      value={searchFormData?.checkOut || ''}
                      onChange={(e) => {
                        const newSearchData = {
                          destination: searchFormData?.destination || '',
                          checkIn: searchFormData?.checkIn || '',
                          checkOut: e.target.value,
                          guests: searchFormData?.guests || '1',
                          amenities: searchFormData?.amenities || []
                        };
                        setSearchFormData(newSearchData);
                        
                        // Update booking details
                        if (searchFormData?.checkIn && e.target.value) {
                          const checkInDate = new Date(searchFormData.checkIn);
                          const checkOutDate = new Date(e.target.value);
                          const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                          const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          const total = totalNights * property.price;
                          
                          setBookingDetails({
                            ...bookingDetails,
                            checkOut: e.target.value,
                            totalNights,
                            total
                          });
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Coupon Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOffer />
                  Coupon Code
                </Typography>
                
                {!appliedCoupon ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      error={!!couponError}
                      helperText={couponError}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                      sx={{
                        borderColor: 'var(--primary-light)',
                        color: 'var(--primary-dark)',
                        '&:hover': {
                          backgroundColor: 'var(--primary-light)',
                          color: 'white',
                          borderColor: 'var(--primary-light)'
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'success.light', 
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                        {appliedCoupon.id} Applied
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.dark' }}>
                        {appliedCoupon.subtitle}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={removeCoupon}
                      sx={{ color: 'success.dark', minWidth: 'auto' }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>
              
              {(() => {
                // Fallback calculation if booking details aren't set
                let totalNights = bookingDetails.totalNights || 0;
                let total = bookingDetails.total || 0;
                
                if (totalNights === 0 && searchFormData && property) {
                  const checkIn = new Date(searchFormData.checkIn);
                  const checkOut = new Date(searchFormData.checkOut);
                  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
                  totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  total = totalNights * property.price;
                }
                
                const serviceFee = total * 0.1;
                const subtotal = total + serviceFee;
                const finalTotal = Math.max(0, subtotal - appliedDiscount);
                
                return (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Price per night</Typography>
                      <Typography variant="body2">₹{property.price.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Number of nights</Typography>
                      <Typography variant="body2">{totalNights}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2">₹{total.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Service fee</Typography>
                      <Typography variant="body2">₹{serviceFee.toLocaleString()}</Typography>
                    </Box>
                    {appliedCoupon && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'success.main' }}>
                          Discount ({appliedCoupon.id})
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'success.main' }}>
                          -₹{appliedDiscount.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })()}
              
              <Divider sx={{ my: 2 }} />
              
              {(() => {
                // Use the same fallback calculation for total
                let totalNights = bookingDetails.totalNights || 0;
                let total = bookingDetails.total || 0;
                
                if (totalNights === 0 && searchFormData && property) {
                  const checkIn = new Date(searchFormData.checkIn);
                  const checkOut = new Date(searchFormData.checkOut);
                  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
                  totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  total = totalNights * property.price;
                }
                
                const finalTotal = getFinalTotal(total);
                
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" sx={{ color: '#d97706' }}>
                      ₹{finalTotal.toLocaleString()}
                    </Typography>
                  </Box>
                );
              })()}
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ flex: 1 }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === steps.length - 1}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4a332c, #b45309)',
                    }
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Payment Required' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
export default function BookingCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingCheckoutContent />
    </Suspense>
  );
}

