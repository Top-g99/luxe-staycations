"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  LinearProgress,
  IconButton,
  Grid
} from '@mui/material';
import {
  Business,
  CalendarToday,
  People,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  Notifications
} from '@mui/icons-material';
import { supabaseHostManager } from '@/lib/supabaseHostManager';
import { ownerBookingManager } from '@/lib/ownerBookingManager';
import { typographyStyles, buttonStyles, cardStyles, iconStyles } from '@/components/BrandStyles';

export default function OwnerBookingsPage() {
  const [ownerBookings, setOwnerBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  useEffect(() => {
    loadOwnerBookings();
    // Set up auto-refresh every 30 seconds to get latest bookings
    const interval = setInterval(loadOwnerBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOwnerBookings = async () => {
    try {
      setLoading(true);
      
      // First try to get host bookings
      let allBookings = await supabaseHostManager.getAllOwnerBookings();
      
      // If no host bookings, get all bookings from main bookings table
      if (allBookings.length === 0) {
        const response = await fetch('/api/bookings');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convert main bookings to owner booking format
          allBookings = result.data.map((booking: any) => ({
            id: booking.id,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestPhone: booking.guestPhone,
            propertyName: booking.propertyName || `Property ${booking.propertyId.slice(0, 8)}...`,
            propertyId: booking.propertyId,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guests: booking.guests,
            totalAmount: booking.amount,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            specialRequests: booking.specialRequests,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            hostName: 'Luxe Staycations',
            hostEmail: 'info@luxestaycations.in',
            hostPhone: '+91-9876543210'
          }));
        }
      }
      
      setOwnerBookings(allBookings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading owner bookings:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadOwnerBookings();
  };

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleAction = (booking: any, type: 'approve' | 'reject') => {
    setSelectedBooking(booking);
    setActionType(type);
    setAdminNotes('');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedBooking || !actionType) return;

    try {
      const result = ownerBookingManager.updateBookingStatus(
        selectedBooking.id,
        actionType === 'approve' ? 'approved' : 'rejected',
        adminNotes
      );

      if (result) {
        setSnackbar({
          open: true,
          message: `Owner booking ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
          severity: 'success'
        });
        setActionDialogOpen(false);
        setSelectedBooking(null);
        setActionType(null);
        setAdminNotes('');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating booking status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <Notifications />;
      default: return <Notifications />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Business sx={{ fontSize: 32, color: 'var(--secondary-dark)', mr: 2 }} />
          <Typography variant="h4" sx={{ ...typographyStyles.h4 }}>
            Owner Booking Requests
          </Typography>
        </Box>
        
        <Button
          startIcon={<Refresh />}
          onClick={loadOwnerBookings}
          sx={buttonStyles.outline}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyles.primary }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'var(--secondary-dark)', fontWeight: 'bold' }}>
                {ownerBookings.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyles.primary }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                {ownerBookings.filter(b => b.status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyles.primary }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                {ownerBookings.filter(b => b.status === 'confirmed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...cardStyles.primary }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                {ownerBookings.filter(b => b.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Owner Bookings Table */}
      <Card sx={{ ...cardStyles.primary }}>
        <CardContent>
          <Typography variant="h5" sx={{ ...typographyStyles.h5, mb: 3 }}>
            Owner Booking Requests
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Special Requests</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ownerBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {booking.hostName || 'Unknown Host'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {booking.guestEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.propertyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {booking.guests}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {booking.specialRequests || 'None'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(booking.status)}
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewBooking(booking)}
                          sx={{ ...iconStyles.primary }}
                        >
                          <Visibility />
                        </IconButton>
                        
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleAction(booking, 'approve')}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleAction(booking, 'reject')}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {ownerBookings.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No owner booking requests found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Owner Booking Details
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
                  Owner Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {selectedBooking.ownerName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {selectedBooking.ownerEmail}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {selectedBooking.ownerPhone}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
                  Booking Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Property:</strong> {selectedBooking.propertyName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Check-in:</strong> {new Date(selectedBooking.checkIn).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Check-out:</strong> {new Date(selectedBooking.checkOut).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Guests:</strong> {selectedBooking.guests}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Purpose:</strong> {selectedBooking.purpose}
                </Typography>
              </Grid>

              {selectedBooking.specialRequests && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
                    Special Requests
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedBooking.specialRequests}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
                  Status
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedBooking.status)}
                  label={selectedBooking.status}
                  color={getStatusColor(selectedBooking.status) as any}
                  size="medium"
                />
              </Grid>

              {selectedBooking.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
                    Admin Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedBooking.adminNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Owner Booking
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {actionType} this owner booking request?
          </Typography>
          
          <TextField
            fullWidth
            label="Admin Notes (Optional)"
            multiline
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes or comments..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            sx={buttonStyles.primary}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
}

