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
  InputAdornment,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { 
  Add, 
  Close, 
  Link as LinkIcon, 
  CloudUpload
} from '@mui/icons-material';

interface EnhancedPropertyEditDialogProps {
  open: boolean;
  onClose: () => void;
  property: any | null;
  mode: 'create' | 'edit';
  onPropertySaved?: () => void;
}

// Predefined amenities categories for luxury villas
const AMENITIES_CATEGORIES = {
  'Basic Amenities': [
    'Air Conditioning', 'Heating', 'WiFi', 'Free WiFi', 'High-speed Internet',
    'Kitchen', 'Full Kitchen', 'Microwave', 'Refrigerator', 'Dishwasher',
    'Coffee Maker', 'Kettle', 'Toaster', 'Blender', 'Cooking Utensils',
    'Dining Area', 'Living Room', 'Balcony', 'Terrace', 'Garden'
  ],
  'Luxury Features': [
    'Swimming Pool', 'Private Pool', 'Infinity Pool', 'Heated Pool', 'Pool Towels', 'Pool Accessories',
    'Hot Tub', 'Jacuzzi', 'Sauna', 'Steam Room', 'Massage Chair',
    'Fireplace', 'Home Theater', 'Gaming Console', 'Smart TV', 'Netflix',
    'Premium Bedding', 'Memory Foam Mattress', 'Blackout Curtains', 'Soundproofing'
  ],
  'Outdoor & Recreation': [
    'BBQ Grill', 'Outdoor Dining', 'Garden Furniture', 'Hammock', 'Swing',
    'Tennis Court', 'Basketball Court', 'Golf Course Access', 'Hiking Trails',
    'Beach Access', 'Beach Equipment', 'Kayaks', 'Paddle Boards', 'Bicycles',
    'Mountain View', 'Ocean View', 'City View', 'Sunset View'
  ],
  'Services & Convenience': [
    'Housekeeping', 'Daily Cleaning', 'Linen Service', 'Concierge Service',
    'Airport Transfer', 'Car Rental', 'Tour Guide', 'Chef Service', 'Private Chef',
    'Room Service', 'Laundry Service', 'Dry Cleaning', 'Grocery Delivery',
    '24/7 Support', 'Security System', 'Gated Community', 'Valet Parking'
  ],
  'Accessibility': [
    'Wheelchair Accessible', 'Elevator', 'Ground Floor', 'Ramp Access',
    'Wide Doorways', 'Grab Bars', 'Shower Seat', 'Accessible Parking'
  ],
  'Family & Kids': [
    'Baby Crib', 'High Chair', 'Baby Gate', 'Kids Pool', 'Playground',
    'Board Games', 'Puzzles', 'Books', 'Kids TV Channels', 'Safety Features'
  ],
  'Business & Work': [
    'Work Desk', 'Office Chair', 'High-speed WiFi', 'Printer', 'Scanner',
    'Meeting Room', 'Conference Facilities', 'Quiet Workspace'
  ]
};

