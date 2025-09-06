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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { propertyManager } from '@/lib/dataManager';

export default function TestSupabaseProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testProperty, setTestProperty] = useState({
    name: 'Test Property',
    location: 'Test Location',
    description: 'This is a test property for Supabase integration',
    price: 5000,
    maxGuests: 4,
    amenities: ['WiFi', 'Pool'],
    image: 'https://via.placeholder.com/400x300',
    rating: 4.5,
    reviews: 10,
    featured: false
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      await propertyManager.initialize();
      const data = propertyManager.getAll();
      setProperties(data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error loading properties:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const addTestProperty = async () => {
    try {
      await propertyManager.create(testProperty);
      await loadProperties();
      alert('Test property added successfully!');
    } catch (error) {
      console.error('Error adding test property:', error);
      alert('Error adding test property');
    }
  };

  const clearAllProperties = async () => {
    if (window.confirm('Are you sure you want to clear all properties?')) {
      try {
        await propertyManager.clear();
        await loadProperties();
        alert('All properties cleared!');
      } catch (error) {
        console.error('Error clearing properties:', error);
        alert('Error clearing properties');
      }
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
        Supabase Properties Test
      </Typography>

      <Alert severity={getConnectionStatusColor()} sx={{ mb: 3 }}>
        {getConnectionStatusText()}
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Test Property
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  value={testProperty.name}
                  onChange={(e) => setTestProperty({ ...testProperty, name: e.target.value })}
                />
                <TextField
                  label="Location"
                  value={testProperty.location}
                  onChange={(e) => setTestProperty({ ...testProperty, location: e.target.value })}
                />
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  value={testProperty.description}
                  onChange={(e) => setTestProperty({ ...testProperty, description: e.target.value })}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={testProperty.price}
                  onChange={(e) => setTestProperty({ ...testProperty, price: Number(e.target.value) })}
                />
                <TextField
                  label="Max Guests"
                  type="number"
                  value={testProperty.maxGuests}
                  onChange={(e) => setTestProperty({ ...testProperty, maxGuests: Number(e.target.value) })}
                />
                <TextField
                  label="Image URL"
                  value={testProperty.image}
                  onChange={(e) => setTestProperty({ ...testProperty, image: e.target.value })}
                />
                <Button variant="contained" onClick={addTestProperty}>
                  Add Test Property
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
                <Button variant="outlined" onClick={loadProperties}>
                  Refresh Properties
                </Button>
                <Button variant="outlined" color="error" onClick={clearAllProperties}>
                  Clear All Properties
                </Button>
                <Button variant="outlined" onClick={() => window.open('/admin/data-monitor', '_blank')}>
                  Open Data Monitor
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Properties ({properties.length})
          </Typography>
          <Grid container spacing={2}>
            {properties.map((property) => (
              <Grid item xs={12} md={6} lg={4} key={property.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {property.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {property.location}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      ₹{property.price}/night
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Max Guests: {property.maxGuests}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {property.featured && (
                        <Chip label="Featured" size="small" color="primary" sx={{ mr: 1 }} />
                      )}
                      <Chip label={`${property.rating}★`} size="small" />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      ID: {property.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {properties.length === 0 && (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No properties found. Add a test property to see it here!
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
