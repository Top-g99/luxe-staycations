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
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
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
  Celebration,
  Diamond,
  Star,
  CardGiftcard,
  Settings,
  Message,
  History
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import GuestAuthGuard from '@/components/GuestAuthGuard';
import SpecialRequestDialog from '@/components/SpecialRequestDialog';
import { emailService } from '@/lib/emailService';

interface LoyaltyData {
  pointsBalance: number;
  tier: string;
  totalSpent: number;
  totalBookings: number;
  nextTierPoints: number;
  tierBenefits: string[];
  totalJewelsEarned: number;
  totalJewelsRedeemed: number;
}

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
  const [tabValue, setTabValue] = useState(0);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [redemptionDialogOpen, setRedemptionDialogOpen] = useState(false);
  const [redemptionOptions, setRedemptionOptions] = useState<any[]>([]);
  const [selectedRedemptionOption, setSelectedRedemptionOption] = useState<any>(null);
  const [redemptionNotes, setRedemptionNotes] = useState('');

  useEffect(() => {
    // Try to get guest email from localStorage (set during booking ID login)
    const savedEmail = localStorage.getItem('guestEmail');
    const currentBookingId = localStorage.getItem('currentBookingId');
    
    if (savedEmail) {
      setGuestEmail(savedEmail);
      loadGuestBookings(savedEmail);
      loadLoyaltyData(savedEmail);
    } else if (currentBookingId) {
      // If no email but booking ID exists, try to get email from booking
      const booking = getBookingById(currentBookingId);
      if (booking) {
        setGuestEmail(booking.guestInfo.email);
        loadGuestBookings(booking.guestInfo.email);
        loadLoyaltyData(booking.guestInfo.email);
      }
    }
    
    // Load redemption options
    loadRedemptionOptions();
  }, [getBookingById]);

  const loadGuestBookings = (email: string) => {
    setLoading(true);
    const bookings = allBookings.filter(booking => 
      booking.guestInfo.email.toLowerCase() === email.toLowerCase()
    );
    setGuestBookings(bookings);
    setLoading(false);
  };

  const loadLoyaltyData = async (email: string) => {
    try {
      const response = await fetch(`/api/guest/profile?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.loyalty) {
          setLoyaltyData(data.loyalty);
          console.log('Loaded loyalty data from Supabase:', data.loyalty);
        } else {
          console.log('No loyalty data found, creating default data');
          createDefaultLoyaltyData();
        }
      } else {
        console.log('Guest account not found, creating default data');
        createDefaultLoyaltyData();
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      createDefaultLoyaltyData();
    }
  };

  const loadRedemptionOptions = async () => {
    try {
      const response = await fetch('/api/loyalty/redemption-options');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRedemptionOptions(data.data || []);
          console.log('Loaded redemption options:', data.data);
        }
      }
    } catch (error) {
      console.error('Error loading redemption options:', error);
    }
  };

  const createDefaultLoyaltyData = () => {
    const currentBooking = guestBookings[0];
    if (currentBooking) {
      // Calculate total points from all bookings
      const totalPoints = guestBookings.reduce((sum, booking) => {
        return sum + (booking.loyaltyPoints || 0);
      }, 0);
      
      const loyalty: LoyaltyData = {
        pointsBalance: totalPoints,
        tier: 'bronze',
        totalSpent: Number(currentBooking.bookingDetails.total) || 0,
        totalBookings: guestBookings.length,
        nextTierPoints: 1000,
        tierBenefits: ['Basic support', 'Email notifications'],
        totalJewelsEarned: totalPoints,
        totalJewelsRedeemed: 0
      };
      setLoyaltyData(loyalty);
    }
  };

  const handleRedemption = async () => {
    if (!loyaltyData || !selectedRedemptionOption) return;
    
    if (selectedRedemptionOption.jewels_required > loyaltyData.pointsBalance) {
      alert('Insufficient jewels balance for this redemption option');
      return;
    }

    try {
      // Get guest account ID from localStorage or API
      const savedEmail = localStorage.getItem('guestEmail');
      if (!savedEmail) {
        alert('Please login first');
        return;
      }

      const response = await fetch('/api/guest/profile?email=' + encodeURIComponent(savedEmail));
      const data = await response.json();
      
      if (!data.success || !data.guest) {
        alert('Guest account not found');
        return;
      }

      // Call redemption request API
      const redeemResponse = await fetch('/api/loyalty/redemption-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: data.guest.id,
          jewels_to_redeem: selectedRedemptionOption.jewels_required,
          redemption_reason: selectedRedemptionOption.option_name,
          contact_preference: 'email',
          special_notes: redemptionNotes || ''
        }),
      });

      const redeemData = await redeemResponse.json();
      
      if (redeemData.success) {
        alert(`Redemption request submitted successfully! Your request for "${selectedRedemptionOption.option_name}" is pending admin approval.`);
        setRedemptionDialogOpen(false);
        setSelectedRedemptionOption(null);
        setRedemptionNotes('');
        // Reload loyalty data
        loadLoyaltyData(savedEmail);
      } else {
        alert('Redemption request failed: ' + redeemData.error);
      }
    } catch (error) {
      console.error('Redemption error:', error);
      alert('Redemption request failed. Please try again.');
    }
  };

  const handleSearch = () => {
    if (guestEmail) {
      localStorage.setItem('guestEmail', guestEmail);
      loadGuestBookings(guestEmail);
      loadLoyaltyData(guestEmail);
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
      // Update booking with special requests in guest info (original approach from backup)
      updateBooking(selectedBookingForRequests.id, {
        guestInfo: {
          ...selectedBookingForRequests.guestInfo,
          specialRequests: requests.map((r: any) => r.description).join('; ')
        },
        updatedAt: new Date().toISOString()
      });
      
      // Send confirmation email for special requests via Brevo
      if (requests.length > 0) {
        const specialRequestData = {
          guestName: selectedBookingForRequests.guestInfo?.name || 'Guest',
          guestEmail: selectedBookingForRequests.guestInfo?.email || guestEmail,
          phone: selectedBookingForRequests.guestInfo?.phone || '',
          propertyName: selectedBookingForRequests.bookingDetails?.propertyName || 'Luxury Villa',
          requestType: requests.map(r => r.category).join(', '),
          description: requests.map(r => r.description).join('\n\n'),
          urgency: requests.some(r => r.priority === 'high') ? 'High' : 
                   requests.some(r => r.priority === 'medium') ? 'Medium' : 'Low',
          requestId: 'SR-' + Date.now()
        };
        
        try {
          console.log('Sending special request confirmation email via Brevo...');
          const response = await fetch('/api/brevo/special-request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(specialRequestData)
          });
          
          const emailResult = await response.json();
          console.log('Special request email result:', emailResult);
          
          if (!emailResult.success) {
            console.error('Special request email failed:', emailResult.message);
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't show error to user, just log it
        }
      }
      
      // Refresh bookings
      loadGuestBookings(guestEmail);
      setSpecialRequestDialogOpen(false);
      setSelectedBookingForRequests(null);
      
      // Show success message
      alert('Special requests submitted successfully! You will receive a confirmation email shortly.');
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'default';
      case 'silver': return 'primary';
      case 'gold': return 'warning';
      case 'platinum': return 'success';
      default: return 'default';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '⭐';
    }
  };

  return (
    <GuestAuthGuard>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, color: '#5a3d35' }}>
            Guest Dashboard
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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="My Bookings" icon={<CalendarToday />} />
            <Tab label="Special Requests" icon={<Message />} />
            <Tab label="💎 Luxe Jewels" icon={<Diamond />} />
            <Tab label="Profile" icon={<Settings />} />
          </Tabs>
        </Box>

        {/* My Bookings Tab */}
        {tabValue === 0 && (
          <>
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
                              {booking.loyaltyPoints && booking.loyaltyPoints > 0 && (
                                <Typography variant="body2" sx={{ color: '#d97706', fontWeight: 500 }}>
                                  💎 {booking.loyaltyPoints} Jewels Earned
                                </Typography>
                              )}
                              
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
          </>
        )}

        {/* Special Requests Tab */}
        {tabValue === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
                Special Requests Management
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Manage special requests for your confirmed bookings. You can add dietary requirements, 
                celebration arrangements, accessibility needs, and other special requests.
              </Typography>
              
              {guestBookings.filter(b => b.status === 'confirmed').length > 0 ? (
                <List>
                  {guestBookings
                    .filter(booking => booking.status === 'confirmed')
                    .map((booking) => (
                      <ListItem key={booking.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                        <ListItemIcon>
                          <Message sx={{ color: '#d97706' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={booking.bookingDetails.propertyName}
                          secondary={`Check-in: ${formatDate(booking.bookingDetails.checkIn)} | Check-out: ${formatDate(booking.bookingDetails.checkOut)}`}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => handleSpecialRequests(booking)}
                          sx={{ borderColor: '#d97706', color: '#d97706' }}
                        >
                          Manage Requests
                        </Button>
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Alert severity="info">
                  No confirmed bookings available for special requests. Please confirm a booking first.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Luxe Jewels Tab */}
        {tabValue === 2 && loyaltyData && (
          <Grid container spacing={3}>
            {/* Luxe Jewels Balance */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #5a3d35 0%, #d97706 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Diamond sx={{ fontSize: 48, mb: 2, color: '#FFD700' }} />
                  <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {loyaltyData.pointsBalance}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Luxe Jewels
                  </Typography>
                  <Chip
                    label={`${getTierIcon(loyaltyData.tier)} ${loyaltyData.tier.toUpperCase()}`}
                    color={getTierColor(loyaltyData.tier)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setRedemptionDialogOpen(true)}
                    sx={{ 
                      bgcolor: '#FFD700', 
                      color: '#5a3d35',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#FFC107' }
                    }}
                  >
                    Redeem Jewels
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Tier Progress */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
                    Tier Progress
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Progress to next tier
                      </Typography>
                      <Typography variant="body2">
                        {loyaltyData.pointsBalance} / {loyaltyData.nextTierPoints} points
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'grey.200', 
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${Math.min((loyaltyData.pointsBalance / loyaltyData.nextTierPoints) * 100, 100)}%`,
                        height: '100%',
                        bgcolor: 'var(--primary-dark)',
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {loyaltyData.nextTierPoints - loyaltyData.pointsBalance} more points to reach the next tier
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Tier Benefits */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
                    Your Tier Benefits
                  </Typography>
                  <Grid container spacing={2}>
                    {loyaltyData.tierBenefits.map((benefit, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Star sx={{ color: '#d97706', mr: 1 }} />
                          <Typography variant="body2">{benefit}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* How to Earn & Redeem */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
                    How to Earn Jewels
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Diamond sx={{ color: '#d97706' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="1 point per ₹100 spent"
                        secondary="Earn jewels on every booking"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Star sx={{ color: '#d97706' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Referral bonus"
                        secondary="Earn 500 jewels for each successful referral"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CardGiftcard sx={{ color: '#d97706' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Special promotions"
                        secondary="Double jewels during special events"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
                    How to Redeem Jewels
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Diamond sx={{ color: '#d97706' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Free nights"
                        secondary="Redeem 10,000 jewels for a free night"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CardGiftcard sx={{ color: '#d97706' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Upgrades"
                        secondary="Upgrade to premium rooms"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Star sx={{ color: '#d97706' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Exclusive experiences"
                        secondary="Access to special events and services"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Profile Tab */}
        {tabValue === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#5a3d35', mb: 3 }}>
                Profile Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={guestEmail}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Total Bookings"
                    value={guestBookings.length}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Loyalty Tier"
                    value={loyaltyData?.tier?.toUpperCase() || 'BRONZE'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Spent"
                    value={`₹${loyaltyData?.totalSpent?.toLocaleString() || '0'}`}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Luxe Jewels Balance"
                    value={loyaltyData?.pointsBalance || '0'}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Member Since"
                    value={new Date().toLocaleDateString()}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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

        {/* Redemption Dialog */}
        <Dialog 
          open={redemptionDialogOpen} 
          onClose={() => setRedemptionDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ color: '#5a3d35', fontWeight: 600 }}>
            💎 Redeem Your Luxe Jewels
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Choose from available redemption options. Your request will be reviewed by our team.
            </Typography>
            
            {loyaltyData && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: '#5a3d35' }}>
                  Your Balance: {loyaltyData.pointsBalance} Jewels
                </Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              {redemptionOptions.map((option) => (
                <Grid item xs={12} sm={6} key={option.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedRedemptionOption?.id === option.id ? '2px solid #d97706' : '1px solid #e0e0e0',
                      '&:hover': { borderColor: '#d97706' }
                    }}
                    onClick={() => setSelectedRedemptionOption(option)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#5a3d35', fontWeight: 600 }}>
                          {option.option_name}
                        </Typography>
                        <Chip 
                          label={`${option.jewels_required} Jewels`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {option.option_description}
                      </Typography>
                      <Chip 
                        label={option.option_type.replace('_', ' ').toUpperCase()}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedRedemptionOption && (
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Special Notes (Optional)"
                  placeholder="Any special requests or notes for this redemption..."
                  value={redemptionNotes}
                  onChange={(e) => setRedemptionNotes(e.target.value)}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRedemptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRedemption}
              variant="contained"
              disabled={!selectedRedemptionOption}
              sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b8651a' } }}
            >
              Submit Redemption Request
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </GuestAuthGuard>
  );
}
