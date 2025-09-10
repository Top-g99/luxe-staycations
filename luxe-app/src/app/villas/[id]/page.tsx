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
import { propertyManager, Property } from '@/lib/dataManager';
import { useBookingContext } from '@/contexts/BookingContext';
import PropertyImageGallery from '@/components/property/PropertyImageGallery';
import PropertySpecifications from '@/components/property/PropertySpecifications';
import PropertyNeighborhood from '@/components/property/PropertyNeighborhood';
import PropertyPricing from '@/components/property/PropertyPricing';
import PropertyReviews from '@/components/property/PropertyReviews';
import PropertyHighlights from '@/components/property/PropertyHighlights';

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
        await propertyManager.initialize();
        
        const propertyId = params.id as string;
        const propertyData = propertyManager.getById(propertyId);
        
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
        propertyImage: property.image || '',
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
        <Chip label="Villa" color="primary" />
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Enhanced Image Gallery */}
          <Box sx={{ mb: 4 }}>
            <PropertyImageGallery
              images={[property.image]}
              mainImage={property.image || ''}
              
              
              propertyName={property.name}
            />
          </Box>

          {/* Property Highlights */}
          <PropertyHighlights
            
            amenities={property.amenities}
            rating={property.rating}
            reviews={property.reviews}
            featured={property.featured}
          />

          {/* Property Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              About this property
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              {property.description}
            </Typography>
          </Box>

          {/* Enhanced Property Specifications */}
          <PropertySpecifications
            
            
            maxGuests={property.max_guests}
          />

          {/* Neighborhood Information */}
          <PropertyNeighborhood
            
            location={property.location}
          />

          {/* Enhanced Pricing & Offers */}
          <PropertyPricing
            
            basePrice={property.price}
          />

          {/* Property Reviews */}
          <PropertyReviews
            
            overallRating={property.rating}
            totalReviews={property.reviews}
          />
        </Grid>

        {/* Booking Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                ₹{(property.price).toLocaleString()}
                <Typography component="span" variant="body1" sx={{ color: 'text.secondary' }}>
                  /night
                </Typography>
              </Typography>
              
              {/* Show weekend pricing if available */}
              
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
                    {Array.from({ length: property.max_guests || 10 }, (_, i) => i + 1).map((num) => (
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
