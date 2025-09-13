"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Business,
  TrendingUp,
  People,
  CalendarToday,
  AttachMoney,
  Hotel,
  Star,
  Edit,
  Visibility,
  Logout,
  Refresh,
  FilterList,
  DateRange,
  Analytics,
  Notifications
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { partnerAuthManager } from '@/lib/partnerAuthManager';
import { partnerDashboardManager } from '@/lib/partnerDashboardManager';
import { typographyStyles, buttonStyles, cardStyles, iconStyles } from '@/components/BrandStyles';
import OwnerBookingForm from '@/components/OwnerBookingForm';

export default function PartnerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [showOwnerBookingForm, setShowOwnerBookingForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const user = partnerAuthManager.getCurrentUser();
    if (!user) {
      router.push('/partner/login');
      return;
    }
    setCurrentUser(user);
  };

  const loadDashboardData = () => {
    if (!currentUser) return;

    try {
      // Load dashboard statistics
      const stats = partnerDashboardManager.getDashboardStats(currentUser.id);
      setDashboardStats(stats);

      // Load recent bookings
      const bookings = partnerDashboardManager.getPartnerBookings(currentUser.id, { status: 'confirmed' });
      setRecentBookings(bookings.slice(0, 10));

      // Load properties
      const partnerProperties = partnerDashboardManager.getPartnerProperties(currentUser.id);
      setProperties(partnerProperties);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    partnerAuthManager.logout();
    router.push('/partner/login');
  };

  const handleRefresh = () => {
    setLoading(true);
    loadDashboardData();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 2, py: 2, mb: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ fontSize: 32, color: 'var(--secondary-dark)', mr: 2 }} />
              <Typography variant="h4" sx={{ ...typographyStyles.h4 }}>
                Partner Dashboard
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Welcome, {currentUser.contactPerson}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Logout />}
                onClick={() => handleLogout()}
                sx={buttonStyles.outline}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyles.primary }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: 'var(--secondary-dark)', fontWeight: 'bold' }}>
                      ₹{dashboardStats?.currentMonthRevenue?.partnerRevenue?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      This Month's Revenue
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, color: 'var(--secondary-dark)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyles.primary }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: 'var(--secondary-dark)', fontWeight: 'bold' }}>
                      {dashboardStats?.currentMonthRevenue?.totalBookings || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Active Bookings
                    </Typography>
                  </Box>
                  <CalendarToday sx={{ fontSize: 40, color: 'var(--secondary-dark)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyles.primary }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: 'var(--secondary-dark)', fontWeight: 'bold' }}>
                      {dashboardStats?.activeProperties || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Active Properties
                    </Typography>
                  </Box>
                  <Hotel sx={{ fontSize: 40, color: 'var(--secondary-dark)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyles.primary }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: 'var(--secondary-dark)', fontWeight: 'bold' }}>
                      {dashboardStats?.currentMonthRevenue?.occupancyRate?.toFixed(1) || '0'}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Occupancy Rate
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: 'var(--secondary-dark)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Bookings */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ ...cardStyles.primary }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ ...typographyStyles.h5 }}>
                    Recent Bookings
                  </Typography>
                  <Button
                    startIcon={<Refresh />}
                    onClick={() => handleRefresh()}
                    sx={buttonStyles.text}
                  >
                    Refresh
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Guest</TableCell>
                        <TableCell>Property</TableCell>
                        <TableCell>Check-in</TableCell>
                        <TableCell>Check-out</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {booking.guestName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {booking.guestEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{booking.propertyName}</TableCell>
                          <TableCell>
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--secondary-dark)' }}>
                              ₹{booking.totalAmount?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status}
                              color={booking.status === 'confirmed' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" sx={{ ...iconStyles.primary }}>
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {recentBookings.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No recent bookings found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions & Properties */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              {/* Properties */}
              <Grid item xs={12}>
                <Card sx={{ ...cardStyles.primary }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ ...typographyStyles.h6, mb: 2 }}>
                      Your Properties
                    </Typography>
                    
                    <List>
                      {properties.map((property) => (
                        <ListItem key={property.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'var(--secondary-dark)' }}>
                              <Hotel />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={property.propertyName}
                            secondary={`${property.propertyType} • ${property.location}`}
                          />
                          <Chip
                            label={property.status}
                            color={property.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>

                    {properties.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No properties added yet
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Card sx={{ ...cardStyles.primary }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ ...typographyStyles.h6, mb: 2 }}>
                      Quick Actions
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Analytics />}
                        sx={buttonStyles.outline}
                        onClick={() => router.push('/partner/analytics')}
                      >
                        View Analytics
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<People />}
                        sx={buttonStyles.outline}
                        onClick={() => router.push('/partner/guests')}
                      >
                        Guest Management
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        sx={buttonStyles.outline}
                        onClick={() => router.push('/partner/properties')}
                      >
                        Manage Properties
                      </Button>
                      
                                             <Button
                         variant="outlined"
                         startIcon={<Notifications />}
                         sx={buttonStyles.outline}
                         onClick={() => router.push('/partner/notifications')}
                       >
                         Notifications
                       </Button>
                       
                       <Button
                         variant="outlined"
                         startIcon={<CalendarToday />}
                         sx={buttonStyles.outline}
                         onClick={() => setShowOwnerBookingForm(true)}
                       >
                         Book My Property
                       </Button>
                     </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
             </Snackbar>

       {/* Owner Booking Form Dialog */}
       <Dialog
         open={showOwnerBookingForm}
         onClose={() => setShowOwnerBookingForm(false)}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: {
             maxHeight: '90vh',
             overflow: 'auto'
           }
         }}
       >
         <DialogTitle sx={{ 
           bgcolor: 'var(--primary-dark)',
           color: 'white',
           fontFamily: 'Playfair Display, serif'
         }}>
           Book Your Own Property
         </DialogTitle>
         <DialogContent sx={{ p: 0 }}>
           <OwnerBookingForm
             onBookingCreated={() => {
               setShowOwnerBookingForm(false);
               loadDashboardData();
             }}
           />
         </DialogContent>
       </Dialog>
     </Box>
   );
 }
