'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Home,
  BookOnline,
  People,
  Payment
} from '@mui/icons-material';

export default function AdminAnalyticsPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹2,50,000',
      trend: '+15%',
      icon: <Payment />,
      color: '#4caf50'
    },
    {
      title: 'Total Bookings',
      value: '45',
      trend: '+8%',
      icon: <BookOnline />,
      color: '#2196f3'
    },
    {
      title: 'Active Properties',
      value: '12',
      trend: '+3%',
      icon: <Home />,
      color: '#ff9800'
    },
    {
      title: 'Total Guests',
      value: '156',
      trend: '+12%',
      icon: <People />,
      color: '#9c27b0'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        {stat.trend} from last month
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    bgcolor: stat.color, 
                    borderRadius: '50%', 
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48
                  }}>
                    {React.cloneElement(stat.icon, { sx: { color: 'white' } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Analytics charts and detailed reports will be implemented here.
        </Typography>
      </Box>
    </Box>
  );
}
