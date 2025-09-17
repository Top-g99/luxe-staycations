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
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Email,
  Save,
  PlayArrow,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Settings,
  Refresh,
  Send
} from '@mui/icons-material';

interface BrevoConfig {
  id?: string;
  apiKey: string;
  senderEmail: string;
  senderName: string;
  replyToEmail: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function BrevoSettingsForm() {
  const [config, setConfig] = useState<BrevoConfig>({
    apiKey: '',
    senderEmail: '',
    senderName: 'Luxe Staycations',
    replyToEmail: '',
    isActive: false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadBrevoConfiguration();
  }, []);

  const loadBrevoConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/brevo/config');
      const result = await response.json();
      
      if (result.success && result.data) {
        setConfig({
          apiKey: '', // Don't load API key for security
          senderEmail: result.data.senderEmail,
          senderName: result.data.senderName,
          replyToEmail: result.data.replyToEmail,
          isActive: result.data.isActive
        });
        setIsConfigured(true);
        console.log('Brevo configuration loaded');
      } else {
        console.log('No Brevo configuration found');
        setIsConfigured(false);
      }
    } catch (error) {
      console.error('Error loading Brevo configuration:', error);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const handleConfigChange = (field: keyof BrevoConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = async () => {
    if (!config.apiKey || !config.senderEmail || !config.senderName) {
      setTestResult({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/brevo/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          senderEmail: config.senderEmail,
          senderName: config.senderName,
          replyToEmail: config.replyToEmail || config.senderEmail
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Brevo configuration saved successfully!'
        });
        setIsConfigured(true);
        // Clear API key from form for security
        setConfig(prev => ({ ...prev, apiKey: '' }));
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Failed to save Brevo configuration'
        });
      }
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = (error as Error).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setTestResult({
        success: false,
        message: `Error saving configuration: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/brevo/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Brevo database table created successfully! You can now configure your API key.'
        });
      } else {
        let errorMessage = result.message || 'Failed to setup Brevo database table';
        
        // If we have detailed instructions, show them
        if (result.instructions) {
          errorMessage += '\n\nManual Setup Required:\n';
          errorMessage += `1. ${result.instructions.step1}\n`;
          errorMessage += `2. ${result.instructions.step2}\n`;
          errorMessage += `3. ${result.instructions.step3}\n`;
          errorMessage += `4. ${result.instructions.step4}`;
        }
        
        setTestResult({
          success: false,
          message: errorMessage
        });
      }
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = (error as Error).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setTestResult({
        success: false,
        message: `Error setting up database: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setTestResult({
        success: false,
        message: 'Please enter a test email address'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/brevo/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: `Test email sent successfully to ${testEmail}! Check your inbox.`
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to send test email'
        });
      }
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = (error as Error).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setTestResult({
        success: false,
        message: `Error sending test email: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, mb: 2 }}>Loading Brevo Settings...</Typography>
        <Button 
          variant="outlined" 
          onClick={loadBrevoConfiguration}
          disabled={isLoading}
          startIcon={<Refresh />}
        >
          Retry Loading
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Email />
        Brevo Email Service Configuration
      </Typography>

      {/* Status Indicator */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={isConfigured ? <CheckCircle /> : <Error />}
          label={isConfigured ? 'Brevo Email Service Active' : 'Brevo Email Service Not Configured'}
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

      <Card sx={{ border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35' }}>
            Brevo API Configuration
          </Typography>
          
          {/* API Key Notice */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Setup Instructions:</strong>
              <br />1. First, click "Setup Database" to create the required table
              <br />2. Get your API key from the Brevo dashboard under Settings → API Keys
              <br />3. Enter your API key and email settings below
              <br />4. Click "Save Brevo Configuration" to save your settings
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* API Key */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Brevo API Key"
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="xkeys-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                helperText="Your Brevo API key (starts with 'xkeys-')"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* Sender Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Email Address"
                value={config.senderEmail}
                onChange={(e) => handleConfigChange('senderEmail', e.target.value)}
                placeholder="noreply@luxestaycations.in"
                helperText="Email address that will appear as sender"
              />
            </Grid>

            {/* Sender Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Name"
                value={config.senderName}
                onChange={(e) => handleConfigChange('senderName', e.target.value)}
                placeholder="Luxe Staycations"
                helperText="Display name for the sender"
              />
            </Grid>

            {/* Reply-To Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reply-To Email (Optional)"
                value={config.replyToEmail}
                onChange={(e) => handleConfigChange('replyToEmail', e.target.value)}
                placeholder="support@luxestaycations.in"
                helperText="Email address for replies (defaults to sender email)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveConfig}
              disabled={isLoading}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              Save Brevo Configuration
            </Button>

            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={handleSetupDatabase}
              disabled={isLoading}
              color="secondary"
            >
              Setup Database
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadBrevoConfiguration}
              disabled={isLoading}
            >
              Refresh Configuration
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              disabled={isLoading}
              color="secondary"
            >
              Refresh Page
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card sx={{ mt: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706' }}>
            Test Brevo Email Service
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Send a test email to verify your Brevo configuration is working correctly.
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Test Email Address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                helperText="Enter an email address to send a test email"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Send />}
                onClick={handleTestEmail}
                disabled={isLoading || !isConfigured}
              >
                Send Test Email
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Brevo Information */}
      <Card sx={{ mt: 3, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
            About Brevo Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Brevo (formerly Sendinblue) provides reliable email delivery with advanced features like:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label="High Deliverability" size="small" color="primary" />
            <Chip label="Email Analytics" size="small" color="primary" />
            <Chip label="Template Management" size="small" color="primary" />
            <Chip label="A/B Testing" size="small" color="primary" />
            <Chip label="Unsubscribe Management" size="small" color="primary" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Setup Steps:</strong>
            <br />1. Create a Brevo account at <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer">brevo.com</a>
            <br />2. Generate an API key in your Brevo dashboard
            <br />3. Configure the settings above and save
            <br />4. Test the integration with a test email
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
