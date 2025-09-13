"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  LinearProgress,
  CircularProgress,
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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Security,
  Shield,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Download,
  Settings,
  Lock,
  Visibility,
  VisibilityOff,
  Delete,
  Block
} from '@mui/icons-material';
import { SecureAuthManager } from '@/lib/security/secureAuth';
import { SecurityAuditLogger, RateLimiter } from '@/lib/security/securityUtils';
import { paymentSecurityManager } from '@/lib/security/paymentSecurity';
import { fileUploadSecurityManager } from '@/lib/security/fileUploadSecurity';
import { businessLogicSecurityManager } from '@/lib/security/businessLogicSecurity';
import { dataProtectionSecurityManager } from '@/lib/security/dataProtectionSecurity';
import { securityTestingFramework } from '@/lib/security/securityTesting';

interface SecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  ip?: string;
  userAgent?: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  activeSessions: number;
  blockedIPs: number;
  rateLimitedRequests: number;
  paymentSecurity: {
    fraudAttempts: number;
    blockedCards: number;
    suspiciousTransactions: number;
  };
  fileUploadSecurity: {
    blockedFiles: number;
    maliciousFiles: number;
    sanitizedFiles: number;
  };
  businessLogicSecurity: {
    suspiciousActivities: number;
    blockedUsers: number;
    priceManipulations: number;
  };
  dataProtection: {
    consentRecords: number;
    dataProcessingLogs: number;
    erasureRequests: number;
  };
}

