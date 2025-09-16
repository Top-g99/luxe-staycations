'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Avatar,
  IconButton
} from '@mui/material';
import { Save, Refresh, PhotoCamera } from '@mui/icons-material';
import { settingsManager, BusinessProfile } from '@/lib/settingsManager';
import { contactManager } from '@/lib/contactManager';

export default function BusinessProfileForm() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadProfile();
    
    // Initialize contact manager
    if (typeof window !== 'undefined') {
      contactManager.initialize();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const { settingsManager } = await import('@/lib/settingsManager');
      
      if (typeof window !== 'undefined') {
        settingsManager.initialize();
      }
      
      const businessProfile = await settingsManager.getBusinessProfile();
      setProfile(businessProfile);
      setLoading(false);
    } catch (error) {
      console.error('Error loading business profile:', error);
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof BusinessProfile, value: string) => {
    if (profile) {
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    if (profile) {
      setProfile(prev => prev ? {
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value
        }
      } : null);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { settingsManager } = await import('@/lib/settingsManager');
      
      const success = await settingsManager.updateBusinessProfile(profile);

      if (success) {
        // Sync contact information with contact manager
        contactManager.syncWithBusinessProfile(profile);
        setMessage({ type: 'success', text: 'Business profile updated successfully! Contact information has been synced across all pages.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update business profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving business profile:', error);
      setMessage({ type: 'error', text: 'Error saving business profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadProfile();
    setMessage(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading business profile...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <Alert severity="error">Business profile not found</Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Business Profile
          </Typography>
          <Box>
            <Button
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ mr: 2 }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Box>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Company Logo */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={profile.logo}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="h6">Company Logo</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Upload your company logo (recommended: 200x200px)
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  component="label"
                >
                  Upload Logo
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          handleProfileChange('logo', e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={profile.companyName}
              onChange={(e) => handleProfileChange('companyName', e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              value={profile.website}
              onChange={(e) => handleProfileChange('website', e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={profile.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={profile.description}
              onChange={(e) => handleProfileChange('description', e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>

          {/* Social Media */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Social Media
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Facebook"
              value={profile.socialMedia.facebook || ''}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              variant="outlined"
              placeholder="facebook.com/yourpage"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Instagram"
              value={profile.socialMedia.instagram || ''}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              variant="outlined"
              placeholder="@yourhandle"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twitter"
              value={profile.socialMedia.twitter || ''}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              variant="outlined"
              placeholder="@yourhandle"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="LinkedIn"
              value={profile.socialMedia.linkedin || ''}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              variant="outlined"
              placeholder="linkedin.com/company/yourcompany"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

