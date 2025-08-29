"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
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
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DragIndicator,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { heroBackgroundManager } from '@/lib/heroBackgroundManager';
import { typographyStyles, buttonStyles, cardStyles, iconStyles, backgroundStyles } from '@/components/BrandStyles';

interface HeroBackground {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function HeroBackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<HeroBackground[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBackground, setEditingBackground] = useState<HeroBackground | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    subtitle: '',
    isActive: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    loadBackgrounds();

    // Subscribe to changes
    const unsubscribe = heroBackgroundManager.subscribe(() => {
      loadBackgrounds();
    });

    return unsubscribe;
  }, []);

  const loadBackgrounds = () => {
    const data = heroBackgroundManager.getAllBackgrounds();
    setBackgrounds(data);
  };

  const handleAddNew = () => {
    setEditingBackground(null);
    setFormData({
      imageUrl: '',
      title: '',
      subtitle: '',
      isActive: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (background: HeroBackground) => {
    setEditingBackground(background);
    setFormData({
      imageUrl: background.imageUrl,
      title: background.title,
      subtitle: background.subtitle,
      isActive: background.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this background?')) {
      const success = heroBackgroundManager.deleteBackground(id);
      if (success) {
        showSnackbar('Background deleted successfully', 'success');
      } else {
        showSnackbar('Failed to delete background', 'error');
      }
    }
  };

  const handleToggleActive = (id: string) => {
    const success = heroBackgroundManager.toggleBackgroundActive(id);
    if (success) {
      showSnackbar('Background status updated', 'success');
    } else {
      showSnackbar('Failed to update background status', 'error');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...backgrounds];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      const orderedIds = newOrder.map(bg => bg.id);
      heroBackgroundManager.reorderBackgrounds(orderedIds);
      showSnackbar('Background order updated', 'success');
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < backgrounds.length - 1) {
      const newOrder = [...backgrounds];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      const orderedIds = newOrder.map(bg => bg.id);
      heroBackgroundManager.reorderBackgrounds(orderedIds);
      showSnackbar('Background order updated', 'success');
    }
  };

  const handleSave = () => {
    if (!formData.imageUrl || !formData.title || !formData.subtitle) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (editingBackground) {
      // Update existing
      const success = heroBackgroundManager.updateBackground(editingBackground.id, {
        imageUrl: formData.imageUrl,
        title: formData.title,
        subtitle: formData.subtitle,
        isActive: formData.isActive
      });

      if (success) {
        showSnackbar('Background updated successfully', 'success');
        setDialogOpen(false);
      } else {
        showSnackbar('Failed to update background', 'error');
      }
    } else {
      // Add new
      const newBackground = heroBackgroundManager.addBackground({
        imageUrl: formData.imageUrl,
        title: formData.title,
        subtitle: formData.subtitle,
        isActive: formData.isActive,
        order: backgrounds.length + 1
      });

      if (newBackground) {
        showSnackbar('Background added successfully', 'success');
        setDialogOpen(false);
      } else {
        showSnackbar('Failed to add background', 'error');
      }
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingBackground(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          ...typographyStyles.h4,
          mb: 2
        }}>
          Hero Background Manager
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Manage the background images and content for the hero section slider
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          sx={buttonStyles.secondary}
        >
          Add New Background
        </Button>
      </Box>

      {/* Backgrounds List */}
      <Grid container spacing={3}>
        {backgrounds.map((background, index) => (
          <Grid item xs={12} md={6} lg={4} key={background.id}>
            <Card sx={{ 
              ...cardStyles.primary,
              height: '100%',
              position: 'relative'
            }}>
              <CardMedia
                component="img"
                height="200"
                image={background.imageUrl}
                alt={background.title}
                sx={{ objectFit: 'cover' }}
              />
              
              {/* Status Overlay */}
              <Box sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1
              }}>
                <Chip
                  label={background.isActive ? 'Active' : 'Inactive'}
                  color={background.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ 
                  ...typographyStyles.h6,
                  fontWeight: 600,
                  mb: 1
                }}>
                  {background.title}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  mb: 2,
                  lineHeight: 1.4
                }}>
                  {background.subtitle}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Order: {background.order}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(background)}
                      sx={{ ...iconStyles.primary }}
                    >
                      <Edit />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(background.id)}
                      sx={{ 
                        ...(background.isActive ? iconStyles.primary : iconStyles.accent)
                      }}
                    >
                      {background.isActive ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(background.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Order Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    sx={{ 
                      ...(index === 0 ? iconStyles.accent : iconStyles.primary),
                      bgcolor: 'rgba(0,0,0,0.04)',
                      '&:hover': {
                        bgcolor: index === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <ArrowUpward />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === backgrounds.length - 1}
                    sx={{ 
                      ...(index === backgrounds.length - 1 ? iconStyles.accent : iconStyles.primary),
                      bgcolor: 'rgba(0,0,0,0.04)',
                      '&:hover': {
                        bgcolor: index === backgrounds.length - 1 ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <ArrowDownward />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          ...backgroundStyles.dark,
          color: 'white',
          fontFamily: 'Gilda Display, serif'
        }}>
          {editingBackground ? 'Edit Background' : 'Add New Background'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
                helperText="Enter the URL of the background image"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter the main title for this slide"
                required
                helperText="This will be the main heading displayed on the slide"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter the subtitle text"
                required
                multiline
                rows={2}
                helperText="This will be the subtitle displayed below the main title"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active (visible in slider)"
              />
            </Grid>

            {/* Preview */}
            {formData.imageUrl && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ ...typographyStyles.h6, mb: 2 }}>
                  Preview
                </Typography>
                <Box sx={{
                  position: 'relative',
                  height: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: 'white',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      mb: 1
                    }}>
                      {formData.title || 'Title Preview'}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {formData.subtitle || 'Subtitle Preview'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            sx={buttonStyles.secondary}
          >
            {editingBackground ? 'Update' : 'Add'} Background
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
