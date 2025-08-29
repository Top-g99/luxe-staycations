'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Rating,
  Divider,
  Avatar,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn,
  Star,
  People,
  Bed,
  Bathtub,
  Wifi,
  Pool,
  Restaurant,
  Spa,
  CheckCircle,
  CalendarToday
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { propertyManager, Property } from '@/lib/propertyManager';
import { useBookingContext } from '@/contexts/BookingContext';

export default function VillaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setBookingDetails, setGuestInfo, setSearchFormData } = useBookingContext();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  useEffect(() => {
    const loadProperty = async () => {
      try {
        if (typeof window !== 'undefined') {
          propertyManager.initialize();
        }
        
        const propertyId = params.id as string;
        const propertyData = propertyManager.getPropertyById(propertyId);
        
        if (propertyData) {
          setProperty(propertyData);
        } else {
          // Handle property not found
          router.push('/villas');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading property:', error);
        setLoading(false);
      }
    };

    loadProperty();
  }, [params.id, router]);

  const handleBookingSubmit = () => {
    if (property && bookingForm.checkIn && bookingForm.checkOut && bookingForm.guests) {
      const checkIn = new Date(bookingForm.checkIn);
      const checkOut = new Date(bookingForm.checkOut);
      const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const total = property.price * totalNights;
      
      // Set search form data (this is what the checkout page expects)
      setSearchFormData({
        destination: property.location,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: bookingForm.guests
      });
      
      // Set booking details
      setBookingDetails({
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: bookingForm.guests,
        totalNights,
        total,
        propertyId: property.id,
        propertyName: property.name,
        propertyLocation: property.location,
        propertyImage: property.image,
        propertyPrice: property.price
      });
      
      setBookingDialogOpen(false);
      router.push('/booking/checkout');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi />;
      case 'pool':
        return <Pool />;
      case 'spa':
        return <Spa />;
      case 'restaurant':
        return <Restaurant />;
      default:
        return <CheckCircle />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading property details...</Typography>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Property not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Property Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          {property.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {property.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={property.rating} precision={0.1} readOnly />
          <Typography variant="body1" sx={{ ml: 1 }}>
            {property.rating} ({property.reviews} reviews)
          </Typography>
        </Box>
        <Chip label={property.type} color="primary" />
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ position: 'relative', height: 400, borderRadius: 3, overflow: 'hidden', mb: 2 }}>
              <img
                src={property.images ? property.images[selectedImage] : property.image}
                alt={property.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            
            {property.images && property.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {property.images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 80,
                      height: 60,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #d97706' : '2px solid transparent',
                      '&:hover': {
                        border: '2px solid #d97706'
                      }
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${property.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Property Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              About this property
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              {property.description}
            </Typography>
            
            {property.highlights && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Highlights
                </Typography>
                <Grid container spacing={2}>
                  {property.highlights.map((highlight, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                        <Typography variant="body2">{highlight}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Amenities */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Amenities
              </Typography>
              <Grid container spacing={2}>
                {property.amenities.map((amenity, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getAmenityIcon(amenity)}
                      <Typography variant="body2">{amenity}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Property Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Property Information
              </Typography>
              <Grid container spacing={2}>
                {property.bedrooms && (
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bed sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">{property.bedrooms} Bedrooms</Typography>
                    </Box>
                  </Grid>
                )}
                {property.bathrooms && (
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bathtub sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">{property.bathrooms} Bathrooms</Typography>
                    </Box>
                  </Grid>
                )}
                {property.maxGuests && (
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">Up to {property.maxGuests} guests</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Host Information */}
            {property.hostName && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Hosted by {property.hostName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {property.hostImage && (
                    <Avatar
                      src={property.hostImage}
                      sx={{ width: 60, height: 60 }}
                    />
                  )}
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {property.hostName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Superhost
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Policies */}
            {property.policies && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  House Rules
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Check-in</Typography>
                    <Typography variant="body2">{property.policies.checkIn}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Check-out</Typography>
                    <Typography variant="body2">{property.policies.checkOut}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Cancellation</Typography>
                    <Typography variant="body2">{property.policies.cancellation}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Booking Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                ₹{property.price.toLocaleString()}
                <Typography component="span" variant="body1" sx={{ color: 'text.secondary' }}>
                  /night
                </Typography>
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setBookingDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4a332c, #b45309)',
                    }
                  }}
                >
                  Book Now
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                You won't be charged yet
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Book Your Stay
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {property.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  type="date"
                  value={bookingForm.checkIn}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Check-out Date"
                  type="date"
                  value={bookingForm.checkOut}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Number of Guests</InputLabel>
                  <Select
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                    label="Number of Guests"
                    startAdornment={<People sx={{ color: 'text.secondary', mr: 1 }} />}
                  >
                    {Array.from({ length: property.maxGuests || 10 }, (_, i) => i + 1).map((num) => (
                      <MenuItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBookingDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            disabled={!bookingForm.checkIn || !bookingForm.checkOut || !bookingForm.guests}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            Continue to Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
