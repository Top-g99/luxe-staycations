
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { propertyManager } from '@/lib/dataManager';

export default function TestPropertyCreation() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testProperty, setTestProperty] = useState({
    name: 'Test Villa',
    location: 'Mumbai',
    description: 'A beautiful test villa',
    price: 5000,
    max_guests: 4,
    amenities: ['WiFi', 'Pool'],
    images: ['https://via.placeholder.com/400x300'],
    featured: false,
    type: 'villa',
    available: true,
    bedrooms: 2,
    bathrooms: 2
  });

  const loadProperties = async () => {
    try {
      setLoading(true);
      await propertyManager.initialize();
      const allProperties = await propertyManager.getAll();
      setProperties(allProperties);
      console.log('Loaded properties:', allProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestProperty = async () => {
    try {
      setLoading(true);
      const newProperty = await propertyManager.create({
        ...testProperty,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('Created property:', newProperty);
      await loadProperties(); // Reload to see the new property
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Test Property Creation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Create Test Property
              </Typography>
              <TextField
                fullWidth
                label="Property Name"
                value={testProperty.name}
                onChange={(e) => setTestProperty(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Location"
                value={testProperty.location}
                onChange={(e) => setTestProperty(prev => ({ ...prev, location: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={testProperty.description}
                onChange={(e) => setTestProperty(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={testProperty.price}
                onChange={(e) => setTestProperty(prev => ({ ...prev, price: Number(e.target.value) }))}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={createTestProperty}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating...' : 'Create Test Property'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Properties ({properties.length})
              </Typography>
              <Button
                variant="outlined"
                onClick={loadProperties}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Refresh Properties
              </Button>
              {properties.length === 0 ? (
                <Alert severity="info">No properties found</Alert>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {properties.map((property, index) => (
                    <Card key={property.id || index} sx={{ mb: 1, p: 1 }}>
                      <Typography variant="subtitle2">{property.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.location} - ₹{property.price}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
