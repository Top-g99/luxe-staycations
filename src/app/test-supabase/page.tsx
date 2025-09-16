"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { supabasePropertyManager } from '@/lib/supabasePropertyManager';
import { isSupabaseAvailable, getSupabaseClient } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (!isSupabaseAvailable()) {
        setConnectionStatus('not-configured');
        setMessage('Supabase is not configured. Please check your .env.local file.');
        return;
      }

      const supabase = getSupabaseClient();
      
      // Test basic connection
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data, error } = await supabase
        .from('properties')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus('error');
        setMessage(`Connection error: ${error.message}`);
      } else {
        setConnectionStatus('connected');
        setMessage('✅ Supabase connection successful!');
        
        // Load properties
        await loadProperties();
      }
    } catch (error) {
      setConnectionStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      await supabasePropertyManager.initialize();
      const props = supabasePropertyManager.getProperties();
      setProperties(props);
      setMessage(`✅ Loaded ${props.length} properties from Supabase`);
    } catch (error) {
      setMessage(`Error loading properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addTestProperty = async () => {
    setLoading(true);
    try {
      const newProperty = await supabasePropertyManager.addProperty({
        name: `Test Property ${Date.now()}`,
        location: 'Test Location',
        description: 'This is a test property added via Supabase',
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
        price: 10000,
        type: 'Test Villa',
        amenities: ['WiFi', 'Kitchen', 'Parking'],
        featured: false,
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        available: true
      });

      setProperties(prev => [...prev, newProperty]);
      setMessage(`✅ Added test property: ${newProperty.name}`);
    } catch (error) {
      setMessage(`Error adding property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearProperties = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { error } = await supabase
        .from('properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        setMessage(`Error clearing properties: ${error.message}`);
      } else {
        setProperties([]);
        setMessage('✅ Cleared all properties from Supabase');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'error': return 'error';
      case 'not-configured': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ color: '#704F49' }}>
        Supabase Connection Test
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Connection Status
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: connectionStatus === 'connected' ? '#4caf50' : 
                                   connectionStatus === 'error' ? '#f44336' : '#ff9800'
                  }}
                />
              )}
              <Typography variant="body1">
                {connectionStatus === 'checking' && 'Checking connection...'}
                {connectionStatus === 'connected' && 'Connected to Supabase'}
                {connectionStatus === 'error' && 'Connection failed'}
                {connectionStatus === 'not-configured' && 'Not configured'}
              </Typography>
            </Box>

            {message && (
              <Alert severity={getStatusColor()} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={testConnection}
                disabled={loading}
                sx={{ bgcolor: '#704F49', '&:hover': { bgcolor: '#5A3F3A' } }}
              >
                Test Connection
              </Button>
              
              <Button
                variant="outlined"
                onClick={addTestProperty}
                disabled={loading || connectionStatus !== 'connected'}
                sx={{ borderColor: '#704F49', color: '#704F49', '&:hover': { borderColor: '#5A3F3A' } }}
              >
                Add Test Property
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={clearProperties}
                disabled={loading || connectionStatus !== 'connected'}
              >
                Clear All Properties
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Properties in Database ({properties.length})
        </Typography>
        
        <Grid container spacing={2}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {property.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {property.location}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{property.price?.toLocaleString()}/night
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={property.type} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {property.featured && (
                      <Chip 
                        label="Featured" 
                        size="small" 
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {properties.length === 0 && (
          <Alert severity="info">
            No properties found in the database. Try adding a test property or check your connection.
          </Alert>
        )}
      </Box>
    </Container>
  );
}
