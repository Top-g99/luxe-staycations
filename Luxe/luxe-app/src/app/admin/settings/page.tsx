"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  Security,
  Refresh,
  Warning,
  Settings,
  Payment,
  Notifications,
  Business,
  WhatsApp,
  Instagram,
  Email
} from '@mui/icons-material';
import { AdminAuthManager } from '@/lib/adminAuth';
import GeneralSettingsForm from '@/components/settings/GeneralSettingsForm';
import BusinessProfileForm from '@/components/settings/BusinessProfileForm';
import PaymentSettingsForm from '@/components/settings/PaymentSettingsForm';
import EmailSettingsForm from '@/components/settings/EmailSettingsForm';
import EnhancedEmailSettingsForm from '@/components/settings/EnhancedEmailSettingsForm';
import RazorpaySettingsForm from '@/components/settings/RazorpaySettingsForm';
import WhatsAppSettingsForm from '@/components/settings/WhatsAppSettingsForm';
import InstagramSettingsForm from '@/components/settings/InstagramSettingsForm';
import BrevoSettingsForm from '@/components/settings/BrevoSettingsForm';

// Error boundary wrapper for settings components
const SettingsWrapper = ({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Settings component error:', error);
    return fallback || (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Component Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There was an error loading this component. Please refresh and try again.
          </Typography>
        </CardContent>
      </Card>
    );
  }
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [settingsInitialized, setSettingsInitialized] = useState(false);
  
  // Password management states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({ isLoggedIn: false, loginTime: null as string | null, remainingTime: 0 });

  useEffect(() => {
    // Get session information
    const info = AdminAuthManager.getSessionInfo();
    setSessionInfo(info);
    
    // Initialize settings manager
    if (typeof window !== 'undefined') {
      import('@/lib/settingsManager').then(({ settingsManager }) => {
        try {
          settingsManager.initialize();
          console.log('Settings manager initialized successfully');
          
          // Test if settings are loaded
          const generalSettings = settingsManager.getSettingsByCategory('general');
          const businessProfile = settingsManager.getBusinessProfile();
          const paymentSettings = settingsManager.getPaymentSettings();
          
          console.log('General settings loaded:', generalSettings?.length || 0);
          console.log('Business profile loaded:', !!businessProfile);
          console.log('Payment settings loaded:', !!paymentSettings);
          
          setSettingsInitialized(true);
        } catch (error) {
          console.error('Error during settings manager initialization:', error);
          setSettingsInitialized(true); // Set to true even on error to show error state
        }
      }).catch(error => {
        console.error('Error importing settings manager:', error);
        setSettingsInitialized(true); // Set to true even on error to show error state
      });
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match', severity: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters long', severity: 'error' });
      return;
    }

    setLoading(true);

    try {
      const success = AdminAuthManager.changePassword(currentPassword, newPassword);
      
      if (success) {
        setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSnackbar({ open: true, message: 'Current password is incorrect', severity: 'error' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setSnackbar({ open: true, message: 'An error occurred while changing password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetCredentials = () => {
    try {
      AdminAuthManager.resetToDefault();
      setSnackbar({ 
        open: true, 
        message: 'Credentials reset to default. Username: admin, Password: luxe2024!', 
        severity: 'success' 
      });
      setResetDialogOpen(false);
    } catch (error) {
      console.error('Reset error:', error);
      setSnackbar({ open: true, message: 'An error occurred while resetting credentials', severity: 'error' });
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getCurrentCredentials = () => {
    const credentials = AdminAuthManager.getCredentials();
    return credentials;
  };

  const credentials = getCurrentCredentials();

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <SettingsWrapper>
            <GeneralSettingsForm />
          </SettingsWrapper>
        );
      case 1:
        return (
          <SettingsWrapper>
            <PaymentSettingsForm />
          </SettingsWrapper>
        );
      case 2:
        return (
          <SettingsWrapper>
            <BusinessProfileForm />
          </SettingsWrapper>
        );
      case 3:
        return renderSecuritySettings();
      case 4:
        return (
          <SettingsWrapper>
            <EnhancedEmailSettingsForm />
          </SettingsWrapper>
        );
      case 5:
        return (
          <SettingsWrapper>
            <RazorpaySettingsForm />
          </SettingsWrapper>
        );
      case 6:
        return (
          <SettingsWrapper>
            <WhatsAppSettingsForm />
          </SettingsWrapper>
        );
      case 7:
        return (
          <SettingsWrapper>
            <InstagramSettingsForm />
          </SettingsWrapper>
        );
      case 8:
        return (
          <SettingsWrapper>
            <BrevoSettingsForm />
          </SettingsWrapper>
        );
      default:
        return (
          <SettingsWrapper>
            <GeneralSettingsForm />
          </SettingsWrapper>
        );
    }
  };

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      {/* Current Session Info */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 2, color: 'var(--primary-dark)' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Current Session
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Username
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {credentials?.username || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Login Time
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {sessionInfo.loginTime ? new Date(sessionInfo.loginTime).toLocaleString() : 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Session Status
              </Typography>
              <Chip 
                label={sessionInfo.isLoggedIn ? 'Active' : 'Expired'} 
                color={sessionInfo.isLoggedIn ? 'success' : 'error'}
                size="small"
              />
            </Box>

            {sessionInfo.isLoggedIn && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Remaining Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatTime(sessionInfo.remainingTime)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Password Change */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Lock sx={{ mr: 2, color: 'var(--primary-dark)' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Change Password
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => handlePasswordChange()}
              disabled={loading}
              sx={{
                background: 'var(--primary-dark)',
                '&:hover': { background: 'var(--secondary-dark)' }
              }}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Reset Credentials */}
      <Grid item xs={12}>
        <Card sx={{ border: '1px solid #ff9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning sx={{ mr: 2, color: '#ff9800' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                Reset Credentials
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This will reset your admin credentials to the default values. Use this option if you've forgotten your password.
              <br />
              <strong>Default Username:</strong> admin
              <br />
              <strong>Default Password:</strong> luxe2024!
            </Typography>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<Refresh />}
              onClick={() => setResetDialogOpen(true)}
              sx={{ borderColor: '#ff9800', color: '#ff9800' }}
            >
              Reset to Default
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ 
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        color: 'var(--primary-dark)',
        mb: 4
      }}>
        Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
              fontWeight: 500
            },
            '& .Mui-selected': {
              color: 'var(--primary-dark)'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary-dark)'
            }
          }}
        >
          <Tab 
            label="General" 
            icon={<Settings />} 
            iconPosition="start"
          />
          <Tab 
            label="Payment" 
            icon={<Payment />} 
            iconPosition="start"
          />
          <Tab 
            label="Business Profile" 
            icon={<Business />} 
            iconPosition="start"
          />
          <Tab 
            label="Security" 
            icon={<Security />} 
            iconPosition="start"
          />
          <Tab 
            label="Email Settings" 
            icon={<Notifications />} 
            iconPosition="start"
          />
          <Tab 
            label="Razorpay Gateway" 
            icon={<Payment />} 
            iconPosition="start"
          />
          <Tab 
            label="WhatsApp" 
            icon={<WhatsApp />} 
            iconPosition="start"
          />
          <Tab 
            label="Instagram" 
            icon={<Instagram />} 
            iconPosition="start"
          />
          <Tab 
            label="Brevo Email" 
            icon={<Email />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {!settingsInitialized ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Initializing Settings...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        renderTabContent()
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Admin Credentials</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the admin credentials to default values? 
            This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            You will need to log in again with the default credentials after reset.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleResetCredentials()} color="warning" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}