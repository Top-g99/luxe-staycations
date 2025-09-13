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
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Add, 
  Close, 
  Link as LinkIcon, 
  CloudUpload,
  AutoAwesome,
  Image,
  LocationOn,
  AttachMoney,
  Star,
  Policy,
  Description,
  Refresh,
  Villa,
  ExpandMore,
  Delete
} from '@mui/icons-material';

interface StreamlinedPropertyEditDialogProps {
  open: boolean;
  onClose: () => void;
  property: any | null;
  mode: 'create' | 'edit';
  onPropertySaved?: () => void;
}

// Consolidated amenities - no duplicates
const AMENITIES_CATEGORIES = {
  'Basic Amenities': [
    'Air Conditioning', 'Heating', 'WiFi', 'Kitchen', 'Microwave', 'Refrigerator',
    'Coffee Maker', 'Dining Area', 'Living Room', 'Balcony', 'Terrace', 'Garden'
  ],
  'Luxury Features': [
    'Swimming Pool', 'Private Pool', 'Infinity Pool', 'Hot Tub', 'Jacuzzi', 'Sauna',
    'Fireplace', 'Home Theater', 'Smart TV', 'Premium Bedding', 'Wine Cellar',
    'Gym', 'Fitness Center', 'Yoga Studio'
  ],
  'Outdoor & Recreation': [
    'BBQ Grill', 'Outdoor Dining', 'Garden Furniture', 'Tennis Court', 'Beach Access',
    'Mountain View', 'Ocean View', 'City View', 'Fire Pit', 'Patio'
  ],
  'Services': [
    'Housekeeping', 'Concierge Service', 'Airport Transfer', 'Chef Service',
    '24/7 Support', 'Security System', 'Valet Parking', 'Spa Services'
  ],
  'Accessibility': [
    'Wheelchair Accessible', 'Elevator', 'Ground Floor', 'Ramp Access'
  ],
  'Family & Kids': [
    'Baby Crib', 'High Chair', 'Kids Pool', 'Playground', 'Board Games'
  ],
  'Business': [
    'Work Desk', 'High-speed WiFi', 'Printer', 'Meeting Room', 'Quiet Workspace'
  ]
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StreamlinedPropertyEditDialog({
  open,
  onClose,
  property,
  mode,
  onPropertySaved
}: StreamlinedPropertyEditDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    location: '',
    description: '',
    image: '',
    type: 'Villa',
    featured: false,
    
    // Pricing (consolidated)
    basePrice: 0,
    weekendPrice: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    cleaningFee: 0,
    serviceFee: 0,
    securityDeposit: 0,
    
    // Property Details (consolidated)
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    propertySize: '',
    yearBuilt: '',
    floorLevel: '',
    totalFloors: 1,
    parkingSpaces: 0,
    
    // Host Information
    hostName: '',
    hostImage: '',
    
    // Timing (consolidated)
    checkInTime: '15:00',
    checkOutTime: '11:00',
    earlyCheckIn: false,
    lateCheckOut: false,
    
    // Policies (consolidated)
    cancellationPolicy: 'Flexible',
    petFriendly: false,
    smokingAllowed: false,
    partiesAllowed: false,
    wheelchairAccessible: false,
    
    // Location Details
    neighborhoodName: '',
    distanceFromAirport: '',
    distanceFromCityCenter: '',
    distanceFromBeach: '',
    publicTransport: '',
    
    // Media & Links
    images: [] as string[],
    virtualTour: '',
    floorPlan: '',
    
    // Amenities & Features
    amenities: [] as string[],
    highlights: [] as string[],
    houseRules: [] as string[],
    
    // Nearby Attractions (AI-generated)
    attractions: [] as string[],
    restaurants: [] as string[],
    activities: [] as string[]
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newHouseRule, setNewHouseRule] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (property && mode === 'edit') {
      setFormData({
        name: property.name || '',
        location: property.location || '',
        description: property.description || '',
        image: property.image || '',
        type: property.type || 'Villa',
        featured: property.featured || false,
        
        // Consolidated pricing
        basePrice: property.price || property.pricing?.basePrice || 0,
        weekendPrice: property.pricing?.weekendPrice || 0,
        weeklyDiscount: property.weeklyDiscount || 0,
        monthlyDiscount: property.monthlyDiscount || 0,
        cleaningFee: property.cleaningFee || 0,
        serviceFee: property.serviceFee || 0,
        securityDeposit: property.securityDeposit || 0,
        
        // Consolidated property details
        maxGuests: property.maxGuests || 2,
        bedrooms: property.specifications?.bedrooms || 1,
        bathrooms: property.specifications?.bathrooms || 1,
        sqft: property.specifications?.sqft || 0,
        propertySize: property.propertySize || '',
        yearBuilt: property.yearBuilt || '',
        floorLevel: property.floorLevel || '',
        totalFloors: property.totalFloors || 1,
        parkingSpaces: property.parkingSpaces || 0,
        
        // Host info
        hostName: property.hostName || '',
        hostImage: property.hostImage || '',
        
        // Consolidated timing
        checkInTime: property.checkInTime || property.specifications?.checkInTime || '15:00',
        checkOutTime: property.checkOutTime || property.specifications?.checkOutTime || '11:00',
        earlyCheckIn: property.earlyCheckIn || false,
        lateCheckOut: property.lateCheckOut || false,
        
        // Consolidated policies
        cancellationPolicy: property.cancellationPolicy || property.policies?.cancellation || 'Flexible',
        petFriendly: property.petFriendly || property.policies?.pets || false,
        smokingAllowed: property.smokingAllowed || property.policies?.smoking || false,
        partiesAllowed: property.policies?.parties || false,
        wheelchairAccessible: property.wheelchairAccessible || false,
        
        // Location
        neighborhoodName: property.neighborhoodName || property.neighborhood?.name || '',
        distanceFromAirport: property.distanceFromAirport || property.neighborhood?.distanceToAirport?.toString() || '',
        distanceFromCityCenter: property.distanceFromCityCenter || '',
        distanceFromBeach: property.distanceFromBeach || property.neighborhood?.distanceToBeach?.toString() || '',
        publicTransport: property.publicTransport || '',
        
        // Media
        images: property.images || [],
        virtualTour: property.virtualTour || '',
        floorPlan: property.floorPlan || '',
        
        // Features
        amenities: property.amenities || [],
        highlights: property.highlights || [],
        houseRules: property.specifications?.houseRules || property.policies?.houseRules || [],
        
        // AI-generated content
        attractions: property.neighborhood?.attractions || [],
        restaurants: property.neighborhood?.restaurants || [],
        activities: property.neighborhood?.nearbyActivities || []
      });
    } else if (mode === 'create') {
      // Reset form for new property
      setFormData({
        name: '',
        location: '',
        description: '',
        image: '',
        type: 'Villa',
        featured: false,
        basePrice: 0,
        weekendPrice: 0,
        weeklyDiscount: 0,
        monthlyDiscount: 0,
        cleaningFee: 0,
        serviceFee: 0,
        securityDeposit: 0,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 0,
        propertySize: '',
        yearBuilt: '',
        floorLevel: '',
        totalFloors: 1,
        parkingSpaces: 0,
        hostName: '',
        hostImage: '',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        earlyCheckIn: false,
        lateCheckOut: false,
        cancellationPolicy: 'Flexible',
        petFriendly: false,
        smokingAllowed: false,
        partiesAllowed: false,
        wheelchairAccessible: false,
        neighborhoodName: '',
        distanceFromAirport: '',
        distanceFromCityCenter: '',
        distanceFromBeach: '',
        publicTransport: '',
        images: [],
        virtualTour: '',
        floorPlan: '',
        amenities: [],
        highlights: [],
        houseRules: [],
        attractions: [],
        restaurants: [],
        activities: []
      });
    }
  }, [property, mode, open]);

  const handleAILocationGeneration = async () => {
    if (!formData.location.trim()) return;

    try {
      setAiLoading(true);
      setError('');

      const [attractionsResponse, restaurantsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/ai/generate-location-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: formData.location, type: 'attractions' })
        }),
        fetch('/api/ai/generate-location-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: formData.location, type: 'restaurants' })
        }),
        fetch('/api/ai/generate-location-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: formData.location, type: 'activities' })
        })
      ]);

      const [attractionsData, restaurantsData, activitiesData] = await Promise.all([
        attractionsResponse.json(),
        restaurantsResponse.json(),
        activitiesResponse.json()
      ]);

      if (attractionsData.success && restaurantsData.success && activitiesData.success) {
        setFormData(prev => ({
          ...prev,
          attractions: attractionsData.data.content,
          restaurants: restaurantsData.data.content,
          activities: activitiesData.data.content
        }));
      } else {
        setError('Failed to generate location content. Please try again.');
      }
    } catch (error) {
      setError('Error generating location content');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert form data to API format
      const propertyData = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        image: formData.image,
        price: formData.basePrice, // Use basePrice as main price
        rating: 0, // Default for new properties
        reviews: 0, // Default for new properties
        type: formData.type,
        amenities: formData.amenities,
        featured: formData.featured,
        maxGuests: formData.maxGuests,
        
        // Host information
        hostName: formData.hostName,
        hostImage: formData.hostImage,
        
        // Property details
        propertySize: formData.propertySize,
        yearBuilt: formData.yearBuilt,
        floorLevel: formData.floorLevel,
        totalFloors: formData.totalFloors,
        parkingSpaces: formData.parkingSpaces,
        
        // Policies
        petFriendly: formData.petFriendly,
        smokingAllowed: formData.smokingAllowed,
        wheelchairAccessible: formData.wheelchairAccessible,
        
        // Location
        neighborhoodName: formData.neighborhoodName,
        distanceFromAirport: formData.distanceFromAirport,
        distanceFromCityCenter: formData.distanceFromCityCenter,
        distanceFromBeach: formData.distanceFromBeach,
        publicTransport: formData.publicTransport,
        
        // Timing
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        earlyCheckIn: formData.earlyCheckIn,
        lateCheckOut: formData.lateCheckOut,
        
        // Pricing
        cancellationPolicy: formData.cancellationPolicy,
        cleaningFee: formData.cleaningFee,
        serviceFee: formData.serviceFee,
        securityDeposit: formData.securityDeposit,
        weeklyDiscount: formData.weeklyDiscount,
        monthlyDiscount: formData.monthlyDiscount,
        
        // Enhanced fields (for backward compatibility)
        images: formData.images,
        virtualTour: formData.virtualTour,
        floorPlan: formData.floorPlan,
        specifications: {
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          sqft: formData.sqft,
          propertyType: formData.type,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          houseRules: formData.houseRules
        },
        neighborhood: {
          attractions: formData.attractions,
          restaurants: formData.restaurants,
          distanceToAirport: parseFloat(formData.distanceFromAirport) || 0,
          distanceToBeach: parseFloat(formData.distanceFromBeach) || 0,
          nearbyActivities: formData.activities
        },
        pricing: {
          basePrice: formData.basePrice,
          weekendPrice: formData.weekendPrice,
          seasonalRates: {},
          offers: {
            earlyBird: 0,
            longStay: 0,
            groupDiscount: 0
          }
        },
        highlights: formData.highlights,
        policies: {
          cancellation: formData.cancellationPolicy,
          checkIn: formData.checkInTime,
          checkOut: formData.checkOutTime,
          smoking: formData.smokingAllowed,
          pets: formData.petFriendly,
          parties: formData.partiesAllowed
        }
      };

      const response = await fetch('/api/villas', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();

      if (data.success) {
        // Trigger global refresh event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dataUpdated', { 
            detail: { type: 'properties', action: mode === 'create' ? 'created' : 'updated' }
          }));
        }
        onPropertySaved?.();
        onClose();
      } else {
        setError(data.error || 'Failed to save property');
      }
    } catch (error) {
      setError('Error saving property');
    } finally {
      setLoading(false);
    }
  };

  const addToList = (listType: string, value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [listType]: [...prev[listType as keyof typeof prev] as string[], value.trim()]
    }));
    
    // Clear input
    switch (listType) {
      case 'amenities': setNewAmenity(''); break;
      case 'highlights': setNewHighlight(''); break;
      case 'houseRules': setNewHouseRule(''); break;
      case 'images': setNewImage(''); break;
    }
  };

  const removeFromList = (listType: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [listType]: (prev[listType as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addAmenityFromCategory = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === 'create' ? 'Add New Property' : 'Edit Property'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Basic Info" icon={<Villa />} />
          <Tab label="Pricing & Policies" icon={<AttachMoney />} />
          <Tab label="Property Details" icon={<Description />} />
          <Tab label="Location & Media" icon={<LocationOn />} />
          <Tab label="Amenities & Features" icon={<Star />} />
        </Tabs>

        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="Villa">Villa</MenuItem>
                  <MenuItem value="Apartment">Apartment</MenuItem>
                  <MenuItem value="Cottage">Cottage</MenuItem>
                  <MenuItem value="Bungalow">Bungalow</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Image URL"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Image /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Host Name"
                value={formData.hostName}
                onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Host Image URL"
                value={formData.hostImage}
                onChange={(e) => setFormData(prev => ({ ...prev, hostImage: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Image /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                }
                label="Featured Property"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Pricing & Policies Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price (₹/night)"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weekend Price (₹/night)"
                type="number"
                value={formData.weekendPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, weekendPrice: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Weekly Discount (%)"
                type="number"
                value={formData.weeklyDiscount}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyDiscount: Number(e.target.value) }))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Monthly Discount (%)"
                type="number"
                value={formData.monthlyDiscount}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyDiscount: Number(e.target.value) }))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cleaning Fee (₹)"
                type="number"
                value={formData.cleaningFee}
                onChange={(e) => setFormData(prev => ({ ...prev, cleaningFee: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Fee (₹)"
                type="number"
                value={formData.serviceFee}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceFee: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Security Deposit (₹)"
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Policies</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cancellation Policy</InputLabel>
                <Select
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                >
                  <MenuItem value="Flexible">Flexible</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Strict">Strict</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-in Time"
                value={formData.checkInTime}
                onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                placeholder="15:00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-out Time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                placeholder="11:00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.earlyCheckIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, earlyCheckIn: e.target.checked }))}
                    />
                  }
                  label="Early Check-in Available"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.lateCheckOut}
                      onChange={(e) => setFormData(prev => ({ ...prev, lateCheckOut: e.target.checked }))}
                    />
                  }
                  label="Late Check-out Available"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.petFriendly}
                      onChange={(e) => setFormData(prev => ({ ...prev, petFriendly: e.target.checked }))}
                    />
                  }
                  label="Pet Friendly"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.smokingAllowed}
                      onChange={(e) => setFormData(prev => ({ ...prev, smokingAllowed: e.target.checked }))}
                    />
                  }
                  label="Smoking Allowed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.partiesAllowed}
                      onChange={(e) => setFormData(prev => ({ ...prev, partiesAllowed: e.target.checked }))}
                    />
                  }
                  label="Parties Allowed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.wheelchairAccessible}
                      onChange={(e) => setFormData(prev => ({ ...prev, wheelchairAccessible: e.target.checked }))}
                    />
                  }
                  label="Wheelchair Accessible"
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Property Details Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: Number(e.target.value) }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Size (sq ft)"
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData(prev => ({ ...prev, sqft: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Size (description)"
                value={formData.propertySize}
                onChange={(e) => setFormData(prev => ({ ...prev, propertySize: e.target.value }))}
                placeholder="e.g., 2000 sq ft, 3 BHK"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year Built"
                value={formData.yearBuilt}
                onChange={(e) => setFormData(prev => ({ ...prev, yearBuilt: e.target.value }))}
                placeholder="e.g., 2020"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor Level"
                value={formData.floorLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, floorLevel: e.target.value }))}
                placeholder="e.g., Ground Floor, 2nd Floor"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Floors"
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData(prev => ({ ...prev, totalFloors: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parking Spaces"
                type="number"
                value={formData.parkingSpaces}
                onChange={(e) => setFormData(prev => ({ ...prev, parkingSpaces: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Location & Media Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Location Details</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Neighborhood Name"
                value={formData.neighborhoodName}
                onChange={(e) => setFormData(prev => ({ ...prev, neighborhoodName: e.target.value }))}
                placeholder="e.g., Bandra West, Mumbai"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Distance from Airport (km)"
                value={formData.distanceFromAirport}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceFromAirport: e.target.value }))}
                placeholder="e.g., 15"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Distance from City Center (km)"
                value={formData.distanceFromCityCenter}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceFromCityCenter: e.target.value }))}
                placeholder="e.g., 5"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Distance from Beach (km)"
                value={formData.distanceFromBeach}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceFromBeach: e.target.value }))}
                placeholder="e.g., 2"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Public Transport Access"
                value={formData.publicTransport}
                onChange={(e) => setFormData(prev => ({ ...prev, publicTransport: e.target.value }))}
                placeholder="e.g., 5 min walk to metro station"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">AI Location Assistant</Typography>
                <Button
                  variant="outlined"
                  startIcon={aiLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
                  onClick={handleAILocationGeneration}
                  disabled={aiLoading || !formData.location.trim()}
                >
                  Auto-Fill Nearby Places
                </Button>
              </Box>
            </Grid>

            {/* AI Generated Content */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Nearby Attractions</Typography>
                  {formData.attractions.map((attraction, index) => (
                    <Chip key={index} label={attraction} size="small" sx={{ m: 0.5 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Restaurants</Typography>
                  {formData.restaurants.map((restaurant, index) => (
                    <Chip key={index} label={restaurant} size="small" sx={{ m: 0.5 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Activities</Typography>
                  {formData.activities.map((activity, index) => (
                    <Chip key={index} label={activity} size="small" sx={{ m: 0.5 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Media & Links</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Virtual Tour URL"
                value={formData.virtualTour}
                onChange={(e) => setFormData(prev => ({ ...prev, virtualTour: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment>
                }}
                placeholder="https://..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Floor Plan URL"
                value={formData.floorPlan}
                onChange={(e) => setFormData(prev => ({ ...prev, floorPlan: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment>
                }}
                placeholder="https://..."
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Amenities & Features Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Property Amenities</Typography>
            </Grid>
            
            {/* Amenity Categories */}
            {Object.entries(AMENITIES_CATEGORIES).map(([category, amenities]) => (
              <Grid item xs={12} key={category}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">{category}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {amenities.map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          clickable
                          color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                          onClick={() => addAmenityFromCategory(amenity)}
                          onDelete={formData.amenities.includes(amenity) ? () => removeFromList('amenities', formData.amenities.indexOf(amenity)) : undefined}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Property Highlights</Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  label="Add Highlight"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToList('highlights', newHighlight)}
                />
                <Button
                  variant="contained"
                  onClick={() => addToList('highlights', newHighlight)}
                  disabled={!newHighlight.trim()}
                >
                  <Add />
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.highlights.map((highlight, index) => (
                  <Chip
                    key={index}
                    label={highlight}
                    onDelete={() => removeFromList('highlights', index)}
                    color="secondary"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>House Rules</Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  label="Add House Rule"
                  value={newHouseRule}
                  onChange={(e) => setNewHouseRule(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToList('houseRules', newHouseRule)}
                />
                <Button
                  variant="contained"
                  onClick={() => addToList('houseRules', newHouseRule)}
                  disabled={!newHouseRule.trim()}
                >
                  <Add />
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.houseRules.map((rule, index) => (
                  <Chip
                    key={index}
                    label={rule}
                    onDelete={() => removeFromList('houseRules', index)}
                    color="warning"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !formData.name || !formData.location || !formData.description}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Property' : 'Update Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
