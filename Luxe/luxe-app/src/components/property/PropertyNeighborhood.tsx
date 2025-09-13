'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Restaurant,
  Attractions,
  DirectionsCar,
  BeachAccess,
  Hiking
} from '@mui/icons-material';

interface PropertyNeighborhoodProps {
  neighborhood?: {
    attractions: string[];
    restaurants: string[];
    distanceToAirport: number;
    distanceToBeach: number;
    nearbyActivities: string[];
  };
  location: string;
}

export default function PropertyNeighborhood({
  neighborhood,
  location
}: PropertyNeighborhoodProps) {
  if (!neighborhood) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn />
          Neighborhood & Location
        </Typography>

        {/* Location */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Location
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {location}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Distances */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <DirectionsCar sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {neighborhood.distanceToAirport} km
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To Airport
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <BeachAccess sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {neighborhood.distanceToBeach} km
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To Beach
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Attractions */}
        {neighborhood.attractions && neighborhood.attractions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Attractions />
              Nearby Attractions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {neighborhood.attractions.map((attraction, index) => (
                <Chip
                  key={index}
                  label={attraction}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Restaurants */}
        {neighborhood.restaurants && neighborhood.restaurants.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Restaurant />
              Nearby Restaurants
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {neighborhood.restaurants.map((restaurant, index) => (
                <Chip
                  key={index}
                  label={restaurant}
                  variant="outlined"
                  size="small"
                  color="secondary"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Activities */}
        {neighborhood.nearbyActivities && neighborhood.nearbyActivities.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Hiking />
              Nearby Activities
            </Typography>
            <List dense>
              {neighborhood.nearbyActivities.map((activity, index) => (
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
                  <ListItemText primary={activity} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