export default function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    activeSessions: 0,
    blockedIPs: 0,
    rateLimitedRequests: 0,
    paymentSecurity: {
      fraudAttempts: 0,
      blockedCards: 0,
      suspiciousTransactions: 0
    },
    fileUploadSecurity: {
      blockedFiles: 0,
      maliciousFiles: 0,
      sanitizedFiles: 0
    },
    businessLogicSecurity: {
      suspiciousActivities: 0,
      blockedUsers: 0,
      priceManipulations: 0
    },
    dataProtection: {
      consentRecords: 0,
      dataProcessingLogs: 0,
      erasureRequests: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    enableRateLimiting: true,
    enableCSRFProtection: true,
    enableAuditLogging: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 15
  });
  const [runningSecurityTests, setRunningSecurityTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security events (in a real app, this would come from a security service)
      const events = await loadSecurityEvents();
      setSecurityEvents(events);
      
      // Calculate stats
      const stats = calculateSecurityStats(events);
      setSecurityStats(stats);
      
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async (): Promise<SecurityEvent[]> => {
    // In a real implementation, this would fetch from a security monitoring service
    // For now, we'll simulate some events
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        event: 'LOGIN_SUCCESS',
        severity: 'low',
        details: { username: 'admin', ip: '192.168.1.100' },
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        event: 'LOGIN_FAILED',
        severity: 'medium',
        details: { username: 'admin', attempts: 3, ip: '192.168.1.101' },
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        event: 'RATE_LIMITED',
        severity: 'high',
        details: { endpoint: '/api/users', ip: '192.168.1.102', requests: 150 },
        ip: '192.168.1.102',
        userAgent: 'curl/7.68.0'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        event: 'SUSPICIOUS_REQUEST',
        severity: 'critical',
        details: { 
          path: '/admin/users', 
          pattern: 'sql_injection', 
          ip: '192.168.1.103' 
        },
        ip: '192.168.1.103',
        userAgent: 'sqlmap/1.6.2'
      }
    ];
  };

  const calculateSecurityStats = (events: SecurityEvent[]): SecurityStats => {
    const stats: SecurityStats = {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      mediumEvents: events.filter(e => e.severity === 'medium').length,
      lowEvents: events.filter(e => e.severity === 'low').length,
      activeSessions: 1, // Would be calculated from active sessions
      blockedIPs: events.filter(e => e.severity === 'critical').length,
      rateLimitedRequests: events.filter(e => e.event === 'RATE_LIMITED').length,
      paymentSecurity: {
        fraudAttempts: events.filter(e => e.event === 'FRAUD_DETECTED').length,
        blockedCards: events.filter(e => e.event === 'TEST_CARD_DETECTED').length,
        suspiciousTransactions: events.filter(e => e.event === 'SUSPICIOUS_TRANSACTION').length
      },
      fileUploadSecurity: {
        blockedFiles: events.filter(e => e.event === 'BLOCKED_FILE_TYPE').length,
        maliciousFiles: events.filter(e => e.event === 'MALICIOUS_FILE_DETECTED').length,
        sanitizedFiles: events.filter(e => e.event === 'FILE_SANITIZED').length
      },
      businessLogicSecurity: {
        suspiciousActivities: events.filter(e => e.event === 'SUSPICIOUS_BOOKING_ACTIVITY').length,
        blockedUsers: events.filter(e => e.event === 'USER_BLOCKED').length,
        priceManipulations: events.filter(e => e.event === 'SUSPICIOUS_PRICE_CHANGE').length
      },
      dataProtection: {
        consentRecords: events.filter(e => e.event === 'CONSENT_RECORDED').length,
        dataProcessingLogs: events.filter(e => e.event === 'DATA_PROCESSING_LOGGED').length,
        erasureRequests: events.filter(e => e.event === 'DATA_ERASURE_REQUESTED').length
      }
    };
    
    return stats;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Error />;
      case 'high': return <Warning />;
      case 'medium': return <Info />;
      case 'low': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const handleEventClick = (event: SecurityEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(securityEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBlockIP = (ip: string) => {
    // In a real implementation, this would block the IP
    SecurityAuditLogger.logSecurityEvent('IP_BLOCKED', { ip }, 'high');
    alert(`IP ${ip} has been blocked`);
  };

  const runSecurityTests = async () => {
    setRunningSecurityTests(true);
    try {
      const results = await securityTestingFramework.runComprehensiveSecurityTests();
      setTestResults(results);
      
      SecurityAuditLogger.logSecurityEvent('SECURITY_TESTS_RUN', {
        overallScore: results.overallScore,
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        criticalIssues: results.criticalIssues
      }, results.criticalIssues > 0 ? 'high' : 'low');
      
    } catch (error) {
      console.error('Error running security tests:', error);
    } finally {
      setRunningSecurityTests(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading security dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
          Security Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadSecurityData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportLogs}
          >
            Export Logs
          </Button>
          <Button
            variant="contained"
            startIcon={runningSecurityTests ? <CircularProgress size={20} /> : <Security />}
            onClick={runSecurityTests}
            disabled={runningSecurityTests}
            sx={{
              backgroundColor: 'var(--primary-dark)',
              '&:hover': {
                backgroundColor: 'var(--primary-light)'
              }
            }}
          >
            {runningSecurityTests ? 'Running Tests...' : 'Run Security Tests'}
          </Button>
        </Box>
      </Box>

      {/* Security Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Events
                  </Typography>
                  <Typography variant="h4">
                    {securityStats.totalEvents}
                  </Typography>
                </Box>
                <Security color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Events
                  </Typography>
                  <Typography variant="h4" color="error">
                    {securityStats.criticalEvents}
                  </Typography>
                </Box>
                <Error color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Sessions
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {securityStats.activeSessions}
                  </Typography>
                </Box>
                <Shield color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Blocked IPs
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {securityStats.blockedIPs}
                  </Typography>
                </Box>
                <Block color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Test Results */}
      {testResults && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Security Test Results"
            subheader={`Overall Score: ${testResults.overallScore}% (${testResults.passedTests}/${testResults.totalTests} tests passed)`}
            action={
              <Chip
                label={testResults.overallScore >= 80 ? 'Secure' : testResults.overallScore >= 60 ? 'Needs Attention' : 'Critical Issues'}
                color={testResults.overallScore >= 80 ? 'success' : testResults.overallScore >= 60 ? 'warning' : 'error'}
                variant="filled"
              />
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error">
                    {testResults.criticalIssues}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Issues
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {testResults.highIssues}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {testResults.mediumIssues}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medium Priority
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {testResults.passedTests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tests Passed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {testResults.criticalIssues > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🚨 Critical Security Issues Detected
                </Typography>
                <Typography variant="body2">
                  {testResults.criticalIssues} critical security issues require immediate attention. 
                  Please review the failed tests and implement fixes as soon as possible.
                </Typography>
              </Alert>
            )}
            
            {testResults.overallScore < 80 && testResults.criticalIssues === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Security Score Below 80%
                </Typography>
                <Typography variant="body2">
                  Overall security score is {testResults.overallScore}%. Consider addressing 
                  high and medium priority issues to improve security posture.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Events Table */}
      <Card>
        <CardHeader
          title="Security Events"
          subheader="Recent security events and alerts"
          action={
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => {/* Open settings dialog */}}
            >
              Settings
            </Button>
          }
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>User Agent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {securityEvents.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {event.event}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(event.severity)}
                        label={event.severity.toUpperCase()}
                        color={getSeverityColor(event.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {event.ip}
                        </Typography>
                        {event.severity === 'critical' && (
                          <Tooltip title="Block IP">
                            <IconButton
                              size="small"
                              onClick={() => handleBlockIP(event.ip!)}
                              color="error"
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.userAgent}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEventClick(event)}
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Security Event Details
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Event Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.event}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Severity
                  </Typography>
                  <Chip
                    icon={getSeverityIcon(selectedEvent.severity)}
                    label={selectedEvent.severity.toUpperCase()}
                    color={getSeverityColor(selectedEvent.severity) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    IP Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.ip}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    User Agent
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {selectedEvent.userAgent}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
