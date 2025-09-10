'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Box,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Save, Refresh, Delete, VideoFile, Image } from '@mui/icons-material';
import { dealBannerManager } from '@/lib/dataManager';
import type { DealBanner } from '@/lib/dataManager';

export default function DealBannerPage() {
  // State management
  const [dealBanner, setDealBanner] = useState<DealBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Form data with guaranteed defaults
  const [formData, setFormData] = useState<DealBanner>({
    id: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    videoUrl: '',
    fallbackImageUrl: '',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // File upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load deal banner data
  useEffect(() => {
    const loadDealBanner = async () => {
      try {
        await dealBannerManager.initialize();
        const data = dealBannerManager.getActive();
        const activeBanner = Array.isArray(data) ? data[0] : data;
        setDealBanner(activeBanner);
        
        if (activeBanner) {
          setFormData({
            id: activeBanner.id || '',
            title: activeBanner.title || '',
            subtitle: activeBanner.subtitle || '',
            buttonText: activeBanner.buttonText || '',
            buttonLink: activeBanner.buttonLink || '',
            videoUrl: activeBanner.videoUrl || '',
            fallbackImageUrl: activeBanner.fallbackImageUrl || '',
            isActive: activeBanner.isActive === true,
            createdAt: activeBanner.createdAt || new Date().toISOString(),
            updatedAt: activeBanner.updatedAt || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading deal banner:', error);
        setSnackbar({
          open: true,
          message: 'Error loading deal banner',
          severity: 'error'
        });
      }
    };

    loadDealBanner();
  }, []);

  // Input change handler
  const handleInputChange = (field: keyof DealBanner, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Video upload handler
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadingVideo(true);
      
      try {
        // For now, just use the file name as a placeholder
        const videoUrl = `/uploads/videos/${file.name}`;
        handleInputChange('videoUrl', videoUrl);
        setSnackbar({
          open: true,
          message: 'Video file selected (upload functionality coming soon)',
          severity: 'info'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to process video file',
          severity: 'error'
        });
      } finally {
        setUploadingVideo(false);
      }
    }
  };

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUploadingImage(true);
      
      try {
        // For now, just use the file name as a placeholder
        const imageUrl = `/uploads/images/${file.name}`;
        handleInputChange('fallbackImageUrl', imageUrl);
        setSnackbar({
          open: true,
          message: 'Image file selected (upload functionality coming soon)',
          severity: 'info'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to process image file',
          severity: 'error'
        });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    
    try {
      await dealBannerManager.initialize();
      
      const dealBannerData = {
        title: formData.title,
        subtitle: formData.subtitle,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        videoUrl: formData.videoUrl,
        fallbackImageUrl: formData.fallbackImageUrl,
        isActive: formData.isActive
      };

      if (dealBanner) {
        await dealBannerManager.update(dealBanner.id, dealBannerData);
      } else {
        await dealBannerManager.create(dealBannerData);
      }
      
      setSnackbar({
        open: true,
        message: 'Deal banner saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving deal banner:', error);
      setSnackbar({
        open: true,
        message: 'Error saving deal banner',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset handler
  const handleReset = async () => {
    try {
      await dealBannerManager.initialize();
      await dealBannerManager.clear();
      setFormData({
        id: '',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        videoUrl: '',
        fallbackImageUrl: '',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setDealBanner(null);
      setSnackbar({
        open: true,
        message: 'Deal banner reset successfully',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error resetting deal banner:', error);
      setSnackbar({
        open: true,
        message: 'Error resetting deal banner',
        severity: 'error'
      });
    }
  };

  // Clear handler
  const handleClear = async () => {
    try {
      await dealBannerManager.initialize();
      await dealBannerManager.clear();
      setFormData({
        id: '',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        videoUrl: '',
        fallbackImageUrl: '',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setDealBanner(null);
      setSnackbar({
        open: true,
        message: 'Deal banner cleared successfully',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error clearing deal banner:', error);
      setSnackbar({
        open: true,
        message: 'Error clearing deal banner',
        severity: 'error'
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Deal Banner Management
      </Typography>

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Edit Deal Banner Content
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Main Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Flash Sale! Book Now"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Before It's Gone!"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Button Text"
                  value={formData.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  placeholder="Grab This Deal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Button Link"
                  value={formData.buttonLink}
                  onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                  placeholder="/villas"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Video Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Video Background
            </Typography>

            <Box sx={{ mb: 2 }}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="video-upload"
                type="file"
                onChange={handleVideoUpload}
              />
              <label htmlFor="video-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={uploadingVideo ? <CircularProgress size={20} /> : <VideoFile />}
                  disabled={uploadingVideo}
                  sx={{ mr: 2 }}
                >
                  {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                </Button>
              </label>
              {videoFile && (
                <Chip
                  label={videoFile.name}
                  onDelete={() => setVideoFile(null)}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <TextField
              fullWidth
              label="Video URL"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              placeholder="/videos/luxury-villa-tour.mp4"
              helperText="Direct URL to video file or uploaded video path"
            />
          </Paper>

          {/* Image Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Fallback Image
            </Typography>

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
                  startIcon={uploadingImage ? <CircularProgress size={20} /> : <Image />}
                  disabled={uploadingImage}
                  sx={{ mr: 2 }}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              </label>
              {imageFile && (
                <Chip
                  label={imageFile.name}
                  onDelete={() => setImageFile(null)}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <TextField
              fullWidth
              label="Fallback Image URL"
              value={formData.fallbackImageUrl}
              onChange={(e) => handleInputChange('fallbackImageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              helperText="Image to show if video fails to load"
            />
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<Refresh />}
            >
              Reset to Defaults
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleClear}
              startIcon={<Delete />}
            >
              Clear Banner
            </Button>
          </Box>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Preview
            </Typography>

            {formData.isActive ? (
              <Box sx={{ 
                p: 3, 
                bgcolor: 'background.paper', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  {formData.title || 'Deal Title'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  {formData.subtitle || 'Deal subtitle will appear here'}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  href={formData.buttonLink || '#'}
                  sx={{ mb: 2 }}
                >
                  {formData.buttonText || 'Button Text'}
                </Button>
                {formData.videoUrl && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Video: {formData.videoUrl}
                  </Typography>
                )}
                {formData.fallbackImageUrl && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Image: {formData.fallbackImageUrl}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                p: 3, 
                bgcolor: 'grey.100', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Banner is currently inactive
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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


