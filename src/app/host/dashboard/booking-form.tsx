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
  Grid,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Person,
  CalendarToday,
  Business,
  Payment,
  Save
} from '@mui/icons-material';
import { supabaseHostManager } from '@/lib/supabaseHostManager';
import { HostProperty } from '@/contexts/HostContext';

interface BookingFormProps {
  hostId: string;
  properties: HostProperty[];
}

interface BookingFormData {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  isSelfBooking: boolean;
  totalAmount: number;
}

export default function BookingForm({ hostId, properties }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    isSelfBooking: false,
    totalAmount: 0
  });
  const [selectedProperty, setSelectedProperty] = useState<HostProperty | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (formData.propertyId && properties.length > 0) {
      const property = properties.find(p => p.id === formData.propertyId);
      setSelectedProperty(property || null);
    }
  }, [formData.propertyId, properties]);

  useEffect(() => {
    if (selectedProperty && formData.checkIn && formData.checkOut) {
      calculateTotal();
    }
  }, [selectedProperty, formData.checkIn, formData.checkOut, formData.guests]);

  const calculateTotal = () => {
    if (!selectedProperty || !formData.checkIn || !formData.checkOut) return;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights > 0) {
      const basePrice = selectedProperty.pricing?.basePrice || selectedProperty.price || 0;
      // Calculate total: base price × number of nights (guests don't affect price for property rentals)
      const total = basePrice * nights;
      setFormData(prev => ({ ...prev, totalAmount: total }));
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelfBookingToggle = () => {
    const isSelf = !formData.isSelfBooking;
    setFormData(prev => ({
      ...prev,
      isSelfBooking: isSelf,
      guestName: isSelf ? 'Self Booking' : '',
      guestEmail: isSelf ? 'self@host.com' : '',
      guestPhone: isSelf ? 'N/A' : ''
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.propertyId) {
      setSnackbar({ open: true, message: 'Please select a property', severity: 'error' });
      return false;
    }
    if (!formData.guestName || !formData.guestEmail) {
      setSnackbar({ open: true, message: 'Please fill in guest details', severity: 'error' });
      return false;
    }
    if (!formData.checkIn || !formData.checkOut) {
      setSnackbar({ open: true, message: 'Please select check-in and check-out dates', severity: 'error' });
      return false;
    }
    if (formData.guests < 1) {
      setSnackbar({ open: true, message: 'Please specify number of guests', severity: 'error' });
      return false;
    }
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      setSnackbar({ open: true, message: 'Check-out date must be after check-in date', severity: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setOpenConfirmDialog(true);
  };

  const confirmBooking = async () => {
    try {
      // Create the booking in the host_bookings table
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      const { data, error } = await supabase
        .from('host_bookings')
        .insert([{
          property_id: formData.propertyId,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests: formData.guests,
          total_amount: formData.totalAmount,
          status: 'confirmed', // Auto-confirm host bookings
          payment_status: 'paid', // Auto-mark as paid for host bookings
          booking_date: new Date().toISOString(),
          special_requests: formData.specialRequests,
          is_self_booking: formData.isSelfBooking
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setSnackbar({ open: true, message: `Error creating booking: ${error.message}`, severity: 'error' });
        return;
      }

      setSnackbar({ open: true, message: 'Booking created successfully!', severity: 'success' });
      setOpenConfirmDialog(false);
      resetForm();
      
      // Refresh the page or trigger a callback to update the bookings list
      window.location.reload();
    } catch (error) {
      console.error('Error creating booking:', error);
      setSnackbar({ open: true, message: 'Error creating booking', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      specialRequests: '',
      isSelfBooking: false,
      totalAmount: 0
    });
    setSelectedProperty(null);
  };

  const getNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Create New Booking
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Property Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Property</InputLabel>
                <Select
                  value={formData.propertyId}
                  onChange={(e) => handleInputChange('propertyId', e.target.value)}
                  label="Select Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: 'primary.main' }} />
                        {property.name} - {property.location}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Self Booking Toggle */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isSelfBooking}
                    onChange={handleSelfBookingToggle}
                  />
                }
                label="Book for myself"
              />
            </Grid>

            {/* Guest Information */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Guest Name"
                value={formData.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                fullWidth
                required
                disabled={formData.isSelfBooking}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Guest Email"
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                fullWidth
                required
                disabled={formData.isSelfBooking}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Guest Phone"
                value={formData.guestPhone}
                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                fullWidth
                disabled={formData.isSelfBooking}
              />
            </Grid>

            {/* Dates and Guests */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Check In"
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Check Out"
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Number of Guests"
                type="number"
                value={formData.guests}
                onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Special Requests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            {/* Property Details and Pricing */}
            {selectedProperty && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Property Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Property Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedProperty.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {selectedProperty.location}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {selectedProperty.type || 'Villa'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Max Guests:</strong> {selectedProperty.maxGuests || selectedProperty.max_guests}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Pricing & Booking Summary
                      </Typography>
                      <Typography variant="body2">
                        <strong>Base Price:</strong> ₹{selectedProperty.pricing?.basePrice?.toLocaleString()}/night
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nights:</strong> {getNights()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Guests:</strong> {formData.guests}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" color="primary.main">
                        <strong>Total: ₹{formData.totalAmount.toLocaleString()}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                >
                  Reset Form
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit}
                  disabled={!formData.propertyId || !formData.checkIn || !formData.checkOut}
                >
                  Create Booking
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Booking
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedProperty?.name}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Guest Information</Typography>
              <Typography>Name: {formData.guestName}</Typography>
              <Typography>Email: {formData.guestEmail}</Typography>
              {formData.guestPhone && <Typography>Phone: {formData.guestPhone}</Typography>}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Booking Details</Typography>
              <Typography>Check In: {new Date(formData.checkIn).toLocaleDateString()}</Typography>
              <Typography>Check Out: {new Date(formData.checkOut).toLocaleDateString()}</Typography>
              <Typography>Guests: {formData.guests}</Typography>
              <Typography>Nights: {getNights()}</Typography>
              <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
                Total: ₹{formData.totalAmount.toLocaleString()}
              </Typography>
            </Box>

            {formData.specialRequests && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Special Requests</Typography>
                <Typography>{formData.specialRequests}</Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              This booking will be automatically confirmed and marked as paid. It will appear in the admin owner bookings section.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmBooking} variant="contained">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
