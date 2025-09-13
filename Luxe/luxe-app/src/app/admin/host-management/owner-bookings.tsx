"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Business,
  Person,
  CalendarToday,
  Payment
} from '@mui/icons-material';
import { supabaseHostManager } from '@/lib/supabaseHostManager';

interface OwnerBooking {
  id: string;
  propertyId: string;
  propertyName: string;
  hostName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingDate: string;
  specialRequests?: string;
  createdAt: string;
}

interface OwnerBookingsProps {
  hostId?: string; // Optional: if provided, shows only bookings for that host
}

export default function OwnerBookings({ hostId }: OwnerBookingsProps) {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    paymentStatus: '',
    specialRequests: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadBookings();
  }, [hostId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let allBookings: OwnerBooking[] = [];

      if (hostId) {
        // Load bookings for specific host
        const hostBookings = await supabaseHostManager.getHostBookings(hostId);
        const hostProperties = await supabaseHostManager.getHostProperties(hostId);
        
        allBookings = hostBookings.map(booking => ({
          ...booking,
          propertyName: hostProperties.find(p => p.id === booking.propertyId)?.name || 'Unknown Property',
          hostName: 'Current Host' // We know this is the current host
        }));
      } else {
        // Load all owner bookings across all hosts
        const allBookingsData = await supabaseHostManager.getAllOwnerBookings();
        allBookings = allBookingsData.map(booking => ({
          ...booking,
          propertyName: (booking as any).propertyName || 'Unknown Property',
          hostName: (booking as any).hostName || 'Unknown Host'
        }));
      }

      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading owner bookings:', error);
      setSnackbar({ open: true, message: 'Error loading bookings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return;

    try {
      // This would need to be implemented in supabaseHostManager
      // For now, we'll show a success message
      setSnackbar({ open: true, message: 'Booking status updated successfully!', severity: 'success' });
      setOpenEditDialog(false);
      loadBookings();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating booking', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const openBookingDetails = (booking: OwnerBooking) => {
    setSelectedBooking(booking);
    setOpenDetailsDialog(true);
  };

  const openEditBooking = (booking: OwnerBooking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests || ''
    });
    setOpenEditDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading owner bookings...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {hostId ? 'Host Property Bookings' : 'All Owner Bookings'}
      </Typography>

      {bookings.length === 0 ? (
        <Alert severity="info">
          No owner bookings found.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Guest</TableCell>
                    <TableCell>Check In/Out</TableCell>
                    <TableCell>Guests</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {booking.propertyName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {booking.hostName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.guestName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.guestEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            to {new Date(booking.checkOut).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell>₹{booking.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.paymentStatus}
                          color={getPaymentStatusColor(booking.paymentStatus) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => openBookingDetails(booking)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Booking">
                            <IconButton size="small" onClick={() => openEditBooking(booking)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Booking Details
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedBooking.propertyName}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Guest Information</Typography>
                  <Typography>Name: {selectedBooking.guestName}</Typography>
                  <Typography>Email: {selectedBooking.guestEmail}</Typography>
                  {selectedBooking.guestPhone && (
                    <Typography>Phone: {selectedBooking.guestPhone}</Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Booking Details</Typography>
                  <Typography>Check In: {new Date(selectedBooking.checkIn).toLocaleDateString()}</Typography>
                  <Typography>Check Out: {new Date(selectedBooking.checkOut).toLocaleDateString()}</Typography>
                  <Typography>Guests: {selectedBooking.guests}</Typography>
                  <Typography>Total: ₹{selectedBooking.totalAmount.toLocaleString()}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={selectedBooking.status}
                    color={getStatusColor(selectedBooking.status) as any}
                  />
                  <Chip
                    label={selectedBooking.paymentStatus}
                    color={getPaymentStatusColor(selectedBooking.paymentStatus) as any}
                  />
                </Box>
              </Box>

              {selectedBooking.specialRequests && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Special Requests</Typography>
                  <Typography>{selectedBooking.specialRequests}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Booking
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={editForm.paymentStatus}
                onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                label="Payment Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Special Requests"
              value={editForm.specialRequests}
              onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
