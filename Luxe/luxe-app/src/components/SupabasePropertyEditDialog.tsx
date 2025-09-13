'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
  Typography,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { PhotoCamera, Add, Delete } from '@mui/icons-material';

interface Property {
  id?: string;
  name: string;
  location: string;
  description: string;
  price: number;
  type: string;
  amenities: string[];
  featured: boolean;
  rating: number;
  reviews: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  host_name: string;
  host_image: string;
  square_footage?: number;
  year_built?: number;
  distance_to_beach?: number;
  distance_to_city?: number;
  primary_view?: string;
  property_style?: string;
  highlights?: string[];
  available: boolean;
  images: string[];
  created_at?: string;
  updated_at?: string;
}

interface SupabasePropertyEditDialogProps {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
  mode: 'create' | 'edit';
  onPropertySaved: () => void;
}

export default function SupabasePropertyEditDialog({ 
  open, 
  onClose, 
  property, 
  mode, 
  onPropertySaved 
}: SupabasePropertyEditDialogProps) {
  
  const [formData, setFormData] = useState<Property>({
    name: '',
    location: '',
    description: '',
    price: 0,
    type: 'villa',
    amenities: ['wifi', 'parking'],
    featured: false,
    rating: 0,
    reviews: 0,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    host_name: '',
    host_image: '',
    square_footage: 0,
    year_built: 0,
    distance_to_beach: 0,
    distance_to_city: 0,
    primary_view: '',
    property_style: '',
    highlights: [],
    available: true,
    images: []
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const propertyTypes = [
    'villa',
    'apartment',
    'house',
    'condo',
    'penthouse',
    'studio',
    'loft',
    'townhouse'
  ];

  const commonAmenities = [
    'wifi',
    'parking',
    'pool',
    'gym',
    'spa',
    'kitchen',
    'balcony',
    'garden',
    'terrace',
    'fireplace',
    'air_conditioning',
    'heating',
    'tv',
    'washing_machine',
    'dryer',
    'dishwasher',
    'microwave',
    'refrigerator',
    'coffee_maker',
    'iron',
    'hairdryer',
    'safe',
    'elevator',
    'concierge',
    'security',
    'pet_friendly',
    'smoking_allowed',
    'wheelchair_accessible'
  ];

  const commonHighlights = [
    'beach_access',
    'mountain_view',
    'city_view',
    'ocean_view',
    'garden_view',
    'pool_view',
    'sunset_view',
    'private_beach',
    'rooftop_access',
    'private_pool',
    'jacuzzi',
    'bbq_area',
    'outdoor_dining',
    'workspace',
    'home_theater',
    'wine_cellar',
    'library',
    'game_room'
  ];

  useEffect(() => {
    if (property && mode === 'edit') {
      setFormData({
        ...property,
        // Ensure arrays are properly initialized
        amenities: property.amenities || [],
        highlights: property.highlights || [],
        images: property.images || []
      });
      if (property.images && property.images.length > 0) {
        setImageUrl(property.images[0]);
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        location: '',
        description: '',
        price: 0,
        type: 'villa',
        amenities: ['wifi', 'parking'],
        featured: false,
        rating: 0,
        reviews: 0,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        host_name: '',
        host_image: '',
        square_footage: 0,
        year_built: 0,
        distance_to_beach: 0,
        distance_to_city: 0,
        primary_view: '',
        property_style: '',
        highlights: [],
        available: true,
        images: []
      });
      setImageUrl('');
    }
    setError('');
  }, [property, mode, open]);

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityAdd = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim().toLowerCase()]
      }));
      setNewAmenity('');
    }
  };

  const handleAmenityRemove = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleHighlightAdd = () => {
    if (newHighlight.trim() && !(formData.highlights || []).includes(newHighlight.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        highlights: [...(prev.highlights || []), newHighlight.trim().toLowerCase()]
      }));
      setNewHighlight('');
    }
  };

  const handleHighlightRemove = (highlight: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).filter(h => h !== highlight)
    }));
  };

  const handleImageAdd = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const handleImageRemove = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Property name is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration not found');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Prepare data for Supabase (ensure proper types)
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        rating: Number(formData.rating),
        reviews: Number(formData.reviews),
        max_guests: Number(formData.max_guests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        square_footage: Number(formData.square_footage),
        year_built: Number(formData.year_built),
        distance_to_beach: Number(formData.distance_to_beach),
        distance_to_city: Number(formData.distance_to_city),
        // Ensure arrays are properly formatted
        amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
        highlights: Array.isArray(formData.highlights) ? formData.highlights : [],
        images: Array.isArray(formData.images) ? formData.images : []
      };

      let result;
      if (mode === 'edit' && property?.id) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id)
          .select();
          
        if (error) throw error;
        result = data[0];
      } else {
        // Create new property
        const { data, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select();
          
        if (error) throw error;
        result = data[0];
      }

      console.log('Property saved to Supabase:', result);
      onPropertySaved();
      onClose();
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      setError(error.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Add New Property' : 'Edit Property'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Property Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price per Night *"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                label="Property Type"
              >
                {propertyTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Property Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Property Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Max Guests"
              type="number"
              value={formData.max_guests}
              onChange={(e) => handleInputChange('max_guests', Number(e.target.value))}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Square Footage"
              type="number"
              value={formData.square_footage}
              onChange={(e) => handleInputChange('square_footage', Number(e.target.value))}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year Built"
              type="number"
              value={formData.year_built}
              onChange={(e) => handleInputChange('year_built', Number(e.target.value))}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Distance to Beach (km)"
              type="number"
              value={formData.distance_to_beach}
              onChange={(e) => handleInputChange('distance_to_beach', Math.round(Number(e.target.value)))}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Distance to City (km)"
              type="number"
              value={formData.distance_to_city}
              onChange={(e) => handleInputChange('distance_to_city', Math.round(Number(e.target.value)))}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Primary View"
              value={formData.primary_view}
              onChange={(e) => handleInputChange('primary_view', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Property Style"
              value={formData.property_style}
              onChange={(e) => handleInputChange('property_style', e.target.value)}
            />
          </Grid>
          
          {/* Host Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Host Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Host Name"
              value={formData.host_name}
              onChange={(e) => handleInputChange('host_name', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Host Image URL"
              value={formData.host_image}
              onChange={(e) => handleInputChange('host_image', e.target.value)}
            />
          </Grid>
          
          {/* Amenities */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Amenities
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.amenities.map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  onDelete={() => handleAmenityRemove(amenity)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add amenity"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAmenityAdd()}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAmenityAdd}
                size="small"
              >
                Add
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Common amenities:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonAmenities.map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  onClick={() => {
                    if (!formData.amenities.includes(amenity)) {
                      setFormData(prev => ({
                        ...prev,
                        amenities: [...prev.amenities, amenity]
                      }));
                    }
                  }}
                  variant={formData.amenities.includes(amenity) ? "filled" : "outlined"}
                  color={formData.amenities.includes(amenity) ? "primary" : "default"}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          
          {/* Highlights */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Highlights
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {(formData.highlights || []).map((highlight) => (
                <Chip
                  key={highlight}
                  label={highlight}
                  onDelete={() => handleHighlightRemove(highlight)}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add highlight"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleHighlightAdd()}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleHighlightAdd}
                size="small"
              >
                Add
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Common highlights:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonHighlights.map((highlight) => (
                <Chip
                  key={highlight}
                  label={highlight}
                  onClick={() => {
                    if (!(formData.highlights || []).includes(highlight)) {
                      setFormData(prev => ({
                        ...prev,
                        highlights: [...(prev.highlights || []), highlight]
                      }));
                    }
                  }}
                  variant={(formData.highlights || []).includes(highlight) ? "filled" : "outlined"}
                  color={(formData.highlights || []).includes(highlight) ? "secondary" : "default"}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          
          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Images
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.images.map((image, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #ddd'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleImageRemove(image)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleImageAdd()}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleImageAdd}
                size="small"
              >
                Add
              </Button>
            </Box>
          </Grid>
          
          {/* Options */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Options
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
              }
              label="Featured Property"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.available}
                  onChange={(e) => handleInputChange('available', e.target.checked)}
                />
              }
              label="Available for Booking"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : (mode === 'create' ? 'Create Property' : 'Update Property')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
