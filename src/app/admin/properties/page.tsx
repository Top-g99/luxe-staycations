"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  LinearProgress,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Villa,
  Star,
  LocationOn,
  AttachMoney,
  Group,
  Hotel,
  Pool,
  Wifi,
  LocalParking,
  Kitchen
} from '@mui/icons-material';
import { propertyManager } from '@/lib/propertyManager';

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  type: string;
  amenities: string[];
  featured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  hostName?: string;
  hostImage?: string;
  images?: string[];
  highlights?: string[];
  squareFootage?: number;
  yearBuilt?: number;
  distanceToBeach?: number;
  distanceToCity?: number;
  primaryView?: string;
  propertyStyle?: string;
  policies?: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
}

export default function PropertiesAdmin() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
    price: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    hostName: '',
    featured: false,
    amenities: [] as string[],
    highlights: [] as string[]
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    try {
      const allProperties = propertyManager.getAllProperties();
      setProperties(allProperties);
      setLoading(false);
    } catch (error) {
      console.error('Error loading properties:', error);
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      image: '',
      price: '',
      type: '',
      bedrooms: '',
      bathrooms: '',
      maxGuests: '',
      hostName: '',
      featured: false,
      amenities: [],
      highlights: []
    });
    setDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      location: property.location,
      description: property.description,
      image: property.image,
      price: property.price.toString(),
      type: property.type,
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      maxGuests: property.maxGuests?.toString() || '',
      hostName: property.hostName || '',
      featured: property.featured || false,
      amenities: property.amenities || [],
      highlights: property.highlights || []
    });
    setDialogOpen(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      try {
        propertyManager.deleteProperty(propertyToDelete.id);
        loadProperties();
        setSnackbar({ open: true, message: 'Property deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting property', severity: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const handleSaveProperty = () => {
    try {
      const propertyData = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        image: formData.image,
        price: parseInt(formData.price),
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms) || undefined,
        bathrooms: parseInt(formData.bathrooms) || undefined,
        maxGuests: parseInt(formData.maxGuests) || undefined,
        hostName: formData.hostName,
        featured: formData.featured,
        amenities: formData.amenities,
        highlights: formData.highlights,
        rating: 4.5,
        reviews: 0,
        images: [formData.image],
        squareFootage: 2000,
        yearBuilt: 2020,
        distanceToBeach: 0,
        distanceToCity: 5,
        primaryView: 'Mountain',
        propertyStyle: 'Modern',
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Free cancellation up to 7 days before check-in'
        }
      };

      if (editingProperty) {
        propertyManager.updateProperty(editingProperty.id, propertyData);
        setSnackbar({ open: true, message: 'Property updated successfully', severity: 'success' });
      } else {
        propertyManager.addProperty(propertyData);
        setSnackbar({ open: true, message: 'Property added successfully', severity: 'success' });
      }

      loadProperties();
      setDialogOpen(false);
      setEditingProperty(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving property', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi />;
      case 'pool': return <Pool />;
      case 'parking': return <LocalParking />;
      case 'kitchen': return <Kitchen />;
      case 'garden': return <Villa />;
      default: return <Villa />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Gilda Display, serif',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          mb: 1
        }}>
          Property Management
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage your villa properties, update details, and control featured listings.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {properties.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Properties
                  </Typography>
                </Box>
                <Villa sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {properties.filter(p => p.featured).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Featured Properties
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {properties.reduce((sum, p) => sum + (p.bedrooms || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Bedrooms
                  </Typography>
                </Box>
                <Hotel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹{properties.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Value
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Properties List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              All Properties ({properties.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddProperty}
              sx={{
                background: 'var(--primary-dark)',
                '&:hover': { background: 'var(--primary-light)' }
              }}
            >
              Add Property
            </Button>
          </Box>

          <List>
            {properties.map((property) => (
              <ListItem
                key={property.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 2,
                  backgroundColor: 'white'
                }}
              >
                <ListItemAvatar>
                  <Avatar src={property.image} alt={property.name} sx={{ width: 80, height: 80 }}>
                    <Villa />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                        {property.name}
                      </Typography>
                      {property.featured && (
                        <Chip 
                          label="Featured" 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'var(--primary-light)',
                            color: 'white'
                          }} 
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                            {property.location}
                          </Typography>
                        </Box>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: '#ffd700' }} />
                          <Typography component="span" variant="body2">
                            {property.rating} ({property.reviews} reviews)
                          </Typography>
                        </Box>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                            {property.maxGuests} guests
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography component="span" variant="body2" sx={{ mb: 1 }}>
                        {property.description}
                      </Typography>
                      
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {property.amenities.slice(0, 5).map((amenity, index) => (
                          <Chip
                            key={index}
                            icon={getAmenityIcon(amenity)}
                            label={amenity}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                        {property.amenities.length > 5 && (
                          <Chip
                            label={`+${property.amenities.length - 5} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                    ₹{property.price.toLocaleString()}/night
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditProperty(property)}
                      sx={{ color: 'var(--primary-dark)' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProperty(property)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add/Edit Property Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Property Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Night"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Property Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="Villa">Villa</MenuItem>
                  <MenuItem value="Cottage">Cottage</MenuItem>
                  <MenuItem value="Apartment">Apartment</MenuItem>
                  <MenuItem value="Bungalow">Bungalow</MenuItem>
                  <MenuItem value="Luxury Villa">Luxury Villa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Host Name"
                value={formData.hostName}
                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                }
                label="Featured Property"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProperty}
            variant="contained"
            sx={{
              background: 'var(--primary-dark)',
              '&:hover': { background: 'var(--primary-light)' }
            }}
          >
            {editingProperty ? 'Update' : 'Add'} Property
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddProperty}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: 'var(--primary-dark)',
          '&:hover': { backgroundColor: 'var(--primary-light)' }
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
