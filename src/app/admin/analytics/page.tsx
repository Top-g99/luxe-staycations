'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Home,
  BookOnline,
  People,
  Payment,
  Refresh
} from '@mui/icons-material';

interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  averageBookingValue: number;
  monthlyRevenue: number;
  monthlyBookings: number;
  topProperties: Array<{
    propertyId: string;
    propertyName: string;
    bookingCount: number;
    revenue: number;
  }>;
  recentBookings: Array<{
    id: string;
    guestName: string;
    propertyName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics');
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Error fetching analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <button onClick={fetchAnalytics} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            <Refresh sx={{ fontSize: 16 }} />
            Retry
          </button>
        </Box>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 2 }}>
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      trend: analytics.monthlyRevenue > 0 ? `+${Math.round((analytics.monthlyRevenue / Math.max(analytics.totalRevenue - analytics.monthlyRevenue, 1)) * 100)}%` : '0%',
      icon: <Payment />,
      color: '#4caf50'
    },
    {
      title: 'Total Bookings',
      value: analytics.totalBookings.toString(),
      trend: analytics.monthlyBookings > 0 ? `+${Math.round((analytics.monthlyBookings / Math.max(analytics.totalBookings - analytics.monthlyBookings, 1)) * 100)}%` : '0%',
      icon: <BookOnline />,
      color: '#2196f3'
    },
    {
      title: 'Confirmed Bookings',
      value: analytics.confirmedBookings.toString(),
      trend: `${Math.round((analytics.confirmedBookings / Math.max(analytics.totalBookings, 1)) * 100)}%`,
      icon: <BookOnline />,
      color: '#ff9800'
    },
    {
      title: 'Average Booking Value',
      value: `₹${Math.round(analytics.averageBookingValue).toLocaleString()}`,
      trend: 'Per booking',
      icon: <Payment />,
      color: '#9c27b0'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Analytics Dashboard
        </Typography>
        <button onClick={fetchAnalytics} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          <Refresh sx={{ fontSize: 16 }} />
          Refresh
        </button>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        {stat.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    bgcolor: stat.color, 
                    borderRadius: '50%', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48
                  }}>
                    {React.cloneElement(stat.icon, { sx: { color: 'white' } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Top Properties */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Properties
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topProperties.map((property, index) => (
                      <TableRow key={property.propertyId}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {property.propertyName || `Property ${property.propertyId.slice(0, 8)}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={property.bookingCount} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ₹{property.revenue.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Bookings
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Guest</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {booking.guestName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {booking.propertyName || `Property ${booking.id.slice(0, 8)}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ₹{booking.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={booking.status} 
                            size="small" 
                            color={getStatusColor(booking.status) as any}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Status Breakdown */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Booking Status Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="h4" color="primary">
                  {analytics.pendingBookings}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                <Typography variant="h4" color="success.main">
                  {analytics.confirmedBookings}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Confirmed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="h4" color="warning.main">
                  {analytics.completedBookings}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                <Typography variant="h4" color="error.main">
                  {analytics.cancelledBookings}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Cancelled
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
