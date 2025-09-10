'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Build,
  Email,
  Settings,
  Send,
  Visibility,
  ExpandMore,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { emailSystemFixer, EmailSystemStatus } from '@/lib/emailSystemFixer';
import { emailService } from '@/lib/emailService';
import { supabaseEmailDeliveryService } from '@/lib/supabaseEmailDeliveryService';
import { emailDeliveryService } from '@/lib/emailDeliveryService';

export default function EmailSystemDashboard() {
  const [status, setStatus] = useState<EmailSystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<any>(null);

  useEffect(() => {
    loadSystemStatus();
    loadDeliveryStats();
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      loadSystemStatus();
      loadDeliveryStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      const systemStatus = await emailSystemFixer.runSystemCheck();
      setStatus(systemStatus);
      setLastUpdated(new Date());
      console.log('Email system status loaded:', systemStatus);
    } catch (error) {
      console.error('Failed to load system status:', error);
      // Set a basic status even if there's an error
      setStatus({
        isConfigured: false,
        isWorking: false,
        issues: ['Failed to load system status'],
        fixes: [],
        lastTested: new Date().toISOString()
      });
    }
  };

  const loadDeliveryStats = async () => {
    try {
      await supabaseEmailDeliveryService.initialize();
      const stats = await supabaseEmailDeliveryService.getDeliveryStatistics();
      setDeliveryStats(stats);
      console.log('Email system delivery stats loaded:', stats);
    } catch (error) {
      console.error('Failed to load delivery stats:', error);
      // Fallback to local service
      const stats = emailDeliveryService.getDeliveryStatistics();
      setDeliveryStats(stats);
      console.log('Using fallback delivery stats:', stats);
    }
  };

  const handleFixIssues = async () => {
    setFixing(true);
    try {
      const systemStatus = await emailSystemFixer.runSystemCheck();
      setStatus(systemStatus);
    } catch (error) {
      console.error('Failed to fix issues:', error);
    } finally {
      setFixing(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    try {
      // Use the real API endpoint for testing
      const response = await fetch('/api/email/send-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          subject: 'Test Email from Luxe Staycations System',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #8B4513;">🧪 System Test Email</h2>
              <p>This is a test email from the Luxe Staycations Email System Dashboard.</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Email system is working correctly!</p>
              <hr style="margin: 20px 0; border: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from the admin dashboard to verify email delivery functionality.
              </p>
            </div>
          `,
          text: `Test Email from Luxe Staycations System\n\nTimestamp: ${new Date().toLocaleString()}\nStatus: Email system is working correctly!\n\nThis email was sent from the admin dashboard to verify email delivery functionality.`
        }),
      });

      const result = await response.json();
      
      setTestResult({
        success: result.success,
        message: result.success ? 'Test email sent successfully!' : `Failed to send test email: ${result.message || 'Unknown error'}`
      });

      // Refresh stats after sending test email
      if (result.success) {
        loadDeliveryStats();
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Network error: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle color="success" />;
      case 'FAIL':
        return <Error color="error" />;
      case 'WARN':
        return <Warning color="warning" />;
      default:
        return <Error color="error" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'success';
      case 'FAIL':
        return 'error';
      case 'WARN':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (loading && !status) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Checking Email System Status...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Email System Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive email system monitoring and troubleshooting
        </Typography>
        {lastUpdated && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip
              icon={<Refresh />}
              label={`Live - Last updated: ${lastUpdated.toLocaleTimeString()}`}
              color="success"
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Auto-refreshes every 10 seconds
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delivery Statistics */}
      {deliveryStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Live Email Delivery Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {deliveryStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Emails
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {deliveryStats.successful}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {deliveryStats.failed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {deliveryStats.successRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Overall Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">System Status</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadSystemStatus}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={fixing ? <CircularProgress size={20} /> : <Build />}
                onClick={handleFixIssues}
                disabled={fixing}
              >
                {fixing ? 'Fixing...' : 'Fix Issues'}
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Configuration</Typography>
                <Chip
                  icon={getStatusIcon(status?.isConfigured ? 'PASS' : 'FAIL')}
                  label={status?.isConfigured ? 'Configured' : 'Not Configured'}
                  color={getStatusColor(status?.isConfigured ? 'PASS' : 'FAIL')}
                  sx={{ mb: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Functionality</Typography>
                <Chip
                  icon={getStatusIcon(status?.isWorking ? 'PASS' : 'FAIL')}
                  label={status?.isWorking ? 'Working' : 'Not Working'}
                  color={getStatusColor(status?.isWorking ? 'PASS' : 'FAIL')}
                  sx={{ mb: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Issues</Typography>
                <Chip
                  icon={status?.issues.length === 0 ? <CheckCircle /> : <Error />}
                  label={`${status?.issues.length || 0} Issues`}
                  color={status?.issues.length === 0 ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                />
              </Box>
            </Grid>
          </Grid>

          {status?.lastTested && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Last tested: {new Date(status.lastTested).toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Issues and Fixes */}
      {status && (status.issues.length > 0 || status.fixes.length > 0) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {status.issues.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error" gutterBottom>
                    <Error sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Issues Found
                  </Typography>
                  <List dense>
                    {status.issues.map((issue, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Error color="error" />
                        </ListItemIcon>
                        <ListItemText primary={issue} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {status.fixes.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Fixes Applied
                  </Typography>
                  <List dense>
                    {status.fixes.map((fix, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={fix} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => setTestDialogOpen(true)}
            >
              Send Test Email
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => window.open('/admin/settings', '_blank')}
            >
              Email Settings
            </Button>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => window.open('/admin/email-delivery', '_blank')}
            >
              Delivery Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Email Service:</strong> {emailService.isEmailConfigured() ? 'Configured' : 'Not Configured'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Check:</strong> {status?.lastTested ? new Date(status.lastTested).toLocaleString() : 'Never'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Issues Count:</strong> {status?.issues.length || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Fixes Applied:</strong> {status?.fixes.length || 0}
              </Typography>
            </Grid>
            {deliveryStats && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Total Emails Sent:</strong> {deliveryStats.total}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Success Rate:</strong> {deliveryStats.successRate}%
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Test Email Address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              fullWidth
              sx={{ mb: 2 }}
            />
            
            {testResult && (
              <Alert 
                severity={testResult.success ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {testResult.message}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendTestEmail}
            disabled={loading || !testEmail}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
