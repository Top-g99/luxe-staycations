'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Preview
} from '@mui/icons-material';

interface Property {
  id: string;
  name: string;
  location: string;
  description?: string;
  image?: string;
  price: number;
  rating?: number;
  reviews?: number;
  type?: string;
  amenities?: string[];
  featured?: boolean;
  maxGuests?: number;
  // Enhanced fields
  images?: string[];
  virtualTour?: string;
  floorPlan?: string;
  specifications?: {
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    propertyType?: string;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string[];
  };
  neighborhood?: {
    attractions?: string[];
    restaurants?: string[];
    distanceToAirport?: number;
    distanceToBeach?: number;
    nearbyActivities?: string[];
  };
  pricing?: {
    basePrice?: number;
    weekendPrice?: number;
    seasonalRates?: Record<string, number>;
    offers?: {
      earlyBird?: number;
      longStay?: number;
      groupDiscount?: number;
    };
  };
  highlights?: string[];
  policies?: {
    cancellation?: string;
    checkIn?: string;
    checkOut?: string;
    smoking?: boolean;
    pets?: boolean;
    parties?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface GenerationResult {
  propertyId: string;
  propertyName: string;
  success: boolean;
  generatedContent?: any;
  error?: string;
}

export default function BulkAIContentGenerator() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([
    'description', 'highlights', 'neighborhood', 'policies'
  ]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const contentTypes = [
    { value: 'description', label: 'Property Description', description: 'SEO-optimized property descriptions' },
    { value: 'highlights', label: 'Property Highlights', description: 'Key selling points and features' },
    { value: 'neighborhood', label: 'Neighborhood Info', description: 'Local attractions and activities' },
    { value: 'policies', label: 'Policies & Rules', description: 'Cancellation and house policies' }
  ];

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

  const handlePropertySelection = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    if (checked) {
      setSelectedContentTypes(prev => [...prev, contentType]);
    } else {
      setSelectedContentTypes(prev => prev.filter(type => type !== contentType));
    }
  };

  const generateBulkContent = async () => {
    if (selectedProperties.length === 0) {
      setMessage({ type: 'warning', text: 'Please select at least one property' });
      return;
    }

    if (selectedContentTypes.length === 0) {
      setMessage({ type: 'warning', text: 'Please select at least one content type' });
      return;
    }

    try {
      setGenerating(true);
      setResults([]);
      setMessage(null);

      const response = await fetch('/api/ai/bulk-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyIds: selectedProperties,
          contentTypes: selectedContentTypes
        })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        if (data.errors.length > 0) {
          setMessage({ 
            type: 'warning', 
            text: `Generated content for ${data.results.length} properties. ${data.errors.length} properties had errors.` 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: `Successfully generated content for ${data.results.length} properties!` 
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate content' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error generating content' });
    } finally {
      setGenerating(false);
    }
  };

  const previewGeneratedContent = (result: GenerationResult) => {
    setPreviewContent({
      propertyName: result.propertyName,
      content: result.generatedContent
    });
    setPreviewDialogOpen(true);
  };

  const getStatusIcon = (result: GenerationResult) => {
    if (result.success) {
      return <CheckCircle sx={{ color: 'success.main' }} />;
    } else {
      return <Error sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusColor = (result: GenerationResult) => {
    return result.success ? 'success' : 'error';
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
        Bulk AI Content Generator
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
        {/* Content Type Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Content Types
              </Typography>
              <FormGroup>
                {contentTypes.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    control={
                      <Checkbox
                        checked={selectedContentTypes.includes(type.value)}
                        onChange={(e) => handleContentTypeChange(type.value, e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {type.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Property Selection */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Select Properties ({selectedProperties.length}/{properties.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                >
                  {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>

              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <List dense>
                  {properties.map((property) => (
                    <ListItem key={property.id} sx={{ px: 0 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedProperties.includes(property.id)}
                            onChange={(e) => handlePropertySelection(property.id, e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {property.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {property.location} • {property.type || 'Villa'} • ₹{property.price.toLocaleString()}/night
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              {property.images && property.images.length > 0 && (
                                <Chip label={`${property.images.length} images`} size="small" color="primary" variant="outlined" />
                              )}
                              {property.specifications && (
                                <Chip label="Specs" size="small" color="secondary" variant="outlined" />
                              )}
                              {property.neighborhood && (
                                <Chip label="Location" size="small" color="info" variant="outlined" />
                              )}
                              {property.highlights && property.highlights.length > 0 && (
                                <Chip label="Highlights" size="small" color="success" variant="outlined" />
                              )}
                              {property.policies && (
                                <Chip label="Policies" size="small" color="warning" variant="outlined" />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Generate Button */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={generateBulkContent}
                  disabled={generating || selectedProperties.length === 0 || selectedContentTypes.length === 0}
                  startIcon={generating ? <CircularProgress size={24} /> : <AutoAwesome />}
                  sx={{
                    background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4a332c, #b45309)',
                    }
                  }}
                >
                  {generating ? 'Generating Content...' : 'Generate AI Content'}
                </Button>
              </Box>
              
              {generating && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Generating content for {selectedProperties.length} properties...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        {results.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Generation Results
                </Typography>
                <List>
                  {results.map((result, index) => (
                    <React.Fragment key={result.propertyId}>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(result)}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.propertyName}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {result.success && Object.keys(result.generatedContent || {}).map((type) => (
                                <Chip
                                  key={type}
                                  label={type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                              {!result.success && (
                                <Typography variant="caption" color="error">
                                  {result.error}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        {result.success && (
                          <Button
                            size="small"
                            startIcon={<Preview />}
                            onClick={() => previewGeneratedContent(result)}
                          >
                            Preview
                          </Button>
                        )}
                      </ListItem>
                      {index < results.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Generated Content Preview: {previewContent?.propertyName}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {previewContent && (
            <Box>
              {previewContent.content.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {previewContent.content.description}
                  </Typography>
                </Box>
              )}
              
              {previewContent.content.highlights && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Highlights
                  </Typography>
                  <List dense>
                    {previewContent.content.highlights.map((highlight: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={highlight} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {previewContent.content.neighborhood && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Neighborhood Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Attractions
                      </Typography>
                      {previewContent.content.neighborhood.attractions?.map((attraction: string, index: number) => (
                        <Chip key={index} label={attraction} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Restaurants
                      </Typography>
                      {previewContent.content.neighborhood.restaurants?.map((restaurant: string, index: number) => (
                        <Chip key={index} label={restaurant} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Activities
                      </Typography>
                      {previewContent.content.neighborhood.nearbyActivities?.map((activity: string, index: number) => (
                        <Chip key={index} label={activity} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {previewContent.content.policies && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Policies
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {previewContent.content.policies.cancellation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
