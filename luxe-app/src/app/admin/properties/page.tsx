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
import { propertyManager, Property } from '@/lib/dataManager';
import PropertyEditDialog from '@/components/PropertyEditDialog';


export default function PropertiesAdmin() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyEditDialogOpen, setPropertyEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      console.log('Loading properties...');
      console.log('PropertyManager instance:', propertyManager);
      
      // Ensure the property manager is initialized
      await propertyManager.initialize();
      
      const allProperties = propertyManager.getAll();
      console.log('All properties loaded:', allProperties);
      
      // Check for duplicate properties
      const duplicates = findDuplicateProperties(allProperties);
      if (duplicates.length > 0) {
        console.log('Found duplicate properties:', duplicates);
        setSnackbar({
          open: true,
          message: `Found ${duplicates.length} duplicate properties. Check the console for details.`,
          severity: 'warning'
        });
      }
      
      // If no properties found, check localStorage directly
      if (allProperties.length === 0) {
        console.log('No properties found in DataManager, checking localStorage...');
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('luxe_properties');
          console.log('localStorage data:', stored);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              console.log('Parsed localStorage data:', parsed);
              setProperties(parsed);
              setLoading(false);
              return;
            } catch (e) {
              console.error('Error parsing localStorage:', e);
            }
          }
        }
      }
      
      setProperties(allProperties);
      setLoading(false);
    } catch (error) {
      console.error('Error loading properties:', error);
      setLoading(false);
    }
  };

  // Helper function to find duplicate properties
  const findDuplicateProperties = (properties: Property[]) => {
    const duplicates: Property[][] = [];
    const seen = new Map<string, Property[]>();
    
    properties.forEach(property => {
      const key = `${property.name}-${property.location}`;
      if (seen.has(key)) {
        seen.get(key)!.push(property);
      } else {
        seen.set(key, [property]);
      }
    });
    
    // Find groups with more than one property
    seen.forEach((group, key) => {
      if (group.length > 1) {
        duplicates.push(group);
        console.log(`Duplicate properties found for key "${key}":`, group);
      }
    });
    
    return duplicates;
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setPropertyEditDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyEditDialogOpen(true);
  };

  const handlePropertySaved = () => {
    loadProperties();
    setPropertyEditDialogOpen(false);
    setEditingProperty(null);
    setSnackbar({
      open: true,
      message: editingProperty ? 'Property updated successfully!' : 'Property created successfully!',
      severity: 'success'
    });
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
      try {
        console.log('Deleting property:', propertyToDelete.id);
        
        // Use the DataManager to delete the property
        const deleted = await propertyManager.delete(propertyToDelete.id);
        
        if (deleted) {
          // Remove from local state
          setProperties(properties.filter(p => p.id !== propertyToDelete.id));
          
          setSnackbar({
            open: true,
            message: 'Property deleted successfully!',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to delete property',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete property',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('pool')) return <Pool />;
    if (amenityLower.includes('wifi')) return <Wifi />;
    if (amenityLower.includes('parking')) return <LocalParking />;
    if (amenityLower.includes('kitchen')) return <Kitchen />;
    return <Villa />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading properties...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
          🏠 Property Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProperty}
          sx={{
            bgcolor: 'var(--primary-dark)',
            '&:hover': { bgcolor: 'var(--primary-light)' }
          }}
        >
          Add New Property
        </Button>
      </Box>

      {/* Properties List */}
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Property Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {property.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" />
                      {property.location}
                    </Typography>
                  </Box>
                  {property.featured && (
                    <Chip 
                      label="Featured" 
                      color="secondary" 
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>

                {/* Property Description */}
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {property.description}
                </Typography>

                {/* Property Stats */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    icon={<AttachMoney />} 
                    label={`₹${property.price}/night`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    icon={<Group />} 
                    label={`${property.max_guests} guests`} 
                    size="small" 
                    variant="outlined"
                  />
                  {property.rating > 0 && (
                    <Chip 
                      icon={<Star />} 
                      label={`${property.rating}★`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Top Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                      Key Amenities ({property.amenities.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {property.amenities.slice(0, 4).map((amenity, index) => (
                        <Chip
                          key={index}
                          icon={getAmenityIcon(amenity)}
                          label={amenity}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                      {property.amenities.length > 4 && (
                        <Chip
                          label={`+${property.amenities.length - 4} more`}
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => handleEditProperty(property)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteProperty(property)}
                    color="error"
                    fullWidth
                  >
                    Delete
                  </Button>
                </Box>
                
                {/* Duplicate Warning */}
                {properties.filter(p => p.name === property.name && p.location === property.location).length > 1 && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                      ⚠️ Duplicate Property Detected
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {properties.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Villa sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No properties found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first luxury villa property
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProperty}
            sx={{
              bgcolor: 'var(--primary-dark)',
              '&:hover': { bgcolor: 'var(--primary-light)' }
            }}
          >
            Add Your First Property
          </Button>
        </Box>
      )}

      {/* Enhanced Property Edit Dialog */}
      <PropertyEditDialog
        open={propertyEditDialogOpen}
        onClose={() => setPropertyEditDialogOpen(false)}
        property={editingProperty}
        mode={editingProperty ? 'edit' : 'create'}
        onPropertySaved={handlePropertySaved}
      />

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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add property"
        onClick={handleAddProperty}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'var(--primary-dark)',
          '&:hover': { bgcolor: 'var(--primary-light)' }
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
