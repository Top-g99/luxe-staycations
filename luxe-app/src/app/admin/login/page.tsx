"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  AdminPanelSettings
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AdminAuthManager } from '@/lib/adminAuth';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    if (AdminAuthManager.isLoggedIn()) {
      router.push('/admin');
    }
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify credentials using AdminAuthManager
      if (AdminAuthManager.verifyCredentials(credentials.username, credentials.password)) {
        // Set login session
        AdminAuthManager.setLoginSession();
        
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError('Invalid username or password');
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

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#FFFEF7', // Ivory white
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Card sx={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}>
            <AdminPanelSettings sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" sx={{ 
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              mb: 1
            }}>
              Admin Login
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Access the Luxe Staycations Admin Dashboard
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Username"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--secondary-dark) 0%, var(--primary-dark) 100%)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => router.push('/')}
                sx={{ color: 'text.secondary' }}
              >
                ← Back to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
