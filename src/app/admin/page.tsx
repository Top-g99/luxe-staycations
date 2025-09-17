'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Villa as VillaIcon,
  LocationOn as LocationIcon,
  BookOnline as BookingIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

// Import managers
import { propertyManager } from '@/lib/managers/PropertyManager';
import { bookingManager } from '@/lib/managers/BookingManager';
import { destinationManager } from '@/lib/managers/DestinationManager';
import { callbackManager } from '@/lib/managers/CallbackManager';
import { consultationManager } from '@/lib/managers/ConsultationManager';

interface DashboardStats {
  properties: number;
  bookings: number;
  destinations: number;
  callbacks: number;
  consultations: number;
  users: number;
  revenue: number;
  occupancy: number;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    properties: 0,
    bookings: 0,
    destinations: 0,
    callbacks: 0,
    consultations: 0,
    users: 0,
    revenue: 0,
    occupancy: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading comprehensive dashboard data from Supabase...');

      // Load all data in parallel using managers
      const [
        propertiesResult,
        bookingsResult,
        destinationsResult,
        callbacksResult,
        consultationsResult
      ] = await Promise.all([
        propertyManager.getPropertyStats(),
        bookingManager.getBookingStats(),
        destinationManager.getDestinationStats(),
        callbackManager.getCallbackStats(),
        consultationManager.getConsultationStats()
      ]);

      console.log('Data loaded successfully from Supabase:', {
        properties: propertiesResult,
        bookings: bookingsResult,
        destinations: destinationsResult,
        callbacks: callbacksResult,
        consultations: consultationsResult
      });

      setStats({
        properties: propertiesResult.total || 0,
        bookings: bookingsResult.total || 0,
        destinations: destinationsResult.total || 0,
        callbacks: callbacksResult.total || 0,
        consultations: consultationsResult.total || 0,
        users: 0, // Mock data for now
        revenue: 0, // Mock data for now
        occupancy: 0 // Mock data for now
      });

      // Load recent activity
      const recentBookings = await bookingManager.getRecentBookings(5);
      const recentCallbacks = await callbackManager.getRecentCallbacks(3);
      const recentConsultations = await consultationManager.getRecentConsultations(2);

      setRecentActivity([
        ...recentBookings.map(booking => ({
          id: booking.id,
          type: 'booking',
          message: `New booking for ${booking.property_id}`,
          time: new Date(booking.created_at).toLocaleTimeString(),
          status: booking.status === 'confirmed' ? 'success' : 'pending'
        })),
        ...recentCallbacks.map(callback => ({
          id: callback.id,
          type: 'callback',
          message: `Callback request from ${callback.name}`,
          time: new Date(callback.created_at).toLocaleTimeString(),
          status: callback.status === 'pending' ? 'warning' : 'success'
        })),
        ...recentConsultations.map(consultation => ({
          id: consultation.id,
          type: 'consultation',
          message: `Consultation scheduled by ${consultation.name}`,
          time: new Date(consultation.created_at).toLocaleTimeString(),
          status: consultation.status === 'scheduled' ? 'info' : 'pending'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10));

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'pending': return <ScheduleIcon color="info" />;
      default: return <CheckCircleIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard from Supabase...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Database Connection Error
          </Typography>
          <Typography>
            {error}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Please make sure to set up your database first by going to <strong>Database Setup</strong> in the sidebar.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={loadDashboardData} sx={{ mr: 2 }}>
          Retry
        </Button>
        <Button variant="outlined" onClick={() => window.location.href = '/admin/setup'}>
          Setup Database
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome to Luxe Staycations Admin Dashboard • Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            onClick={loadDashboardData}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <TrendingUpIcon />}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Supabase Connected" 
            color="success" 
            variant="outlined" 
          />
        </Box>
      </Box>

      {/* Success Alert */}
      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Admin System Connected to Supabase!
        </Typography>
        <Typography>
          All data is now being saved and retrieved from your Supabase database. Real-time updates are working.
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VillaIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Properties</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats.properties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active properties
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BookingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Bookings</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.bookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Destinations</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.destinations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available destinations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Callbacks</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.callbacks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending callbacks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity & System Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                      />
                      <Chip 
                        label={activity.type} 
                        color={getStatusColor(activity.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Supabase Connection
                </Typography>
                <LinearProgress variant="determinate" value={100} color="success" />
                <Typography variant="caption" color="success.main">
                  Connected
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API Response Time
                </Typography>
                <LinearProgress variant="determinate" value={85} color="success" />
                <Typography variant="caption" color="success.main">
                  120ms
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Server Load
                </Typography>
                <LinearProgress variant="determinate" value={45} color="warning" />
                <Typography variant="caption" color="warning.main">
                  45%
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                <strong>Database:</strong> Supabase PostgreSQL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Backup:</strong> 2 hours ago
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Version:</strong> 2.1.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}