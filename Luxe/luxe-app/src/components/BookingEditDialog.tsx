'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
import { isAdmin } from '@/lib/adminPermissions';

interface Booking {
  id?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  propertyId: string;
  propertyName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount?: number;
  amount?: number;
  status: string;
  specialRequests?: string;
}

interface BookingEditDialogProps {
  open: boolean;
  onClose: () => void;
  booking?: Booking | null;
  mode: 'create' | 'edit' | 'view';
  onDelete?: (booking: Booking) => void;
}

export default function BookingEditDialog({ open, onClose, booking, mode, onDelete }: BookingEditDialogProps) {
  const [formData, setFormData] = useState<Booking>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    propertyId: '',
    propertyName: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    totalAmount: 0,
    amount: 0,
    status: 'Pending',
    specialRequests: ''
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (booking) {
      setFormData(booking);
    } else {
      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        propertyId: '',
        propertyName: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        totalAmount: 0,
        amount: 0,
        status: 'Pending',
        specialRequests: ''
      });
    }
    setError('');
  }, [booking]);

  const handleChange = (field: keyof Booking, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.guestName || !formData.guestEmail || !formData.propertyId || 
          !formData.checkIn || !formData.checkOut || (formData.totalAmount || formData.amount || 0) <= 0) {
        setError('Please fill in all required fields');
        return;
      }

      // Here you would typically make an API call to save the booking
      console.log('Saving booking:', formData);
      
      // For now, just close the dialog
      onClose();
    } catch (error) {
      setError('Failed to save booking. Please try again.');
    }
  };

  const handleDelete = () => {
    if (!booking || !onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete this booking for ${booking.guestName}? This action cannot be undone.`)) {
      onDelete(booking);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #5a3d35, #d97706)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {mode === 'create' ? 'Create New Booking' : mode === 'edit' ? 'Edit Booking' : 'View Booking Details'}
        <Button onClick={onClose} sx={{ color: 'white', minWidth: 'auto' }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Guest Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#d97706' }}>
              Guest Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guest Name *"
              value={formData.guestName}
              onChange={(e) => handleChange('guestName', e.target.value)}
              required
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guest Email *"
              type="email"
              value={formData.guestEmail}
              onChange={(e) => handleChange('guestEmail', e.target.value)}
              required
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guest Phone"
              value={formData.guestPhone}
              onChange={(e) => handleChange('guestPhone', e.target.value)}
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Number of Guests *"
              type="number"
              value={formData.guests}
              onChange={(e) => handleChange('guests', parseInt(e.target.value))}
              required
              disabled={mode === 'view'}
            />
          </Grid>

          {/* Property Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#d97706', mt: 2 }}>
              Property Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Property ID *"
              value={formData.propertyId}
              onChange={(e) => handleChange('propertyId', e.target.value)}
              required
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Property Name"
              value={formData.propertyName}
              onChange={(e) => handleChange('propertyName', e.target.value)}
              disabled={mode === 'view'}
            />
          </Grid>

          {/* Booking Details */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#d97706', mt: 2 }}>
              Booking Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Check-in Date *"
              type="date"
              value={formData.checkIn}
              onChange={(e) => handleChange('checkIn', e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Check-out Date *"
              type="date"
              value={formData.checkOut}
              onChange={(e) => handleChange('checkOut', e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Amount *"
              type="number"
              value={formData.totalAmount || formData.amount || 0}
              onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value))}
              required
              disabled={mode === 'view'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
                disabled={mode === 'view'}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Special Requests"
              multiline
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => handleChange('specialRequests', e.target.value)}
              disabled={mode === 'view'}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: '#f5f5f5' }}>
        {mode === 'view' ? (
          <>
            {isAdmin() && onDelete && (
              <Button 
                onClick={handleDelete} 
                variant="contained"
                color="error"
                startIcon={<Delete />}
                sx={{ mr: 'auto' }}
              >
                Delete Booking
              </Button>
            )}
            <Button onClick={onClose} variant="contained" sx={{ ml: 'auto' }}>
              Close
            </Button>
          </>
        ) : (
          <>
            {isAdmin() && onDelete && mode === 'edit' && (
              <Button 
                onClick={handleDelete} 
                variant="contained"
                color="error"
                startIcon={<Delete />}
                sx={{ mr: 'auto' }}
              >
                Delete Booking
              </Button>
            )}
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              startIcon={<Save />}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              {mode === 'create' ? 'Create Booking' : 'Save Changes'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

