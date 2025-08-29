"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Save,
  Upload,
  PlayArrow,
  Image,
  VideoFile,
  Refresh,
  Delete,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { dealBannerManager, DealBanner } from '@/lib/dealBannerManager';

export default function DealBannerPage() {
  const [dealBanner, setDealBanner] = useState<DealBanner | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    videoUrl: '',
    fallbackImageUrl: '',
    isActive: true
  });

  // File upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load deal banner data
  useEffect(() => {
    const loadDealBanner = () => {
      const data = dealBannerManager.getDealBanner();
      setDealBanner(data);
      if (data) {
        setFormData({
          title: data.title,
          subtitle: data.subtitle,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          videoUrl: data.videoUrl,
          fallbackImageUrl: data.fallbackImageUrl,
          isActive: data.isActive
        });
      }
    };

    loadDealBanner();

    // Subscribe to changes
    const unsubscribe = dealBannerManager.subscribe(() => {
      loadDealBanner();
    });

    return unsubscribe;
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadingVideo(true);
      
      try {
        const videoUrl = await dealBannerManager.uploadVideo(file);
        setFormData(prev => ({ ...prev, videoUrl }));
        setSnackbar({
          open: true,
          message: 'Video uploaded successfully!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to upload video',
          severity: 'error'
        });
      } finally {
        setUploadingVideo(false);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUploadingImage(true);
      
      try {
        const imageUrl = await dealBannerManager.uploadImage(file);
        setFormData(prev => ({ ...prev, fallbackImageUrl: imageUrl }));
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

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const success = dealBannerManager.updateDealBanner(formData);
      if (success) {
        setSnackbar({
          open: true,
          message: 'Deal banner updated successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update deal banner',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating deal banner',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    dealBannerManager.resetToDefault();
    setSnackbar({
      open: true,
      message: 'Deal banner reset to defaults',
      severity: 'info'
    });
  };

  const handleClear = () => {
    dealBannerManager.clearDealBanner();
    setSnackbar({
      open: true,
      message: 'Deal banner cleared',
      severity: 'info'
    });
  };

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

            {dealBanner && (
              <Card sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={formData.fallbackImageUrl}
                  alt="Deal Banner Preview"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {formData.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {formData.subtitle}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'white', color: 'var(--primary-dark)' }}
                  >
                    {formData.buttonText}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {formData.isActive ? (
                <Chip icon={<Visibility />} label="Active" color="success" size="small" />
              ) : (
                <Chip icon={<VisibilityOff />} label="Inactive" color="default" size="small" />
              )}
            </Box>

            {dealBanner && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Last Updated
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {new Date(dealBanner.updatedAt).toLocaleString()}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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


