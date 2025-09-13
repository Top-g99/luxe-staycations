"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  Lock,
  Person,
  Warning
} from '@mui/icons-material';
import { SecureAuthManager } from '@/lib/security/secureAuth';
import { SecurityAuditLogger } from '@/lib/security/securityUtils';

export default function SecureAdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const sessionInfo = SecureAuthManager.getSessionInfo();
    if (sessionInfo.isLoggedIn) {
      router.push('/admin');
      return;
    }

    // Check for security warnings
    checkSecurityWarnings();
  }, [router]);

  const checkSecurityWarnings = () => {
    const warnings: string[] = [];
    
    // Check if running on HTTP in production
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && process.env.NODE_ENV === 'production') {
      warnings.push('Connection is not secure. Please use HTTPS in production.');
    }
    
    // Check for suspicious browser extensions or developer tools
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if (userAgent.includes('HeadlessChrome') || userAgent.includes('PhantomJS')) {
        warnings.push('Suspicious browser detected. Access may be restricted.');
      }
    }
    
    setSecurityWarnings(warnings);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const clientIP = 'unknown'; // In a real app, this would be determined server-side
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';

      const result = await SecureAuthManager.secureLogin(
        formData.username,
        formData.password,
        clientIP,
        userAgent
      );

      if (result.success && result.session) {
        SecurityAuditLogger.logSecurityEvent('SECURE_LOGIN_SUCCESS', {
          username: formData.username,
          userAgent,
          rememberMe: formData.rememberMe
        }, 'low');

        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(result.error || 'Login failed');
        setRemainingAttempts(result.remainingAttempts || null);
        
        SecurityAuditLogger.logSecurityEvent('SECURE_LOGIN_FAILED', {
          username: formData.username,
          userAgent,
          error: result.error,
          remainingAttempts: result.remainingAttempts
        }, 'medium');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      SecurityAuditLogger.logSecurityEvent('SECURE_LOGIN_ERROR', {
        username: formData.username,
        error: errorMessage
      }, 'high');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // This would typically open a password change dialog
    router.push('/admin/change-password');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2d1b1b 0%, #1a1a1a 50%, #0f0f0f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{
          padding: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-dark)',
              mb: 2
            }}>
              <Security sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography variant="h4" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              mb: 1
            }}>
              Secure Admin Access
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Enhanced security authentication required
            </Typography>
          </Box>

          {/* Security Warnings */}
          {securityWarnings.length > 0 && (
            <Alert 
              severity="warning" 
              icon={<Warning />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Security Notice:
              </Typography>
              {securityWarnings.map((warning, index) => (
                <Typography key={index} variant="body2">
                  • {warning}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                remainingAttempts !== null && remainingAttempts > 0 && (
                  <Typography variant="body2" color="error">
                    {remainingAttempts} attempts remaining
                  </Typography>
                )
              }
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--primary-dark)',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'var(--primary-dark)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
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
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--primary-dark)',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'var(--primary-dark)',
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: 'var(--primary-dark)',
                      '&.Mui-checked': {
                        color: 'var(--primary-dark)',
                      },
                    }}
                  />
                }
                label="Remember me"
              />
              
              <Button
                variant="text"
                onClick={handlePasswordChange}
                disabled={loading}
                sx={{ color: 'var(--primary-dark)' }}
              >
                Change Password
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !formData.username || !formData.password}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: 'var(--primary-dark)',
                '&:hover': {
                  backgroundColor: 'var(--primary-light)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <Typography>Authenticating...</Typography>
                </Box>
              ) : (
                'Secure Login'
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Security Features Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enhanced Security Features:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              • Rate limiting protection • CSRF token validation • Session encryption
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              • Audit logging • Account lockout • Secure session management
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
