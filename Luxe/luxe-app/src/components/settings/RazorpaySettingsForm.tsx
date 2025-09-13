'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Payment,
  Save,
  PlayArrow,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Security,
  ColorLens,
  Business
} from '@mui/icons-material';
import { razorpayService, RazorpayConfig, defaultRazorpayConfig } from '@/lib/razorpayService';

export default function RazorpaySettingsForm() {
  const [config, setConfig] = useState<RazorpayConfig>(defaultRazorpayConfig);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Load existing configuration from localStorage
    const savedConfig = localStorage.getItem('luxeRazorpayConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setIsConfigured(true);
      } catch (error) {
        console.error('Error loading Razorpay config:', error);
      }
    }
  }, []);

  const handleConfigChange = (field: keyof RazorpayConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrefillChange = (field: keyof RazorpayConfig['prefill'], value: string) => {
    setConfig(prev => ({
      ...prev,
      prefill: {
        ...prev.prefill,
        [field]: value
      }
    }));
  };

  const handleThemeChange = (field: keyof RazorpayConfig['theme'], value: string) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value
      }
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!config.keyId || !config.keySecret) {
        setTestResult({
          success: false,
          message: 'Key ID and Key Secret are required'
        });
        setIsLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem('luxeRazorpayConfig', JSON.stringify(config));
      
      // Configure Razorpay service
      razorpayService.configure(config);
      
      setIsConfigured(true);
      setTestResult({
        success: true,
        message: 'Razorpay configuration saved successfully!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error saving Razorpay configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPayment = async () => {
    if (!isConfigured) {
      setTestResult({
        success: false,
        message: 'Please save configuration before testing'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await razorpayService.testPayment();
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Test payment initiated successfully! Check the payment modal.' 
          : 'Failed to initiate test payment.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error testing payment gateway'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfig = () => {
    setConfig(defaultRazorpayConfig);
    setIsConfigured(false);
    localStorage.removeItem('luxeRazorpayConfig');
    setTestResult(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Payment />
        Razorpay Payment Gateway
      </Typography>

      {/* Status Indicator */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={isConfigured ? <CheckCircle /> : <Error />}
          label={isConfigured ? 'Razorpay Configured' : 'Razorpay Not Configured'}
          color={isConfigured ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>

      {/* Test Result Alert */}
      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* API Configuration */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid #f3f4f6', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security />
                API Configuration
              </Typography>

              <TextField
                fullWidth
                label="Key ID"
                value={config.keyId}
                onChange={(e) => handleConfigChange('keyId', e.target.value)}
                placeholder="rzp_test_xxxxxxxxxxxxx"
                helperText="Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Key Secret"
                type={showKeySecret ? 'text' : 'password'}
                value={config.keySecret}
                onChange={(e) => handleConfigChange('keySecret', e.target.value)}
                placeholder="Enter your Razorpay Key Secret"
                helperText="Your Razorpay Key Secret (keep this secure)"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      edge="end"
                    >
                      {showKeySecret ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={config.currency}
                  onChange={(e) => handleConfigChange('currency', e.target.value)}
                  label="Currency"
                >
                  <MenuItem value="INR">Indian Rupee (INR)</MenuItem>
                  <MenuItem value="USD">US Dollar (USD)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid #f3f4f6', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                Company Settings
              </Typography>

              <TextField
                fullWidth
                label="Company Name"
                value={config.companyName}
                onChange={(e) => handleConfigChange('companyName', e.target.value)}
                placeholder="Luxe Staycations"
                helperText="Name displayed on payment page"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={config.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Luxury Villa Booking"
                helperText="Description shown on payment page"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Theme Color"
                value={config.theme.color}
                onChange={(e) => handleThemeChange('color', e.target.value)}
                placeholder="#d97706"
                helperText="Hex color code for payment theme"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Prefill Settings */}
        <Grid item xs={12}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706' }}>
                Prefill Settings (Optional)
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                These fields will be pre-filled on the payment page. Leave empty to let users fill them.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Default Name"
                    value={config.prefill.name}
                    onChange={(e) => handlePrefillChange('name', e.target.value)}
                    placeholder="Guest Name"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Default Email"
                    value={config.prefill.email}
                    onChange={(e) => handlePrefillChange('email', e.target.value)}
                    placeholder="guest@example.com"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Default Contact"
                    value={config.prefill.contact}
                    onChange={(e) => handlePrefillChange('contact', e.target.value)}
                    placeholder="8828279739"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSaveConfig()}
          disabled={isLoading}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Save Configuration
        </Button>

        <Button
          variant="outlined"
          startIcon={<PlayArrow />}
          onClick={() => handleTestPayment()}
          disabled={isLoading || !isConfigured}
        >
          Test Payment Gateway
        </Button>

        <Button
          variant="outlined"
          onClick={() => handleResetConfig()}
          disabled={isLoading}
        >
          Reset to Default
        </Button>
      </Box>

      {/* Configuration Help */}
      <Card sx={{ border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
            How to Get Razorpay API Keys
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Step 1:</strong> Sign up for a Razorpay account at{' '}
            <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d97706' }}>
              razorpay.com
            </a>
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Step 2:</strong> Go to Settings → API Keys in your Razorpay Dashboard
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Step 3:</strong> Generate a new API key pair
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Step 4:</strong> Copy the Key ID and Key Secret to the fields above
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Note:</strong> Use test keys (rzp_test_*) for development and live keys (rzp_live_*) for production.
            Never share your Key Secret publicly.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
