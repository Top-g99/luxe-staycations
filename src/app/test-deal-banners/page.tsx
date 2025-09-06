'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import { dealBannerManager } from '@/lib/dataManager';

export default function TestDealBanners() {
  const [dealBanners, setDealBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testDealBanner, setTestDealBanner] = useState({
    title: 'Ready to Find a Great Villa Deal?',
    subtitle: 'Save up to 25% on your next luxury villa stay',
    buttonText: 'Explore Deals',
    buttonLink: '/villas',
    videoUrl: '',
    fallbackImageUrl: 'https://i.pinimg.com/736x/6d/a3/a3/6da3a3ded69f943f7d4df7b33e2d6086.jpg',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDealBanners();
  }, []);

  const loadDealBanners = async () => {
    setIsLoading(true);
    try {
      await dealBannerManager.initialize();
      const data = dealBannerManager.getAll();
      setDealBanners(data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error loading deal banners:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const addTestDealBanner = async () => {
    try {
      await dealBannerManager.create(testDealBanner);
      await loadDealBanners();
      alert('Test deal banner added successfully!');
    } catch (error) {
      console.error('Error adding test deal banner:', error);
      alert('Error adding test deal banner');
    }
  };

  const clearAllDealBanners = async () => {
    if (window.confirm('Are you sure you want to clear all deal banners?')) {
      try {
        await dealBannerManager.clear();
        await loadDealBanners();
        alert('All deal banners cleared!');
      } catch (error) {
        console.error('Error clearing deal banners:', error);
        alert('Error clearing deal banners');
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await dealBannerManager.update(id, { isActive: !currentActive });
      await loadDealBanners();
    } catch (error) {
      console.error('Error toggling deal banner:', error);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'warning';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to Supabase';
      case 'error': return 'Error connecting to Supabase';
      default: return 'Checking connection...';
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
        Deal Banners Test
      </Typography>

      <Alert severity={getConnectionStatusColor()} sx={{ mb: 3 }}>
        {getConnectionStatusText()}
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Test Deal Banner
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Title"
                  value={testDealBanner.title}
                  onChange={(e) => setTestDealBanner({ ...testDealBanner, title: e.target.value })}
                />
                <TextField
                  label="Subtitle"
                  multiline
                  rows={2}
                  value={testDealBanner.subtitle}
                  onChange={(e) => setTestDealBanner({ ...testDealBanner, subtitle: e.target.value })}
                />
                <TextField
                  label="Button Text"
                  value={testDealBanner.buttonText}
                  onChange={(e) => setTestDealBanner({ ...testDealBanner, buttonText: e.target.value })}
                />
                <TextField
                  label="Button Link"
                  value={testDealBanner.buttonLink}
                  onChange={(e) => setTestDealBanner({ ...testDealBanner, buttonLink: e.target.value })}
                />
                <TextField
                  label="Fallback Image URL"
                  value={testDealBanner.fallbackImageUrl}
                  onChange={(e) => setTestDealBanner({ ...testDealBanner, fallbackImageUrl: e.target.value })}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={testDealBanner.isActive}
                      onChange={(e) => setTestDealBanner({ ...testDealBanner, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
                <Button variant="contained" onClick={addTestDealBanner}>
                  Add Test Deal Banner
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" onClick={loadDealBanners}>
                  Refresh Deal Banners
                </Button>
                <Button variant="outlined" color="error" onClick={clearAllDealBanners}>
                  Clear All Deal Banners
                </Button>
                <Button variant="outlined" onClick={() => window.open('/admin/data-monitor', '_blank')}>
                  Open Data Monitor
                </Button>
                <Button variant="outlined" onClick={() => window.open('/', '_blank')}>
                  View Home Page
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Deal Banners ({dealBanners.length})
          </Typography>
          <Grid container spacing={2}>
            {dealBanners.map((banner) => (
              <Grid item xs={12} md={6} lg={4} key={banner.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {banner.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {banner.subtitle}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={banner.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={banner.isActive ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <Chip label={banner.buttonText} size="small" />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        size="small" 
                        onClick={() => toggleActive(banner.id, banner.isActive)}
                        variant="outlined"
                      >
                        {banner.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      ID: {banner.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {dealBanners.length === 0 && (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No deal banners found. Add a test deal banner to see it here!
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
