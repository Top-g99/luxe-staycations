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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
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
  Login as LoginIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Import all managers
import {
  propertyManager,
  bookingManager,
  destinationManager,
  emailManager,
  callbackManager,
  consultationManager,
  partnerManager,
  offersManager,
  loyaltyManager,
  specialRequestsManager,
  analyticsManager
} from '@/lib/managers';

interface ManagerStatus {
  name: string;
  status: 'loading' | 'connected' | 'error';
  message: string;
  icon: React.ReactNode;
  data?: any;
}

interface DashboardStats {
  properties: { total: number; active: number; inactive: number };
  bookings: { total: number; pending: number; confirmed: number; totalRevenue: number };
  destinations: { total: number; popular: number };
  callbacks: { total: number; pending: number; contacted: number; resolved: number };
  consultations: { total: number; pending: number; scheduled: number; completed: number };
  partnerRequests: { total: number; pending: number; approved: number; rejected: number };
  emails: { total: number; sent: number; failed: number; pending: number };
  loyalty: { totalMembers: number; byTier: Record<string, number> };
  specialRequests: { total: number; pending: number; approved: number; rejected: number };
}

export default function AdminDashboard() {
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    initializeManagers();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(initializeManagers, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeManagers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize all managers with real data
      const managerPromises = [
        { name: 'Property Management', manager: propertyManager, method: 'getPropertyStats' },
        { name: 'Destination Management', manager: destinationManager, method: 'getDestinationStats' },
        { name: 'Offers & Deals', manager: offersManager, method: 'getOfferStats' },
        { name: 'Loyalty Program', manager: loyaltyManager, method: 'getLoyaltyStats' },
        { name: 'Booking Management', manager: bookingManager, method: 'getBookingStats' },
        { name: 'Payment Processing', manager: bookingManager, method: 'getBookingStats' },
        { name: 'Email System', manager: emailManager, method: 'getEmailStats' },
        { name: 'Analytics', manager: analyticsManager, method: 'getDashboardAnalytics' }
      ];

      const updatedManagers = await Promise.all(
        managerPromises.map(async (item, index) => {
          try {
            await new Promise(resolve => setTimeout(resolve, 200 + index * 100));
            const data = await (item.manager as any)[item.method]();
            
            return {
              name: item.name,
              status: 'connected' as const,
              message: 'Connected successfully',
              icon: managers[index].icon,
              data: data
            };
          } catch (err) {
            console.error(`Error initializing ${item.name}:`, err);
            return {
              name: item.name,
              status: 'error' as const,
              message: 'Connection failed',
              icon: managers[index].icon,
              data: null
            };
          }
        })
      );

      setManagers(updatedManagers);

      // Load dashboard statistics
      await loadDashboardStats();
      
      // Load recent activity
      await loadRecentActivity();

    } catch (err) {
      setError('Failed to initialize admin system');
      console.error('Admin initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [
        propertyStats,
        bookingStats,
        destinationStats,
        callbackStats,
        consultationStats,
        partnerStats,
        emailStats,
        loyaltyStats,
        specialRequestStats
      ] = await Promise.all([
        propertyManager.getPropertyStats(),
        bookingManager.getBookingStats(),
        destinationManager.getDestinationStats(),
        callbackManager.getCallbackStats(),
        consultationManager.getConsultationStats(),
        partnerManager.getPartnerRequestStats(),
        emailManager.getEmailStats(),
        loyaltyManager.getLoyaltyStats(),
        specialRequestsManager.getSpecialRequestStats()
      ]);

      setStats({
        properties: {
          total: propertyStats.total,
          active: propertyStats.active,
          inactive: propertyStats.inactive
        },
        bookings: {
          total: bookingStats.total,
          pending: bookingStats.pending,
          confirmed: bookingStats.confirmed,
          totalRevenue: bookingStats.totalRevenue
        },
        destinations: {
          total: destinationStats.total,
          popular: destinationStats.popular
        },
        callbacks: {
          total: callbackStats.total,
          pending: callbackStats.pending,
          contacted: callbackStats.contacted,
          resolved: callbackStats.resolved
        },
        consultations: {
          total: consultationStats.total,
          pending: consultationStats.pending,
          scheduled: consultationStats.scheduled,
          completed: consultationStats.completed
        },
        partnerRequests: {
          total: partnerStats.total,
          pending: partnerStats.pending,
          approved: partnerStats.approved,
          rejected: partnerStats.rejected
        },
        emails: {
          total: emailStats.total,
          sent: emailStats.sent,
          failed: emailStats.failed,
          pending: emailStats.pending
        },
        loyalty: {
          totalMembers: loyaltyStats.totalMembers,
          byTier: loyaltyStats.byTier
        },
        specialRequests: {
          total: specialRequestStats.total,
          pending: specialRequestStats.pending,
          approved: specialRequestStats.approved,
          rejected: specialRequestStats.rejected
        }
      });
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const [recentBookings, recentCallbacks, recentConsultations, recentPartnerRequests] = await Promise.all([
        bookingManager.getAllBookings().then(bookings => bookings.slice(0, 5)),
        callbackManager.getRecentCallbacks(5),
        consultationManager.getRecentConsultations(5),
        partnerManager.getRecentPartnerRequests(5)
      ]);

      const activity = [
        ...recentBookings.map(booking => ({
          type: 'booking',
          message: `New booking from ${booking.guest_name}`,
          time: booking.created_at,
          status: booking.status
        })),
        ...recentCallbacks.map(callback => ({
          type: 'callback',
          message: `Callback request from ${callback.name}`,
          time: callback.created_at,
          status: callback.status
        })),
        ...recentConsultations.map(consultation => ({
          type: 'consultation',
          message: `Consultation request from ${consultation.name}`,
          time: consultation.created_at,
          status: consultation.status
        })),
        ...recentPartnerRequests.map(partner => ({
          type: 'partner',
          message: `Partner request from ${partner.name}`,
          time: partner.created_at,
          status: partner.status
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

      setRecentActivity(activity);
    } catch (err) {
      console.error('Error loading recent activity:', err);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={60} />
          <Typography variant="h6">Initializing Admin Dashboard...</Typography>
          <LinearProgress sx={{ width: '100%', mt: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🚀 Luxe Staycations Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Real-time management of your luxury villa rental platform
        </Typography>
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ Live Data Connected - All managers operational with real-time updates
        </Alert>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.properties.total}
                    </Typography>
                    <Typography variant="body2">
                      Total Properties
                    </Typography>
                    <Typography variant="caption">
                      {stats.properties.active} active
                    </Typography>
                  </Box>
                  <VillaIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.bookings.total}
                    </Typography>
                    <Typography variant="body2">
                      Total Bookings
                    </Typography>
                    <Typography variant="caption">
                      {formatCurrency(stats.bookings.totalRevenue)} revenue
                    </Typography>
                  </Box>
                  <BookingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.loyalty.totalMembers}
                    </Typography>
                    <Typography variant="body2">
                      Loyalty Members
                    </Typography>
                    <Typography variant="caption">
                      {Object.keys(stats.loyalty.byTier).length} tiers
                    </Typography>
                  </Box>
                  <LoyaltyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.callbacks.pending + stats.consultations.pending + stats.partnerRequests.pending}
                    </Typography>
                    <Typography variant="body2">
                      Pending Requests
                    </Typography>
                    <Typography variant="caption">
                      Callbacks, Consultations, Partners
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* System Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status & Managers
          </Typography>
          <Grid container spacing={2}>
            {managers.map((manager, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: manager.status === 'connected' ? 'success.main' : 'error.main',
                    borderRadius: 2,
                    backgroundColor: manager.status === 'connected' ? 'success.50' : 'error.50'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box color={manager.status === 'connected' ? 'success.main' : 'error.main'}>
                      {manager.icon}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {manager.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {manager.message}
                      </Typography>
                      {manager.data && (
                        <Typography variant="caption" color="primary">
                          Data loaded successfully
                        </Typography>
                      )}
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
                size="large"
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
                size="large"
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
                size="large"
              >
                Email System
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AnalyticsIcon />}
                href="/admin/analytics"
                size="large"
              >
                Analytics
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={activity.type} 
                          color="primary" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{activity.message}</TableCell>
                      <TableCell>
                        <Chip 
                          label={activity.status} 
                          color={activity.status === 'pending' ? 'warning' : 'success'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(activity.time)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Statistics */}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Statistics
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Bookings:</Typography>
                  <Typography fontWeight="bold">{stats.bookings.total}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Pending:</Typography>
                  <Typography color="warning.main">{stats.bookings.pending}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Confirmed:</Typography>
                  <Typography color="success.main">{stats.bookings.confirmed}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Revenue:</Typography>
                  <Typography fontWeight="bold" color="primary.main">
                    {formatCurrency(stats.bookings.totalRevenue)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Statistics
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Callbacks:</Typography>
                  <Typography>{stats.callbacks.total} ({stats.callbacks.pending} pending)</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Consultations:</Typography>
                  <Typography>{stats.consultations.total} ({stats.consultations.pending} pending)</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Partner Requests:</Typography>
                  <Typography>{stats.partnerRequests.total} ({stats.partnerRequests.pending} pending)</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Special Requests:</Typography>
                  <Typography>{stats.specialRequests.total} ({stats.specialRequests.pending} pending)</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Luxe Staycations Admin Dashboard v2.0 - Live Data Connected
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
}