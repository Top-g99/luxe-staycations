'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import BookingCalendar from '@/components/admin/BookingCalendar';

export default function AdminBookingCalendarPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: '#5a3d35',
          fontWeight: 600,
          mb: 4
        }}>
          Booking Calendar & Occupancy Analysis
        </Typography>
        
        <BookingCalendar showAllProperties={true} />
      </Box>
    </Container>
  );
}
