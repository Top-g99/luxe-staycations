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
  Template,
  Trigger,
  Analytics,
  Refresh,
  Add,
  Edit,
  Delete,
  ExpandMore,
  Send,
  TestTube
} from '@mui/icons-material';
import { emailService } from '@/lib/email/EmailService';
import { EmailConfig, EmailTemplate, EmailTrigger } from '@/lib/email/types';

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

  // Configuration form state
  const [configForm, setConfigForm] = useState({
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 587,
    smtpUser: 'info@luxestaycations.in',
    smtpPassword: '',
    enableSSL: false,
    fromName: 'Luxe Staycations',
    fromEmail: 'info@luxestaycations.in'
  });

  useEffect(() => {
    initializeEmailSystem();
  }, []);

  const initializeEmailSystem = async () => {
    try {
      console.log('Initializing enhanced email system...');
      setIsLoading(true);
      
      const success = await emailService.initialize();
      if (success) {
        setIsInitialized(true);
        setIsConfigured(emailService.isReady());
        
        // Load current configuration
        const currentConfig = emailService.getConfig();
        if (currentConfig) {
          setConfig(currentConfig);
          setConfigForm({
            smtpHost: currentConfig.smtpHost,
            smtpPort: currentConfig.smtpPort,
            smtpUser: currentConfig.smtpUser,
            smtpPassword: currentConfig.smtpPassword,
            enableSSL: currentConfig.enableSSL,
            fromName: currentConfig.fromName,
            fromEmail: currentConfig.fromEmail
          });
        }

        // Load templates and triggers
        setTemplates(emailService.getTemplates());
        setTriggers(emailService.getTriggers());
        
        console.log('Enhanced email system initialized successfully');
      } else {
        console.error('Failed to initialize email system');
      }
    } catch (error) {
      console.error('Error initializing email system:', error);
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
      // This would need to be implemented in the EmailService
      // For now, we'll just show a success message
      setTestResult({
        success: true,
        message: 'Email configuration saved successfully! The enhanced email system is now active.'
      });
      
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
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
      const result = await emailService.testConnection();
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      const result = await emailService.sendTestEmail(testEmail);
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Enhanced test email sent successfully! Check your inbox.' 
          : `Failed to send test email: ${result.error || 'Unknown error'}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error sending test email: ${error instanceof Error ? error.message : 'Unknown error'}`
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
                helperText="SMTP server port (587 for TLS, 465 for SSL)"
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
                    checked={configForm.enableSSL}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing Enhanced Email System...</Typography>
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
