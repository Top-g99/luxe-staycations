"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save,
  Refresh,
  CheckCircle,
  Error,
  WhatsApp,
  Visibility,
  VisibilityOff,
  Info
} from '@mui/icons-material';
import { whatsappService, WhatsAppConfig } from '@/lib/whatsappService';

const defaultWhatsAppConfig: WhatsAppConfig = {
  id: '1',
  business_account_id: '',
  access_token: '',
  phone_number_id: '',
  webhook_verify_token: '',
  is_active: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export default function WhatsAppSettingsForm() {
  const [config, setConfig] = useState<WhatsAppConfig>(defaultWhatsAppConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      await whatsappService.initialize();
      const savedConfig = whatsappService.getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
        setIsConfigured(whatsappService.isServiceConfigured());
      }
    } catch (error) {
      console.error('Error loading WhatsApp configuration:', error);
    }
  };

  const handleInputChange = (field: keyof WhatsAppConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const success = await whatsappService.configure(config);
      if (success) {
        setIsConfigured(whatsappService.isServiceConfigured());
        setAlert({
          open: true,
          message: 'WhatsApp configuration saved successfully!',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: 'Failed to save WhatsApp configuration',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving WhatsApp configuration:', error);
      setAlert({
        open: true,
        message: 'Error saving WhatsApp configuration',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!isConfigured) {
      setAlert({
        open: true,
        message: 'Please save configuration first',
        severity: 'info'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await whatsappService.testConnection();
      setAlert({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      setAlert({
        open: true,
        message: 'Error testing WhatsApp connection',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!isConfigured) {
      setAlert({
        open: true,
        message: 'Please save configuration first',
        severity: 'info'
      });
      return;
    }

    const testPhone = prompt('Enter phone number to send test message (with country code):');
    if (!testPhone) return;

    setIsLoading(true);
    try {
      const result = await whatsappService.sendQuickResponse(
        testPhone,
        '🎉 Test message from Luxe Staycations!\n\nThis is a test message to verify WhatsApp integration is working correctly.\n\nBest regards,\nLuxe Staycations Team'
      );
      setAlert({
        open: true,
        message: result.message || 'Operation completed',
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error sending test message:', error);
      setAlert({
        open: true,
        message: 'Error sending test message',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <WhatsApp sx={{ fontSize: 32, color: '#25D366', mr: 2 }} />
            <Box>
              <Typography variant="h5" component="h2">
                WhatsApp Business Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure WhatsApp Business API for automated notifications and communication
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Setup Instructions:</strong>
              <br />
              1. Create a WhatsApp Business Account
              <br />
              2. Set up WhatsApp Business API through Meta for Developers
              <br />
              3. Get your Business Account ID, Access Token, and Phone Number ID
              <br />
              4. Configure webhook for receiving messages (optional)
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Enable/Disable Switch */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_active}
                    onChange={handleInputChange('is_active')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      Enable WhatsApp Integration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Turn on WhatsApp notifications and messaging
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Business Account ID */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Account ID"
                value={config.business_account_id}
                onChange={handleInputChange('business_account_id')}
                placeholder="123456789012345"
                helperText="Your WhatsApp Business Account ID"
                disabled={!config.is_active}
              />
            </Grid>

            {/* Phone Number ID */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number ID"
                value={config.phone_number_id}
                onChange={handleInputChange('phone_number_id')}
                placeholder="123456789012345"
                helperText="Your WhatsApp Business Phone Number ID"
                disabled={!config.is_active}
              />
            </Grid>

            {/* Access Token */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Access Token"
                type={showAccessToken ? 'text' : 'password'}
                value={config.access_token}
                onChange={handleInputChange('access_token')}
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxx"
                helperText="Your WhatsApp Business API Access Token"
                disabled={!config.is_active}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      edge="end"
                    >
                      {showAccessToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* Webhook Verify Token */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Webhook Verify Token"
                value={config.webhook_verify_token}
                onChange={handleInputChange('webhook_verify_token')}
                placeholder="your_webhook_verify_token"
                helperText="Token for webhook verification (optional)"
                disabled={!config.is_active}
              />
            </Grid>

          </Grid>

          {/* Status Indicator */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                icon={isConfigured ? <CheckCircle /> : <Error />}
                label={isConfigured ? 'Configured' : 'Not Configured'}
                color={isConfigured ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleSaveConfig()}
              disabled={isLoading || !config.is_active}
              sx={{
                background: 'linear-gradient(45deg, #25D366, #128C7E)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1ea952, #0f7a6b)',
                }
              }}
            >
              Save Configuration
            </Button>

            <Button
              variant="outlined"
              startIcon={<CheckCircle />}
              onClick={() => handleTestConnection()}
              disabled={isLoading || !isConfigured}
            >
              Test Connection
            </Button>

            <Button
              variant="outlined"
              startIcon={<WhatsApp />}
              onClick={() => handleSendTestMessage()}
              disabled={isLoading || !isConfigured}
            >
              Send Test Message
            </Button>
          </Box>

          {/* Features Info */}
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>WhatsApp Features Enabled:</strong>
              <br />
              • Automated booking confirmations
              <br />
              • Check-in/check-out reminders
              <br />
              • Payment due notifications
              <br />
              • Booking cancellation alerts
              <br />
              • Customer support messaging
              <br />
              • Interactive message buttons
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Loading overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Processing...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
