"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Schedule,
  Phone,
  VideoCall,
  Person,
  Close
} from '@mui/icons-material';
import { emailService } from '@/lib/emailService';

interface ConsultationFormProps {
  open: boolean;
  onClose: () => void;
  source?: string; // To track where the consultation request came from
}

interface ConsultationFormData {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyDescription: string;
  consultationType: 'phone' | 'video' | 'in-person';
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
}

export default function ConsultationForm({ open, onClose, source = 'partner-page' }: ConsultationFormProps) {
  const [formData, setFormData] = useState<ConsultationFormData>({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    propertyDescription: '',
    consultationType: 'phone',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const propertyTypes = [
    'Villa',
    'Apartment',
    'Resort',
    'Hotel',
    'Guest House',
    'Farmhouse',
    'Beach House',
    'Mountain Cabin',
    'Other'
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          additionalNotes: `${formData.additionalNotes}\n\nSource: ${source}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit consultation request');
      }

      setSuccess(true);
      
      // Send confirmation email
      console.log('Email service configured:', emailService.isConfigured);
      if (emailService.isConfigured) {
        const consultationData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          propertyType: formData.propertyType,
          location: formData.location,
          consultationType: formData.consultationType,
          requestId: 'CR-' + Date.now()
        };
        
        console.log('Attempting to send consultation email:', consultationData);
        try {
          // Use delivery tracking service for better monitoring
          const { emailDeliveryService } = await import('@/lib/emailDeliveryService');
          const result = await emailDeliveryService.sendConsultationRequestWithTracking(consultationData);
          console.log('Email sending result:', result);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't show error to user, just log it
        }
      } else {
        console.log('Email service not configured, skipping email sending');
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form data
        setFormData({
          name: '',
          email: '',
          phone: '',
          propertyType: '',
          location: '',
          bedrooms: 1,
          bathrooms: 1,
          maxGuests: 2,
          propertyDescription: '',
          consultationType: 'phone',
          preferredDate: '',
          preferredTime: '',
          additionalNotes: ''
        });
      }, 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
      setSuccess(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
          ✅ Consultation Request Submitted!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
            Thank you for your consultation request!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Our partnership team will review your request and contact you within 24 hours to schedule your consultation.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll receive a confirmation email shortly with further details.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleClose()}
            sx={{ bgcolor: 'var(--primary-dark)' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'var(--primary-dark)', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Schedule Free Consultation
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 'auto' }}
          disabled={loading}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Tell us about your partnership goals and we'll schedule a personalized consultation to help you succeed with Luxe Staycations.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', fontWeight: 600 }}>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
              />
            </Grid>

            {/* Property Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', fontWeight: 600, mt: 2 }}>
                Property Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.propertyType}
                  label="Property Type"
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  disabled={loading}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (City, State)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                required
                disabled={loading}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                required
                disabled={loading}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) || 2 })}
                required
                disabled={loading}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Description"
                multiline
                rows={3}
                value={formData.propertyDescription}
                onChange={(e) => setFormData({ ...formData, propertyDescription: e.target.value })}
                required
                disabled={loading}
                helperText="Describe your property, amenities, and unique features"
              />
            </Grid>

            {/* Consultation Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)', fontWeight: 600, mt: 2 }}>
                Consultation Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Consultation Type</InputLabel>
                <Select
                  value={formData.consultationType}
                  label="Consultation Type"
                  onChange={(e) => setFormData({ ...formData, consultationType: e.target.value as any })}
                  disabled={loading}
                >
                  <MenuItem value="phone">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 20 }} />
                      Phone Call
                    </Box>
                  </MenuItem>
                  <MenuItem value="video">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoCall sx={{ fontSize: 20 }} />
                      Video Call
                    </Box>
                  </MenuItem>
                  <MenuItem value="in-person">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 20 }} />
                      In-Person Meeting
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Date"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Preferred Time</InputLabel>
                <Select
                  value={formData.preferredTime}
                  label="Preferred Time"
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  disabled={loading}
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                disabled={loading}
                helperText="Tell us about your partnership goals, specific questions, or any other information you'd like to discuss"
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={(e) => handleSubmit(e)}
          disabled={loading || !formData.name || !formData.email || !formData.phone || !formData.propertyType || !formData.location || !formData.propertyDescription || !formData.preferredDate || !formData.preferredTime}
          sx={{
            bgcolor: 'var(--primary-dark)',
            px: 4,
            '&:hover': { bgcolor: 'var(--primary-light)' },
            '&:disabled': { bgcolor: 'grey.400' }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: 'white' }} />
              Submitting...
            </Box>
          ) : (
            'Schedule Consultation'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
