'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  propertyManager,
  destinationManager,
  dealBannerManager,
  heroBackgroundManager
} from '@/lib/dataManager';

export default function TestRealtimePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [dealBanners, setDealBanners] = useState<any[]>([]);
  const [heroBackgrounds, setHeroBackgrounds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Initialize all managers
        await Promise.all([
          propertyManager.initialize(),
          destinationManager.initialize(),
          dealBannerManager.initialize(),
          heroBackgroundManager.initialize()
        ]);

        // Load data
        setProperties(await propertyManager.getAll());
        setDestinations(await destinationManager.getAll());
        setDealBanners(await dealBannerManager.getAll());
        setHeroBackgrounds(await heroBackgroundManager.getAll());
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();

    // Subscribe to all managers for real-time updates
    const unsubscribeProperty = propertyManager.subscribe(async () => {
      setProperties(await propertyManager.getAll());
      setLastUpdate(new Date());
    });

    const unsubscribeDestination = destinationManager.subscribe(async () => {
      setDestinations(await destinationManager.getAll());
      setLastUpdate(new Date());
    });

    const unsubscribeDealBanner = dealBannerManager.subscribe(async () => {
      setDealBanners(await dealBannerManager.getAll());
      setLastUpdate(new Date());
    });

    const unsubscribeHeroBackground = heroBackgroundManager.subscribe(async () => {
      setHeroBackgrounds(await heroBackgroundManager.getAll());
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribeProperty();
      unsubscribeDestination();
      unsubscribeDealBanner();
      unsubscribeHeroBackground();
    };
  }, []);

  const addTestProperty = async () => {
    try {
      await propertyManager.create({
        id: Date.now().toString(),
        name: `Test Property ${Date.now()}`,
        location: 'Test Location',
        description: 'This is a test property for real-time updates',
        price: 5000,
        max_guests: 4,
        amenities: ['WiFi', 'Pool'],
        images: ['https://via.placeholder.com/400x300'],
        featured: false,
        type: 'villa',
        available: true,
        bedrooms: 2,
        bathrooms: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding test property:', error);
    }
  };

  const addTestHeroBackground = async () => {
    try {
      await heroBackgroundManager.create({
        title: `Test Hero ${Date.now()}`,
        subtitle: 'This is a test hero background',
        image: 'https://via.placeholder.com/1200x800',
        alt_text: 'Test hero background',
        active: true,
        priority: 1,
        link: '',
        link_text: '',
        start_date: '',
        end_date: ''
      });
    } catch (error) {
      console.error('Error adding test hero background:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Real-time Data Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page demonstrates real-time updates. Open the admin panel in another tab and make changes - they will appear here immediately!
      </Alert>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
        <Button variant="outlined" size="small" onClick={addTestProperty}>
          Add Test Property
        </Button>
        <Button variant="outlined" size="small" onClick={addTestHeroBackground}>
          Add Test Hero
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Properties */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Properties ({properties.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {properties.slice(0, 5).map((property) => (
                <Box key={property.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {property.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {property.location} • ₹{property.price}/night
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={property.featured ? 'Featured' : 'Regular'} 
                      size="small" 
                      color={property.featured ? 'primary' : 'default'}
                    />
                  </Box>
                </Box>
              ))}
              {properties.length > 5 && (
                <Typography variant="body2" color="textSecondary">
                  +{properties.length - 5} more properties
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Destinations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Destinations ({destinations.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {destinations.slice(0, 5).map((destination) => (
                <Box key={destination.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {destination.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {destination.description}
                  </Typography>
                </Box>
              ))}
              {destinations.length > 5 && (
                <Typography variant="body2" color="textSecondary">
                  +{destinations.length - 5} more destinations
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Deal Banners */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Deal Banners ({dealBanners.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {dealBanners.slice(0, 3).map((banner) => (
                <Box key={banner.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {banner.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {banner.subtitle}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={banner.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={banner.isActive ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              ))}
              {dealBanners.length > 3 && (
                <Typography variant="body2" color="textSecondary">
                  +{dealBanners.length - 3} more banners
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Hero Backgrounds */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hero Backgrounds ({heroBackgrounds.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {heroBackgrounds.slice(0, 3).map((background) => (
                <Box key={background.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {background.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {background.subtitle}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip 
                      label={background.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={background.active ? 'success' : 'default'}
                    />
                    <Chip 
                      label={`Priority ${background.priority}`} 
                      size="small" 
                      color={background.priority === 1 ? 'primary' : 'default'}
                    />
                  </Box>
                </Box>
              ))}
              {heroBackgrounds.length > 3 && (
                <Typography variant="body2" color="textSecondary">
                  +{heroBackgrounds.length - 3} more backgrounds
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          💡 Tip: Open the admin panel in another tab and make changes to see real-time updates here!
        </Typography>
      </Box>
    </Container>
  );
}
