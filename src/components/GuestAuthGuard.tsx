'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { BookOnline } from '@mui/icons-material';

interface GuestAuthGuardProps {
  children: React.ReactNode;
}

export default function GuestAuthGuard({ children }: GuestAuthGuardProps) {
  const router = useRouter();
  const { getBookingById } = useBookingContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const guestEmail = localStorage.getItem('guestEmail');
      const currentBookingId = localStorage.getItem('currentBookingId');

      if (guestEmail && currentBookingId) {
        // Verify booking ID exists and matches the email
        const booking = getBookingById(currentBookingId);
        if (booking && booking.guestInfo.email === guestEmail) {
          setIsAuthenticated(true);
        } else {
          // Invalid session, clear and redirect
          localStorage.removeItem('guestEmail');
          localStorage.removeItem('currentBookingId');
          router.push('/guest/login');
        }
      } else {
        // No session data, redirect to login
        router.push('/guest/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, getBookingById]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} sx={{ color: '#d97706' }} />
        <Typography variant="h6" sx={{ color: '#5a3d35' }}>
          Verifying your booking access...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
          p: 3
        }}
      >
        <BookOnline sx={{ fontSize: 80, color: '#d97706' }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#5a3d35', textAlign: 'center' }}>
          Access Denied
        </Typography>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          You need to log in with your booking ID to access this page.
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push('/guest/login')}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}





