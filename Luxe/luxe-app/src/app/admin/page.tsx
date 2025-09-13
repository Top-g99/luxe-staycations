



"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Villa,
  LocationOn,
  Phone,
  Campaign,
  TrendingUp,
  TrendingDown,
  Add,
  Edit,
  Delete,
  Visibility,
  BookOnline,
  Payment,
  Business,
  Support,
  People,
  CalendarToday
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { propertyManager, destinationManager, callbackManager, dealBannerManager } from '@/lib/dataManager';
import EmailStatusIndicator from '@/components/EmailStatusIndicator';

interface DashboardStats {
  totalProperties: number;
  totalDestinations: number;
  pendingCallbacks: number;
  activeDeals: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalDestinations: 0,
    pendingCallbacks: 0,
    activeDeals: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentCallbacks, setRecentCallbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  useEffect(() => {
    loadDashboardData();
    loadAnalyticsData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Initialize managers
      await propertyManager.initialize();
      await destinationManager.initialize();
      await callbackManager.initialize();
      await dealBannerManager.initialize();
      
      // Load properties
      const properties = await propertyManager.getAll();
      const featuredProperties = properties.filter(p => p.featured);
      
      // Load destinations
      const destinations = await destinationManager.getAll();
      const featuredDestinations = destinations.filter(d => d.featured);
      
      // Load callbacks
      const callbacks = await callbackManager.getAll();
      const pendingCallbacks = callbacks.filter(c => c.status === 'pending');
      
      // Load deal banner
      const dealBanners = await dealBannerManager.getAll();
      const activeDealBanner = dealBanners.find(db => db.isActive);
      
      // Calculate stats
      const newStats: DashboardStats = {
        totalProperties: properties.length,
        totalDestinations: destinations.length,
        pendingCallbacks: pendingCallbacks.length,
        activeDeals: activeDealBanner ? 1 : 0,
        totalBookings: 0, // Will be loaded from analytics
        totalRevenue: 0 // Will be loaded from analytics
      };
      
      setStats(newStats);
      setRecentProperties(properties.slice(0, 5));
      setRecentCallbacks(callbacks.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      if (data.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalBookings: data.data.totalBookings,
          totalRevenue: data.data.totalRevenue
        }));
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-property':
        router.push('/admin/properties');
        break;
      case 'add-destination':
        router.push('/admin/destinations');
        break;
      case 'manage-callbacks':
        router.push('/admin/callback-requests');
        break;
      case 'manage-deals':
        router.push('/admin/deal-banner');
        break;
      case 'booking-calendar':
        router.push('/admin/booking-calendar');
        break;
      default:
        break;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 1
        }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Welcome to your property management dashboard. Here's an overview of your business.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalProperties}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Properties
                  </Typography>
                </Box>
                <Villa sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalDestinations}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Destinations
                  </Typography>
                </Box>
                <LocationOn sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pendingCallbacks}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Pending Callbacks
                  </Typography>
                </Box>
                <Phone sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.activeDeals}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active Deals
                  </Typography>
                </Box>
                <Campaign sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Email Status */}
      <EmailStatusIndicator />

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleQuickAction('add-property')}
                sx={{
                  background: 'var(--primary-dark)',
                  '&:hover': { background: 'var(--primary-light)' }
                }}
              >
                Add Property
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleQuickAction('add-destination')}
                sx={{
                  background: 'var(--secondary-dark)',
                  '&:hover': { background: 'var(--primary-light)' }
                }}
              >
                Add Destination
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Phone />}
                onClick={() => handleQuickAction('manage-callbacks')}
                sx={{
                  borderColor: 'var(--primary-dark)',
                  color: 'var(--primary-dark)',
                  '&:hover': {
                    borderColor: 'var(--primary-light)',
                    backgroundColor: 'rgba(50, 42, 43, 0.04)'
                  }
                }}
              >
                Manage Callbacks
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CalendarToday />}
                onClick={() => handleQuickAction('booking-calendar')}
                sx={{
                  borderColor: 'var(--primary-dark)',
                  color: 'var(--primary-dark)',
                  '&:hover': {
                    borderColor: 'var(--primary-light)',
                    backgroundColor: 'rgba(50, 42, 43, 0.04)'
                  }
                }}
              >
                Booking Calendar
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Campaign />}
                onClick={() => handleQuickAction('manage-deals')}
                sx={{
                  borderColor: 'var(--secondary-dark)',
                  color: 'var(--secondary-dark)',
                  '&:hover': {
                    borderColor: 'var(--primary-light)',
                    backgroundColor: 'rgba(112, 79, 73, 0.04)'
                  }
                }}
              >
                Manage Deals
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Properties */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Properties
                </Typography>
                <Button
                  size="small"
                  onClick={() => router.push('/admin/properties')}
                  sx={{ color: 'var(--primary-dark)' }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentProperties.length > 0 ? (
                  recentProperties.map((property) => (
                    <ListItem key={property.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={property.image} alt={property.name}>
                          <Villa />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={property.name}
                        secondary={`${property.location} • ₹${property.price.toLocaleString()}/night`}
                      />
                      <Box>
                        {property.featured && (
                          <Chip 
                            label="Featured" 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'var(--primary-light)',
                              color: 'white',
                              fontSize: '0.75rem'
                            }} 
                          />
                        )}
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No properties yet"
                      secondary="Add your first property to get started"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Callbacks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Callback Requests
                </Typography>
                <Button
                  size="small"
                  onClick={() => router.push('/admin/callback-requests')}
                  sx={{ color: 'var(--primary-dark)' }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentCallbacks.length > 0 ? (
                  recentCallbacks.map((callback) => (
                    <ListItem key={callback.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'var(--primary-light)' }}>
                          <Phone />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={callback.name}
                        secondary={`${callback.phone} • ${callback.numberOfGuests} guests`}
                      />
                      <Chip 
                        label={callback.status} 
                        size="small" 
                        color={callback.status === 'pending' ? 'warning' : 'success'}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No callback requests yet"
                      secondary="Callback requests will appear here when customers reach out"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
