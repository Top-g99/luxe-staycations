'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Cancel,
  Visibility,
  FilterList,
  Search,
  Download,
  Refresh,
  TrendingUp,
  AccountBalance,
  Receipt
} from '@mui/icons-material';
import { razorpayService } from '@/lib/razorpayService';
import { useBookingContext } from '@/contexts/BookingContext';

export default function PaymentsPage() {
  const { allBookings } = useBookingContext();
  const [payments, setPayments] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isRazorpayConfigured, setIsRazorpayConfigured] = useState(false);

  useEffect(() => {
    // Load payments from localStorage
    const razorpayPayments = razorpayService.getPaymentHistory();
    
    // Combine with booking payments
    const bookingPayments = allBookings
      .filter(booking => booking.paymentStatus === 'paid')
      .map(booking => ({
        paymentId: booking.transactionId || `booking-${booking.id}`,
        amount: booking.bookingDetails?.total || 0,
        status: booking.paymentStatus,
        guestName: `${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName}`,
        propertyName: booking.bookingDetails?.propertyName || 'Unknown Property',
        guestEmail: booking.guestInfo?.email,
        guestPhone: booking.guestInfo?.phone,
        bookingDate: booking.createdAt,
        source: 'booking'
      }));

    const allPayments = [...razorpayPayments, ...bookingPayments];
    setPayments(allPayments);

    // Check Razorpay configuration
    setIsRazorpayConfigured(razorpayService.isRazorpayConfigured());
  }, [allBookings]);

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      payment.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setDetailDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
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

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const successfulPayments = payments.filter(p => p.status === 'success' || p.status === 'paid').length;
  const totalRevenue = payments
    .filter(p => p.status === 'success' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, mb: 4, color: '#5a3d35' }}>
        Payment Management
      </Typography>

      {/* Razorpay Status */}
      {!isRazorpayConfigured && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Razorpay payment gateway is not configured. Please configure it in Settings → Razorpay Gateway.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Payment sx={{ color: '#d97706', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalPayments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total Payments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {successfulPayments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Successful
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp sx={{ color: '#d97706', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatAmount(totalRevenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalance sx={{ color: 'warning.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {pendingPayments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search payments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by guest name, property, or booking ID"
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="success">Successful</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {
                    // Export functionality would go here
                    console.log('Export payments');
                  }}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <Card sx={{ border: '2px solid #f3f4f6' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Payment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No payments found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Payments will appear here once guests complete their bookings.'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ border: '2px solid #f3f4f6' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {payment.guestName || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {payment.guestEmail || payment.bookingId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.propertyName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatAmount(payment.amount || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(payment.status)}
                      color={getStatusColor(payment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(payment.timestamp || payment.bookingDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Payment Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt />
            Payment Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#d97706' }}>
                  Guest Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={selectedPayment.guestName || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={selectedPayment.guestEmail || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={selectedPayment.guestPhone || 'N/A'}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: '#d97706' }}>
                  Payment Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Amount"
                      secondary={formatAmount(selectedPayment.amount || 0)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={getStatusLabel(selectedPayment.status)}
                          color={getStatusColor(selectedPayment.status) as any}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment ID"
                      secondary={selectedPayment.paymentId || selectedPayment.transactionId || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Booking ID"
                      secondary={selectedPayment.bookingId || 'N/A'}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#d97706' }}>
                  Property Details
                </Typography>
                <Typography variant="body2">
                  {selectedPayment.propertyName || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#d97706' }}>
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  {selectedPayment.method || selectedPayment.source === 'razorpay' ? 'Razorpay' : 'Manual Payment'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
