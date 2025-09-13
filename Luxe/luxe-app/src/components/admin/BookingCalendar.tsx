'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  ArrowBack,
  ArrowForward,
  Refresh,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  People,
  Hotel
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface BookingCalendarProps {
  propertyId?: string;
  showAllProperties?: boolean;
}

interface BookingData {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
  propertyName: string;
  propertyId: string;
}

interface MonthlyAvailability {
  [date: string]: {
    available: boolean;
    booking?: BookingData;
    revenue?: number;
  };
}

interface OccupancyStats {
  totalDays: number;
  bookedDays: number;
  availableDays: number;
  occupancyRate: number;
  totalRevenue: number;
  averageDailyRate: number;
}

export default function BookingCalendar({ 
  propertyId, 
  showAllProperties = false 
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState(propertyId || '');
  const [properties, setProperties] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAvailability>({});
  const [occupancyStats, setOccupancyStats] = useState<OccupancyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchMonthlyData();
    }
  }, [selectedProperty, currentDate]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/villas');
      const result = await response.json();
      
      if (result.success) {
        setProperties(result.data || []);
        if (!selectedProperty && result.data.length > 0) {
          setSelectedProperty(result.data[0].id);
        }
      } else {
        console.error('Failed to fetch properties:', result.error);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      
      const response = await fetch(
        `/api/availability?propertyId=${selectedProperty}&month=${month}&year=${year}`
      );
      const result = await response.json();
      
      if (result.success) {
        setMonthlyData(result.data.availability);
        setOccupancyStats(result.data.occupancy);
      } else {
        console.error('Failed to fetch monthly data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: string) => {
    const dayData = monthlyData[date];
    if (dayData && !dayData.available && dayData.booking) {
      setSelectedBooking(dayData.booking);
      setSelectedDate(date);
      setDialogOpen(true);
    }
  };

  const getDateColor = (date: string) => {
    const dayData = monthlyData[date];
    if (!dayData) return 'default';
    
    if (!dayData.available) {
      return 'error';
    }
    
    return 'success';
  };

  const getDateVariant = (date: string) => {
    const dayData = monthlyData[date];
    if (!dayData) return 'outlined';
    
    if (!dayData.available) {
      return 'filled';
    }
    
    return 'outlined';
  };

  const renderCalendar = () => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <Grid container spacing={1}>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = monthlyData[dateStr];
          const isToday = isSameDay(day, new Date());
          
          return (
            <Grid item xs={1.7} key={dateStr}>
              <Tooltip 
                title={
                  dayData && !dayData.available && dayData.booking
                    ? `Booked by ${dayData.booking.guestName} - ₹${dayData.booking.amount}`
                    : dayData && dayData.available
                    ? 'Available'
                    : 'No data'
                }
              >
                <Box
                  sx={{
                    p: 1,
                    minHeight: 60,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    cursor: dayData && !dayData.available ? 'pointer' : 'default',
                    backgroundColor: isToday ? '#fff3e0' : 'transparent',
                    '&:hover': {
                      backgroundColor: dayData && !dayData.available ? '#ffebee' : '#f5f5f5'
                    }
                  }}
                  onClick={() => handleDateClick(dateStr)}
                >
                  <Typography variant="caption" display="block">
                    {format(day, 'd')}
                  </Typography>
                  {dayData && (
                    <Chip
                      size="small"
                      label={dayData.available ? 'Available' : 'Booked'}
                      color={getDateColor(dateStr) as any}
                      variant={getDateVariant(dateStr) as any}
                      sx={{ fontSize: '0.6rem', height: 16 }}
                    />
                  )}
                  {dayData && !dayData.available && dayData.revenue && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      ₹{dayData.revenue}
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderOccupancyStats = () => {
    if (!occupancyStats) return null;
    
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Hotel color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {occupancyStats.occupancyRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Occupancy Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {occupancyStats.bookedDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Booked Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {occupancyStats.availableDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOn color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                ₹{occupancyStats.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday />
              Booking Calendar & Occupancy Analysis
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Property</InputLabel>
                <Select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  label="Select Property"
                  disabled={loading}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Loading properties...
                    </MenuItem>
                  ) : properties.length === 0 ? (
                    <MenuItem disabled>No properties found</MenuItem>
                  ) : (
                    properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name || property.title || `Property ${property.id}`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              <Tooltip title="Refresh Properties">
                <IconButton onClick={fetchProperties} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Refresh Calendar Data">
                <IconButton onClick={fetchMonthlyData} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handlePreviousMonth}>
                <ArrowBack />
              </IconButton>
              
              <Typography variant="h6">
                {format(currentDate, 'MMMM yyyy')}
              </Typography>
              
              <IconButton onClick={handleNextMonth}>
                <ArrowForward />
              </IconButton>
            </Box>
            
            {loading && <CircularProgress size={24} />}
          </Box>
          
          {renderOccupancyStats()}
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Monthly Calendar View
          </Typography>
          
          {renderCalendar()}
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Legend:</strong> Click on booked dates to view booking details. 
              Green indicates available dates, red indicates booked dates.
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Booking Details - {selectedDate && format(new Date(selectedDate), 'MMM dd, yyyy')}
        </DialogTitle>
        
        <DialogContent>
          {selectedBooking && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Guest Name</strong></TableCell>
                    <TableCell>{selectedBooking.guestName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Check-in</strong></TableCell>
                    <TableCell>{format(new Date(selectedBooking.checkIn), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Check-out</strong></TableCell>
                    <TableCell>{format(new Date(selectedBooking.checkOut), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={selectedBooking.status} 
                        color={selectedBooking.status === 'confirmed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell>₹{selectedBooking.amount.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Property</strong></TableCell>
                    <TableCell>{selectedBooking.propertyName}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
