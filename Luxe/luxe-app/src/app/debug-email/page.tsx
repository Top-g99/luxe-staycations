'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Divider,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { emailService } from '@/lib/emailService';
import { supabaseEmailManager } from '@/lib/supabaseEmailManager';

export default function DebugEmailPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Test 1: Supabase Connection
      addResult('Supabase Connection', 'info', 'Testing Supabase connection...');
      try {
        await supabaseEmailManager.initialize();
        addResult('Supabase Connection', 'success', 'Supabase connection successful');
      } catch (error) {
        addResult('Supabase Connection', 'error', `Supabase connection failed: ${error}`);
        return;
      }

      // Test 2: Email Configuration Loading
      addResult('Config Loading', 'info', 'Loading email configuration...');
      try {
        const emailConfig = supabaseEmailManager.getConfiguration();
        if (emailConfig) {
          setConfig(emailConfig);
          addResult('Config Loading', 'success', 'Email configuration loaded from Supabase', {
            smtpHost: emailConfig.smtpHost,
            smtpPort: emailConfig.smtpPort,
            smtpUser: emailConfig.smtpUser,
            enableSSL: emailConfig.enableSSL,
            fromEmail: emailConfig.fromEmail,
            fromName: emailConfig.fromName
          });
        } else {
          addResult('Config Loading', 'error', 'No email configuration found in Supabase');
          return;
        }
      } catch (error) {
        addResult('Config Loading', 'error', `Failed to load configuration: ${error}`);
        return;
      }

      // Test 3: Email Service Initialization
      addResult('Email Service', 'info', 'Initializing email service...');
      try {
        await emailService.initialize();
        const serviceConfig = emailService.getConfig();
        if (serviceConfig) {
          addResult('Email Service', 'success', 'Email service initialized successfully', {
            isConfigured: emailService.isEmailConfigured(),
            config: serviceConfig
          });
        } else {
          addResult('Email Service', 'error', 'Email service not properly configured');
        }
      } catch (error) {
        addResult('Email Service', 'error', `Email service initialization failed: ${error}`);
      }

      // Test 4: SMTP Connection Test
      if (config) {
        addResult('SMTP Test', 'info', 'Testing SMTP connection...');
        try {
          const testResult = await emailService.testConnection();
          addResult('SMTP Test', testResult.success ? 'success' : 'error', testResult.message);
        } catch (error) {
          addResult('SMTP Test', 'error', `SMTP test failed: ${error}`);
        }
      }

      // Test 5: Database Tables Check
      addResult('Database Tables', 'info', 'Checking email configuration table...');
      try {
        const { getSupabaseClient, TABLES } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();
        
        if (supabase) {
          const { data, error } = await supabase
            .from(TABLES.EMAIL_CONFIGURATIONS)
            .select('*')
            .eq('is_active', true);
          
          if (error) {
            addResult('Database Tables', 'error', `Database query failed: ${error.message}`);
          } else {
            addResult('Database Tables', 'success', `Found ${data?.length || 0} active email configurations`, data);
          }
        } else {
          addResult('Database Tables', 'error', 'Supabase client not available');
        }
      } catch (error) {
        addResult('Database Tables', 'error', `Database check failed: ${error}`);
      }

    } catch (error) {
      addResult('General', 'error', `Diagnostic failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔍';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: '#5a3d35' }}>
        Email Configuration Diagnostics
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Run Email System Diagnostics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This diagnostic tool will test all components of the email system to identify issues.
          </Typography>
          
          <Button
            variant="contained"
            onClick={runDiagnostics}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Diagnostic Results
            </Typography>
            
            {results.map((result, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {getStatusIcon(result.status)}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mr: 2, fontWeight: 600 }}>
                    {result.test}
                  </Typography>
                  <Chip 
                    label={result.status.toUpperCase()} 
                    color={getStatusColor(result.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                    {result.timestamp}
                  </Typography>
                </Box>
                
                <Alert 
                  severity={result.status === 'success' ? 'success' : result.status === 'error' ? 'error' : 'info'}
                  sx={{ mb: 1 }}
                >
                  {result.message}
                </Alert>
                
                {result.details && (
                  <Box sx={{ ml: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Details:
                    </Typography>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </Box>
                )}
                
                {index < results.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {config && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Email Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">SMTP Host</Typography>
                <Typography variant="body1">{config.smtpHost}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">SMTP Port</Typography>
                <Typography variant="body1">{config.smtpPort}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">SMTP User</Typography>
                <Typography variant="body1">{config.smtpUser}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">SSL/TLS</Typography>
                <Typography variant="body1">{config.enableSSL ? 'Enabled' : 'Disabled'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">From Email</Typography>
                <Typography variant="body1">{config.fromEmail}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">From Name</Typography>
                <Typography variant="body1">{config.fromName}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
