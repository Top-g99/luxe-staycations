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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Refresh,
  Email,
  CheckCircle,
  Error,
  Warning,
  PlayArrow,
  Visibility,
  Send,
  Analytics
} from '@mui/icons-material';
import { emailDeliveryService, EmailDeliveryLog } from '@/lib/emailDeliveryService';
import { supabaseEmailDeliveryService } from '@/lib/supabaseEmailDeliveryService';
import { emailService } from '@/lib/emailService';

interface DiagnosticsResult {
  success: boolean;
  message: string;
  diagnostics?: {
    tests?: Array<{
      test: string;
      status: string;
      message: string;
    }>;
    recommendations?: string[];
  };
}

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return (error as Error).message;
  }
  return 'Unknown error';
};

export default function EmailDeliveryDashboard() {
  const [deliveryStats, setDeliveryStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<EmailDeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<DiagnosticsResult | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [retryLoading, setRetryLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadDeliveryData();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      loadDeliveryData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadDeliveryData = async () => {
    try {
      // Initialize Supabase service
      await supabaseEmailDeliveryService.initialize();
      
      // Get data from Supabase service
      const stats = await supabaseEmailDeliveryService.getDeliveryStatistics();
      const logs = await supabaseEmailDeliveryService.getRecentDeliveryLogs(100);
      
      setDeliveryStats(stats);
      setRecentLogs(logs);
      setLastUpdated(new Date());
      
      console.log('Email delivery data loaded:', { stats, logsCount: logs.length });
    } catch (error) {
      console.error('Error loading delivery data:', error);
      // Fallback to local service
      const stats = emailDeliveryService.getDeliveryStatistics();
      const logs = emailDeliveryService.getRecentDeliveryLogs(100);
      
      setDeliveryStats(stats);
      setRecentLogs(logs);
      setLastUpdated(new Date());
      
      console.log('Using fallback delivery data:', { stats, logsCount: logs.length });
    }
  };

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const config = emailService.getConfig();
      if (!config) {
        setDiagnosticsResult({
          success: false,
          message: 'Email service not configured'
        });
        return;
      }

      const result = await emailDeliveryService.runEmailDiagnostics(config);
      setDiagnosticsResult(result);
    } catch (error: unknown) {
      setDiagnosticsResult({
        success: false,
        message: getErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailedEmails = async () => {
    setRetryLoading(true);
    try {
      const result = await emailDeliveryService.retryFailedEmails();
      loadDeliveryData(); // Refresh data
      
      setDiagnosticsResult({
        success: true,
        message: `Retried ${result.retried} emails, ${result.successful} successful`
      });
    } catch (error: unknown) {
      setDiagnosticsResult({
        success: false,
        message: getErrorMessage(error)
      });
    } finally {
      setRetryLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    try {
      const success = await emailService.sendTestEmail(testEmail);
      setDiagnosticsResult({
        success,
        message: success ? 'Test email sent successfully' : 'Failed to send test email'
      });
    } catch (error: unknown) {
      setDiagnosticsResult({
        success: false,
        message: getErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle color="success" />
    ) : (
      <Error color="error" />
    );
  };

  const getStatusChip = (success: boolean) => {
    return (
      <Chip
        icon={getStatusIcon(success)}
        label={success ? 'Delivered' : 'Failed'}
        color={success ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const filteredLogs = filterType === 'all' 
    ? recentLogs 
    : recentLogs.filter(log => log.type === filterType);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Email Delivery Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage email delivery status for all automated emails
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
              Auto-refreshes every 5 seconds
            </Typography>
          </Box>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Emails</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {deliveryStats?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Successful</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {deliveryStats?.successful || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Failed</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {deliveryStats?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Analytics color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {deliveryStats?.successRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadDeliveryData}
        >
          Refresh Data
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<PlayArrow />}
          onClick={() => setDiagnosticsOpen(true)}
        >
          Run Diagnostics
        </Button>
        
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Send />}
          onClick={handleRetryFailedEmails}
          disabled={retryLoading}
        >
          {retryLoading ? <CircularProgress size={20} /> : 'Retry Failed Emails'}
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            label="Filter by Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="booking_confirmation">Booking Confirmation</MenuItem>
            <MenuItem value="consultation_request">Consultation Request</MenuItem>
            <MenuItem value="contact_form">Contact Form</MenuItem>
            <MenuItem value="partner_request">Partner Request</MenuItem>
            <MenuItem value="special_request">Special Request</MenuItem>
            <MenuItem value="booking_cancellation">Booking Cancellation</MenuItem>
            <MenuItem value="admin_notification">Admin Notification</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Recent Delivery Logs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Email Delivery Logs
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip
                        label={log.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{log.recipient}</TableCell>
                    <TableCell>
                      <Tooltip title={log.subject}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {log.subject}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{getStatusChip(log.status.success)}</TableCell>
                    <TableCell>{log.status.deliveryAttempts}</TableCell>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Diagnostics Dialog */}
      <Dialog open={diagnosticsOpen} onClose={() => setDiagnosticsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Email Delivery Diagnostics</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Email Configuration
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Test Email Address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleSendTestEmail}
                disabled={loading || !testEmail}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                Send Test
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Diagnostics
            </Typography>
            <Button
              variant="outlined"
              onClick={handleRunDiagnostics}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
            >
              Run Diagnostics
            </Button>
          </Box>

          {diagnosticsResult && (
            <Alert 
              severity={diagnosticsResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {diagnosticsResult.message}
            </Alert>
          )}

          {diagnosticsResult?.diagnostics && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Diagnostic Results
              </Typography>
              {diagnosticsResult.diagnostics.tests?.map((test: any, index: number) => (
                <Alert
                  key={index}
                  severity={test.status === 'PASS' ? 'success' : test.status === 'WARN' ? 'warning' : 'error'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">{test.test}</Typography>
                  <Typography variant="body2">{test.message}</Typography>
                </Alert>
              ))}
              
              {diagnosticsResult.diagnostics?.recommendations && diagnosticsResult.diagnostics.recommendations.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <ul>
                    {diagnosticsResult.diagnostics.recommendations.map((rec: string, index: number) => (
                      <li key={index}>
                        <Typography variant="body2">{rec}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiagnosticsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
