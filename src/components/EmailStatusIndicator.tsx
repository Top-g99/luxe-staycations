'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  Email,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Settings
} from '@mui/icons-material';
import { emailService } from '@/lib/emailService';
import { emailTriggerManager } from '@/lib/emailTriggers';

interface EmailStatus {
  isConfigured: boolean;
  isInitialized: boolean;
  lastTestResult: {
    success: boolean;
    message: string;
    timestamp: Date;
  } | null;
  triggersEnabled: number;
  totalTriggers: number;
}

export default function EmailStatusIndicator() {
  const [status, setStatus] = useState<EmailStatus>({
    isConfigured: false,
    isInitialized: false,
    lastTestResult: null,
    triggersEnabled: 0,
    totalTriggers: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const checkEmailStatus = async () => {
    setIsLoading(true);
    try {
      await emailService.initialize();
      const triggers = await emailTriggerManager.getTriggers();
      
      setStatus({
        isConfigured: emailService.isConfigured,
        isInitialized: true,
        lastTestResult: null,
        triggersEnabled: triggers.filter(t => t.enabled).length,
        totalTriggers: triggers.length
      });
    } catch (error) {
      console.error('Error checking email status:', error);
      setStatus(prev => ({
        ...prev,
        isInitialized: false
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setIsTesting(true);
    try {
      const result = await emailService.testConnection();
      setStatus(prev => ({
        ...prev,
        lastTestResult: {
          success: result.success,
          message: result.message,
          timestamp: new Date()
        }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        lastTestResult: {
          success: false,
          message: 'Test failed',
          timestamp: new Date()
        }
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = () => {
    if (!status.isInitialized) return 'error';
    if (!status.isConfigured) return 'warning';
    if (status.lastTestResult && !status.lastTestResult.success) return 'error';
    return 'success';
  };

  const getStatusIcon = () => {
    if (!status.isInitialized) return <Error />;
    if (!status.isConfigured) return <Warning />;
    if (status.lastTestResult && !status.lastTestResult.success) return <Error />;
    return <CheckCircle />;
  };

  const getStatusText = () => {
    if (!status.isInitialized) return 'Email service not initialized';
    if (!status.isConfigured) return 'Email service not configured';
    if (status.lastTestResult && !status.lastTestResult.success) return 'Email test failed';
    return 'Email service ready';
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email />
            Email System Status
          </Typography>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={checkEmailStatus}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Checking email status...</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* Main Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={getStatusIcon()}
                label={getStatusText()}
                color={getStatusColor()}
                variant="outlined"
              />
              <Button
                size="small"
                variant="outlined"
                onClick={testEmailConnection}
                disabled={isTesting || !status.isConfigured}
                startIcon={isTesting ? <CircularProgress size={16} /> : <Settings />}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>

            {/* Test Result */}
            {status.lastTestResult && (
              <Alert 
                severity={status.lastTestResult.success ? 'success' : 'error'}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  <strong>Test Result:</strong> {status.lastTestResult.message}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Tested at: {status.lastTestResult.timestamp.toLocaleString()}
                </Typography>
              </Alert>
            )}

            <Divider />

            {/* Email Triggers Status */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Email Triggers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {status.triggersEnabled} of {status.totalTriggers} triggers enabled
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${status.triggersEnabled}/${status.totalTriggers} Active`}
                  color={status.triggersEnabled > 0 ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>

            {/* Configuration Status */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Configuration
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={status.isConfigured ? 'Configured' : 'Not Configured'}
                  color={status.isConfigured ? 'success' : 'warning'}
                  size="small"
                />
                <Chip
                  label={status.isInitialized ? 'Initialized' : 'Not Initialized'}
                  color={status.isInitialized ? 'success' : 'error'}
                  size="small"
                />
              </Stack>
            </Box>

            {/* Quick Actions */}
            {!status.isConfigured && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Email service is not configured. Please configure your SMTP settings in the Email Settings tab.
                </Typography>
              </Alert>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
