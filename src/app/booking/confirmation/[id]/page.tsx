'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  Avatar,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Receipt,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  People,
  Payment,
  Download,
  Share,
  BookOnline
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { emailService } from '@/lib/emailService';
import { emailDeliveryService } from '@/lib/emailDeliveryService';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { getBookingById } = useBookingContext();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState<'sent' | 'not-configured' | 'unknown'>('unknown');

  useEffect(() => {
    const loadBooking = () => {
      const bookingId = params.id as string;
      const bookingData = getBookingById(bookingId);
      
      if (bookingData) {
        setBooking(bookingData);
        
        // Check email service status
        if (emailService.isConfigured) {
          setEmailStatus('sent');
        } else {
          setEmailStatus('not-configured');
        }
      }
      setLoading(false);
    };

    loadBooking();
  }, [params.id, getBookingById]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    const finalAmount = booking.paymentDetails?.finalAmount || (booking.bookingDetails.total * 1.1);
    const couponDiscount = booking.paymentDetails?.couponDiscount || 0;
    const couponCode = booking.paymentDetails?.couponCode;
    
    const receiptData = {
      bookingId: booking.id,
      guestName: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
      propertyName: booking.bookingDetails.propertyName,
      checkIn: formatDate(booking.bookingDetails.checkIn),
      checkOut: formatDate(booking.bookingDetails.checkOut),
      baseAmount: booking.bookingDetails.total,
      serviceFee: booking.bookingDetails.total * 0.1,
      couponDiscount: couponDiscount,
      couponCode: couponCode,
      finalAmount: finalAmount,
      transactionId: booking.transactionId
    };

    const receiptText = `
Booking Receipt
===============

Booking ID: ${receiptData.bookingId}
Guest: ${receiptData.guestName}
Property: ${receiptData.propertyName}
Check-in: ${receiptData.checkIn}
Check-out: ${receiptData.checkOut}

Payment Breakdown:
Base Amount: ₹${receiptData.baseAmount.toLocaleString()}
Service Fee: ₹${receiptData.serviceFee.toLocaleString()}
${couponDiscount > 0 ? `Coupon Discount (${couponCode}): -₹${couponDiscount.toLocaleString()}` : ''}
${couponDiscount > 0 ? '----------------------------------------' : ''}
Total Amount Paid: ₹${receiptData.finalAmount.toLocaleString()}

Transaction ID: ${receiptData.transactionId}

Thank you for choosing Luxe Staycations!
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${booking.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Booking Confirmation',
        text: `I've booked ${booking.bookingDetails.propertyName} for ${formatDate(booking.bookingDetails.checkIn)} to ${formatDate(booking.bookingDetails.checkOut)}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading booking confirmation...</Typography>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          Booking not found. Please check your booking ID.
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#5a3d35', mb: 2 }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
          Thank you for choosing Luxe Staycations
        </Typography>
        
        {/* Unique Booking ID */}
        <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4, border: '2px solid #4caf50' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50', mb: 2, textAlign: 'center' }}>
              Your Booking ID
            </Typography>
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              p: 2, 
              borderRadius: 1, 
              border: '1px solid #e9ecef',
              mb: 2,
              textAlign: 'center'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#5a3d35', 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  lineHeight: 1.2
                }}
              >
                {booking.id}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Please save this ID for future reference
            </Typography>
            
            {/* Email Status */}
            {emailStatus === 'sent' && (
              <Alert severity="success" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                Confirmation email sent to {booking.guestInfo.email}
              </Alert>
            )}
            {emailStatus === 'not-configured' && (
              <Alert severity="info" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                Email service not configured. Please contact admin to set up email notifications.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={4}>
        {/* Booking Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4, border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt />
                Booking Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Property</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {booking.bookingDetails.propertyName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {booking.bookingDetails.propertyLocation}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Check-in</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatDate(booking.bookingDetails.checkIn)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Check-out</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatDate(booking.bookingDetails.checkOut)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <People sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Guests</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {booking.bookingDetails.guests} {parseInt(booking.bookingDetails.guests) === 1 ? 'Guest' : 'Guests'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card sx={{ mb: 4, border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email />
                Guest Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#d97706', width: 64, height: 64 }}>
                  {booking.guestInfo.firstName.charAt(0)}{booking.guestInfo.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Primary Guest
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{booking.guestInfo.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{booking.guestInfo.phone}</Typography>
                  </Box>
                </Grid>
                {booking.guestInfo.address && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                      <Typography variant="body2">
                        {booking.guestInfo.address}
                        {booking.guestInfo.city && `, ${booking.guestInfo.city}`}
                        {booking.guestInfo.country && `, ${booking.guestInfo.country}`}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment />
                Payment Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Base Amount</Typography>
                  <Typography variant="body2">₹{booking.bookingDetails.total.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Service Fee</Typography>
                  <Typography variant="body2">₹{(booking.bookingDetails.total * 0.1).toLocaleString()}</Typography>
                </Box>
                
                {/* Show coupon discount if applied */}
                {booking.paymentDetails?.couponDiscount && booking.paymentDetails.couponDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      Coupon Discount ({booking.paymentDetails.couponCode || 'Applied'})
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      -₹{booking.paymentDetails.couponDiscount.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total Paid</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>
                    ₹{booking.paymentDetails?.finalAmount?.toLocaleString() || (booking.bookingDetails.total * 1.1).toLocaleString()}
                  </Typography>
                </Box>
                
                <Chip 
                  label="Payment Successful" 
                  color="success" 
                  icon={<CheckCircle />}
                  sx={{ width: '100%' }}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadReceipt}
                  fullWidth
                >
                  Download Receipt
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShareBooking}
                  fullWidth
                >
                  Share Booking
                </Button>
                                 <Button
                   variant="contained"
                   startIcon={<Home />}
                   onClick={() => router.push('/')}
                   fullWidth
                   sx={{
                     background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                     '&:hover': {
                       background: 'linear-gradient(45deg, #4a332c, #b45309)',
                     }
                   }}
                 >
                   Return to Home
                 </Button>
                 <Button
                   variant="outlined"
                   startIcon={<BookOnline />}
                   onClick={() => {
                     // Set the current booking ID and redirect to guest dashboard
                     localStorage.setItem('currentBookingId', booking.id);
                     localStorage.setItem('guestEmail', booking.guestInfo.email);
                     router.push('/guest/dashboard');
                   }}
                   fullWidth
                   sx={{ mt: 1 }}
                 >
                   Manage This Booking
                 </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
