'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  LocalOffer,
  AttachMoney,
  People,
  Schedule,
  Refresh,
  Download,
  Visibility
} from '@mui/icons-material';
import { couponManagerInstance } from '@/lib/dataManager';

interface CouponAnalytics {
  totalRedemptions: number;
  totalDiscountGiven: number;
  topCoupons: Array<{ code: string; title: string; redemptions: number; totalDiscount: number }>;
  recentRedemptions: Array<any>;
}

export default function CouponAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CouponAnalytics>({
    totalRedemptions: 0,
    totalDiscountGiven: 0,
    topCoupons: [],
    recentRedemptions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize coupon manager
        await couponManagerInstance.initialize();
        
        // Get analytics data
        const data = await couponManagerInstance.getCouponAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error loading coupon analytics:', err);
        setError('Failed to load coupon analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await couponManagerInstance.initialize();
      const data = await couponManagerInstance.getCouponAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error refreshing analytics:', err);
      setError('Failed to refresh analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading coupon analytics...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Coupon Analytics & Accounting
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track coupon performance, usage, and financial impact
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              // Export functionality can be added here
              console.log('Export analytics data');
            }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <LocalOffer color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {analytics.totalRedemptions}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Redemptions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analytics.totalDiscountGiven)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Discount Given
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                  {analytics.topCoupons.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Coupons
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <People color="warning" sx={{ mr: 1 }} />
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                  {analytics.totalRedemptions > 0 ? 
                    formatCurrency(analytics.totalDiscountGiven / analytics.totalRedemptions) : 
                    '₹0'
                  }
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg. Discount per Use
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Performing Coupons */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1 }} />
              Top Performing Coupons
            </Typography>
            
            {analytics.topCoupons.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Coupon Code</TableCell>
                      <TableCell>Redemptions</TableCell>
                      <TableCell>Total Discount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topCoupons.map((coupon, index) => (
                      <TableRow key={coupon.code}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={coupon.code} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {coupon.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {coupon.redemptions}
                            </Typography>
                            {index < 3 && (
                              <Chip 
                                label={`#${index + 1}`} 
                                size="small" 
                                color={index === 0 ? 'success' : index === 1 ? 'warning' : 'info'}
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatCurrency(coupon.totalDiscount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No coupon redemptions found. Create and activate some coupons to see analytics.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Recent Redemptions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1 }} />
              Recent Redemptions
            </Typography>
            
            {analytics.recentRedemptions.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {analytics.recentRedemptions.map((redemption, index) => (
                  <React.Fragment key={redemption.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <LocalOffer color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={redemption.couponCode} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {redemption.bannerTitle}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(redemption.redeemedAt)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption">
                                Order: {formatCurrency(redemption.orderAmount)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                Discount: {formatCurrency(redemption.discountAmount)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < analytics.recentRedemptions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No recent redemptions found.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Summary */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <AttachMoney sx={{ mr: 1 }} />
          Financial Summary
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                {formatCurrency(analytics.totalDiscountGiven)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Discount Given
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                {analytics.totalRedemptions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Redemptions
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h5" color="info.main" sx={{ fontWeight: 600 }}>
                {analytics.totalRedemptions > 0 ? 
                  formatCurrency(analytics.totalDiscountGiven / analytics.totalRedemptions) : 
                  '₹0'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Discount per Use
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
