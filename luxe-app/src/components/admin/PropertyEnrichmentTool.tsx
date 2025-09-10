'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Preview,
  Refresh,
  CheckCircle,
  Error
} from '@mui/icons-material';

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  // Enriched fields
  images?: string[];
  virtualTour?: string;
  floorPlan?: string;
  specifications?: any;
  neighborhood?: any;
  pricing?: any;
  propertyReviews?: any[];
  highlights?: string[];
  policies?: any;
}

export default function PropertyEnrichmentTool() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/villas');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch properties' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching properties' });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = async (propertyId: string, dataType: string) => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/villas/generate-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, dataType })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Apply the generated data to the property
        await enrichProperty(propertyId, data.data);
        setMessage({ type: 'success', text: `Sample ${dataType} data generated and applied successfully!` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate sample data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error generating sample data' });
    } finally {
      setActionLoading(false);
    }
  };

  const enrichProperty = async (propertyId: string, enrichedData: any) => {
    try {
      // First verify the property exists
      const propertyExists = properties.find(p => p.id === propertyId);
      if (!propertyExists) {
        setMessage({ type: 'error', text: 'Property not found. Cannot enrich.' });
        return false;
      }

      const response = await fetch(`/api/villas/${propertyId}/enrich`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the properties list
        setProperties(prev => prev.map(p => p.id === propertyId ? data.data : p));
        return true;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to enrich property' });
        return false;
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error enriching property' });
      return false;
    }
  };

  const getEnrichmentStatus = (property: Property) => {
    const enrichedFields = [
      property.images,
      property.virtualTour,
      property.floorPlan,
      property.specifications,
      property.neighborhood,
      property.pricing,
      property.propertyReviews,
      property.highlights,
      property.policies
    ];
    
    const enrichedCount = enrichedFields.filter(field => field !== undefined).length;
    return { enrichedCount, totalFields: 9 };
  };

  const handleGenerateSampleData = () => {
    if (selectedProperty) {
      generateSampleData(selectedProperty.id, selectedDataType);
      setEnrichmentDialogOpen(false);
    }
  };

  const handlePreviewProperty = () => {
    if (selectedProperty) {
      window.open(`/villas/${selectedProperty.id}`, '_blank');
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
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Property Enrichment Tool
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
        {properties.map((property) => {
          const { enrichedCount, totalFields } = getEnrichmentStatus(property);
          const enrichmentPercentage = Math.round((enrichedCount / totalFields) * 100);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {property.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {property.location}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ₹{property.price.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      /night
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Enrichment Status: {enrichedCount}/{totalFields} fields
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}>
                      <Box
                        sx={{
                          width: `${enrichmentPercentage}%`,
                          height: '100%',
                          backgroundColor: enrichmentPercentage === 100 ? 'success.main' : 
                                         enrichmentPercentage >= 50 ? 'warning.main' : 'error.main',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {enrichmentPercentage}% enriched
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {property.images && <Chip label="Images" size="small" color="primary" />}
                    {property.specifications && <Chip label="Specs" size="small" color="primary" />}
                    {property.neighborhood && <Chip label="Location" size="small" color="primary" />}
                    {property.pricing && <Chip label="Pricing" size="small" color="primary" />}
                    {property.propertyReviews && <Chip label="Reviews" size="small" color="primary" />}
                    {property.highlights && <Chip label="Highlights" size="small" color="primary" />}
                    {property.policies && <Chip label="Policies" size="small" color="primary" />}
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => {
                          setSelectedProperty(property);
                          setEnrichmentDialogOpen(true);
                        }}
                      >
                        Enrich
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        startIcon={<Preview />}
                        onClick={() => {
                          setSelectedProperty(property);
                          handlePreviewProperty();
                        }}
                        sx={{
                          background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #4a332c, #b45309)',
                          }
                        }}
                      >
                        Preview
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Enrichment Dialog */}
      <Dialog open={enrichmentDialogOpen} onClose={() => setEnrichmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Enrich Property: {selectedProperty?.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={selectedDataType}
              onChange={(e) => setSelectedDataType(e.target.value)}
              label="Data Type"
            >
              <MenuItem value="all">All Enriched Data</MenuItem>
              <MenuItem value="images">Images & Virtual Tour</MenuItem>
              <MenuItem value="specifications">Property Specifications</MenuItem>
              <MenuItem value="neighborhood">Neighborhood Info</MenuItem>
              <MenuItem value="pricing">Pricing & Offers</MenuItem>
              <MenuItem value="reviews">Guest Reviews</MenuItem>
              <MenuItem value="highlights">Property Highlights</MenuItem>
              <MenuItem value="policies">Policies & Rules</MenuItem>
            </Select>
          </FormControl>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            This will generate sample data for the selected property. You can customize the data later through the admin panel.
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setEnrichmentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateSampleData}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Add />}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            {actionLoading ? 'Generating...' : 'Generate Sample Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