export default function EnhancedPropertyEditDialog({ open, onClose, property, mode, onPropertySaved }: EnhancedPropertyEditDialogProps) {
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
    hostImage: '',
    propertySize: '',
    yearBuilt: '',
    floorLevel: '',
    totalFloors: 1,
    parkingSpaces: 0,
    petFriendly: false,
    smokingAllowed: false,
    wheelchairAccessible: false,
    neighborhood: '',
    distanceFromAirport: '',
    distanceFromCityCenter: '',
    distanceFromBeach: '',
    publicTransport: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    earlyCheckIn: false,
    lateCheckOut: false,
    cancellationPolicy: 'Flexible',
    cleaningFee: 0,
    serviceFee: 0,
    securityDeposit: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (property && mode === 'edit') {
      setFormData({
        name: property.name || '',
        location: property.location || '',
        description: property.description || '',
        image: property.image || '',
        price: property.price || 0,
        rating: property.rating || 0,
        reviews: property.reviews || 0,
        type: property.type || 'Villa',
        amenities: property.amenities || [],
        featured: property.featured || false,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        maxGuests: property.maxGuests || 2,
        hostName: property.hostName || '',
        hostImage: property.hostImage || '',
        propertySize: property.propertySize || '',
        yearBuilt: property.yearBuilt || '',
        floorLevel: property.floorLevel || '',
        totalFloors: property.totalFloors || 1,
        parkingSpaces: property.parkingSpaces || 0,
        petFriendly: property.petFriendly || false,
        smokingAllowed: property.smokingAllowed || false,
        wheelchairAccessible: property.wheelchairAccessible || false,
        neighborhood: property.neighborhood || '',
        distanceFromAirport: property.distanceFromAirport || '',
        distanceFromCityCenter: property.distanceFromCityCenter || '',
        distanceFromBeach: property.distanceFromBeach || '',
        publicTransport: property.publicTransport || '',
        checkInTime: property.checkInTime || '15:00',
        checkOutTime: property.checkOutTime || '11:00',
        earlyCheckIn: property.earlyCheckIn || false,
        lateCheckOut: property.lateCheckOut || false,
        cancellationPolicy: property.cancellationPolicy || 'Flexible',
        cleaningFee: property.cleaningFee || 0,
        serviceFee: property.serviceFee || 0,
        securityDeposit: property.securityDeposit || 0,
        weeklyDiscount: property.weeklyDiscount || 0,
        monthlyDiscount: property.monthlyDiscount || 0
      });
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
        hostImage: '',
        propertySize: '',
        yearBuilt: '',
        floorLevel: '',
        totalFloors: 1,
        parkingSpaces: 0,
        petFriendly: false,
        smokingAllowed: false,
        wheelchairAccessible: false,
        neighborhood: '',
        distanceFromAirport: '',
        distanceFromCityCenter: '',
        distanceFromBeach: '',
        publicTransport: '',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        earlyCheckIn: false,
        lateCheckOut: false,
        cancellationPolicy: 'Flexible',
        cleaningFee: 0,
        serviceFee: 0,
        securityDeposit: 0,
        weeklyDiscount: 0,
        monthlyDiscount: 0
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

  const handleToggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    if (currentAmenities.includes(amenity)) {
      handleRemoveAmenity(amenity);
    } else {
      setFormData((prev: any) => ({
        ...prev,
        amenities: [...currentAmenities, amenity]
      }));
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    handleChange('image', url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        handleChange('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePropertyToLocalStorage = (propertyData: any) => {
    try {
      const existingProperties = JSON.parse(localStorage.getItem('luxe_properties') || '[]');
      const newProperty = {
        ...propertyData,
        id: propertyData.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        createdAt: propertyData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (mode === 'edit' && property) {
        // Update existing property
        const index = existingProperties.findIndex((p: any) => p.id === property.id);
        if (index !== -1) {
          existingProperties[index] = newProperty;
        } else {
          existingProperties.unshift(newProperty);
        }
      } else {
        // Add new property
        existingProperties.unshift(newProperty);
      }

      localStorage.setItem('luxe_properties', JSON.stringify(existingProperties));
      console.log('Property saved to localStorage:', newProperty);
      return newProperty;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  };

  const savePropertyToSupabase = async (propertyData: any) => {
    try {
      // Convert property data to Supabase format
      const supabaseData = {
        name: propertyData.name,
        location: propertyData.location,
        description: propertyData.description,
        price: parseFloat(propertyData.price) || 0,
        rating: parseFloat(propertyData.rating) || 0,
        reviews: parseInt(propertyData.reviews) || 0,
        max_guests: parseInt(propertyData.maxGuests) || 2,
        amenities: propertyData.amenities || [],
        image: propertyData.image || '',
        featured: propertyData.featured || false,
        type: propertyData.type || 'Villa',
        bedrooms: parseInt(propertyData.bedrooms) || 1,
        bathrooms: parseInt(propertyData.bathrooms) || 1,
        host_name: propertyData.hostName || '',
        host_image: propertyData.hostImage || '',
        property_size: propertyData.propertySize || '',
        year_built: propertyData.yearBuilt || '',
        floor_level: propertyData.floorLevel || '',
        total_floors: parseInt(propertyData.totalFloors) || 1,
        parking_spaces: parseInt(propertyData.parkingSpaces) || 0,
        pet_friendly: propertyData.petFriendly || false,
        smoking_allowed: propertyData.smokingAllowed || false,
        wheelchair_accessible: propertyData.wheelchairAccessible || false,
        neighborhood: propertyData.neighborhood || '',
        distance_from_airport: propertyData.distanceFromAirport || '',
        distance_from_city_center: propertyData.distanceFromCityCenter || '',
        distance_from_beach: propertyData.distanceFromBeach || '',
        public_transport: propertyData.publicTransport || '',
        check_in_time: propertyData.checkInTime || '15:00',
        check_out_time: propertyData.checkOutTime || '11:00',
        early_check_in: propertyData.earlyCheckIn || false,
        late_check_out: propertyData.lateCheckOut || false,
        cancellation_policy: propertyData.cancellationPolicy || 'Flexible',
        cleaning_fee: parseFloat(propertyData.cleaningFee) || 0,
        service_fee: parseFloat(propertyData.serviceFee) || 0,
        security_deposit: parseFloat(propertyData.securityDeposit) || 0,
        weekly_discount: parseFloat(propertyData.weeklyDiscount) || 0,
        monthly_discount: parseFloat(propertyData.monthlyDiscount) || 0
      };

      const response = await fetch('/api/villas', {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...supabaseData,
          id: mode === 'edit' ? property?.id : undefined
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save property');
      }

      console.log('Property saved to Supabase:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Saving property with data:', formData);
      
      // Try to save to Supabase first, fallback to localStorage
      let savedProperty;
      try {
        savedProperty = await savePropertyToSupabase(formData);
      } catch (supabaseError) {
        console.warn('Supabase save failed, falling back to localStorage:', supabaseError);
        savedProperty = savePropertyToLocalStorage(formData);
      }

      console.log('Property saved successfully:', savedProperty);
      
      if (onPropertySaved) {
        onPropertySaved();
      }
      onClose();
      
    } catch (error) {
      console.error('Error saving property:', error);
      setError('Failed to save property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 600
      }}>
        {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ p: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', pb: 1 }}>
                🏠 Basic Information
              </Typography>
            </Grid>
            
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
                placeholder="Describe your villa's unique features, atmosphere, and what makes it special..."
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
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
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
                  <MenuItem value="Luxury Villa">Luxury Villa</MenuItem>
                  <MenuItem value="Beach Villa">Beach Villa</MenuItem>
                  <MenuItem value="Mountain Villa">Mountain Villa</MenuItem>
                  <MenuItem value="City Villa">City Villa</MenuItem>
                  <MenuItem value="Resort Villa">Resort Villa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Property Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', pb: 1, mt: 2 }}>
                📐 Property Specifications
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => handleChange('maxGuests', Number(e.target.value))}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Property Size (sq ft)"
                type="number"
                value={formData.propertySize}
                onChange={(e) => handleChange('propertySize', e.target.value)}
                placeholder="e.g., 2500"
              />
            </Grid>

            {/* Image Management Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', pb: 1, mt: 2 }}>
                🖼️ Property Images
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

            {/* Predefined Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', pb: 1, mt: 2 }}>
                🎯 Predefined Amenities
              </Typography>
            </Grid>
            
            {Object.entries(AMENITIES_CATEGORIES).map(([category, amenities]) => (
              <Grid item xs={12} md={6} key={category}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'var(--primary-dark)' }}>
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {amenities.map((amenity) => (
                    <FormControlLabel
                      key={amenity}
                      control={
                        <Checkbox
                          checked={formData.amenities?.includes(amenity) || false}
                          onChange={() => handleToggleAmenity(amenity)}
                          size="small"
                        />
                      }
                      label={amenity}
                      sx={{ fontSize: '0.875rem' }}
                    />
                  ))}
                </Box>
              </Grid>
            ))}

            {/* Custom Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', pb: 1, mt: 2 }}>
                ✨ Custom Amenities
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Custom Amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                  placeholder="e.g., Private Chef, Helicopter Pad, Wine Cellar..."
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAmenity}
                  disabled={!newAmenity.trim()}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              
              {/* Display Selected Amenities */}
              {formData.amenities && formData.amenities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Selected Amenities ({formData.amenities.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.amenities.map((amenity: string, index: number) => (
                      <Chip
                        key={index}
                        label={amenity}
                        onDelete={() => handleRemoveAmenity(amenity)}
                        deleteIcon={<Close />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Property Status */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', pb: 1, mt: 2 }}>
                ⭐ Property Status
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Featured Property</InputLabel>
                <Select
                  value={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.value === 'true')}
                  label="Featured Property"
                >
                  <MenuItem value="true">Yes - Feature this property</MenuItem>
                  <MenuItem value="false">No - Regular listing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name || !formData.location || !formData.price}
          sx={{
            bgcolor: 'var(--primary-dark)',
            '&:hover': { bgcolor: 'var(--primary-light)' }
          }}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : (mode === 'edit' ? 'Update Property' : 'Create Property')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}