'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  IconButton,
  Button,
  LinearProgress
} from '@mui/material';
import { Visibility, Edit, Refresh, Add } from '@mui/icons-material';
import BookingEditDialog from '@/components/BookingEditDialog';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Load real-time bookings from BookingManager
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { bookingManager } = await import('@/lib/bookingManager');
        
        if (typeof window !== 'undefined') {
          bookingManager.initialize();
        }
        
        const allBookings = bookingManager.getAllBookings();
        // Filter out any invalid bookings and ensure all required fields exist
        const validBookings = allBookings.filter(booking => 
          booking && 
          booking.id && 
          booking.guestName && 
          booking.propertyName &&
          typeof booking.amount === 'number'
        );
        setBookings(validBookings);
        setLoading(false);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setLoading(false);
      }
    };

    loadBookings();

    // Subscribe to real-time updates
    let unsubscribe: (() => void) | null = null;
    import('@/lib/bookingManager').then(({ bookingManager }) => {
      unsubscribe = bookingManager.subscribe(() => {
        const updatedBookings = bookingManager.getAllBookings();
        // Filter out any invalid bookings and ensure all required fields exist
        const validBookings = updatedBookings.filter(booking => 
          booking && 
          booking.id && 
          booking.guestName && 
          booking.propertyName &&
          typeof booking.amount === 'number'
        );
        console.log('Bookings updated in real-time:', validBookings);
        setBookings(validBookings);
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Manage Bookings
        </Typography>
        <Box>
          <Button
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
                  <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedBooking(null);
            setDialogMode('create');
            setDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          New Booking
        </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
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
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary', py: 4 }}>
                        No bookings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id || 'N/A'}</TableCell>
                      <TableCell>{booking.guestName || 'N/A'}</TableCell>
                      <TableCell>{booking.propertyName || 'N/A'}</TableCell>
                      <TableCell>{booking.checkIn || 'N/A'}</TableCell>
                      <TableCell>{booking.checkOut || 'N/A'}</TableCell>
                      <TableCell>₹{(booking.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status || 'Unknown'}
                          color={booking.status === 'Confirmed' ? 'success' : 
                                 booking.status === 'Pending' ? 'warning' : 
                                 booking.status === 'Cancelled' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDialogMode('edit');
                            setDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Booking Edit Dialog */}
      <BookingEditDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        booking={selectedBooking}
        mode={dialogMode}
      />
    </Box>
  );
}
