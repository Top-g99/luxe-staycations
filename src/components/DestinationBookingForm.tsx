'use client';

import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { CalendarToday, LocationOn, People } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';

interface DestinationBookingFormProps {
  open: boolean;
  onClose: () => void;
  destination: string;
}

export default function DestinationBookingForm({ open, onClose, destination }: DestinationBookingFormProps) {
  const router = useRouter();
  const { setSearchFormData } = useBookingContext();
  
  const [formData, setFormData] = useState({
    destination: destination,
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.checkIn && formData.checkOut && formData.guests;

  const handleSubmit = () => {
    if (isFormValid) {
      setSearchFormData(formData);
      onClose();
      router.push('/villas');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Book Your Stay in {destination}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                value={formData.destination}
                InputProps={{
                  startAdornment: <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-in Date"
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleChange('checkIn', e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-out Date"
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleChange('checkOut', e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Number of Guests</InputLabel>
                <Select
                  value={formData.guests}
                  onChange={(e) => handleChange('guests', e.target.value as string)}
                  label="Number of Guests"
                  startAdornment={<People sx={{ color: 'text.secondary', mr: 1 }} />}
                >
                  <MenuItem value="1">1 Guest</MenuItem>
                  <MenuItem value="2">2 Guests</MenuItem>
                  <MenuItem value="3">3 Guests</MenuItem>
                  <MenuItem value="4">4 Guests</MenuItem>
                  <MenuItem value="5">5 Guests</MenuItem>
                  <MenuItem value="6">6 Guests</MenuItem>
                  <MenuItem value="7">7 Guests</MenuItem>
                  <MenuItem value="8">8 Guests</MenuItem>
                  <MenuItem value="9">9 Guests</MenuItem>
                  <MenuItem value="10">10+ Guests</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid}
          sx={{
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4a332c, #b45309)',
            }
          }}
        >
          Search Properties
        </Button>
      </DialogActions>
    </Dialog>
  );
}
