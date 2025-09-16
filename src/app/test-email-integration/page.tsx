'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  Email,
  CheckCircle,
  Error,
  Refresh,
  Send
} from '@mui/icons-material';
import { supabaseEmailDeliveryService } from '@/lib/supabaseEmailDeliveryService';
import { emailDeliveryService } from '@/lib/emailDeliveryService';
import { emailService } from '@/lib/emailService';

export default function TestEmailIntegration() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Initialize Supabase service
      await supabaseEmailDeliveryService.initialize();
      
      // Get delivery statistics
      const stats = await supabaseEmailDeliveryService.getDeliveryStatistics();
      setDeliveryStats(stats);
      
      // Get recent logs
      const logs = await supabaseEmailDeliveryService.getRecentDeliveryLogs(10);
      setRecentLogs(logs);
      
      console.log('Test data loaded:', { stats, logs });
    } catch (error) {
      console.error('Error loading test data:', error);
      // Fallback to local service
      const stats = emailDeliveryService.getDeliveryStatistics();
      const logs = emailDeliveryService.getRecentDeliveryLogs(10);
      setDeliveryStats(stats);
      setRecentLogs(logs);
    }
  };

  const runIntegrationTest = async () => {
    setLoading(true);
    const results: any[] = [];
    
    try {
      // Test 1: Supabase Service Initialization
      results.push({
        test: 'Supabase Service Initialization',
        status: 'running',
        message: 'Testing...'
      });
      setTestResults([...results]);
      
      await supabaseEmailDeliveryService.initialize();
      results[0] = {
        test: 'Supabase Service Initialization',
        status: 'success',
        message: 'Supabase service initialized successfully'
      };
      setTestResults([...results]);
      
      // Test 2: Email Service Configuration
      results.push({
        test: 'Email Service Configuration',
        status: 'running',
        message: 'Testing...'
      });
      setTestResults([...results]);
      
      const isConfigured = emailService.isConfigured;
      results[1] = {
        test: 'Email Service Configuration',
        status: isConfigured ? 'success' : 'warning',
        message: isConfigured ? 'Email service is configured' : 'Email service not configured (this is expected for testing)'
      };
      setTestResults([...results]);
      
      // Test 3: Delivery Statistics
      results.push({
        test: 'Delivery Statistics',
        status: 'running',
        message: 'Testing...'
      });
      setTestResults([...results]);
      
      const stats = await supabaseEmailDeliveryService.getDeliveryStatistics();
      results[2] = {
        test: 'Delivery Statistics',
        status: 'success',
        message: `Retrieved statistics: ${stats.total} total emails, ${stats.successful} successful, ${stats.failed} failed`
      };
      setTestResults([...results]);
      
      // Test 4: Recent Logs
      results.push({
        test: 'Recent Logs',
        status: 'running',
        message: 'Testing...'
      });
      setTestResults([...results]);
      
      const logs = await supabaseEmailDeliveryService.getRecentDeliveryLogs(5);
      results[3] = {
        test: 'Recent Logs',
        status: 'success',
        message: `Retrieved ${logs.length} recent delivery logs`
      };
      setTestResults([...results]);
      
      // Test 5: Log Email Delivery (Simulation)
      results.push({
        test: 'Log Email Delivery',
        status: 'running',
        message: 'Testing...'
      });
      setTestResults([...results]);
      
      const logId = await supabaseEmailDeliveryService.logEmailDelivery(
        'admin_notification',
        'test@example.com',
        'Test Email Integration',
        'Test email content for integration testing'
      );
      
      results[4] = {
        test: 'Log Email Delivery',
        status: logId ? 'success' : 'error',
        message: logId ? `Email delivery logged with ID: ${logId}` : 'Failed to log email delivery'
      };
      setTestResults([...results]);
      
      // Refresh data after logging
      await loadData();
      
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = (error as Error).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }
      
      results.push({
        test: 'Integration Test',
        status: 'error',
        message: `Test failed: ${errorMessage}`
      });
      setTestResults([...results]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Error color="warning" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Email Integration Test
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Test the integration between email services and delivery tracking
      </Typography>

      {/* Test Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              onClick={runIntegrationTest}
              disabled={loading}
            >
              {loading ? 'Running Tests...' : 'Run Integration Test'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
            >
              Refresh Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            {testResults.map((result, index) => (
              <Alert
                key={index}
                severity={getStatusColor(result.status) as any}
                icon={getStatusIcon(result.status)}
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">{result.test}</Typography>
                <Typography variant="body2">{result.message}</Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delivery Statistics */}
      {deliveryStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Delivery Statistics
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

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Delivery Logs
            </Typography>
            {recentLogs.map((log, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">
                    {log.type.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Chip
                    icon={log.status.success ? <CheckCircle /> : <Error />}
                    label={log.status.success ? 'Delivered' : 'Failed'}
                    color={log.status.success ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>To:</strong> {log.recipient}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Subject:</strong> {log.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Time:</strong> {new Date(log.createdAt).toLocaleString()}
                </Typography>
                {log.status.error && (
                  <Typography variant="body2" color="error">
                    <strong>Error:</strong> {log.status.error}
                  </Typography>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {recentLogs.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No delivery logs found. Run the integration test to create some test data.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
