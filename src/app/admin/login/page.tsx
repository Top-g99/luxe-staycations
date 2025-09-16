'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { CheckCircle as CheckIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to admin dashboard after 2 seconds
    const timer = setTimeout(() => {
      router.push('/admin');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Authentication Removed
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Admin dashboard is now directly accessible
            </Typography>
          </Box>

          {/* Success Alert */}
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Authentication system has been completely removed. You can now access the admin dashboard directly.
          </Alert>

          {/* Redirect Message */}
          <Box textAlign="center" mb={3}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">
              Redirecting to admin dashboard...
            </Typography>
          </Box>

          {/* Manual Redirect Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ArrowIcon />}
            onClick={() => router.push('/admin')}
            sx={{ mb: 2 }}
          >
            Go to Admin Dashboard
          </Button>

          {/* Back to Home Link */}
          <Box textAlign="center">
            <Button
              variant="text"
              onClick={() => router.push('/')}
              sx={{ textTransform: 'none' }}
            >
              ← BACK TO HOME
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
