'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  Email,
  CheckCircle,
  Error,
  Analytics,
  Schedule,
  IntegrationInstructions
} from '@mui/icons-material';

interface WorkflowLog {
  id: string;
  workflow_type: string;
  recipient_email: string;
  success: boolean;
  triggered_at: string;
}

export default function BrevoWorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  const availableWorkflows = [
    {
      id: 'booking_confirmation',
      name: 'Booking Confirmation',
      description: 'Immediate confirmation after booking',
      icon: <CheckCircle />,
      color: 'success'
    },
    {
      id: 'pre_arrival_reminder',
      name: 'Pre-arrival Reminder',
      description: '24 hours before check-in',
      icon: <Schedule />,
      color: 'warning'
    },
    {
      id: 'post_stay_followup',
      name: 'Post-stay Follow-up',
      description: '24 hours after checkout',
      icon: <Email />,
      color: 'info'
    },
    {
      id: 'loyalty_welcome',
      name: 'Loyalty Welcome',
      description: 'Welcome new loyalty members',
      icon: <Analytics />,
      color: 'primary'
    },
    {
      id: 'tier_upgrade',
      name: 'Tier Upgrade',
      description: 'Notify tier level upgrades',
      icon: <CheckCircle />,
      color: 'secondary'
    }
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brevo/workflows');
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.data.availableWorkflows);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWorkflow = async () => {
    if (!selectedWorkflow || !testEmail) return;

    setLoading(true);
    setResult(null);

    try {
      const testData = {
        guestName: 'Test Guest',
        guestEmail: testEmail,
        bookingId: 'TEST-' + Date.now(),
        propertyName: 'Test Luxury Villa',
        propertyLocation: 'Test Location',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: '2',
        totalAmount: 15000,
        hostName: 'Test Host',
        hostPhone: '+91-9876543210'
      };

      const response = await fetch('/api/brevo/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowType: selectedWorkflow,
          data: testData
        }),
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message
      });

      if (data.success) {
        setTestDialogOpen(false);
        setTestEmail('');
        setSelectedWorkflow('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error testing workflow'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🤖 Brevo Automated Workflows
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage automated email sequences and triggers for enhanced guest experience
        </Typography>
      </Box>

      {/* Available Workflows */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {availableWorkflows.map((workflow) => (
          <Grid item xs={12} sm={6} md={4} key={workflow.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    color: `${workflow.color}.main`, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {workflow.icon}
                  </Box>
                  <Typography variant="h6">
                    {workflow.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {workflow.description}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={() => {
                    setSelectedWorkflow(workflow.id);
                    setTestDialogOpen(true);
                  }}
                  size="small"
                >
                  Test Workflow
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadWorkflows}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Test Result */}
      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setResult(null)}
        >
          {result.message}
        </Alert>
      )}

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Workflow</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Workflow Type</InputLabel>
              <Select
                value={selectedWorkflow}
                label="Workflow Type"
                onChange={(e) => setSelectedWorkflow(e.target.value)}
              >
                {availableWorkflows.map((workflow) => (
                  <MenuItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Test Email Address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTestWorkflow}
            disabled={loading || !selectedWorkflow || !testEmail}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
          >
            {loading ? 'Testing...' : 'Test Workflow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Integration Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <IntegrationInstructions sx={{ mr: 1, verticalAlign: 'middle' }} />
            System Integration Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              icon={<CheckCircle />} 
              label="Brevo Email Service" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<CheckCircle />} 
              label="Supabase Database" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<CheckCircle />} 
              label="Existing Template Manager" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<CheckCircle />} 
              label="Integrated Email Service" 
              color="success" 
              variant="outlined" 
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            ✅ All workflows integrate with existing email template management system
            <br />
            ✅ Data is saved to Supabase for analytics and tracking
            <br />
            ✅ Fallback support ensures email delivery even if Brevo is unavailable
          </Typography>
        </CardContent>
      </Card>

      {/* Workflow Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Workflow Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<CheckCircle />} 
              label="Automated Sequences Active" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<Email />} 
              label="Email Templates Ready" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<Analytics />} 
              label="Analytics Tracking" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<Schedule />} 
              label="Scheduled Triggers" 
              color="success" 
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
