'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { 
  Storage as DatabaseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export default function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'in_progress' | 'completed' | 'error'>('idle');
  const [setupMessage, setSetupMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const setupDatabase = async () => {
    try {
      setIsLoading(true);
      setSetupStatus('in_progress');
      setSetupMessage('Setting up Supabase database...');
      setProgress(10);

      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setProgress(50);

      const result = await response.json();
      
      setProgress(100);

      if (result.success) {
        setSetupStatus('completed');
        setSetupMessage('Database setup completed successfully! All tables created and sample data inserted.');
      } else {
        setSetupStatus('error');
        setSetupMessage(`Database setup failed: ${result.message}`);
      }
    } catch (error) {
      setSetupStatus('error');
      setSetupMessage(`Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (setupStatus) {
      case 'completed': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'in_progress': return <CircularProgress size={20} />;
      default: return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = () => {
    switch (setupStatus) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'in_progress': return 'info';
      default: return 'warning';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Database Setup
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Set up your Supabase database with all required tables and sample data
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DatabaseIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Supabase Database Setup</Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            This will create all necessary tables in your Supabase database and insert sample data for testing.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>What will be created:</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Properties table with sample villas" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Bookings table with sample reservations" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Destinations table with popular locations" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Callbacks table for customer inquiries" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Consultations table for property consultations" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Row Level Security (RLS) policies" />
              </ListItem>
            </List>
          </Alert>

          {setupStatus === 'in_progress' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {setupMessage}
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
            </Box>
          )}

          {setupStatus !== 'idle' && (
            <Alert severity={getStatusColor() as any} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getStatusIcon()}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {setupMessage}
                </Typography>
              </Box>
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={setupDatabase}
            disabled={isLoading || setupStatus === 'completed'}
            startIcon={isLoading ? <CircularProgress size={20} /> : <DatabaseIcon />}
            size="large"
          >
            {isLoading ? 'Setting up...' : setupStatus === 'completed' ? 'Database Ready' : 'Setup Database'}
          </Button>

          {setupStatus === 'completed' && (
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/admin'}
              sx={{ ml: 2 }}
            >
              Go to Admin Dashboard
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Database Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Make sure your Supabase credentials are properly configured in your environment variables:
          </Typography>
          <Box sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br/>
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
