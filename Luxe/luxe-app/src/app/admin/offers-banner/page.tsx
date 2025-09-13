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
  Chip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Image,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
  CloudUpload,
  Star,
  StarBorder,
  Schedule,
  Category,
  TrendingUp
} from '@mui/icons-material';
import { offersBannerManager } from '@/lib/dataManager';
import type { OffersBanner } from '@/lib/dataManager';

export default function OffersBannerPage() {
  // State management
  const [banners, setBanners] = useState<OffersBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<OffersBanner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<OffersBanner | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBanner, setSelectedBanner] = useState<OffersBanner | null>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<OffersBanner>>({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    backgroundImageUrl: '',
    isActive: true,
    category: 'general',
    priority: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    // Coupon fields
    hasCoupon: false,
    couponCode: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    maxUses: 0,
    usedCount: 0,
    termsAndConditions: ''
  });

  // File upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        await offersBannerManager.initialize();
        const data = offersBannerManager.getAll();
        setBanners(data);
      } catch (error) {
        console.error('Error loading banners:', error);
        setSnackbar({
          open: true,
          message: 'Error loading banners',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadBanners();

    // Subscribe to real-time updates
    const unsubscribe = offersBannerManager.subscribe(() => {
      const updatedBanners = offersBannerManager.getAll();
      setBanners(updatedBanners);
    });

    return unsubscribe;
  }, []);

  // Input change handler
  const handleInputChange = (field: keyof OffersBanner, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUploadingImage(true);
      
      try {
        // For now, create a data URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          handleInputChange('backgroundImageUrl', imageUrl);
          setUploadingImage(false);
        };
        reader.readAsDataURL(file);
        
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
        setUploadingImage(false);
      }
    }
  };

  // Open create dialog
  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      backgroundImageUrl: '',
      isActive: true,
      category: 'general',
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      // Coupon fields
      hasCoupon: false,
      couponCode: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      maxUses: 0,
      usedCount: 0,
      termsAndConditions: ''
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (banner: OffersBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      backgroundImageUrl: banner.backgroundImageUrl,
      isActive: banner.isActive,
      category: banner.category || 'general',
      priority: banner.priority || 1,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      // Coupon fields
      hasCoupon: banner.hasCoupon || false,
      couponCode: banner.couponCode || '',
      discountType: banner.discountType || 'percentage',
      discountValue: banner.discountValue || 0,
      minOrderAmount: banner.minOrderAmount || 0,
      maxDiscountAmount: banner.maxDiscountAmount || 0,
      maxUses: banner.maxUses || 0,
      usedCount: banner.usedCount || 0,
      termsAndConditions: banner.termsAndConditions || ''
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  // Save banner
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const bannerData = {
        title: formData.title!,
        subtitle: formData.subtitle,
        description: formData.description,
        buttonText: formData.buttonText!,
        buttonLink: formData.buttonLink!,
        backgroundImageUrl: formData.backgroundImageUrl!,
        isActive: formData.isActive!,
        category: formData.category!,
        priority: formData.priority!,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        // Coupon fields
        hasCoupon: formData.hasCoupon || false,
        couponCode: formData.couponCode,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount,
        maxDiscountAmount: formData.maxDiscountAmount,
        maxUses: formData.maxUses,
        usedCount: formData.usedCount || 0,
        termsAndConditions: formData.termsAndConditions
      };

      if (editingBanner) {
        await offersBannerManager.update(editingBanner.id, bannerData);
        setSnackbar({
          open: true,
          message: 'Banner updated successfully!',
          severity: 'success'
        });
      } else {
        await offersBannerManager.create(bannerData);
        setSnackbar({
          open: true,
          message: 'Banner created successfully!',
          severity: 'success'
        });
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving banner:', error);
      setSnackbar({
        open: true,
        message: 'Error saving banner',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle banner active status
  const handleToggleActive = async (banner: OffersBanner) => {
    try {
      await offersBannerManager.update(banner.id, { isActive: !banner.isActive });
      setSnackbar({
        open: true,
        message: `Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling banner status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating banner status',
        severity: 'error'
      });
    }
  };

  // Delete banner
  const handleDelete = async () => {
    if (!bannerToDelete) return;
    
    try {
      await offersBannerManager.delete(bannerToDelete.id);
      setSnackbar({
        open: true,
        message: 'Banner deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting banner',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, banner: OffersBanner) => {
    setAnchorEl(event.currentTarget);
    setSelectedBanner(banner);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBanner(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'partnership': return 'primary';
      case 'promotion': return 'secondary';
      case 'seasonal': return 'success';
      default: return 'default';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'partnership': return <Star />;
      case 'promotion': return <Category />;
      case 'seasonal': return <Schedule />;
      default: return <Category />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading banners...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Offers Banner Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage promotional banners for the "Offers for You" section
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Create New Banner
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
              {banners.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Banners
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {banners.filter(b => b.isActive).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Banners
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {banners.filter(b => b.category === 'partnership').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Partnerships
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
              {banners.filter(b => b.category === 'promotion').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Promotions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Banners Grid */}
      <Grid container spacing={3}>
        {banners.map((banner) => (
          <Grid item xs={12} md={6} lg={4} key={banner.id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&:hover': {
                boxShadow: 4
              }
            }}>
              {/* Banner Image */}
              <CardMedia
                component="img"
                height="200"
                image={banner.backgroundImageUrl}
                alt={banner.title}
                sx={{ objectFit: 'cover' }}
              />

              {/* Status Badge */}
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Chip
                  icon={banner.isActive ? <Visibility /> : <VisibilityOff />}
                  label={banner.isActive ? 'Active' : 'Inactive'}
                  color={banner.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ 
                    backgroundColor: banner.isActive ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Category Badge */}
              <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                <Chip
                  icon={getCategoryIcon(banner.category || 'general')}
                  label={banner.category || 'General'}
                  color={getCategoryColor(banner.category || 'general') as any}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'text.primary',
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Priority Badge */}
              {banner.priority && banner.priority > 1 && (
                <Box sx={{ position: 'absolute', top: 48, left: 8 }}>
                  <Chip
                    icon={<TrendingUp />}
                    label={`Priority ${banner.priority}`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 193, 7, 0.9)',
                      color: 'text.primary',
                      fontWeight: 600
                    }}
                  />
                </Box>
              )}

              {/* Menu Button */}
              <IconButton
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                }}
                onClick={(e) => handleMenuOpen(e, banner)}
              >
                <MoreVert />
              </IconButton>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {banner.title}
                </Typography>
                {banner.subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {banner.subtitle}
                  </Typography>
                )}
                {banner.description && (
                  <Typography variant="body2" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {banner.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Button:
                  </Typography>
                  <Chip label={banner.buttonText} size="small" variant="outlined" />
                </Box>
                
                {banner.hasCoupon && banner.couponCode && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Coupon:
                    </Typography>
                    <Chip 
                      label={banner.couponCode} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      ({banner.discountType === 'percentage' ? `${banner.discountValue}%` : `₹${banner.discountValue}`})
                    </Typography>
                  </Box>
                )}
                
                {banner.startDate && banner.endDate && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={banner.isActive ? <VisibilityOff /> : <Visibility />}
                  onClick={() => handleToggleActive(banner)}
                  color={banner.isActive ? 'warning' : 'success'}
                >
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEdit(banner)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {banners.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No banners created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first promotional banner to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Create First Banner
          </Button>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingBanner ? 'Edit Banner' : 'Create New Banner'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter banner title"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Enter banner subtitle"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter banner description"
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText}
                onChange={(e) => handleInputChange('buttonText', e.target.value)}
                placeholder="e.g., Book Now"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Button Link"
                value={formData.buttonLink}
                onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                placeholder="e.g., /villas"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="partnership">Partnership</MenuItem>
                  <MenuItem value="promotion">Promotion</MenuItem>
                  <MenuItem value="seasonal">Seasonal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Priority"
                type="number"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 10 }}
                helperText="Higher numbers appear first"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="banner-image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="banner-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={uploadingImage}
                    sx={{ mr: 2 }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Background Image'}
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
                label="Background Image URL (Optional)"
                value={formData.backgroundImageUrl}
                onChange={(e) => handleInputChange('backgroundImageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                helperText="Direct URL to the background image. Leave empty for auto-generated banner cards."
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

            {/* Coupon Management Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6" color="primary">
                  Coupon Code Management
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hasCoupon || false}
                    onChange={(e) => handleInputChange('hasCoupon', e.target.checked)}
                  />
                }
                label="Enable Coupon Code"
              />
            </Grid>

            {formData.hasCoupon && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coupon Code"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                    placeholder="e.g., SAVE20"
                    helperText="Enter a unique coupon code"
                    required={formData.hasCoupon}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={formData.discountType}
                      onChange={(e) => handleInputChange('discountType', e.target.value)}
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                    inputProps={{ 
                      min: 0, 
                      max: formData.discountType === 'percentage' ? 100 : undefined 
                    }}
                    helperText={formData.discountType === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount in ₹'}
                    required={formData.hasCoupon}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Order Amount (₹)"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => handleInputChange('minOrderAmount', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                    helperText="Minimum order amount to use this coupon"
                  />
                </Grid>

                {formData.discountType === 'percentage' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maximum Discount Amount (₹)"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => handleInputChange('maxDiscountAmount', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0 }}
                      helperText="Maximum discount amount (leave 0 for no limit)"
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Uses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => handleInputChange('maxUses', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                    helperText="Maximum number of times this coupon can be used (0 = unlimited)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Terms & Conditions"
                    value={formData.termsAndConditions}
                    onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                    placeholder="Enter terms and conditions for this coupon"
                    multiline
                    rows={3}
                  />
                </Grid>

                {editingBanner && formData.usedCount && formData.usedCount > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      This coupon has been used {formData.usedCount} times.
                      {formData.maxUses && formData.maxUses > 0 && (
                        <span> ({formData.maxUses - formData.usedCount} uses remaining)</span>
                      )}
                    </Alert>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || !formData.title || !formData.buttonText || !formData.buttonLink}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{bannerToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedBanner) {
            handleEdit(selectedBanner);
            handleMenuClose();
          }
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedBanner) {
            handleToggleActive(selectedBanner);
            handleMenuClose();
          }
        }}>
          {selectedBanner?.isActive ? <VisibilityOff sx={{ mr: 1 }} /> : <Visibility sx={{ mr: 1 }} />}
          {selectedBanner?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedBanner) {
            setBannerToDelete(selectedBanner);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }
        }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

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
