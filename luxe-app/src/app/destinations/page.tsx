"use client";

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
  Paper
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Hotel,
  Villa,
  Apartment
} from '@mui/icons-material';
import { propertyManager } from '@/lib/dataManager';
import { destinationManager } from '@/lib/dataManager';

// Default destinations for fallback
const defaultDestinations = [
  {
    name: 'Lonavala',
    state: 'Maharashtra',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Scenic hill station known for its caves, forts, and viewpoints',
    propertyCount: 12,
    rating: 4.8,
    popularFor: ['Weekend Getaways', 'Adventure', 'Nature']
  },
  {
    name: 'Goa',
    state: 'Goa',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    description: 'Tropical paradise with beaches, nightlife, and Portuguese heritage',
    propertyCount: 25,
    rating: 4.7,
    popularFor: ['Beaches', 'Nightlife', 'Culture']
  }
];

function DestinationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        await destinationManager.initialize();
        const data = destinationManager.getAll();
        setDestinations(data);
        setFilteredDestinations(data);
      } catch (error) {
        console.error('Error loading destinations:', error);
        // Fallback to default destinations
        setDestinations(defaultDestinations);
        setFilteredDestinations(defaultDestinations);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  useEffect(() => {
    let filtered = destinations;

    if (searchTerm) {
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stateFilter) {
      filtered = filtered.filter(dest => dest.location === stateFilter);
    }

    setFilteredDestinations(filtered);
  }, [searchTerm, stateFilter, destinations]);

  const handleDestinationClick = (destination: any) => {
    // Navigate to home page with destination pre-filled in search
    router.push(`/?destination=${encodeURIComponent(destination.name)}`);
  };

  const states = [...new Set(destinations.map(dest => dest.location))];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            mb: 2,
            color: 'var(--primary-dark)',
            fontFamily: 'Playfair Display, serif'
          }}
        >
          Explore Destinations
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
            fontFamily: 'Nunito, sans-serif'
          }}
        >
          Discover handpicked destinations across India, each offering unique experiences 
          and luxury accommodations for your perfect getaway
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                value={stateFilter}
                label="State"
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <MenuItem value="">All States</MenuItem>
                {states.map((state) => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStateFilter('');
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await propertyManager.initialize();
                  const allProperties = propertyManager.getAll();
                  if (allProperties.length === 0) {
                    // Add sample properties
                    const sampleProperties = [
                      {
                        name: 'Casa Alphonso - Lonavala',
                        location: 'Lonavala, Maharashtra',
                        description: 'Luxury villa with panoramic mountain views, private pool, and modern amenities.',
                        price: 15000,
                        rating: 4.8,
                        reviews: 25,
                        max_guests: 8,
                        amenities: ['Private Pool', 'WiFi', 'Kitchen', 'Parking', 'Mountain View'],
                        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
                        featured: true,
                        type: 'villa',
                        available: true,
                        bedrooms: 4,
                        bathrooms: 3,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      },
                      {
                        name: 'Casa Alphonso - Malpe',
                        location: 'Malpe, Maharashtra',
                        description: 'Luxury beachfront villa in Malpe with stunning ocean views, private pool, and modern amenities.',
                        price: 18000,
                        rating: 4.9,
                        reviews: 32,
                        max_guests: 8,
                        amenities: ['Private Pool', 'Beach Access', 'WiFi', 'Kitchen', 'Parking', 'Ocean View'],
                        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
                        featured: true,
                        type: 'villa',
                        available: true,
                        bedrooms: 4,
                        bathrooms: 3,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }
                    ];
                    
                    for (const property of sampleProperties) {
                      await propertyManager.create(property);
                    }
                    
                    console.log('Sample properties added successfully');
                    alert('Sample properties added! Now you can click on destinations to see properties.');
                  } else {
                    alert(`Already have ${allProperties.length} properties in the system.`);
                  }
                } catch (error) {
                  console.error('Error adding sample properties:', error);
                  alert('Error adding sample properties. Check console for details.');
                }
              }}
              fullWidth
              sx={{ bgcolor: 'var(--primary-dark)' }}
            >
              Add Sample Properties
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Destinations Grid */}
      <Grid container spacing={4}>
        {filteredDestinations.map((destination) => (
          <Grid item xs={12} sm={6} md={4} key={destination.name}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => handleDestinationClick(destination)}
            >
              <CardMedia
                component="img"
                height="200"
                image={destination.image}
                alt={destination.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {destination.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                      {destination.state || destination.location || 'Maharashtra, India'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Star sx={{ color: '#fbbf24', fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {destination.rating || 4.5}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {destination.propertyCount || 0} properties
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                  {destination.description || 'Experience luxury and comfort in this beautiful destination with premium accommodations and exceptional service.'}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {destination.popularFor && destination.popularFor.length > 0 ? (
                    destination.popularFor.map((tag: string) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: 'var(--primary-light)',
                          color: 'var(--primary-dark)',
                          fontSize: '0.75rem'
                        }}
                      />
                    ))
                  ) : (
                    <Chip
                      label="Luxury Villas"
                      size="small"
                      sx={{
                        bgcolor: 'var(--primary-light)',
                        color: 'var(--primary-dark)',
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: 'var(--secondary-dark)',
                    '&:hover': { bgcolor: 'var(--secondary-dark)' }
                  }}
                >
                  Explore Properties
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredDestinations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            No destinations found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Try adjusting your search criteria or browse all destinations
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setStateFilter('');
            }}
          >
            View All Destinations
          </Button>
        </Box>
      )}


    </Container>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading destinations...</Typography>
      </Container>
    }>
      <DestinationsContent />
    </Suspense>
  );
}
