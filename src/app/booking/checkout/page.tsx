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
  CheckCircle
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { propertyManager, Property } from '@/lib/propertyManager';
import GuestInfoForm from '@/components/GuestInfoForm';
import BookingSummary from '@/components/BookingSummary';
import PaymentForm from '@/components/PaymentForm';
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

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyId = searchParams.get('property');
        if (propertyId) {
          if (typeof window !== 'undefined') {
            propertyManager.initialize();
          }
          const propertyData = propertyManager.getPropertyById(propertyId);
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
          propertyId: property.id,
          propertyName: property.name,
          propertyLocation: property.location,
          propertyImage: property.image,
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

  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      if (!property || !bookingDetails || !searchFormData) {
        throw new Error('Missing property, booking details, or search data');
      }

      // Create complete booking with payment details
      const completeBooking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        guestInfo: {
          ...guestInfo,
        },
        bookingDetails: {
          ...bookingDetails,
          propertyId: property.id,
          propertyName: property.name,
          propertyLocation: property.location,
          propertyImage: property.image,
          propertyPrice: property.price
        },
        searchFormData: searchFormData,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'paid' as const,
        paymentMethod: paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        paymentDetails: paymentDetails
      };

      // Add booking to context (this will also save to localStorage)
      addBooking(completeBooking);

      // Also save to BookingManager for backward compatibility
      const { bookingManager } = await import('@/lib/bookingManager');
      
      if (typeof window !== 'undefined') {
        bookingManager.initialize();
      }

      const legacyBooking = bookingManager.addBooking({
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        propertyId: property.id,
        propertyName: property.name,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        guests: parseInt(bookingDetails.guests),
        amount: bookingDetails.total,
        status: 'confirmed'
      });

      // Sync to admin dashboard
      syncToAdminDashboard();

      // Send confirmation email
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
          paymentMethod: paymentDetails.method
        };

        const emailSent = await emailService.sendBookingConfirmation(emailData);
        
        if (emailSent) {
          console.log('📧 Confirmation email sent successfully to', guestInfo.email);
        } else {
          console.warn('⚠️ Email service not configured or failed to send email');
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the booking process if email fails
      }
      
      setSnackbar({
        open: true,
        message: 'Payment successful! Booking confirmed and confirmation email sent.',
        severity: 'success'
      });
      
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

  const handleGuestInfoChange = (field: string, value: string) => {
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
                  totalAmount={bookingDetails.total * 1.1} // Include service fee
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
                  src={property.image}
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
              
              <Divider sx={{ my: 2 }} />
              
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
                      <Typography variant="body2">Service fee</Typography>
                      <Typography variant="body2">₹{(total * 0.1).toLocaleString()}</Typography>
                    </Box>
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
                
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" sx={{ color: '#d97706' }}>
                      ₹{(total * 1.1).toLocaleString()}
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
