'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Slider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Search, FilterList, Star } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { propertyManager, Property } from '@/lib/propertyManager';
import PropertyImage from '@/components/PropertyImage';

function VillasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchFormData } = useBookingContext();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const loadProperties = () => {
      try {
        if (typeof window !== 'undefined') {
          propertyManager.initialize();
        }
        
        // Use getAllProperties method for all properties
        const allProperties = propertyManager.getAllProperties();
        setProperties(allProperties);
        setFilteredProperties(allProperties);
        setLoading(false);
      } catch (error) {
        console.error('Error loading properties:', error);
        setLoading(false);
      }
    };

    // Initial load
    loadProperties();

    // Subscribe to real-time updates
    const unsubscribe = propertyManager.subscribe(() => {
      const updatedProperties = propertyManager.getAllProperties();
      console.log('Properties updated in real-time:', updatedProperties);
      setProperties(updatedProperties);
      setFilteredProperties(updatedProperties);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle URL search parameters
  useEffect(() => {
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    if (destination) {
      setSearchQuery(destination);
      console.log('Setting search query from URL:', destination);
    }

    // Also update the booking context if we have search data
    if (destination || checkIn || checkOut || guests) {
      const urlSearchData = {
        destination: destination || '',
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        guests: guests || ''
      };
      console.log('URL search data:', urlSearchData);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [properties, searchQuery, priceRange, selectedType, selectedAmenities, minRating]);

  const applyFilters = () => {
    let filtered = [...properties];

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(property =>
      property.price >= priceRange[0] && property.price <= priceRange[1]
    );

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(property =>
        selectedAmenities.every(amenity => property.amenities.includes(amenity))
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(property => property.rating >= minRating);
    }

    setFilteredProperties(filtered);
  };

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/villas/${propertyId}`);
  };

  const handleBookNow = (propertyId: string) => {
    router.push(`/booking/checkout?property=${propertyId}`);
  };

  const amenities = ['Pool', 'WiFi', 'Spa', 'Mountain View', 'Private Beach', 'Restaurant', 'Fireplace', 'Hiking Trails'];
  const propertyTypes = ['Villa', 'Resort', 'Lodge', 'Cottage', 'Apartment'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading properties...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Discover Luxury Villas
        </Typography>
        {searchFormData && (
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Showing results for {searchFormData.destination} • {searchFormData.checkIn} to {searchFormData.checkOut} • {searchFormData.guests} guests
          </Typography>
        )}
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {filteredProperties.length} properties found
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              Filters
            </Typography>

            {/* Search */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Search properties"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Box>

            {/* Price Range */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Price Range (₹)
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={50000}
                step={1000}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">₹{priceRange[0].toLocaleString()}</Typography>
                <Typography variant="body2">₹{priceRange[1].toLocaleString()}</Typography>
              </Box>
            </Box>

            {/* Property Type */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Property Type
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Types</MenuItem>
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Amenities */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Amenities
              </Typography>
              {amenities.map((amenity) => (
                <FormControlLabel
                  key={amenity}
                  control={
                    <Checkbox
                      checked={selectedAmenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAmenities([...selectedAmenities, amenity]);
                        } else {
                          setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                        }
                      }}
                    />
                  }
                  label={amenity}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>

            {/* Rating */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Minimum Rating
              </Typography>
              <Rating
                value={minRating}
                onChange={(_, newValue) => setMinRating(newValue || 0)}
                precision={0.5}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {minRating > 0 ? `${minRating}+ stars` : 'Any rating'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Properties Grid */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {filteredProperties.map((property) => (
              <Grid item xs={12} sm={6} lg={4} key={property.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                  onClick={() => handlePropertyClick(property.id)}
                >
                  <Box sx={{ height: 200, overflow: 'hidden' }}>
                    <PropertyImage
                      src={property.image || ''}
                      alt={property.name}
                      height={200}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                        {property.name}
                      </Typography>
                      <Chip
                        label={property.type}
                        size="small"
                        sx={{ ml: 1, bgcolor: '#f3f4f6' }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {property.location}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={property.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {property.rating} ({property.reviews} reviews)
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                      {property.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <Chip
                          key={index}
                          label={amenity}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#d97706' }}>
                          ₹{property.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          per night
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(property.id);
                        }}
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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {filteredProperties.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                No properties found matching your criteria
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setPriceRange([0, 50000]);
                  setSelectedType('');
                  setSelectedAmenities([]);
                  setMinRating(0);
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default function VillasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VillasPageContent />
    </Suspense>
  );
}
