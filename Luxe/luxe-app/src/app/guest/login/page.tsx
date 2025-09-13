'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  BookOnline,
  Visibility,
  VisibilityOff,
  Search,
  Home
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';

export default function GuestLoginPage() {
  const router = useRouter();
  const { allBookings, getBookingById } = useBookingContext();
  
  const [bookingId, setBookingId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate booking ID format
      if (!bookingId.trim()) {
        setError('Please enter your booking ID');
        setLoading(false);
        return;
      }

      // Check if booking ID exists in the original system
      const booking = getBookingById(bookingId.trim());
      
      if (!booking) {
        setError('Invalid booking ID. Please check and try again.');
        setLoading(false);
        return;
      }

      // Store guest email for dashboard access
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestEmail', booking.guestInfo.email);
        localStorage.setItem('currentBookingId', bookingId.trim());
      }
      
      // Redirect to guest dashboard
      router.push('/guest/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <BookOnline sx={{ fontSize: 64, color: '#d97706', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#5a3d35', mb: 2 }}>
          Manage My Booking
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Access your booking details and manage your stay
        </Typography>
      </Box>

      <Card sx={{ border: '2px solid #f3f4f6' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#d97706', textAlign: 'center' }}>
            Login with Booking ID
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter your booking ID"
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              type={showPassword ? 'text' : 'password'}
              helperText="Enter your unique booking ID (same as password)"
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading || !bookingId.trim()}
            sx={{
              py: 2,
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            {loading ? 'Accessing Booking...' : 'Access My Booking'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push('/')}
            startIcon={<Home />}
          >
            Browse Properties
          </Button>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
            How to Find Your Booking ID
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Your booking ID can be found in:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <strong>Confirmation Email:</strong> Sent to your email after booking
            </Typography>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <strong>Booking Confirmation Page:</strong> Displayed after payment completion
            </Typography>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <strong>Booking Receipt:</strong> Downloaded after booking confirmation
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>Format:</strong> booking_1234567890_abc123def
          </Typography>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Need help accessing your booking?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Contact us at <strong>support@luxestaycations.com</strong> or call <strong>+91-98765-43210</strong>
        </Typography>
      </Box>
    </Container>
  );
}
