"use client";

import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Paper,
  Grid
} from '@mui/material';
import {
  Business,
  Lock,
  Email,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { partnerAuthManager } from '@/lib/partnerAuthManager';
import { typographyStyles, buttonStyles, cardStyles } from '@/components/BrandStyles';

export default function PartnerLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await partnerAuthManager.login({
        email: formData.email,
        password: formData.password
      });

      if (result.success && result.user) {
        // Redirect to partner dashboard
        router.push('/partner/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7ede1 0%, #E8E2D9 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Grid container spacing={4}>
          {/* Welcome Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Business sx={{ fontSize: 60, color: 'var(--secondary-dark)', mb: 2 }} />
              <Typography variant="h3" sx={{ ...typographyStyles.h3, mb: 2 }}>
                Partner Portal
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
                Access your property dashboard and manage your business
              </Typography>
              
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h6" sx={{ color: 'var(--primary-dark)', mb: 2 }}>
                  What you can do:
                </Typography>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    • View real-time bookings and revenue
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    • Monitor occupancy rates and analytics
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    • Manage guest details and communications
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    • Update property information and pricing
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    • Access operational reports and insights
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Login Form */}
          <Grid item xs={12} md={6}>
            <Card sx={{ ...cardStyles.elevated, p: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Lock sx={{ fontSize: 40, color: 'var(--secondary-dark)', mb: 2 }} />
                  <Typography variant="h4" sx={{ ...typographyStyles.h4, mb: 1 }}>
                    Partner Login
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Sign in to your partner account
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: (
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      ...buttonStyles.primary,
                      py: 1.5,
                      fontSize: '1.1rem',
                      mb: 3
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Don't have a partner account?
                    </Typography>
                    <Link
                      href="/partner-with-us"
                      sx={{
                        color: 'var(--secondary-dark)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Apply to become a partner
                    </Link>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link
                      href="/partner/forgot-password"
                      sx={{
                        color: 'var(--secondary-dark)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

