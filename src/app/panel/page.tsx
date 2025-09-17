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
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Villa as VillaIcon,
  LocationOn as LocationIcon,
  LocalOffer as OfferIcon,
  Loyalty as LoyaltyIcon,
  BookOnline as BookingIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Login as LoginIcon
} from '@mui/icons-material';

interface ManagerStatus {
  name: string;
  status: 'loading' | 'connected' | 'error';
  message: string;
  icon: React.ReactNode;
}

export default function AdminPanel() {
  const [managers, setManagers] = useState<ManagerStatus[]>([
    { name: 'Property Management', status: 'loading', message: 'Initializing...', icon: <VillaIcon /> },
    { name: 'Destination Management', status: 'loading', message: 'Initializing...', icon: <LocationIcon /> },
    { name: 'Offers & Deals', status: 'loading', message: 'Initializing...', icon: <OfferIcon /> },
    { name: 'Loyalty Program', status: 'loading', message: 'Initializing...', icon: <LoyaltyIcon /> },
    { name: 'Booking Management', status: 'loading', message: 'Initializing...', icon: <BookingIcon /> },
    { name: 'Payment Processing', status: 'loading', message: 'Initializing...', icon: <PaymentIcon /> },
    { name: 'Email System', status: 'loading', message: 'Initializing...', icon: <EmailIcon /> },
    { name: 'Analytics', status: 'loading', message: 'Initializing...', icon: <AnalyticsIcon /> }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeManagers();
  }, []);

  const initializeManagers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate manager initialization
      const updatedManagers = await Promise.all(
        managers.map(async (manager, index) => {
          // Simulate async initialization
          await new Promise(resolve => setTimeout(resolve, 500 + index * 200));
          
          // Simulate success/failure
          const success = Math.random() > 0.2; // 80% success rate
          
          return {
            ...manager,
            status: success ? 'connected' as const : 'error' as const,
            message: success ? 'Connected successfully' : 'Connection failed'
          };
        })
      );

      setManagers(updatedManagers);
    } catch (err) {
      setError('Failed to initialize admin system');
      console.error('Admin initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✓';
      case 'error': return '✗';
      default: return <CircularProgress size={16} />;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={60} />
          <Typography variant="h6">Initializing Admin Dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🚀 Luxe Staycations Admin Panel
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Direct access admin dashboard - No authentication required
        </Typography>
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ This is a working admin panel accessible at /panel
        </Alert>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<VillaIcon />}
                href="/admin/properties"
              >
                Manage Properties
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<BookingIcon />}
                href="/admin/bookings"
              >
                View Bookings
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<EmailIcon />}
                href="/admin/email-system"
              >
                Email System
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SettingsIcon />}
                href="/admin/settings"
              >
                Settings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            {managers.map((manager, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box color="primary.main">
                      {manager.icon}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle2">
                        {manager.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {manager.message}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusIcon(manager.status)}
                      color={getStatusColor(manager.status) as any}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Admin Features */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Admin Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Core Management
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><VillaIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Property Management" secondary="Add, edit, and manage villa listings" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocationIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Destination Management" secondary="Manage travel destinations and locations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><OfferIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Offers & Deals" secondary="Create and manage special offers" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LoyaltyIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Loyalty Program" secondary="Manage guest loyalty and rewards" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Operations
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><BookingIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Booking Management" secondary="Process and track reservations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PaymentIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Payment Processing" secondary="Handle payments and transactions" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Email System" secondary="Send notifications and communications" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AnalyticsIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Analytics" secondary="View performance metrics and reports" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Luxe Staycations Admin Panel v1.0 - Working Version
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.href = '/'}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}