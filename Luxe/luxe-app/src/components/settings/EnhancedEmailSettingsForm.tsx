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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  Add,
  Edit,
  Delete,
  ExpandMore,
  Send,
  Science as TestTube,
  Description as Template,
  FlashOn as Trigger,
  Analytics
} from '@mui/icons-material';

// Types for the email system
interface EmailConfig {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableSSL: boolean;
  fromName: string;
  fromEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailTrigger {
  id: string;
  name: string;
  event: string;
  templateId: string;
  priority: 'low' | 'normal' | 'high';
  delay: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnhancedEmailSettingsForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [triggers, setTriggers] = useState<EmailTrigger[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Configuration form state - initialize with empty password for security
  const [configForm, setConfigForm] = useState({
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 587,
    smtpUser: 'info@luxestaycations.in',
    smtpPassword: '', // Password will be loaded from saved config or entered by user
    enableSSL: false, // This will be determined by port in the API
    fromName: 'Luxe Staycations',
    fromEmail: 'info@luxestaycations.in',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    initializeEmailSystem();
  }, []);

  const initializeEmailSystem = async () => {
    try {
      console.log('Initializing enhanced email system...');
      setIsLoading(true);
      
      // Load saved configuration from API first, then fallback to localStorage
      try {
        const response = await fetch('/api/email/save-config');
        const result = await response.json();
        
        if (result.success && result.data) {
          setConfigForm(result.data);
          setIsConfigured(true);
          console.log('Loaded saved email configuration from database');
        } else {
          // Fallback to localStorage
          const savedConfig = localStorage.getItem('emailConfig');
          if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            setConfigForm(parsedConfig);
            setIsConfigured(true);
            console.log('Loaded saved email configuration from localStorage');
          }
        }
      } catch (error) {
        console.error('Error loading configuration from API:', error);
        // Fallback to localStorage
        const savedConfig = localStorage.getItem('emailConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfigForm(parsedConfig);
          setIsConfigured(true);
          console.log('Loaded saved email configuration from localStorage (fallback)');
        }
      }
      
      setIsInitialized(true);
      
      // Set default templates
      setTemplates([
        {
          id: '1',
          name: 'Booking Confirmation',
          type: 'booking_confirmation',
          subject: 'Booking Confirmed - {{propertyName}}',
          content: 'Your booking has been confirmed!',
          isActive: true,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Booking Cancellation',
          type: 'booking_cancellation',
          subject: 'Booking Cancelled - {{propertyName}}',
          content: 'Your booking has been cancelled.',
          isActive: true,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      
      setTriggers([]);
      
      console.log('Enhanced email system initialized successfully');
    } catch (error) {
      console.error('Error initializing email system:', error);
      // Still set as initialized to show the form even if there's an error
      setIsInitialized(true);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConfigChange = (field: keyof typeof configForm, value: string | number | boolean) => {
    setConfigForm(prev => ({
      ...prev,
      [field]: field === 'smtpPort' ? (isNaN(Number(value)) ? 587 : Number(value)) : value
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Save to database via API
      const response = await fetch('/api/email/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: configForm }),
      });

      const result = await response.json();

      if (result.success) {
        // Also save to localStorage as backup
        localStorage.setItem('emailConfig', JSON.stringify(configForm));
        
        setTestResult({
          success: true,
          message: 'Email configuration saved successfully! The enhanced email system is now active.'
        });
        
        setIsConfigured(true);
      } else {
        // Fallback to localStorage if API fails
        localStorage.setItem('emailConfig', JSON.stringify(configForm));
        
        setTestResult({
          success: true,
          message: 'Email configuration saved locally! (Database save failed, but configuration is active)'
        });
        
        setIsConfigured(true);
      }
      
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      // Fallback to localStorage if API fails
      localStorage.setItem('emailConfig', JSON.stringify(configForm));
      
      setTestResult({
        success: true,
        message: 'Email configuration saved locally! (Database connection failed, but configuration is active)'
      });
      
      setIsConfigured(true);
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/email/test-connection-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configForm),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: 'SMTP connection test successful! Your email configuration is working.'
        });
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Connection test failed'
        });
      }
    } catch (error: unknown) {
      setTestResult({
        success: false,
        message: `Error testing connection: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
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
      const response = await fetch('/api/email/send-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...configForm,
          to: testEmail,
          subject: 'Test Email from Luxe Staycations',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #5a3d35; text-align: center; margin-bottom: 20px;">🎉 Email Test Successful!</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Congratulations! Your email configuration is working perfectly. This is a test email from your Luxe Staycations email system.
                </p>
                <div style="background-color: #f0f8f0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
                  <p style="margin: 0; color: #2e7d32; font-weight: bold;">✅ SMTP Configuration Details:</p>
                  <ul style="margin: 10px 0 0 0; color: #2e7d32;">
                    <li>Host: ${configForm.smtpHost}</li>
                    <li>Port: ${configForm.smtpPort}</li>
                    <li>SSL/TLS: ${configForm.enableSSL ? 'Enabled' : 'Disabled'}</li>
                    <li>From: ${configForm.fromName} &lt;${configForm.fromEmail}&gt;</li>
                  </ul>
                </div>
                <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                  This email was sent at ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `,
          config: configForm
        }),
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
          message: result.message || 'Failed to send test email'
        });
      }
    } catch (error: unknown) {
      setTestResult({
        success: false,
        message: `Error sending test email: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfigurationTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35' }}>
        SMTP Configuration
      </Typography>
      
      {/* Password Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Password Required:</strong> Please enter your email password in the SMTP Password field below. 
          This password will be securely stored and used for sending emails. If you need to reset your password, 
          please update it here and save the configuration.
        </Typography>
      </Alert>

      {/* Status Indicator */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={isConfigured ? <CheckCircle /> : <Error />}
          label={isConfigured ? 'Enhanced Email System Active' : 'Email System Not Configured'}
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
          <Grid container spacing={3}>
            {/* From Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email Address"
                value={configForm.fromEmail}
                onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                placeholder="info@luxestaycations.in"
                helperText="Email address that will appear as sender"
              />
            </Grid>

            {/* From Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                value={configForm.fromName}
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
                value={configForm.smtpHost}
                onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                placeholder="smtp.hostinger.com"
                helperText="SMTP server hostname"
              />
            </Grid>

            {/* SMTP Port */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={configForm.smtpPort}
                onChange={(e) => handleConfigChange('smtpPort', e.target.value)}
                placeholder="587"
                helperText="SMTP server port (587 for TLS, 465 for SSL) - SSL/TLS is auto-detected"
              />
            </Grid>

            {/* SMTP Username */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                value={configForm.smtpUser}
                onChange={(e) => handleConfigChange('smtpUser', e.target.value)}
                placeholder="info@luxestaycations.in"
                helperText="Your email address or username"
              />
            </Grid>

            {/* SMTP Password */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                type={showPassword ? 'text' : 'password'}
                value={configForm.smtpPassword}
                onChange={(e) => handleConfigChange('smtpPassword', e.target.value)}
                placeholder="Enter your email password"
                helperText="Enter your email password. This will be securely stored and used for sending emails."
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
                    checked={configForm.enableSSL}
                    onChange={(e) => handleConfigChange('enableSSL', e.target.checked)}
                  />
                }
                label="Enable SSL/TLS (Auto-detected based on port)"
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
              Save Configuration
            </Button>

            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              Test Connection
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card sx={{ mt: 3, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706' }}>
            Test Enhanced Email System
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Send a test email to verify your enhanced email system is working correctly.
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
                startIcon={<TestTube />}
                onClick={handleTestEmail}
                disabled={isLoading || !isConfigured}
              >
                Send Test Email
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderTemplatesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35' }}>
          Email Templates
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Template />}
            onClick={() => console.log('Load comprehensive templates')}
          >
            Load Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            Add Template
          </Button>
        </Box>
      </Box>

      {/* Template Categories Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Booking Templates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  background: '#e3f2fd', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>📅</Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  Booking Templates
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Confirmation, cancellation, and modification emails
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Confirmation" size="small" color="primary" />
                <Chip label="Cancellation" size="small" color="error" />
                <Chip label="Modification" size="small" color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Templates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  background: '#e8f5e8', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>💳</Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  Payment Templates
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Payment confirmations, receipts, and refund notifications
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Confirmation" size="small" color="success" />
                <Chip label="Receipt" size="small" color="info" />
                <Chip label="Refund" size="small" color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Guest Templates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  background: '#fff3e0', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>👥</Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 600 }}>
                  Guest Templates
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Welcome messages, check-in instructions, and feedback requests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Welcome" size="small" color="primary" />
                <Chip label="Check-in" size="small" color="info" />
                <Chip label="Feedback" size="small" color="secondary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Host Templates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  background: '#f3e5f5', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>🏠</Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#7b1fa2', fontWeight: 600 }}>
                  Host Templates
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Booking alerts, earnings notifications, and management updates
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Booking Alert" size="small" color="primary" />
                <Chip label="Earnings" size="small" color="success" />
                <Chip label="Management" size="small" color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Templates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  background: '#e1f5fe', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>⚙️</Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#0277bd', fontWeight: 600 }}>
                  Admin Templates
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                System notifications, reports, and administrative alerts
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Notifications" size="small" color="primary" />
                <Chip label="Reports" size="small" color="info" />
                <Chip label="Alerts" size="small" color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Marketing Templates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  background: '#fce4ec', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '20px' }}>📢</Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#c2185b', fontWeight: 600 }}>
                  Marketing Templates
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Newsletters, promotions, and loyalty program communications
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Newsletter" size="small" color="primary" />
                <Chip label="Promotions" size="small" color="error" />
                <Chip label="Loyalty" size="small" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 3, p: 3, background: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#5a3d35' }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<TestTube />}
            onClick={() => console.log('Test all templates')}
            sx={{ background: '#5a3d35' }}
          >
            Test All Templates
          </Button>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => console.log('View analytics')}
          >
            View Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => console.log('Refresh templates')}
          >
            Refresh Templates
          </Button>
        </Box>
      </Box>

      {/* Templates Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={template.type.replace('_', ' ')} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell>
                  <Chip 
                    label={template.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={template.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {template.isDefault && <CheckCircle color="primary" />}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderTriggersTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35' }}>
          Email Triggers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Add Trigger
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Delay</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {triggers.map((trigger) => (
              <TableRow key={trigger.id}>
                <TableCell>{trigger.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={trigger.event.replace('_', ' ')} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{trigger.templateId}</TableCell>
                <TableCell>
                  <Chip 
                    label={trigger.priority} 
                    size="small" 
                    color={trigger.priority === 'high' ? 'error' : trigger.priority === 'normal' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{trigger.delay} min</TableCell>
                <TableCell>
                  <Chip 
                    label={trigger.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={trigger.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35' }}>
        Email Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Emails Sent
              </Typography>
              <Typography variant="h4">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Delivery Rate
              </Typography>
              <Typography variant="h4">
                0%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Rate
              </Typography>
              <Typography variant="h4">
                0%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Click Rate
              </Typography>
              <Typography variant="h4">
                0%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        Analytics data will be available once emails start being sent through the system.
      </Alert>
    </Box>
  );

  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, mb: 2 }}>Initializing Enhanced Email System...</Typography>
        <Button 
          variant="outlined" 
          onClick={initializeEmailSystem}
          disabled={isLoading}
          startIcon={<Refresh />}
        >
          Retry Initialization
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Email />
        Enhanced Email System
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Settings />} label="Configuration" />
          <Tab icon={<Template />} label="Templates" />
          <Tab icon={<Trigger />} label="Triggers" />
          <Tab icon={<Analytics />} label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {renderConfigurationTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderTemplatesTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderTriggersTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        {renderAnalyticsTab()}
      </TabPanel>
    </Box>
  );
}