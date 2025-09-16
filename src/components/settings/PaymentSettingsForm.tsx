'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { Save, Refresh, Security } from '@mui/icons-material';
import { settingsManager, PaymentSettings } from '@/lib/settingsManager';

export default function PaymentSettingsForm() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { settingsManager } = await import('@/lib/settingsManager');
      
      if (typeof window !== 'undefined') {
        settingsManager.initialize();
      }
      
      const paymentSettings = await settingsManager.getPaymentSettings();
      setSettings(paymentSettings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payment settings:', error);
      setLoading(false);
    }
  };

  const handleSettingChange = (field: keyof PaymentSettings, value: string | number | boolean) => {
    if (settings) {
      setSettings(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const { settingsManager } = await import('@/lib/settingsManager');
      
      const success = await settingsManager.updatePaymentSettings(settings);

      if (success) {
        setMessage({ type: 'success', text: 'Payment settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update payment settings. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      setMessage({ type: 'error', text: 'Error saving payment settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setMessage(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading payment settings...</Typography>
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box>
        <Alert severity="error">Payment settings not found</Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment Configuration
          </Typography>
          <Box>
            <Button
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ mr: 2 }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Razorpay Configuration */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security />
              Razorpay Configuration
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Razorpay Key ID"
              value={settings.razorpayKeyId}
              onChange={(e) => handleSettingChange('razorpayKeyId', e.target.value)}
              variant="outlined"
              type="password"
              helperText="Your Razorpay public key"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Razorpay Key Secret"
              value={settings.razorpayKeySecret}
              onChange={(e) => handleSettingChange('razorpayKeySecret', e.target.value)}
              variant="outlined"
              type="password"
              helperText="Your Razorpay secret key"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* General Payment Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              General Payment Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                <MenuItem value="USD">US Dollar ($)</MenuItem>
                <MenuItem value="EUR">Euro (€)</MenuItem>
                <MenuItem value="GBP">British Pound (£)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tax Rate (%)"
              type="number"
              value={settings.taxRate}
              onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
              variant="outlined"
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Tax rate applied to bookings"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Commission Rate (%)"
              type="number"
              value={settings.commissionRate}
              onChange={(e) => handleSettingChange('commissionRate', parseFloat(e.target.value) || 0)}
              variant="outlined"
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Commission rate for partner properties"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoConfirmBookings}
                  onChange={(e) => handleSettingChange('autoConfirmBookings', e.target.checked)}
                />
              }
              label="Auto-confirm bookings"
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Automatically confirm bookings when payment is successful
            </Typography>
          </Grid>

          {/* Security Notice */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Security Notice:</strong> Your Razorpay keys are encrypted and stored securely. 
                Never share these keys publicly. For production, ensure you're using live keys from your Razorpay dashboard.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

