'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Villa as VillaIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  Wifi as WifiIcon,
  Pool as PoolIcon,
  DirectionsCar as CarIcon,
  Kitchen as KitchenIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  AcUnit as AcIcon,
  LocalLaundryService as LaundryIcon,
  HotTub as HotTubIcon,
  FitnessCenter as GymIcon,
  Restaurant as RestaurantIcon,
  BeachAccess as BeachIcon,
  Terrain as MountainIcon,
  Security as SecurityIcon,
  Pets as PetIcon,
  SmokingRooms as SmokingIcon,
  Block as NoSmokingIcon
} from '@mui/icons-material';
import { PropertyManager } from '@/lib/managers/PropertyManager';

const propertyManager = new PropertyManager();

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  state: string;
  city: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
  property_type: 'villa' | 'homestay' | 'cottage' | 'bungalow' | 'pool_villa' | 'luxury_villa';
  created_at: string;
  updated_at: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Villa in Lonavala',
    description: 'Beautiful 3-bedroom villa with mountain views and private pool',
    location: 'Lonavala, Maharashtra',
    state: 'Maharashtra',
    city: 'Lonavala',
    price_per_night: 15000,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Swimming Pool', 'Garden', 'Kitchen', 'AC'],
    images: ['/images/properties/villa1.jpg'],
    is_active: true,
    property_type: 'luxury_villa',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Beach House in Goa',
    description: 'Modern beachfront property with ocean views and direct beach access',
    location: 'Calangute, Goa',
    state: 'Goa',
    city: 'Calangute',
    price_per_night: 12000,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Beach Access', 'Kitchen', 'AC', 'Balcony'],
    images: ['/images/properties/beach-house1.jpg'],
    is_active: true,
    property_type: 'villa',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

const propertyTypes = [
  { value: 'villa', label: 'Villa' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'pool_villa', label: 'Pool Villa' },
  { value: 'luxury_villa', label: 'Luxury Villa' }
];

const amenitiesOptions = [
  'WiFi', 'Parking', 'Swimming Pool', 'Garden', 'Kitchen', 'AC', 'Balcony',
  'Beach Access', 'Fireplace', 'Cultural Activities', 'Room Service', 'Spa',
  'Gym', 'Restaurant', 'Bar', 'Concierge', 'Laundry', 'Airport Transfer',
  'Hot Tub', 'Security', 'Pet Friendly', 'Smoking Allowed', 'Non-Smoking',
  'Terrace', 'TV', 'Sound System', 'BBQ Area', 'Outdoor Dining', 'Housekeeping',
  'Sauna', 'Tennis Court', 'Golf Course', 'Boat Access', 'Mountain View',
  'Pool Table', 'Ping Pong', 'Library', 'Workspace', 'Child Friendly'
];

