"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Diamond,
  Visibility,
  VisibilityOff,
  Search,
  AccountCircle,
  Lock
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface GuestLoyaltyAuthProps {
  onAuthSuccess: (guestId: string, guestEmail: string) => void;
}

export default function GuestLoyaltyAuth({ onAuthSuccess }: GuestLoyaltyAuthProps) {
  const router = useRouter();
  const [guestId, setGuestId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate input
      if (!guestId.trim() || !password.trim()) {
        setError('Please enter both Guest ID and Password');
        setLoading(false);
        return;
      }

      // Simulate API call to authenticate guest
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any non-empty credentials
      // In production, validate against your database
      if (guestId.trim() && password.trim()) {
        // Store guest authentication in localStorage
        localStorage.setItem('loyaltyGuestId', guestId.trim());
        localStorage.setItem('loyaltyGuestEmail', `${guestId.trim()}@guest.com`);
        
        // Call success callback
        onAuthSuccess(guestId.trim(), `${guestId.trim()}@guest.com`);
      } else {
        setError('Invalid credentials. Please try again.');
      }
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

  const handleGuestRegistration = () => {
    // Redirect to guest registration page or show registration modal
    setError('Guest registration feature coming soon. Please contact support for access.');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Diamond sx={{ fontSize: 64, color: '#ffd700', mb: 2 }} />
        <Typography variant="h3" sx={{ 
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 2
        }}>
          💎 Luxe Jewels Loyalty
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Access your personal jewel wallet and exclusive rewards
        </Typography>
      </Box>

      <Card sx={{ 
        border: '2px solid #f3f4f6',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            fontWeight: 600, 
            color: 'var(--primary-dark)', 
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            <AccountCircle sx={{ color: 'var(--primary-light)' }} />
            Guest Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Guest ID"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              placeholder="Enter your Guest ID"
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyPress={handleKeyPress}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
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
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading || !guestId.trim() || !password.trim()}
            sx={{
              py: 2,
              mb: 2,
              background: 'linear-gradient(45deg, var(--primary-dark), var(--primary-light))',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Access My Jewel Wallet'
            )}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGuestRegistration}
            sx={{
              py: 1.5,
              borderColor: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              '&:hover': {
                borderColor: 'var(--primary-dark)',
                backgroundColor: 'rgba(217, 119, 6, 0.04)'
              }
            }}
          >
            New Guest? Register Here
          </Button>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary-dark)' }}>
            How to Access Your Jewel Wallet
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Your Guest ID and Password can be found in:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <strong>Welcome Email:</strong> Sent after your first booking
            </Typography>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <strong>Booking Confirmation:</strong> Available in your booking details
            </Typography>
            <Typography component="li" variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              <strong>Guest Dashboard:</strong> Accessible from your main guest account
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>Need Help?</strong> Contact us at <strong>loyalty@luxestaycations.com</strong>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

