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
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [propertyManager, setPropertyManager] = useState<any>(null);
  
  // Initialize propertyManager for getting property names
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/dataManager').then(({ propertyManager }) => {
        propertyManager.initialize();
        setPropertyManager(propertyManager);
      });
    }
  }, []);
  
  // Helper function to get property name from propertyId
  const getPropertyName = (propertyId: string) => {
    try {
      const property = propertyManager?.getById(propertyId);
      return property ? property.name : `Property ${propertyId.slice(0, 8)}...`;
    } catch (error) {
      return `Property ${propertyId.slice(0, 8)}...`;
    }
  };

  // Load real-time bookings from Supabase API
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        const result = await response.json();
        
        if (result.success) {
          setBookings(result.data || []);
        } else {
          console.error('Error loading bookings:', result.error);
          setBookings([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setBookings([]);
        setLoading(false);
      }
    };

    loadBookings();
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
            onClick={async () => {
              try {
                setLoading(true);
                const response = await fetch('/api/bookings');
                const result = await response.json();
                
                if (result.success) {
                  setBookings(result.data || []);
                } else {
                  console.error('Error refreshing bookings:', result.error);
                }
              } catch (error) {
                console.error('Error refreshing bookings:', error);
              } finally {
                setLoading(false);
              }
            }}
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
                      <TableCell>{getPropertyName(booking.propertyId) || 'N/A'}</TableCell>
                      <TableCell>{booking.checkIn || 'N/A'}</TableCell>
                      <TableCell>{booking.checkOut || 'N/A'}</TableCell>
                      <TableCell>₹{(booking.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status || 'Unknown'}
                          color={booking.status === 'confirmed' ? 'success' : 
                                 booking.status === 'pending' ? 'warning' : 
                                 booking.status === 'cancelled' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDialogMode('view');
                            setDialogOpen(true);
                          }}
                          sx={{ color: '#1976d2' }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDialogMode('edit');
                            setDialogOpen(true);
                          }}
                          sx={{ color: '#d97706' }}
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
