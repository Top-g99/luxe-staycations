'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert,
  InputAdornment
} from '@mui/material';
import { Add, Close, Link as LinkIcon, CloudUpload } from '@mui/icons-material';

interface PropertyEditDialogProps {
  open: boolean;
  onClose: () => void;
  property: any | null;
  mode: 'create' | 'edit';
  onPropertySaved?: () => void;
}

export default function PropertyEditDialog({ open, onClose, property, mode, onPropertySaved }: PropertyEditDialogProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    location: '',
    description: '',
    image: '',
    price: 0,
    rating: 0,
    reviews: 0,
    type: 'Villa',
    amenities: [],
    featured: false,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    hostName: '',
    hostImage: ''
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (property && mode === 'edit') {
      setFormData(property);
      setImageUrl(property.image || '');
      setPreviewUrl(property.image || '');
    } else {
      setFormData({
        name: '',
        location: '',
        description: '',
        image: '',
        price: 0,
        rating: 0,
        reviews: 0,
        type: 'Villa',
        amenities: [],
        featured: false,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        hostName: '',
        hostImage: ''
      });
      setImageUrl('');
      setPreviewUrl('');
    }
    setError('');
    setSelectedFile(null);
  }, [property, mode, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      setFormData((prev: any) => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: prev.amenities?.filter((a: string) => a !== amenity) || []
    }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPreviewUrl(base64);
        setFormData((prev: any) => ({ ...prev, image: base64 }));
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setError('Error processing image file');
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    setFormData((prev: any) => ({ ...prev, image: url }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      
      if (mode === 'edit' && property) {
        // Update existing property
        response = await fetch(`/api/villas/${property.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new property
        response = await fetch('/api/villas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Property saved successfully:', result);
        onPropertySaved?.();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setError('Failed to save property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Name *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location *"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price per Night *"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  label="Property Type"
                >
                  <MenuItem value="Villa">Villa</MenuItem>
                  <MenuItem value="Hotel">Hotel</MenuItem>
                  <MenuItem value="Apartment">Apartment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => handleChange('maxGuests', Number(e.target.value))}
              />
            </Grid>
            
            {/* Image Management Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Property Image
              </Typography>
              
              {/* Image URL Input */}
              <TextField
                fullWidth
                label="Image URL"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              {/* File Upload */}
              <input
                accept="image/*"
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="property-image-upload"
              />
              <label htmlFor="property-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Upload Image File
                </Button>
              </label>
              
              {/* Image Preview */}
              {previewUrl && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAmenity}
                  disabled={!newAmenity.trim()}
                >
                  <Add />
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.amenities?.map((amenity: string, index: number) => (
                  <Chip
                    key={index}
                    label={amenity}
                    onDelete={() => handleRemoveAmenity(amenity)}
                    deleteIcon={<Close />}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Featured</InputLabel>
                <Select
                  value={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.value)}
                  label="Featured"
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name || !formData.location || !formData.price}
        >
          {loading ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
