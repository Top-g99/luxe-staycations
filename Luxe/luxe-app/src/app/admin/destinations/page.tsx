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
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  LinearProgress,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Star,
  Visibility,
  Image,
  PhotoCamera
} from '@mui/icons-material';
import { destinationManager } from '@/lib/dataManager';
import { isAdmin, hasAdminPermission, getAdminPermissionError } from '@/lib/adminPermissions';

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  attractions: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DestinationsAdmin() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<Destination | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    featured: false
  });

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      await destinationManager.initialize();
      const allDestinations = destinationManager.getAll();
      setDestinations(allDestinations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading destinations:', error);
      setLoading(false);
    }
  };

  const handleAddDestination = () => {
    setEditingDestination(null);
    setFormData({
      name: '',
      image: '',
      description: '',
      featured: false
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleEditDestination = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      image: destination.image,
      description: destination.description || '',
      featured: destination.featured || false
    });
    setDialogOpen(true);
  };

  const handleDeleteDestination = (destination: Destination) => {
    if (!hasAdminPermission('delete', 'destination')) {
      setSnackbar({
        open: true,
        message: getAdminPermissionError('delete', 'destination'),
        severity: 'error'
      });
      return;
    }
    setDestinationToDelete(destination);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (destinationToDelete) {
      try {
        await destinationManager.delete(destinationToDelete.id);
        loadDestinations();
        setSnackbar({ open: true, message: 'Destination deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting destination', severity: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setDestinationToDelete(null);
  };

  const handleSaveDestination = async () => {
    try {
      const destinationData = {
        name: formData.name,
        image: formData.image,
        description: formData.description,
        location: formData.name, // Using name as location for now
        attractions: [], // Empty array for now
        featured: formData.featured
      };

      if (editingDestination) {
        await destinationManager.update(editingDestination.id, destinationData);
        setSnackbar({ open: true, message: 'Destination updated successfully', severity: 'success' });
      } else {
        await destinationManager.create(destinationData);
        setSnackbar({ open: true, message: 'Destination added successfully', severity: 'success' });
      }

      loadDestinations();
      setDialogOpen(false);
      setEditingDestination(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving destination', severity: 'error' });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUploadingImage(true);
      
      try {
        // Create a local URL for the uploaded image
        const imageUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setSnackbar({
          open: true,
          message: 'Image uploaded successfully!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to upload image',
          severity: 'error'
        });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          color: '#5D4037',
          mb: 1,
          letterSpacing: '0.5px'
        }}>
          Destination Management
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#8D6E63',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '1.1rem'
        }}>
          Curate and manage your exclusive travel destinations with precision and elegance.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)', 
            color: 'white',
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(93, 64, 55, 0.25)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                    {destinations.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Nunito, sans-serif' }}>
                    Total Destinations
                  </Typography>
                </Box>
                <LocationOn sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)', 
            color: 'white',
            boxShadow: '0 8px 32px rgba(141, 110, 99, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(141, 110, 99, 0.25)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                    {destinations.filter(d => d.featured).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Nunito, sans-serif' }}>
                    Featured Destinations
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #A1887F 0%, #BCAAA4 100%)', 
            color: 'white',
            boxShadow: '0 8px 32px rgba(161, 136, 127, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(161, 136, 127, 0.25)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                    {destinations.filter(d => d.description && d.description.length > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Nunito, sans-serif' }}>
                    With Descriptions
                  </Typography>
                </Box>
                <Visibility sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #BCAAA4 0%, #D7CCC8 100%)', 
            color: '#5D4037',
            boxShadow: '0 8px 32px rgba(188, 170, 164, 0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(188, 170, 164, 0.25)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                    {destinations.filter(d => d.image && d.image.length > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Nunito, sans-serif' }}>
                    With Images
                  </Typography>
                </Box>
                <Image sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Destinations List */}
      <Card sx={{ 
        boxShadow: '0 4px 20px rgba(93, 64, 55, 0.08)',
        border: '1px solid #F5F5F5'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#5D4037',
              fontFamily: 'Playfair Display, serif',
              letterSpacing: '0.5px'
            }}>
              All Destinations ({destinations.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddDestination}
              sx={{
                background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(93, 64, 55, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(93, 64, 55, 0.3)'
                }
              }}
            >
              Add Destination
            </Button>
          </Box>

          <List>
            {destinations.map((destination) => (
              <ListItem
                key={destination.id}
                sx={{
                  border: '1px solid #F5F5F5',
                  borderRadius: 3,
                  mb: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 12px rgba(93, 64, 55, 0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(93, 64, 55, 0.12)',
                    transform: 'translateY(-2px)',
                    borderColor: '#D7CCC8'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={destination.image} 
                    alt={destination.name} 
                    sx={{ 
                      width: 80, 
                      height: 80,
                      border: '3px solid #F5F5F5',
                      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.15)'
                    }}
                  >
                    <LocationOn sx={{ color: '#8D6E63' }} />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                        {destination.name}
                      </Typography>
                      {destination.featured && (
                        <Chip 
                          label="Featured" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
                            color: 'white',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            boxShadow: '0 2px 8px rgba(93, 64, 55, 0.2)'
                          }} 
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      {destination.description && (
                        <Typography component="span" variant="body2" sx={{ mb: 1 }}>
                          {destination.description}
                        </Typography>
                      )}
                      
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                          Created: {new Date(destination.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                          Updated: {new Date(destination.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditDestination(destination)}
                    sx={{ 
                      color: '#8D6E63',
                      backgroundColor: 'rgba(141, 110, 99, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(141, 110, 99, 0.15)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Edit />
                  </IconButton>
                  {isAdmin() && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDestination(destination)}
                      sx={{ 
                        color: '#D32F2F',
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.15)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add/Edit Destination Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.15)',
            border: '1px solid #F5F5F5'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
          color: 'white',
          fontFamily: 'Playfair Display, serif',
          fontWeight: 600
        }}>
          {editingDestination ? 'Edit Destination' : 'Add New Destination'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                label="Featured Destination"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Destination Image
              </Typography>
              
              {/* Image Upload Section */}
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploadingImage ? <CircularProgress size={20} /> : <PhotoCamera />}
                    disabled={uploadingImage}
                    sx={{
                      borderColor: '#8D6E63',
                      color: '#8D6E63',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#5D4037',
                        backgroundColor: 'rgba(141, 110, 99, 0.08)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(141, 110, 99, 0.2)'
                      }
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </label>
                
                {imageFile && (
                  <Chip
                    label={imageFile.name}
                    onDelete={() => setImageFile(null)}
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
              
              {/* Image URL Field (Alternative) */}
              <TextField
                fullWidth
                label="Image URL (Alternative)"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                helperText="Enter a valid image URL (e.g., from Unsplash, Pexels, etc.) or upload an image above"
              />
              
              {/* Image Preview */}
              {formData.image && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={formData.image}
                    alt="Destination preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                helperText="Describe the destination, attractions, and what makes it special"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{
              color: '#8D6E63',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(141, 110, 99, 0.08)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDestination}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(93, 64, 55, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                background: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(93, 64, 55, 0.3)'
              }
            }}
          >
            {editingDestination ? 'Update' : 'Add'} Destination
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{destinationToDelete?.name}"? This action cannot be undone.
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
        onClick={handleAddDestination}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
          color: 'white',
          boxShadow: '0 6px 20px rgba(93, 64, 55, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': { 
            background: 'linear-gradient(135deg, #8D6E63 0%, #A1887F 100%)',
            transform: 'scale(1.1)',
            boxShadow: '0 8px 25px rgba(93, 64, 55, 0.4)'
          }
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