export default function PropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    description: '',
    location: '',
    state: '',
    city: '',
    price_per_night: 0,
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
    is_active: true,
    property_type: 'villa'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // Load properties from Supabase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyManager.getAllProperties();
        setProperties(data);
        console.log('Loaded properties from Supabase:', data.length);
      } catch (error) {
        console.error('Error loading properties:', error);
        setSnackbar({ open: true, message: 'Error loading properties', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleOpen = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData(property);
      setImagePreview(property.images || []);
    } else {
      setEditingProperty(null);
      setFormData({
        name: '',
        description: '',
        location: '',
        state: '',
        city: '',
        price_per_night: 0,
        max_guests: 1,
        bedrooms: 1,
        bathrooms: 1,
        amenities: [],
        images: [],
        is_active: true,
        property_type: 'villa'
      });
      setImages([]);
      setImagePreview([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProperty(null);
  };

  const handleSave = async () => {
    try {
      if (editingProperty) {
        // Update existing property
        const updatedProperty = await propertyManager.updateProperty(editingProperty.id, {
          ...formData,
          images: imagePreview
        });
        
        if (updatedProperty) {
          setProperties(prev => prev.map(p => p.id === editingProperty.id ? updatedProperty : p));
          setSnackbar({ open: true, message: 'Property updated successfully! Now live on website.', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Error updating property', severity: 'error' });
        }
      } else {
        // Add new property
        const newProperty = await propertyManager.createProperty({
          ...formData,
          images: imagePreview
        } as Omit<Property, 'id' | 'created_at' | 'updated_at'>);
        
        if (newProperty) {
          setProperties(prev => [...prev, newProperty]);
          setSnackbar({ open: true, message: 'Property added successfully! Now live on website and available for booking.', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Error creating property', severity: 'error' });
        }
      }
      
      // Reset form and images
      setImages([]);
      setImagePreview([]);
      handleClose();
    } catch (error) {
      console.error('Error saving property:', error);
      setSnackbar({ open: true, message: 'Error saving property', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await propertyManager.deleteProperty(id);
      if (success) {
        setProperties(prev => prev.filter(p => p.id !== id));
        setSnackbar({ open: true, message: 'Property deleted successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Error deleting property', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      setSnackbar({ open: true, message: 'Error deleting property', severity: 'error' });
    }
  };

  const handleToggleActive = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, is_active: !p.is_active, updated_at: new Date().toISOString() } : p
    ));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages(prev => [...prev, ...newImages]);
      
      // Create preview URLs
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <WifiIcon />;
      case 'parking': return <CarIcon />;
      case 'swimming pool': return <PoolIcon />;
      case 'kitchen': return <KitchenIcon />;
      case 'ac': case 'air conditioning': return <AcIcon />;
      case 'laundry': return <LaundryIcon />;
      case 'hot tub': return <HotTubIcon />;
      case 'gym': case 'fitness center': return <GymIcon />;
      case 'restaurant': return <RestaurantIcon />;
      case 'beach access': return <BeachIcon />;
      case 'mountain view': return <MountainIcon />;
      case 'security': return <SecurityIcon />;
      case 'pet friendly': return <PetIcon />;
      case 'smoking allowed': return <SmokingIcon />;
      case 'non-smoking': return <NoSmokingIcon />;
      default: return <VillaIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Property Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Manage your properties, add new listings, and update existing ones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Add New Property
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Loading properties...</Typography>
        </Box>
      )}

      {/* No Properties Message */}
      {!loading && properties.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No properties found. Add your first property to get started!
          </Typography>
        </Box>
      )}

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {!loading && properties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {property.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(property)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(property.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {property.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{property.location}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MoneyIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">₹{(property.price_per_night || 0).toLocaleString()}/night</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{property.max_guests || 0} guests</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BedIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{property.bedrooms || 0} bed • {property.bathrooms || 0} bath</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Amenities:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(property.amenities || []).slice(0, 3).map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        icon={getAmenityIcon(amenity)}
                        variant="outlined"
                      />
                    ))}
                    {(property.amenities || []).length > 3 && (
                      <Chip
                        label={`+${(property.amenities || []).length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={property.is_active ? 'Active' : 'Inactive'}
                    color={property.is_active ? 'success' : 'default'}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={property.is_active}
                        onChange={() => handleToggleActive(property.id)}
                        size="small"
                      />
                    }
                    label=""
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Property Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value as any })}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Night"
                type="number"
                value={formData.price_per_night || 0}
                onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.max_guests || 1}
                onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) || 1 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms || 1}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) || 1 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms || 1}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) || 1 })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Property Images
              </Typography>
              <Box sx={{ border: '2px dashed #ccc', p: 2, textAlign: 'center', mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 1 }}
                  >
                    Upload Images
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Upload multiple images of your property (max 10 images)
                </Typography>
              </Box>
              
              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {imagePreview.map((preview, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #ccc'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: 'error.main',
                          color: 'white',
                          '&:hover': { backgroundColor: 'error.dark' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={amenitiesOptions}
                value={formData.amenities || []}
                onChange={(event, newValue) => setFormData({ ...formData, amenities: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Amenities"
                    placeholder="Select amenities"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Property"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProperty ? 'Update' : 'Add'} Property
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
