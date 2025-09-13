'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  Close,
  CheckCircle,
  Cancel,
  Warning,
  Info
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns';

interface DatePickerWithAvailabilityProps {
  value: { checkIn: Date | null; checkOut: Date | null };
  onChange: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  propertyId?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  showAvailability?: boolean;
  onAvailabilityCheck?: (available: boolean, message: string) => void;
  sx?: any;
}

interface AvailabilityData {
  [date: string]: {
    available: boolean;
    bookingId?: string;
    status?: string;
  };
}

export default function DatePickerWithAvailability({
  value,
  onChange,
  propertyId,
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
  disabled = false,
  label = "Select Dates",
  placeholder = "Choose check-in and check-out dates",
  showAvailability = true,
  onAvailabilityCheck,
  sx
}: DatePickerWithAvailabilityProps) {
  const [open, setOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable' | 'checking' | null>(null);

  // Fetch availability data when propertyId changes
  useEffect(() => {
    if (propertyId && showAvailability) {
      fetchAvailability();
    }
  }, [propertyId, showAvailability]);

  // Check availability when dates change
  useEffect(() => {
    if (value.checkIn && value.checkOut && propertyId && showAvailability) {
      checkDateAvailability();
    }
  }, [value.checkIn, value.checkOut, propertyId, showAvailability]);

  const fetchAvailability = async () => {
    if (!propertyId) return;
    
    setLoading(true);
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 90), 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/availability?propertyId=${propertyId}&startDate=${startDate}&endDate=${endDate}`
      );
      const result = await response.json();
      
      if (result.success) {
        setAvailability(result.data.availability);
      } else {
        console.error('Failed to fetch availability:', result.error);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDateAvailability = async () => {
    if (!value.checkIn || !value.checkOut || !propertyId) return;
    
    setAvailabilityStatus('checking');
    setLoading(true);
    
    try {
      const startDate = format(value.checkIn, 'yyyy-MM-dd');
      const endDate = format(value.checkOut, 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/availability?propertyId=${propertyId}&startDate=${startDate}&endDate=${endDate}`
      );
      const result = await response.json();
      
      if (result.success) {
        const availabilityData = result.data.availability;
        const isAvailable = Object.values(availabilityData).every((day: any) => day.available);
        
        if (isAvailable) {
          setAvailabilityStatus('available');
          setAvailabilityMessage('Selected dates are available for booking!');
          onAvailabilityCheck?.(true, 'Selected dates are available for booking!');
        } else {
          setAvailabilityStatus('unavailable');
          const unavailableDates = Object.entries(availabilityData)
            .filter(([_, day]: [string, any]) => !day.available)
            .map(([date, _]) => format(new Date(date), 'MMM dd, yyyy'));
          
          setAvailabilityMessage(`Selected dates are not available. Unavailable dates: ${unavailableDates.join(', ')}`);
          onAvailabilityCheck?.(false, `Selected dates are not available. Unavailable dates: ${unavailableDates.join(', ')}`);
        }
      } else {
        setAvailabilityStatus('unavailable');
        setAvailabilityMessage('Unable to check availability. Please try again.');
        onAvailabilityCheck?.(false, 'Unable to check availability. Please try again.');
      }
    } catch (error) {
      setAvailabilityStatus('unavailable');
      setAvailabilityMessage('Error checking availability. Please try again.');
      onAvailabilityCheck?.(false, 'Error checking availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'checkIn' | 'checkOut', date: Date | null) => {
    if (field === 'checkIn') {
      onChange({ checkIn: date, checkOut: value.checkOut });
    } else {
      onChange({ checkIn: value.checkIn, checkOut: date });
    }
  };

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      return true;
    }
    
    if (showAvailability && propertyId) {
      const dateStr = format(date, 'yyyy-MM-dd');
      return !availability[dateStr]?.available;
    }
    
    return false;
  };

  const getDateStatus = (date: Date) => {
    if (!showAvailability || !propertyId) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability[dateStr];
    
    if (!dayAvailability) return null;
    
    if (!dayAvailability.available) {
      return {
        status: 'booked',
        message: `Booked (${dayAvailability.status})`
      };
    }
    
    return {
      status: 'available',
      message: 'Available'
    };
  };

  const formatDateRange = () => {
    if (!value.checkIn && !value.checkOut) {
      return placeholder;
    }
    
    if (value.checkIn && value.checkOut) {
      return `${format(value.checkIn, 'MMM dd, yyyy')} - ${format(value.checkOut, 'MMM dd, yyyy')}`;
    }
    
    if (value.checkIn) {
      return `Check-in: ${format(value.checkIn, 'MMM dd, yyyy')}`;
    }
    
    if (value.checkOut) {
      return `Check-out: ${format(value.checkOut, 'MMM dd, yyyy')}`;
    }
    
    return placeholder;
  };

  const getAvailabilityIcon = () => {
    switch (availabilityStatus) {
      case 'available':
        return <CheckCircle color="success" />;
      case 'unavailable':
        return <Cancel color="error" />;
      case 'checking':
        return <CircularProgress size={20} />;
      default:
        return <Info color="info" />;
    }
  };

  const getAvailabilityColor = () => {
    switch (availabilityStatus) {
      case 'available':
        return 'success';
      case 'unavailable':
        return 'error';
      case 'checking':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <TextField
          fullWidth
          label={label}
          value={formatDateRange()}
          onClick={() => setOpen(true)}
          disabled={disabled}
          sx={{
            ...sx,
            '& .MuiInputBase-input': {
              cursor: 'pointer'
            }
          }}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showAvailability && availabilityStatus && (
                  <Tooltip title={availabilityMessage}>
                    {getAvailabilityIcon()}
                  </Tooltip>
                )}
                <CalendarToday color="action" />
              </Box>
            )
          }}
        />
        
        {showAvailability && availabilityMessage && (
          <Alert 
            severity={getAvailabilityColor() as any} 
            sx={{ mt: 1 }}
            icon={getAvailabilityIcon()}
          >
            {availabilityMessage}
          </Alert>
        )}

        <Dialog 
          open={open} 
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #5a3d35, #d97706)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            Select Check-in & Check-out Dates
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {showAvailability && propertyId && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Real-time Availability:</strong> Dates marked in red are already booked. 
                  Only available dates can be selected.
                </Typography>
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Check-in Date"
                  value={value.checkIn}
                  onChange={(date) => handleDateChange('checkIn', date)}
                  minDate={minDate}
                  maxDate={maxDate}
                  shouldDisableDate={isDateDisabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Select your arrival date'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Check-out Date"
                  value={value.checkOut}
                  onChange={(date) => handleDateChange('checkOut', date)}
                  minDate={value.checkIn ? addDays(value.checkIn, 1) : minDate}
                  maxDate={maxDate}
                  shouldDisableDate={isDateDisabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Select your departure date'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            {showAvailability && propertyId && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Availability Legend
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<CheckCircle />} 
                    label="Available" 
                    color="success" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<Cancel />} 
                    label="Booked" 
                    color="error" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<Warning />} 
                    label="Past Date" 
                    color="default" 
                    variant="outlined" 
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, background: '#f5f5f5' }}>
            <Button onClick={() => setOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={() => setOpen(false)} 
              variant="contained"
              disabled={!value.checkIn || !value.checkOut || availabilityStatus === 'unavailable'}
              sx={{
                background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a332c, #b45309)',
                }
              }}
            >
              Confirm Dates
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
