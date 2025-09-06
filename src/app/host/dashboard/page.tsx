"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Business,
  TrendingUp,
  People,
  Payment,
  CalendarToday,
  LocationOn,
  Star,
  Edit,
  Visibility,
  MoreVert,
  Add,
  Dashboard,
  Assessment,
  Settings,
  Logout
} from '@mui/icons-material';
import { useHost } from '@/contexts/HostContext';
import { useRouter } from 'next/navigation';
import { HostProperty } from '@/contexts/HostContext';
import BookingForm from './booking-form';
import SelfBookingsList from './self-bookings-list';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`host-tabpanel-${index}`}
      aria-labelledby={`host-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HostDashboardPage() {
  const { host, logout, isLoading } = useHost();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!isLoading && !host) {
      router.push('/host/login');
    }
  }, [host, isLoading, router]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!host) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    router.push('/host/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Welcome back, {host.name}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your properties and track your success
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={() => handleLogout()}
              sx={{ borderRadius: 2 }}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {host.totalProperties}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Properties
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {host.properties.reduce((sum, prop) => sum + prop.totalBookings, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Bookings
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(host.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Revenue
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {host.verificationStatus === 'verified' ? '✓' : '⏳'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {host.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </Typography>
                </Box>
                <Payment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="host dashboard tabs">
          <Tab label="Properties" icon={<Business />} />
          <Tab label="Bookings" icon={<CalendarToday />} />
          <Tab label="Analytics" icon={<Assessment />} />
          <Tab label="Settings" icon={<Settings />} />
        </Tabs>
      </Paper>

      {/* Properties Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Your Properties
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 2 }}
            onClick={() => router.push('/partner-with-us')}
          >
            Add New Property
          </Button>
        </Box>

        <Grid container spacing={3}>
          {host.properties.map((property) => (
            <Grid item xs={12} md={6} key={property.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {property.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {property.location}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={property.status}
                      color={getStatusColor(property.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Property Type: {property.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Base Price: {formatCurrency(property.pricing.basePrice)}/night
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {property.totalBookings}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Bookings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatCurrency(property.totalRevenue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Revenue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Amenities:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <Chip
                          key={index}
                          label={amenity}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                      {property.amenities.length > 3 && (
                        <Chip
                          label={`+${property.amenities.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => router.push(`/host/properties/${property.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => router.push(`/host/properties/${property.id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Owner Bookings Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          Your Property Bookings
        </Typography>
        
        {/* Booking Form */}
        <Box sx={{ mb: 4 }}>
          <BookingForm hostId={host.id} properties={host.properties} />
        </Box>

        {/* Recent Bookings Display */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Recent Bookings
            </Typography>
            <SelfBookingsList hostId={host.id} />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          Performance Analytics
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Overview
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    📊 Revenue charts and analytics will be displayed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Properties
                </Typography>
                <List>
                  {host.properties
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 3)
                    .map((property, index) => (
                      <ListItem key={property.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={property.name}
                          secondary={`${formatCurrency(property.totalRevenue)} • ${property.totalBookings} bookings`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          Account Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Name: {host.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {host.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {host.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member Since: {host.memberSince.toLocaleDateString()}
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bank Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Account: {host.bankDetails.accountNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IFSC: {host.bankDetails.ifscCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Holder: {host.bankDetails.accountHolderName}
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">
                  Update Bank Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}
