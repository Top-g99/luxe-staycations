'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Search,
  Link,
  Refresh,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { seoManager, SEOAnalytics } from '@/lib/seoManager';

interface SEOAnalyticsProps {
  pagePath?: string;
}

export default function SEOAnalyticsComponent({ pagePath }: SEOAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SEOAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [pagePath]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from Google Analytics API
      // For now, we'll use mock data
      const mockAnalytics: SEOAnalytics = {
        pageViews: 15420,
        uniqueVisitors: 8930,
        bounceRate: 42.5,
        avgSessionDuration: 3.2,
        topPages: [
          { path: '/', title: 'Homepage', views: 5420, bounceRate: 38.2 },
          { path: '/villas', title: 'Villas', views: 3200, bounceRate: 45.1 },
          { path: '/destinations', title: 'Destinations', views: 2100, bounceRate: 41.8 },
          { path: '/about-us', title: 'About Us', views: 1800, bounceRate: 52.3 },
          { path: '/contact-us', title: 'Contact Us', views: 1200, bounceRate: 48.7 }
        ],
        topKeywords: [
          { keyword: 'luxury villas india', position: 3, clicks: 1200, impressions: 15000 },
          { keyword: 'villa booking', position: 5, clicks: 890, impressions: 12000 },
          { keyword: 'premium accommodations', position: 8, clicks: 650, impressions: 8500 },
          { keyword: 'luxury staycations', position: 12, clicks: 420, impressions: 6000 },
          { keyword: 'villa rentals', position: 15, clicks: 380, impressions: 5200 }
        ],
        pageTitle: 'Luxe Staycations - Luxury Villa Rentals',
        metaDescription: 'Experience luxury villa rentals with premium amenities and stunning locations across India.',
        keywords: ['luxury villas', 'villa rentals', 'premium accommodations'],
        h1Tags: ['Luxe Staycations', 'Luxury Villa Rentals'],
        h2Tags: ['Featured Villas', 'Destinations', 'About Us'],
        imageAlts: ['Luxury villa exterior', 'Villa interior', 'Swimming pool'],
        internalLinks: 25,
        externalLinks: 8,
        wordCount: 1250,
        readabilityScore: 85,
        mobileFriendly: true,
        loadTime: 2.3,
        lastAnalyzed: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      setAnalytics(mockAnalytics);
      seoManager.updateAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getBounceRateColor = (rate: number) => {
    if (rate < 40) return 'success';
    if (rate < 60) return 'warning';
    return 'error';
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'success';
    if (position <= 10) return 'warning';
    return 'error';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadAnalytics}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data available. Please check your analytics configuration.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          SEO Analytics
        </Typography>
        <IconButton onClick={loadAnalytics} title="Refresh Analytics">
          <Refresh />
        </IconButton>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Visibility sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Page Views</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatNumber(analytics.pageViews)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Unique Visitors</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatNumber(analytics.uniqueVisitors)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">Bounce Rate</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {analytics.bounceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Link sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6">Avg. Session</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {analytics.avgSessionDuration}m
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Pages */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Performing Pages
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Page</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Bounce Rate</TableCell>
                  <TableCell>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.topPages.map((page, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {page.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {page.path}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatNumber(page.views)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={page.bounceRate}
                          color={getBounceRateColor(page.bounceRate)}
                          sx={{ width: 60, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color={`${getBounceRateColor(page.bounceRate)}.main`}>
                          {page.bounceRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={page.bounceRate < 50 ? 'Good' : page.bounceRate < 70 ? 'Average' : 'Poor'}
                        color={getBounceRateColor(page.bounceRate)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Ranking Keywords
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Keyword</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Impressions</TableCell>
                  <TableCell>CTR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.topKeywords.map((keyword, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {keyword.keyword}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`#${keyword.position}`}
                        color={getPositionColor(keyword.position)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatNumber(keyword.clicks)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatNumber(keyword.impressions)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {((keyword.clicks / keyword.impressions) * 100).toFixed(1)}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
