"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Save,
  Refresh,
  CheckCircle,
  Error,
  Instagram,
  Visibility,
  VisibilityOff,
  Info,
  ExpandMore,
  Photo,
  VideoLibrary,
  Analytics,
  TrendingUp,
  People,
  Message
} from '@mui/icons-material';
import { instagramService, InstagramConfig } from '@/lib/instagramService';

const defaultInstagramConfig: InstagramConfig = {
  id: '1',
  access_token: '',
  user_id: '',
  username: '',
  businessAccountId: '',
  instagramAccountId: '',
  webhookVerifyToken: '',
  apiVersion: '18.0',
  enabled: false,
  is_active: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export default function InstagramSettingsForm() {
  const [config, setConfig] = useState<InstagramConfig>(defaultInstagramConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      await instagramService.initialize();
      const savedConfig = instagramService.getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
        setIsConfigured(instagramService.isServiceConfigured());
      }
    } catch (error) {
      console.error('Error loading Instagram configuration:', error);
    }
  };

  const handleInputChange = (field: keyof InstagramConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const success = await instagramService.configure(config);
      if (success) {
        setIsConfigured(instagramService.isServiceConfigured());
        setAlert({
          open: true,
          message: 'Instagram configuration saved successfully!',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: 'Failed to save Instagram configuration',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving Instagram configuration:', error);
      setAlert({
        open: true,
        message: 'Error saving Instagram configuration',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!isConfigured) {
      setAlert({
        open: true,
        message: 'Please save configuration first',
        severity: 'info'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await instagramService.testConnection();
      setAlert({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error testing Instagram connection:', error);
      setAlert({
        open: true,
        message: 'Error testing Instagram connection',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfig = () => {
    setConfig(defaultInstagramConfig);
    setIsConfigured(false);
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Instagram sx={{ fontSize: 32, color: '#E4405F', mr: 2 }} />
            <Box>
              <Typography variant="h5" gutterBottom>
                Instagram Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect your Instagram Business account to manage posts, stories, and analytics
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Configuration Status */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6">Configuration Status</Typography>
              <Chip
                label={isConfigured ? 'Configured' : 'Not Configured'}
                color={isConfigured ? 'success' : 'default'}
                icon={isConfigured ? <CheckCircle /> : <Error />}
              />
            </Box>
            
            {isConfigured && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Instagram integration is active and ready to use!
              </Alert>
            )}
          </Box>

          {/* Configuration Form */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enabled}
                    onChange={handleInputChange('enabled')}
                    color="primary"
                  />
                }
                label="Enable Instagram Integration"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Access Token"
                value={config.access_token}
                onChange={handleInputChange('access_token')}
                type={showAccessToken ? 'text' : 'password'}
                variant="outlined"
                placeholder="Enter your Instagram access token"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      edge="end"
                    >
                      {showAccessToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                helperText="Get this from Facebook Developer Console"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Account ID"
                value={config.businessAccountId}
                onChange={handleInputChange('businessAccountId')}
                variant="outlined"
                placeholder="Enter your Facebook Business Account ID"
                helperText="Found in Facebook Business Manager"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram Account ID"
                value={config.instagramAccountId}
                onChange={handleInputChange('instagramAccountId')}
                variant="outlined"
                placeholder="Enter your Instagram Business Account ID"
                helperText="Your Instagram Business account ID"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Webhook Verify Token"
                value={config.webhookVerifyToken}
                onChange={handleInputChange('webhookVerifyToken')}
                variant="outlined"
                placeholder="Enter webhook verification token"
                helperText="For webhook verification (optional)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Version"
                value={config.apiVersion}
                onChange={handleInputChange('apiVersion')}
                variant="outlined"
                placeholder="18.0"
                helperText="Instagram Graph API version"
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleSaveConfig()}
              disabled={isLoading || !config.enabled}
              sx={{
                background: 'linear-gradient(45deg, #E4405F, #C13584)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d63384, #a02d6b)',
                }
              }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Save Configuration'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<CheckCircle />}
              onClick={() => handleTestConnection()}
              disabled={isLoading || !isConfigured}
            >
              Test Connection
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleResetConfig}
              disabled={isLoading}
            >
              Reset
            </Button>
          </Box>

          {/* Features Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Available Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Photo />
                  </ListItemIcon>
                  <ListItemText
                    primary="Post Management"
                    secondary="View, create, and manage Instagram posts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <VideoLibrary />
                  </ListItemIcon>
                  <ListItemText
                    primary="Story Management"
                    secondary="Create and manage Instagram stories"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Analytics />
                  </ListItemIcon>
                  <ListItemText
                    primary="Analytics & Insights"
                    secondary="Track engagement, reach, and performance metrics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Performance Tracking"
                    secondary="Monitor hashtag performance and best posting times"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText
                    primary="Audience Insights"
                    secondary="Understand your audience demographics and behavior"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Message />
                  </ListItemIcon>
                  <ListItemText
                    primary="Comment Management"
                    secondary="View and respond to comments on your posts"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Setup Instructions */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Setup Instructions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  How to get your Instagram Business API credentials:
                </Typography>
                <ol>
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                  <li>Create a new app or use an existing one</li>
                  <li>Add Instagram Basic Display product to your app</li>
                  <li>Get your App ID and App Secret</li>
                  <li>Generate a long-lived access token</li>
                  <li>Get your Instagram Business Account ID</li>
                  <li>Enter the credentials above and test the connection</li>
                </ol>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> You need an Instagram Business account and a Facebook Page connected to it to use the Instagram Business API.
                  </Typography>
                </Alert>
              </Box>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
