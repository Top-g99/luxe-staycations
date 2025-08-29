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
  TextField
} from '@mui/material';
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/supabase';

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [testData, setTestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    description: '',
    price: 0,
    location: ''
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      if (!isSupabaseAvailable()) {
        setConnectionStatus('error');
        setErrorMessage('Supabase is not configured. Please check your environment variables.');
        return;
      }

      const supabase = getSupabaseClient();
      
      // Test basic connection
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

      if (error) {
        setConnectionStatus('error');
        setErrorMessage(`Connection error: ${error.message}`);
        return;
      }

      setConnectionStatus('connected');
      setTestData(data || []);
      
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addTestProperty = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          name: newProperty.name,
          description: newProperty.description,
          price: newProperty.price,
          location: newProperty.location,
          type: 'villa',
          amenities: ['WiFi', 'Pool'],
          images: [],
          featured: false,
          available: true,
          max_guests: 4,
          bedrooms: 2,
          bathrooms: 2
        }])
        .select();

      if (error) {
        setErrorMessage(`Error adding property: ${error.message}`);
        return;
      }

      setTestData(prev => [...prev, ...(data || [])]);
      setNewProperty({ name: '', description: '', price: 0, location: '' });
      
    } catch (error) {
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(`Error fetching data: ${error.message}`);
        return;
      }

      setTestData(data || []);
      
    } catch (error) {
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Supabase Connection Test
      </Typography>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connection Status
          </Typography>
          
          {connectionStatus === 'checking' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Checking connection...</Typography>
            </Box>
          )}
          
          {connectionStatus === 'connected' && (
            <Alert severity="success">
              ✅ Supabase connection successful!
            </Alert>
          )}
          
          {connectionStatus === 'error' && (
            <Alert severity="error">
              ❌ {errorMessage}
            </Alert>
          )}
          
          <Button 
            onClick={testConnection} 
            variant="outlined" 
            sx={{ mt: 2 }}
          >
            Test Connection
          </Button>
        </CardContent>
      </Card>

      {/* Add Test Data */}
      {connectionStatus === 'connected' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add Test Property
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Name"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newProperty.location}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={newProperty.price}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, price: Number(e.target.value) }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newProperty.description}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
            </Grid>
            
            <Button 
              onClick={addTestProperty}
              variant="contained"
              disabled={loading || !newProperty.name || !newProperty.location}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Add Property'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display Test Data */}
      {connectionStatus === 'connected' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Test Data ({testData.length} properties)
              </Typography>
              <Button onClick={refreshData} variant="outlined" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Refresh'}
              </Button>
            </Box>
            
            {testData.length === 0 ? (
              <Typography color="text.secondary">
                No properties found. Add some test data above.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {testData.map((property, index) => (
                  <Grid item xs={12} sm={6} md={4} key={property.id || index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{property.name}</Typography>
                        <Typography color="text.secondary">{property.location}</Typography>
                        <Typography variant="body2">₹{property.price?.toLocaleString()}</Typography>
                        <Typography variant="caption" display="block">
                          {property.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
    </Container>
  );
}
