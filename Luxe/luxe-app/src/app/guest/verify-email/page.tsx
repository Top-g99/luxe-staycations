'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Email,
  Refresh
} from '@mui/icons-material';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token && emailParam) {
      verifyEmail(token, emailParam);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/guest/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully! Your Luxe Rewards account is now active.');
      } else {
        if (data.message.includes('expired')) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    setStatus('loading');
    try {
      const response = await fetch('/api/guest/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('A new verification email has been sent to your email address.');
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 64, color: 'success.main' }} />;
      case 'error':
      case 'expired':
        return <Error sx={{ fontSize: 64, color: 'error.main' }} />;
      default:
        return <CircularProgress size={64} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
      case 'expired':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Box sx={{ mb: 3 }}>
            {getStatusIcon()}
          </Box>

          <Typography variant="h4" gutterBottom color={getStatusColor() + '.main'}>
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Link Expired'}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {message}
          </Typography>

          {status === 'success' && (
            <Box>
              <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Welcome to Luxe Rewards!</strong><br />
                  Your account is now active and you can start earning points on your next booking.
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  component={Link}
                  href="/guest/dashboard"
                  sx={{
                    bgcolor: 'var(--primary-dark)',
                    '&:hover': { bgcolor: 'var(--primary-light)' }
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/villas"
                >
                  Browse Properties
                </Button>
              </Box>
            </Box>
          )}

          {status === 'expired' && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  Verification links expire after 24 hours for security reasons.
                </Typography>
              </Alert>
              
              <Button
                variant="contained"
                onClick={resendVerification}
                startIcon={<Email />}
                sx={{
                  bgcolor: 'var(--primary-dark)',
                  '&:hover': { bgcolor: 'var(--primary-light)' }
                }}
              >
                Resend Verification Email
              </Button>
            </Box>
          )}

          {status === 'error' && (
            <Box>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  There was an issue verifying your email. This could be due to an invalid or expired link.
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={resendVerification}
                  startIcon={<Refresh />}
                  sx={{
                    bgcolor: 'var(--primary-dark)',
                    '&:hover': { bgcolor: 'var(--primary-light)' }
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/guest/signup"
                >
                  Sign Up Again
                </Button>
              </Box>
            </Box>
          )}

          {status === 'loading' && (
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email address...
            </Typography>
          )}

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              Need help?{' '}
              <MuiLink component={Link} href="/contact-us">
                Contact our support team
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={64} />
            <Typography variant="h4" sx={{ mt: 2 }}>
              Loading...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
