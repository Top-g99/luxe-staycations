'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  BookOnline,
  CalendarToday,
  LocationOn,
  Payment,
  Receipt,
  Edit,
  Cancel,
  Search,
  FilterList,
  Logout,
  Celebration
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import GuestAuthGuard from '@/components/GuestAuthGuard';
import SpecialRequestDialog from '@/components/SpecialRequestDialog';
import { emailService } from '@/lib/emailService';

export default function GuestDashboard() {
  const router = useRouter();
  const { allBookings, getBookingById, updateBooking } = useBookingContext();
  
  const [guestEmail, setGuestEmail] = useState('');
  const [guestBookings, setGuestBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [specialRequestDialogOpen, setSpecialRequestDialogOpen] = useState(false);
  const [selectedBookingForRequests, setSelectedBookingForRequests] = useState<any>(null);

  useEffect(() => {
    // Try to get guest email from localStorage (set during booking ID login)
    const savedEmail = localStorage.getItem('guestEmail');
    const currentBookingId = localStorage.getItem('currentBookingId');
    
    if (savedEmail) {
      setGuestEmail(savedEmail);
      loadGuestBookings(savedEmail);
    } else if (currentBookingId) {
      // If no email but booking ID exists, try to get email from booking
      const booking = getBookingById(currentBookingId);
      if (booking) {
        setGuestEmail(booking.guestInfo.email);
        loadGuestBookings(booking.guestInfo.email);
      }
    }
  }, [getBookingById]);

  const loadGuestBookings = (email: string) => {
    setLoading(true);
    const bookings = allBookings.filter(booking => 
      booking.guestInfo.email.toLowerCase() === email.toLowerCase()
    );
    setGuestBookings(bookings);
    setLoading(false);
  };

  const handleSearch = () => {
    if (guestEmail) {
      localStorage.setItem('guestEmail', guestEmail);
      loadGuestBookings(guestEmail);
    }
  };

  const filteredBookings = guestBookings.filter(booking => {
    const matchesSearch = booking.bookingDetails.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCancelBooking = async () => {
    if (selectedBooking) {
      try {
        updateBooking(selectedBooking.id, {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        });
        
        // Send cancellation confirmation email
        if (emailService.isConfigured) {
          const cancellationData = {
            guestName: selectedBooking.guestInfo?.name || 'Guest',
            guestEmail: selectedBooking.guestInfo?.email || guestEmail,
            bookingId: selectedBooking.id,
            propertyName: selectedBooking.bookingDetails?.propertyName || 'Luxury Villa',
            propertyAddress: selectedBooking.bookingDetails?.propertyLocation || 'Premium Location',
            checkIn: selectedBooking.bookingDetails?.checkIn || '',
            checkOut: selectedBooking.bookingDetails?.checkOut || '',
            guests: parseInt(selectedBooking.bookingDetails?.guests || '1'),
            totalAmount: parseFloat(selectedBooking.bookingDetails?.totalAmount || '0'),
            cancellationReason: 'Guest requested cancellation',
            refundAmount: parseFloat(selectedBooking.bookingDetails?.totalAmount || '0') * 0.9, // 90% refund
            refundMethod: 'Original payment method',
            refundTimeline: '5-7 business days',
            hostName: 'Property Host',
            hostPhone: '+91-8828279739',
            hostEmail: 'host@luxestaycations.in'
          };
          
          try {
            await emailService.sendBookingCancellation(cancellationData);
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't show error to user, just log it
          }
        }
        
        // Refresh bookings
        loadGuestBookings(guestEmail);
        setCancelDialogOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const handleLogout = () => {
    // Clear guest session data
    localStorage.removeItem('guestEmail');
    localStorage.removeItem('currentBookingId');
    
    // Redirect to login page
    router.push('/guest/login');
  };

  const handleSpecialRequests = (booking: any) => {
    setSelectedBookingForRequests(booking);
    setSpecialRequestDialogOpen(true);
  };

  const handleSaveSpecialRequests = async (requests: any[]) => {
    if (selectedBookingForRequests) {
      // Update booking with special requests in guest info
      updateBooking(selectedBookingForRequests.id, {
        guestInfo: {
          ...selectedBookingForRequests.guestInfo,
          specialRequests: requests.map((r: any) => r.description).join('; ')
        },
        updatedAt: new Date().toISOString()
      });
      
      // Send confirmation email for special requests
      if (emailService.isConfigured && requests.length > 0) {
        const specialRequestData = {
          guestName: selectedBookingForRequests.guestInfo?.name || 'Guest',
          email: selectedBookingForRequests.guestInfo?.email || guestEmail,
          phone: selectedBookingForRequests.guestInfo?.phone || '',
          propertyName: selectedBookingForRequests.propertyName || 'Luxury Villa',
          requestType: requests.map(r => r.category).join(', '),
          description: requests.map(r => r.description).join('\n\n'),
          urgency: requests.some(r => r.priority === 'high') ? 'High' : 
                   requests.some(r => r.priority === 'medium') ? 'Medium' : 'Low',
          requestId: 'SR-' + Date.now()
        };
        
        try {
          await emailService.sendSpecialRequestConfirmation(specialRequestData);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't show error to user, just log it
        }
      }
      
      // Refresh bookings
      loadGuestBookings(guestEmail);
      setSpecialRequestDialogOpen(false);
      setSelectedBookingForRequests(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <GuestAuthGuard>
      <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#5a3d35' }}>
          My Bookings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={() => handleLogout()}
          sx={{ borderColor: '#d97706', color: '#d97706' }}
        >
          Logout
        </Button>
      </Box>

      {/* Search Section */}
      <Card sx={{ mb: 4, border: '2px solid #f3f4f6' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d97706' }}>
            Find Your Bookings
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Enter your email address"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="john@example.com"
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSearch()}
                disabled={!guestEmail}
                sx={{
                  background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4a332c, #b45309)',
                  }
                }}
              >
                <Search sx={{ mr: 1 }} />
                Search Bookings
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/')}
              >
                Browse Properties
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters */}
      {guestBookings.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search bookings"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by property name or booking ID"
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Filter by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Bookings List */}
      {loading ? (
        <Typography>Loading your bookings...</Typography>
      ) : guestBookings.length === 0 && guestEmail ? (
        <Alert severity="info">
          No bookings found for this email address. Please check your email or create a new booking.
        </Alert>
      ) : guestBookings.length === 0 ? (
        <Card sx={{ border: '2px solid #f3f4f6' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <BookOnline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Welcome to Your Booking Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Enter your email address above to view your bookings and manage your stays.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card sx={{ border: '2px solid #f3f4f6' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Property Image */}
                    <Grid item xs={12} sm={3}>
                      <Box
                        component="img"
                        src={booking.bookingDetails.propertyImage}
                        alt={booking.bookingDetails.propertyName}
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 2
                        }}
                      />
                    </Grid>

                    {/* Booking Details */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {booking.bookingDetails.propertyName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {booking.bookingDetails.propertyLocation}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Check-in</Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatDate(booking.bookingDetails.checkIn)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Check-out</Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatDate(booking.bookingDetails.checkOut)}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={getStatusLabel(booking.status)}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                          Booking ID: {booking.id}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>
                          ₹{booking.bookingDetails.total.toLocaleString()}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Receipt />}
                          onClick={() => router.push(`/booking/confirmation/${booking.id}`)}
                        >
                          View Details
                        </Button>

                        {booking.status === 'confirmed' && (
                          <>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Celebration />}
                              onClick={() => handleSpecialRequests(booking)}
                              sx={{ mb: 1 }}
                            >
                              Special Requests
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Cancel />}
                              color="error"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setCancelDialogOpen(true);
                              }}
                            >
                              Cancel Booking
                            </Button>
                          </>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your booking for{' '}
            <strong>{selectedBooking?.bookingDetails.propertyName}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            This action cannot be undone. Please check the cancellation policy for refund details.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button onClick={() => handleCancelBooking()} color="error" variant="contained">
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Special Request Dialog */}
      <SpecialRequestDialog
        open={specialRequestDialogOpen}
        onClose={() => setSpecialRequestDialogOpen(false)}
        onSave={handleSaveSpecialRequests}
        bookingId={selectedBookingForRequests?.id || ''}
      />
      </Container>
    </GuestAuthGuard>
  );
}
