"use client";

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Business,
  Security,
  Analytics,
  Payment,
  Support
} from '@mui/icons-material';
import { useHost } from '@/contexts/HostContext';
import { useRouter } from 'next/navigation';

export default function HostLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useHost();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/host/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  const features = [
    {
      icon: <Business sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Property Management',
      description: 'Manage all your properties from one dashboard'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Revenue Analytics',
      description: 'Track bookings, revenue, and performance metrics'
    },
    {
      icon: <Payment sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Payment Tracking',
      description: 'Monitor payments and manage bank details'
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '24/7 Support',
      description: 'Get help whenever you need it'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Login Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'primary.main', 
                fontWeight: 'bold' 
              }}>
                Host Login
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Access your property management portal
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 3 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2E1A16 0%, #4D3027 100%)'
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Login to Portal'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                New to Luxe Staycations?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Want to list your property?
              </Typography>
              <Link href="/partner-with-us" sx={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Partner With Us
                </Button>
              </Link>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link href="/host/forgot-password" sx={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Forgot Password?
                </Typography>
              </Link>
            </Box>
          </Paper>
        </Grid>

        {/* Features & Benefits */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ 
              fontFamily: 'Playfair Display, serif',
              color: 'primary.main', 
              fontWeight: 'bold', 
              mb: 3 
            }}>
              Why Choose Luxe Staycations?
            </Typography>
            
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ 
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 'bold' 
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'primary.contrastText', 
                fontWeight: 'bold' 
              }}>
                🎯 Ready to Maximize Your Property's Potential?
              </Typography>
              <Typography variant="body1" sx={{ color: 'primary.contrastText', mb: 2 }}>
                Join thousands of successful property owners who trust Luxe Staycations
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.contrastText' }}>
                • Increase your bookings by up to 300%<br/>
                • Professional photography & marketing<br/>
                • 24/7 guest support & management<br/>
                • Secure payment processing
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
