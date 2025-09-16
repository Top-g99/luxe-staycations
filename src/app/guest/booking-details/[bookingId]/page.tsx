'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BookOnline,
  CalendarToday,
  LocationOn,
  People,
  Payment,
  Email,
  Phone,
  Home
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

interface BookingDetails {
  id: string;
  property_name: string;
  property_location: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_amount: number;
  status: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  created_at: string;
}

function BookingDetailsContent({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error || !data) {
          setError('Booking not found. Please check your booking ID.');
          return;
        }

        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('An error occurred while fetching booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={64} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading booking details...
        </Typography>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Booking not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => router.push('/')}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <BookOnline sx={{ fontSize: 64, color: '#d97706', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#5a3d35', mb: 2 }}>
          Booking Details
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Your booking information and stay details
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#5a3d35' }}>
              {booking.property_name}
            </Typography>
            <Chip
              label={booking.status.toUpperCase()}
              color={getStatusColor(booking.status) as any}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ color: '#d97706', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {booking.property_location}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ color: '#d97706', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {booking.guests} Guest{booking.guests > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ color: '#d97706', mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Check-in
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(booking.check_in_date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ color: '#d97706', mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Check-out
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(booking.check_out_date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
            Guest Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ color: '#d97706', mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {booking.guest_email}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ color: '#d97706', mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {booking.guest_phone}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
            Payment Information
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Payment sx={{ color: '#d97706', mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Total Amount
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#5a3d35' }}>
              {formatCurrency(booking.total_amount)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Want to earn rewards on future bookings?</strong> Join our Luxe Rewards program to earn points, 
          get exclusive member rates, and enjoy VIP services. 
          <Button 
            variant="text" 
            sx={{ ml: 1, textTransform: 'none' }}
            onClick={() => router.push('/guest/signup')}
          >
            Sign up now
          </Button>
        </Typography>
      </Alert>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => router.push('/')}
          sx={{
            py: 2,
            px: 4,
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={64} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    }>
      <BookingDetailsContent bookingId={bookingId} />
    </Suspense>
  );
}
