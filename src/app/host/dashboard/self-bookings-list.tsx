"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Business,
  Payment,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';
import { supabaseHostManager } from '@/lib/supabaseHostManager';
import { HostBooking } from '@/lib/supabaseHostManager';

interface SelfBookingsListProps {
  hostId: string;
}

export default function SelfBookingsList({ hostId }: SelfBookingsListProps) {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [hostId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const selfBookings = await supabaseHostManager.getHostSelfBookings(hostId);
      setBookings(selfBookings);
    } catch (error) {
      console.error('Error loading self-bookings:', error);
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Bookings Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first booking using the form above. All bookings will appear here and in the admin panel.
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {bookings.map((booking, index) => (
        <React.Fragment key={booking.id}>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Business sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {booking.guest_name}
                  </Typography>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status) as any}
                    size="small"
                  />
                  <Chip
                    label={booking.paymentStatus || 'Pending'}
                    color={getPaymentStatusColor(booking.paymentStatus || 'Pending') as any}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Payment sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="medium" color="primary.main">
                        {formatCurrency(booking.total_amount)}
                      </Typography>
                    </Box>
                    
                    {booking.specialRequests && (
                      <Typography variant="body2" color="text.secondary">
                        Special: {booking.specialRequests}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Booked on: {new Date(booking.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < bookings.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
}
