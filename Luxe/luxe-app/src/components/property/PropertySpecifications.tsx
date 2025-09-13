'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Bed,
  Bathtub,
  SquareFoot,
  Home,
  AccessTime,
  Rule,
  SmokingRooms,
  Pets,
  Celebration
} from '@mui/icons-material';

interface PropertySpecificationsProps {
  specifications?: {
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    propertyType: string;
    checkInTime: string;
    checkOutTime: string;
    houseRules: string[];
  };
  policies?: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    smoking: boolean;
    pets: boolean;
    parties: boolean;
  };
  maxGuests: number;
}

export default function PropertySpecifications({
  specifications,
  policies,
  maxGuests
}: PropertySpecificationsProps) {
  if (!specifications && !policies) {
    return null;
  }

  return (
    <Box>
      {/* Property Details */}
      {specifications && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Property Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Bed sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {specifications.bedrooms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bedroom{specifications.bedrooms > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Bathtub sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {specifications.bathrooms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bathroom{specifications.bathrooms > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <SquareFoot sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {specifications.sqft}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sq Ft
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Home sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {maxGuests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Guest{maxGuests > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AccessTime sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Check-in
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {specifications.checkInTime}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AccessTime sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Check-out
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {specifications.checkOutTime}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Property Type
              </Typography>
              <Chip label={specifications.propertyType} color="primary" variant="outlined" />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* House Rules */}
      {specifications?.houseRules && specifications.houseRules.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rule />
              House Rules
            </Typography>
            <List dense>
              {specifications.houseRules.map((rule, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={rule} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Policies */}
      {policies && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Policies
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Cancellation Policy
                </Typography>
                <Typography variant="body1">
                  {policies.cancellation}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Check-in Policy
                </Typography>
                <Typography variant="body1">
                  {policies.checkIn}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {policies.smoking ? (
                    <SmokingRooms sx={{ color: 'error.main' }} />
                  ) : (
                    <SmokingRooms sx={{ color: 'success.main' }} />
                  )}
                  <Typography variant="body2">
                    {policies.smoking ? 'Smoking Allowed' : 'No Smoking'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {policies.pets ? (
                    <Pets sx={{ color: 'success.main' }} />
                  ) : (
                    <Pets sx={{ color: 'error.main' }} />
                  )}
                  <Typography variant="body2">
                    {policies.pets ? 'Pets Allowed' : 'No Pets'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {policies.parties ? (
                    <Celebration sx={{ color: 'success.main' }} />
                  ) : (
                    <Celebration sx={{ color: 'error.main' }} />
                  )}
                  <Typography variant="body2">
                    {policies.parties ? 'Parties Allowed' : 'No Parties'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
