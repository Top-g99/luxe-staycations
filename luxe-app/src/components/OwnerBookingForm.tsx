"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  CalendarToday,
  People,
  Business,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { bookingManager } from '@/lib/dataManager';
import { partnerAuthManager } from '@/lib/partnerAuthManager';
import { partnerDashboardManager } from '@/lib/partnerDashboardManager';
import { typographyStyles, buttonStyles, cardStyles } from './BrandStyles';

interface OwnerBookingFormProps {
  onBookingCreated?: () => void;
}

export default function OwnerBookingForm({ onBookingCreated }: OwnerBookingFormProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    purpose: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  useEffect(() => {
    loadUserAndProperties();
  }, []);

  const loadUserAndProperties = () => {
    const user = partnerAuthManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const userProperties = partnerDashboardManager.getPartnerProperties(user.id);
      setProperties(userProperties);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check availability when dates change
    if ((field === 'checkIn' || field === 'checkOut') && formData.propertyId) {
      checkAvailability();
    }
  };

  const checkAvailability = () => {
    if (!formData.propertyId || !formData.checkIn || !formData.checkOut) {
      setAvailabilityChecked(false);
      setIsAvailable(false);
      return;
    }

    // For now, assume all dates are available (can be enhanced later with proper availability checking)
    const available = true;

    setAvailabilityChecked(true);
    setIsAvailable(available);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !formData.propertyId || !formData.checkIn || !formData.checkOut) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    if (!isAvailable) {
      setSnackbar({
        open: true,
        message: 'Selected dates are not available for booking',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const selectedProperty = properties.find(p => p.id === formData.propertyId);
      
      const bookingData = {
        partnerId: currentUser.id,
        propertyId: formData.propertyId,
        propertyName: selectedProperty?.propertyName || 'Unknown Property',
        ownerName: currentUser.contactPerson,
        ownerEmail: currentUser.email,
        ownerPhone: currentUser.phone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        purpose: formData.purpose,
        specialRequests: formData.specialRequests
      };

      // Save to Supabase using bookingManager
      await bookingManager.initialize();
      const newBooking = await bookingManager.create({
        propertyId: formData.propertyId,
        guestName: currentUser.contactPerson,
        guestEmail: currentUser.email,
        guestPhone: currentUser.phone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        totalAmount: 0, // Owner booking - no charge
        status: 'pending',
        specialRequests: formData.specialRequests || ''
      });

      setSnackbar({
        open: true,
        message: 'Owner booking request submitted successfully! Admin will review and approve.',
        severity: 'success'
      });

      // Reset form
      setFormData({
        propertyId: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        purpose: '',
        specialRequests: ''
      });
      setAvailabilityChecked(false);
      setIsAvailable(false);

      // Notify parent component
      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error submitting booking request. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProperty = () => {
    return properties.find(p => p.id === formData.propertyId);
  };

  return (
    <Box>
      <Card sx={{ ...cardStyles.primary, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Business sx={{ fontSize: 32, color: 'var(--secondary-dark)', mr: 2 }} />
            <Typography variant="h5" sx={{ ...typographyStyles.h5 }}>
              Book Your Own Property
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Request to book your own property for personal use. Your request will be reviewed by our admin team.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Property Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Property</InputLabel>
                  <Select
                    value={formData.propertyId}
                    onChange={(e) => handleInputChange('propertyId', e.target.value)}
                    label="Select Property"
                  >
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.propertyName} - {property.location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Property Details */}
              {getSelectedProperty() && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'var(--background-light)', borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'var(--primary-dark)' }}>
                      Property Details
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {getSelectedProperty()?.propertyName} • {getSelectedProperty()?.propertyType} • {getSelectedProperty()?.location}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Check-in Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>

              {/* Check-out Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Check-out Date"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{
                    min: formData.checkIn || new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>

              {/* Number of Guests */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Guests"
                  type="number"
                  value={formData.guests}
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                  required
                  InputProps={{
                    startAdornment: <People sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{
                    min: 1,
                    max: 20
                  }}
                />
              </Grid>

              {/* Purpose */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Purpose of Stay</InputLabel>
                  <Select
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    label="Purpose of Stay"
                  >
                    <MenuItem value="personal">Personal Use</MenuItem>
                    <MenuItem value="family">Family Visit</MenuItem>
                    <MenuItem value="maintenance">Property Maintenance</MenuItem>
                    <MenuItem value="inspection">Property Inspection</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Special Requests */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests (Optional)"
                  multiline
                  rows={3}
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requirements or requests..."
                />
              </Grid>

              {/* Availability Status */}
              {availabilityChecked && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isAvailable ? (
                      <>
                        <CheckCircle sx={{ color: 'success.main' }} />
                        <Chip
                          label="Available for booking"
                          color="success"
                          variant="outlined"
                        />
                      </>
                    ) : (
                      <>
                        <Error sx={{ color: 'error.main' }} />
                        <Chip
                          label="Not available for selected dates"
                          color="error"
                          variant="outlined"
                        />
                      </>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !isAvailable}
                  sx={{
                    ...buttonStyles.primary,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Submit Booking Request'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

