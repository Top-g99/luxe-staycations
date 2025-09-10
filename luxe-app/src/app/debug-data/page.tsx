'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  propertyManager, 
  destinationManager, 
  dealBannerManager, 
  heroBackgroundManager 
} from '@/lib/dataManager';

export default function DebugDataPage() {
  const [data, setData] = useState({
    properties: [] as any[],
    destinations: [] as any[],
    dealBanners: [] as any[],
    heroBackgrounds: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize all managers
      await Promise.all([
        propertyManager.initialize(),
        destinationManager.initialize(),
        dealBannerManager.initialize(),
        heroBackgroundManager.initialize()
      ]);

      // Get all data
      const properties = propertyManager.getAll();
      const destinations = destinationManager.getAll();
      const dealBanners = dealBannerManager.getAll();
      const heroBackgrounds = heroBackgroundManager.getAll();

      setData({
        properties,
        destinations,
        dealBanners,
        heroBackgrounds
      });

      console.log('Debug Data:', {
        properties,
        destinations,
        dealBanners,
        heroBackgrounds
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Data Debug Page
      </Typography>

      <Button variant="contained" onClick={loadAllData} sx={{ mb: 3 }}>
        Reload All Data
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Properties ({data.properties.length})
              </Typography>
              {data.properties.map((prop: any) => (
                <Box key={prop.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{prop.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{prop.location}</Typography>
                  <Typography variant="caption">ID: {prop.id}</Typography>
                </Box>
              ))}
              {data.properties.length === 0 && (
                <Typography color="textSecondary">No properties found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Destinations ({data.destinations.length})
              </Typography>
              {data.destinations.map((dest: any) => (
                <Box key={dest.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{dest.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{dest.location}</Typography>
                  <Typography variant="caption">ID: {dest.id}</Typography>
                </Box>
              ))}
              {data.destinations.length === 0 && (
                <Typography color="textSecondary">No destinations found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Deal Banners ({data.dealBanners.length})
              </Typography>
              {data.dealBanners.map((banner: any) => (
                <Box key={banner.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{banner.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{banner.subtitle}</Typography>
                  <Typography variant="body2" color="textSecondary">Active: {banner.isActive ? 'Yes' : 'No'}</Typography>
                  <Typography variant="caption">ID: {banner.id}</Typography>
                </Box>
              ))}
              {data.dealBanners.length === 0 && (
                <Typography color="textSecondary">No deal banners found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hero Backgrounds ({data.heroBackgrounds.length})
              </Typography>
              {data.heroBackgrounds.map((hero: any) => (
                <Box key={hero.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{hero.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{hero.subtitle}</Typography>
                  <Typography variant="body2" color="textSecondary">Active: {hero.active ? 'Yes' : 'No'}</Typography>
                  <Typography variant="caption">ID: {hero.id}</Typography>
                </Box>
              ))}
              {data.heroBackgrounds.length === 0 && (
                <Typography color="textSecondary">No hero backgrounds found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
