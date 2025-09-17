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
  Kitchen as KitchenIcon
} from '@mui/icons-material';

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
  'Gym', 'Restaurant', 'Bar', 'Concierge', 'Laundry', 'Airport Transfer'
];

export default function PropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
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

  const handleOpen = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData(property);
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
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProperty(null);
  };

  const handleSave = () => {
    if (editingProperty) {
      // Update existing property
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? { ...formData, id: editingProperty.id, updated_at: new Date().toISOString() } as Property : p));
      setSnackbar({ open: true, message: 'Property updated successfully!', severity: 'success' });
    } else {
      // Add new property
      const newProperty: Property = {
        ...formData as Property,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProperties(prev => [...prev, newProperty]);
      setSnackbar({ open: true, message: 'Property added successfully!', severity: 'success' });
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    setSnackbar({ open: true, message: 'Property deleted successfully!', severity: 'success' });
  };

  const handleToggleActive = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, is_active: !p.is_active, updated_at: new Date().toISOString() } : p
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <WifiIcon />;
      case 'parking': return <CarIcon />;
      case 'swimming pool': return <PoolIcon />;
      case 'kitchen': return <KitchenIcon />;
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

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {properties.map((property) => (
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
                  <Typography variant="body2">₹{property.price_per_night.toLocaleString()}/night</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{property.max_guests} guests</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BedIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{property.bedrooms} bed • {property.bathrooms} bath</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Amenities:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        icon={getAmenityIcon(amenity)}
                        variant="outlined"
                      />
                    ))}
                    {property.amenities.length > 3 && (
                      <Chip
                        label={`+${property.amenities.length - 3} more`}
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
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
              />
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
