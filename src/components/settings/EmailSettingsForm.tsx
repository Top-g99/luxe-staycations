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
  Tooltip
} from '@mui/material';
import {
  Email,
  Save,
  PlayArrow,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { emailService, EmailConfig, defaultEmailConfig } from '@/lib/emailService';

export default function EmailSettingsForm() {
  const [config, setConfig] = useState<EmailConfig>(defaultEmailConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Load existing configuration from Supabase
    const loadConfig = async () => {
      try {
        console.log('Initializing email service...');
        await emailService.initialize();
        
        console.log('Email service initialized, loading config...');
        const savedConfig = emailService.getConfig();
        console.log('Retrieved config:', savedConfig ? 'Found' : 'Not found');
        
        if (savedConfig && savedConfig.smtpHost && savedConfig.smtpUser && savedConfig.smtpPassword) {
          setConfig(savedConfig);
          setIsConfigured(true);
          console.log('Email configuration loaded successfully from Supabase');
        } else {
          console.log('No valid email configuration found in Supabase');
          setIsConfigured(false);
        }
      } catch (error: unknown) {
        console.error('Error loading email config from Supabase:', error);
        setIsConfigured(false);
        
        // Fallback to localStorage if Supabase fails
        const savedConfig = localStorage.getItem('luxeEmailConfig');
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            if (parsedConfig.smtpPort && !isNaN(parsedConfig.smtpPort)) {
              parsedConfig.smtpPort = Number(parsedConfig.smtpPort);
            } else {
              parsedConfig.smtpPort = 587;
            }
            setConfig(parsedConfig);
            setIsConfigured(true);
            console.log('Email configuration loaded from localStorage fallback');
          } catch (parseError) {
            console.error('Error parsing localStorage config:', parseError);
            setIsConfigured(false);
          }
        }
      }
    };
    
    loadConfig();
  }, []);

  const handleConfigChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'smtpPort' ? (isNaN(Number(value)) ? 587 : Number(value)) : value
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Configure email service (now saves to Supabase)
      const success = await emailService.configure(config);
      
      if (success) {
        // Reload configuration to ensure it's properly loaded
        await emailService.reloadConfiguration();
        setIsConfigured(true);
        setTestResult({
          success: true,
          message: 'Email configuration saved successfully to Supabase!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setTestResult(null), 3000);
      } else {
        setTestResult({
          success: false,
          message: 'Failed to save email configuration to Supabase'
        });
      }
    } catch (error: unknown) {
      console.error('Error saving email configuration:', error);
      setTestResult({
        success: false,
        message: 'Error saving email configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('Testing SMTP connection with config:', {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        enableSSL: config.enableSSL
      });
      
      const result = await emailService.testConnection();
      console.log('Test connection result:', result);
      
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch (error: unknown) {
      console.error('Error testing SMTP connection:', error);
      const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';
      setTestResult({
        success: false,
        message: `Error testing SMTP connection: ${errorMessage}`
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
      console.log('Sending test email to:', testEmail);
      const success = await emailService.sendTestEmail(testEmail);
      console.log('Test email result:', success);
      
      setTestResult({
        success,
        message: success 
          ? 'Test email sent successfully! Check your inbox.' 
          : 'Failed to send test email. Please check your configuration.'
      });
    } catch (error: unknown) {
      console.error('Error sending test email:', error);
      const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';
      setTestResult({
        success: false,
        message: `Error sending test email: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfig = async () => {
    try {
      // Reset in Supabase
      const success = await emailService.configure(defaultEmailConfig);
      if (success) {
        await emailService.reloadConfiguration();
        setConfig(defaultEmailConfig);
        setIsConfigured(false);
        localStorage.removeItem('luxeEmailConfig');
        setTestResult({
          success: true,
          message: 'Configuration reset to defaults'
        });
        setTimeout(() => setTestResult(null), 3000);
      } else {
        setTestResult({
          success: false,
          message: 'Failed to reset configuration'
        });
      }
    } catch (error: unknown) {
      console.error('Error resetting config:', error);
      setTestResult({
        success: false,
        message: 'Error resetting configuration'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Email />
        Email Configuration
      </Typography>

      {/* Status Indicator */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={isConfigured ? <CheckCircle /> : <Error />}
          label={isConfigured ? 'Email Service Configured' : 'Email Service Not Configured'}
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
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706' }}>
            SMTP Configuration
          </Typography>

          <Grid container spacing={3}>
            {/* From Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email Address"
                value={config.fromEmail}
                onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                placeholder="noreply@luxestaycations.com"
                helperText="Email address that will appear as sender"
              />
            </Grid>

            {/* From Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                value={config.fromName}
                onChange={(e) => handleConfigChange('fromName', e.target.value)}
                placeholder="Luxe Staycations"
                helperText="Display name for the sender"
              />
            </Grid>

            {/* SMTP Host */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={config.smtpHost}
                onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                helperText="SMTP server hostname"
              />
            </Grid>

            {/* SMTP Port */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={config.smtpPort || ''}
                onChange={(e) => handleConfigChange('smtpPort', e.target.value)}
                placeholder="587"
                helperText="SMTP server port (587 for TLS, 465 for SSL)"
              />
            </Grid>

            {/* SMTP Username */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                value={config.smtpUser}
                onChange={(e) => handleConfigChange('smtpUser', e.target.value)}
                placeholder="your-email@gmail.com"
                helperText="Your email address or username"
              />
            </Grid>

            {/* SMTP Password */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                type={showPassword ? 'text' : 'password'}
                value={config.smtpPassword}
                onChange={(e) => handleConfigChange('smtpPassword', e.target.value)}
                placeholder="your-app-password"
                helperText="App password or email password"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* SSL/TLS Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableSSL}
                    onChange={(e) => handleConfigChange('enableSSL', e.target.checked)}
                  />
                }
                label="Enable SSL/TLS"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
              onClick={() => handleResetConfig()}
              disabled={isLoading}
            >
              Reset to Default
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card sx={{ mt: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706' }}>
            Test Email Configuration
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Send a test email to verify your configuration is working correctly.
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
                startIcon={<CheckCircle />}
                onClick={() => handleTestConnection()}
                disabled={isLoading || !isConfigured}
                sx={{ mb: 1 }}
              >
                Test Connection
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={() => handleTestEmail()}
                disabled={isLoading || !isConfigured}
              >
                Send Test Email
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Configuration Help */}
      <Card sx={{ mt: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
            Configuration Help
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>For Gmail:</strong>
          </Typography>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
            <li>SMTP Host: smtp.gmail.com</li>
            <li>SMTP Port: 587 (TLS) or 465 (SSL)</li>
            <li>Use an App Password instead of your regular password</li>
            <li>Enable 2-factor authentication first</li>
          </ul>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>For Outlook/Hotmail:</strong>
          </Typography>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
            <li>SMTP Host: smtp-mail.outlook.com</li>
            <li>SMTP Port: 587</li>
            <li>Use your email password</li>
          </ul>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>For Yahoo:</strong>
          </Typography>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
            <li>SMTP Host: smtp.mail.yahoo.com</li>
            <li>SMTP Port: 587</li>
            <li>Use an App Password</li>
          </ul>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>For Hostinger:</strong>
          </Typography>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
            <li>SMTP Host: smtp.hostinger.com</li>
            <li>SMTP Port: 587 (TLS) or 465 (SSL)</li>
            <li>Username: Your full email address (e.g., info@yourdomain.com)</li>
            <li>Password: Your email account password</li>
            <li>Enable SSL/TLS: Yes (for port 465) or No (for port 587)</li>
          </ul>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Hostinger Troubleshooting:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Make sure your email account is created in Hostinger control panel</li>
              <li>Try port 587 with SSL disabled first</li>
              <li>If port 587 fails, try port 465 with SSL enabled</li>
              <li>Ensure your email account is not suspended or disabled</li>
              <li>Check if your hosting plan includes email services</li>
            </ul>
          </Alert>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Note:</strong> For production use, consider using email services like SendGrid, AWS SES, or Mailgun for better deliverability and features.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
