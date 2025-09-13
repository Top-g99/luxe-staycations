'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Link as MuiLink
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Lock,
  Phone,
  CheckCircle,
  Diamond
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}

export default function GuestSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeToNewsletter: true
  });

  const handleInputChange = (field: keyof SignupFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (field: keyof Pick<SignupFormData, 'agreeToTerms' | 'subscribeToNewsletter'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeToTerms) return 'Please agree to terms and conditions';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/guest/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          subscribeToNewsletter: formData.subscribeToNewsletter
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to verification page or dashboard
        setTimeout(() => {
          router.push('/guest/verify-email?email=' + encodeURIComponent(formData.email));
        }, 2000);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Welcome to Luxe Rewards!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your account has been created successfully. Please check your email to verify your account and activate your loyalty benefits.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to email verification...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ 
          color: 'var(--primary-dark)', 
          fontFamily: 'Playfair Display, serif',
          mb: 2
        }}>
          Join Luxe Rewards
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create your account and unlock exclusive benefits
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Benefits Card */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #5a3d35 0%, #d97706 100%)', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Diamond sx={{ mr: 1 }} />
                Luxe Rewards Benefits
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#FFD700' }}>
                  🏆 Earn Points
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Earn 1 point for every ₹100 spent on bookings
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#FFD700' }}>
                  💎 Exclusive Rates
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Access member-only pricing and special offers
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#FFD700' }}>
                  🎯 Priority Booking
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Get priority access to new properties and peak dates
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#FFD700' }}>
                  🌟 VIP Services
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Complimentary amenities and personalized concierge
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.3)' }} />
              
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "Join thousands of satisfied guests who enjoy exclusive luxury experiences"
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Signup Form */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonAdd sx={{ mr: 1, color: 'var(--primary-dark)' }} />
                Create Your Account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeToTerms}
                        onChange={handleCheckboxChange('agreeToTerms')}
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <MuiLink href="/terms-of-service" target="_blank">
                          Terms of Service
                        </MuiLink>{' '}
                        and{' '}
                        <MuiLink href="/privacy-policy" target="_blank">
                          Privacy Policy
                        </MuiLink>
                      </Typography>
                    }
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.subscribeToNewsletter}
                        onChange={handleCheckboxChange('subscribeToNewsletter')}
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Subscribe to our newsletter for exclusive offers and updates
                      </Typography>
                    }
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    bgcolor: 'var(--primary-dark)',
                    '&:hover': { bgcolor: 'var(--primary-light)' }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account & Join Luxe Rewards'
                  )}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink component={Link} href="/guest/login">
                    Sign in here
                  </MuiLink>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

