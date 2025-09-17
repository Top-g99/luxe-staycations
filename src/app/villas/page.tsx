'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Rating,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Villa,
  Bed,
  Bathtub,
  People,
  Wifi,
  Pool,
  DirectionsCar,
  Kitchen,
  AcUnit,
  LocalLaundryService,
  HotTub,
  FitnessCenter,
  Restaurant,
  BeachAccess,
  Terrain,
  Security,
  Pets,
  SmokingRooms,
  Block,
  FilterList,
  Close
} from '@mui/icons-material';
import { PropertyManager } from '@/lib/managers/PropertyManager';

const propertyManager = new PropertyManager();

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  state: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function VillasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const propertyTypes = [
    { value: 'villa', label: 'Villa' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'pool_villa', label: 'Pool Villa' },
    { value: 'luxury_villa', label: 'Luxury Villa' }
  ];

  const priceRanges = [
    { value: '0-5000', label: 'Under ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-20000', label: '₹10,000 - ₹20,000' },
    { value: '20000+', label: 'Above ₹20,000' }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi />;
      case 'parking': return <DirectionsCar />;
      case 'swimming pool': return <Pool />;
      case 'kitchen': return <Kitchen />;
      case 'ac': case 'air conditioning': return <AcUnit />;
      case 'laundry': return <LocalLaundryService />;
      case 'hot tub': return <HotTub />;
      case 'gym': case 'fitness center': return <FitnessCenter />;
      case 'restaurant': return <Restaurant />;
      case 'beach access': return <BeachAccess />;
      case 'mountain view': return <Terrain />;
      case 'security': return <Security />;
      case 'pet friendly': return <Pets />;
      case 'smoking allowed': return <SmokingRooms />;
      case 'non-smoking': return <Block />;
      default: return <Villa />;
    }
  };

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyManager.getAllProperties();
        setProperties(data);
        setFilteredProperties(data);
        console.log('Loaded properties for villas page:', data.length);
      } catch (error) {
        console.error('Error loading properties:', error);
        setSnackbar({ open: true, message: 'Error loading properties', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by property type
    if (propertyType) {
      filtered = filtered.filter(property => property.property_type === propertyType);
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : parseInt(p));
      filtered = filtered.filter(property => {
        const price = property.price_per_night || 0;
        return price >= min && (max === Infinity || price <= max);
      });
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, propertyType, priceRange]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleBookNow = (property: Property) => {
    // Navigate to booking page with property details
    router.push(`/booking?property=${property.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPropertyType('');
    setPriceRange('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6">Loading properties...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontFamily: 'Playfair Display, serif',
          color: 'var(--primary-dark)',
          textAlign: 'center'
        }}>
          Luxe Villas & Retreats
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', mb: 4 }}>
          Discover our collection of premium properties
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                label="Property Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {propertyTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                label="Price Range"
              >
                <MenuItem value="">All Prices</MenuItem>
                {priceRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
              fullWidth
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Showing {filteredProperties.length} propert{filteredProperties.length !== 1 ? 'ies' : 'y'}
        </Typography>
      </Box>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 4
              }
            }}
            onClick={() => handlePropertyClick(property)}
            >
              <CardMedia
                component="img"
                height="250"
                image={property.images && property.images.length > 0 ? property.images[0] : '/images/placeholder-villa.jpg'}
                alt={property.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {property.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {property.location}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {property.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Bed sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {property.bedrooms || 0} bed • {property.bathrooms || 0} bath • {property.max_guests || 0} guests
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Amenities:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(property.amenities || []).slice(0, 3).map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        icon={getAmenityIcon(amenity)}
                        variant="outlined"
                      />
                    ))}
                    {(property.amenities || []).length > 3 && (
                      <Chip
                        label={`+${(property.amenities || []).length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="h6" sx={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                    ₹{(property.price_per_night || 0).toLocaleString()}/night
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(property);
                    }}
                    sx={{
                      backgroundColor: 'var(--primary-dark)',
                      '&:hover': {
                        backgroundColor: 'var(--secondary-dark)'
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

      {/* No Properties Message */}
      {filteredProperties.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No properties found matching your criteria.
          </Typography>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Property Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedProperty?.name}
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProperty && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProperty.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {selectedProperty.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty.location}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Bed sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty.bedrooms || 0} bed • {selectedProperty.bathrooms || 0} bath • {selectedProperty.max_guests || 0} guests
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ color: 'var(--primary-dark)', fontWeight: 'bold', mb: 2 }}>
                ₹{(selectedProperty.price_per_night || 0).toLocaleString()}/night
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(selectedProperty.amenities || []).map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    icon={getAmenityIcon(amenity)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedProperty) {
                handleBookNow(selectedProperty);
              }
            }}
            sx={{
              backgroundColor: 'var(--primary-dark)',
              '&:hover': {
                backgroundColor: 'var(--secondary-dark)'
              }
            }}
          >
            Book Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function VillasPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Container>
    }>
      <VillasPageContent />
    </Suspense>
  );
}
