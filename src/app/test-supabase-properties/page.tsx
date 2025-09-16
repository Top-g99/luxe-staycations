'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Science
} from '@mui/icons-material';

interface PropertyAnalysis {
  totalProperties: number;
  propertiesWithEnrichedData: number;
  enrichmentBreakdown: {
    images: number;
    specifications: number;
    neighborhood: number;
    pricing: number;
    highlights: number;
    policies: number;
    virtualTour: number;
    floorPlan: number;
  };
  sampleProperty: any;
}

export default function TestSupabasePropertiesPage() {
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalysis();
    fetchProperties();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-supabase-properties');
      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        setMessage({ type: 'info', text: `Found ${data.analysis.totalProperties} properties in database` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch analysis' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching analysis' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/villas');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const testSupabaseSave = async () => {
    if (!selectedProperty) {
      setMessage({ type: 'error', text: 'Please select a property to test' });
      return;
    }

    try {
      setTesting(true);
      const response = await fetch('/api/test-supabase-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty,
          testData: {
            highlights: ['AI Generated Highlight 1', 'AI Generated Highlight 2'],
            neighborhood: {
              attractions: ['AI Generated Attraction 1', 'AI Generated Attraction 2'],
              restaurants: ['AI Generated Restaurant 1'],
              distanceToAirport: 30,
              distanceToBeach: 3,
              nearbyActivities: ['AI Generated Activity 1', 'AI Generated Activity 2']
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Test data successfully saved to Supabase!' });
        fetchAnalysis(); // Refresh analysis
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save test data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error testing Supabase save' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Supabase Properties Test
      </Typography>
      
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Analysis Results */}
        {analysis && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Database Analysis
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={fetchAnalysis}
                  >
                    Refresh
                  </Button>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {analysis.totalProperties}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Properties
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {analysis.propertiesWithEnrichedData}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enriched Properties
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {Math.round((analysis.propertiesWithEnrichedData / analysis.totalProperties) * 100)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enrichment Rate
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(156, 39, 176, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        {Object.values(analysis.enrichmentBreakdown).reduce((a, b) => a + b, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Enrichments
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Enrichment Breakdown
                </Typography>
                
                <Grid container spacing={1}>
                  {Object.entries(analysis.enrichmentBreakdown).map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <Chip
                        label={`${key}: ${value}`}
                        color={value > 0 ? 'primary' : 'default'}
                        variant={value > 0 ? 'filled' : 'outlined'}
                        size="small"
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Test Supabase Save */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Test Supabase Save
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Property</InputLabel>
                <Select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  label="Select Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                fullWidth
                variant="contained"
                onClick={testSupabaseSave}
                disabled={testing || !selectedProperty}
                startIcon={testing ? <CircularProgress size={20} /> : <Science />}
                sx={{
                  background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4a332c, #b45309)',
                  }
                }}
              >
                {testing ? 'Testing...' : 'Test Save to Supabase'}
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This will add test enriched data to the selected property to verify Supabase integration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sample Property Data */}
        {analysis?.sampleProperty && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Sample Property Data Structure
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {analysis.sampleProperty.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Location:</strong> {analysis.sampleProperty.location}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Price:</strong> ₹{analysis.sampleProperty.price?.toLocaleString()}/night
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Enriched Fields Present:
                </Typography>
                
                <List dense>
                  {Object.entries(analysis.sampleProperty).map(([key, value]) => {
                    if (['images', 'specifications', 'neighborhood', 'pricing', 'highlights', 'policies', 'virtualTour', 'floorPlan'].includes(key)) {
                      return (
                        <ListItem key={key} sx={{ py: 0 }}>
                          <ListItemText
                            primary={key}
                            secondary={value ? 'Present' : 'Not present'}
                            secondaryTypographyProps={{
                              color: value ? 'success.main' : 'text.secondary'
                            }}
                          />
                        </ListItem>
                      );
                    }
                    return null;
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}