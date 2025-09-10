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
import { destinationManager } from '@/lib/dataManager';

export default function TestSupabaseDestinations() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testDestination, setTestDestination] = useState({
    name: 'Test Destination',
    description: 'This is a test destination for Supabase integration',
    image: 'https://via.placeholder.com/400x300',
    location: 'Test Location',
    attractions: ['Beach', 'Mountains'],
    featured: false
  });

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      await destinationManager.initialize();
      const data = destinationManager.getAll();
      setDestinations(data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error loading destinations:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const addTestDestination = async () => {
    try {
      await destinationManager.create(testDestination);
      await loadDestinations();
      alert('Test destination added successfully!');
    } catch (error) {
      console.error('Error adding test destination:', error);
      alert('Error adding test destination');
    }
  };

  const clearAllDestinations = async () => {
    if (window.confirm('Are you sure you want to clear all destinations?')) {
      try {
        await destinationManager.clear();
        await loadDestinations();
        alert('All destinations cleared!');
      } catch (error) {
        console.error('Error clearing destinations:', error);
        alert('Error clearing destinations');
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
        Supabase Destinations Test
      </Typography>

      <Alert severity={getConnectionStatusColor()} sx={{ mb: 3 }}>
        {getConnectionStatusText()}
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Test Destination
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  value={testDestination.name}
                  onChange={(e) => setTestDestination({ ...testDestination, name: e.target.value })}
                />
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  value={testDestination.description}
                  onChange={(e) => setTestDestination({ ...testDestination, description: e.target.value })}
                />
                <TextField
                  label="Location"
                  value={testDestination.location}
                  onChange={(e) => setTestDestination({ ...testDestination, location: e.target.value })}
                />
                <TextField
                  label="Image URL"
                  value={testDestination.image}
                  onChange={(e) => setTestDestination({ ...testDestination, image: e.target.value })}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={testDestination.featured}
                      onChange={(e) => setTestDestination({ ...testDestination, featured: e.target.checked })}
                    />
                  }
                  label="Featured Destination"
                />
                <Button variant="contained" onClick={addTestDestination}>
                  Add Test Destination
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
                <Button variant="outlined" onClick={loadDestinations}>
                  Refresh Destinations
                </Button>
                <Button variant="outlined" color="error" onClick={clearAllDestinations}>
                  Clear All Destinations
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
            Destinations ({destinations.length})
          </Typography>
          <Grid container spacing={2}>
            {destinations.map((destination) => (
              <Grid item xs={12} md={6} lg={4} key={destination.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {destination.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {destination.location}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {destination.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {destination.featured && (
                        <Chip label="Featured" size="small" color="primary" sx={{ mr: 1 }} />
                      )}
                      <Chip label={`${destination.attractions?.length || 0} attractions`} size="small" />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      ID: {destination.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {destinations.length === 0 && (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No destinations found. Add a test destination to see it here!
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
