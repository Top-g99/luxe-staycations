'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  LocalOffer,
  TrendingUp,
  Group,
  CalendarToday,
  CheckCircle
} from '@mui/icons-material';

interface PropertyPricingProps {
  pricing?: {
    basePrice: number;
    weekendPrice?: number;
    seasonalRates?: { [key: string]: number };
    offers?: {
      earlyBird?: number;
      longStay?: number;
      groupDiscount?: number;
    };
  };
  basePrice: number;
}

export default function PropertyPricing({
  pricing,
  basePrice
}: PropertyPricingProps) {
  const currentPrice = pricing?.basePrice || basePrice;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOffer />
          Pricing & Offers
        </Typography>

        {/* Base Pricing */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(90, 61, 53, 0.05)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ₹{currentPrice.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Per Night
                </Typography>
              </Box>
            </Grid>
            
            {pricing?.weekendPrice && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(217, 119, 6, 0.05)', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    ₹{pricing.weekendPrice.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Weekend Rate
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Seasonal Rates */}
        {pricing?.seasonalRates && Object.keys(pricing.seasonalRates).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday />
              Seasonal Rates
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(pricing.seasonalRates).map(([season, rate]) => (
                <Grid item xs={12} sm={6} key={season}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {season}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      ₹{rate.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Special Offers */}
        {pricing?.offers && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Special Offers
            </Typography>
            <List dense>
              {pricing.offers.earlyBird && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Early Bird Discount"
                    secondary={`Save ${pricing.offers.earlyBird}% on bookings made 30+ days in advance`}
                  />
                </ListItem>
              )}
              
              {pricing.offers.longStay && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Long Stay Discount"
                    secondary={`Save ${pricing.offers.longStay}% on stays of 7+ nights`}
                  />
                </ListItem>
              )}
              
              {pricing.offers.groupDiscount && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Group sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Group Discount"
                    secondary={`Save ${pricing.offers.groupDiscount}% for groups of 8+ guests`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* No offers message */}
        {!pricing?.offers && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No special offers available at this time
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
