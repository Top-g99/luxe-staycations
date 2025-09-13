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
  ListItemText
} from '@mui/material';
import {
  Star,
  CheckCircle,
  LocalFireDepartment,
  TrendingUp,
  Security,
  Wifi,
  Pool,
  Restaurant,
  Spa
} from '@mui/icons-material';

interface PropertyHighlightsProps {
  highlights?: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  featured: boolean;
}

export default function PropertyHighlights({
  highlights = [],
  amenities,
  rating,
  reviews,
  featured
}: PropertyHighlightsProps) {
  // Generate highlights from existing data if not provided
  const generatedHighlights = highlights.length > 0 ? highlights : [
    rating >= 4.5 && `${rating.toFixed(1)}★ Highly Rated (${reviews} reviews)`,
    featured && 'Featured Property',
    amenities.includes('Pool') && 'Private Pool Access',
    amenities.includes('Wifi') && 'High-Speed WiFi',
    amenities.includes('Spa') && 'Spa & Wellness Center',
    amenities.includes('Restaurant') && 'On-Site Restaurant'
  ].filter(Boolean) as string[];

  const getHighlightIcon = (highlight: string) => {
    if (highlight.includes('★') || highlight.includes('Rated')) return <Star />;
    if (highlight.includes('Featured')) return <LocalFireDepartment />;
    if (highlight.includes('Pool')) return <Pool />;
    if (highlight.includes('WiFi')) return <Wifi />;
    if (highlight.includes('Spa')) return <Spa />;
    if (highlight.includes('Restaurant')) return <Restaurant />;
    if (highlight.includes('Security')) return <Security />;
    if (highlight.includes('Trending')) return <TrendingUp />;
    return <CheckCircle />;
  };

  const getHighlightColor = (highlight: string) => {
    if (highlight.includes('★') || highlight.includes('Rated')) return 'primary';
    if (highlight.includes('Featured')) return 'error';
    if (highlight.includes('Pool') || highlight.includes('Spa')) return 'info';
    if (highlight.includes('WiFi') || highlight.includes('Restaurant')) return 'secondary';
    return 'success';
  };

  if (generatedHighlights.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star />
          Property Highlights
        </Typography>

        <Grid container spacing={2}>
          {generatedHighlights.map((highlight, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  backgroundColor: 'rgba(90, 61, 53, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(90, 61, 53, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(90, 61, 53, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(90, 61, 53, 0.15)'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: `${getHighlightColor(highlight)}.light`,
                    color: `${getHighlightColor(highlight)}.main`
                  }}
                >
                  {getHighlightIcon(highlight)}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
                  {highlight}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Alternative List View for Mobile */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 2 }}>
          <List dense>
            {generatedHighlights.map((highlight, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: `${getHighlightColor(highlight)}.light`,
                      color: `${getHighlightColor(highlight)}.main`
                    }}
                  >
                    {getHighlightIcon(highlight)}
                  </Box>
                </ListItemIcon>
                <ListItemText primary={highlight} />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
}
