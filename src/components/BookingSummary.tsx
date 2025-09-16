'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  People,
  Home,
  Payment,
  Message
} from '@mui/icons-material';
import { Property } from '@/lib/dataManager';

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  specialRequests?: string;
}

interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: string;
  totalNights: number;
  total: number;
  propertyId?: string;
  propertyName?: string;
  propertyLocation?: string;
  propertyImage?: string;
  propertyPrice?: number;
}

interface BookingSummaryProps {
  guestInfo: GuestInfo;
  bookingDetails: BookingDetails;
  property: Property;
}

export default function BookingSummary({ guestInfo, bookingDetails, property }: BookingSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(bookingDetails.checkIn);
    const checkOut = new Date(bookingDetails.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5a3d35' }}>
        Booking Summary
      </Typography>

      <Grid container spacing={3}>
        {/* Property Information */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3, border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Home />
                Property Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box
                    component="img"
                    src={property.images?.[0] || ''}
                    alt={property.name}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 2
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {property.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16 }} />
                    {property.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {property.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {property.amenities?.slice(0, 4).map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Guest Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Guest Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d97706', width: 56, height: 56 }}>
                  {guestInfo.firstName.charAt(0)}{guestInfo.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {guestInfo.firstName} {guestInfo.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Guest
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{guestInfo.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{guestInfo.phone}</Typography>
                </Box>
                {guestInfo.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                    <Typography variant="body2">
                      {guestInfo.address}
                      {guestInfo.city && `, ${guestInfo.city}`}
                      {guestInfo.country && `, ${guestInfo.country}`}
                    </Typography>
                  </Box>
                )}
                {guestInfo.specialRequests && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Message sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{guestInfo.specialRequests}"
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday />
                Stay Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Check-in</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDate(bookingDetails.checkIn)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Check-out</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDate(bookingDetails.checkOut)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 16 }} />
                    Guests
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {bookingDetails.guests} {parseInt(bookingDetails.guests) === 1 ? 'Guest' : 'Guests'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Duration</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing Summary */}
        <Grid item xs={12}>
          <Card sx={{ border: '2px solid #f3f4f6' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment />
                Pricing Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Per Night Rate</Typography>
                  <Typography variant="body1">₹{property.price.toLocaleString()}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Number of Nights</Typography>
                  <Typography variant="body1">{nights}</Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>Total Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>
                    ₹{bookingDetails.total.toLocaleString()}
                  </Typography>
                </Box>
                
                <Chip 
                  label="Payment Pending" 
                  color="warning" 
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}




