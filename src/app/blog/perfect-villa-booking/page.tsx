"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowBack } from '@mui/icons-material';

export default function PerfectVillaBookingPage() {
  const router = useRouter();

  return (
    <Box sx={{ py: 8, bgcolor: 'var(--background)' }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/blog')}
          sx={{
            mb: 4,
            color: 'var(--secondary-dark)',
            '&:hover': {
              color: 'var(--primary-dark)'
            }
          }}
        >
          Back to Blog
        </Button>

        {/* Article Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h1" sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'var(--primary-dark)',
            mb: 3,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            How to Choose the Perfect Luxury Villa for Your Staycation
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              By Michael Chen
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              •
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              November 5, 2025
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              •
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              10 min read
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ 
            color: 'text.secondary',
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            Expert tips on selecting the ideal villa that matches your luxury preferences and travel style.
          </Typography>
        </Box>

        {/* Featured Image */}
        <Box sx={{ mb: 6 }}>
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
            alt="Villa booking guide"
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
        </Box>

        {/* Article Content */}
        <Box sx={{ lineHeight: 1.8 }}>
          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Understanding Your Needs
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            The first step in choosing the perfect luxury villa is understanding your specific needs and preferences. 
            Consider factors such as group size, travel purpose, desired amenities, and budget constraints. 
            This foundation will guide your entire selection process.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Key Selection Criteria
          </Typography>

          <Card sx={{ mb: 4, bgcolor: 'var(--background-light)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                color: 'var(--primary-dark)',
                mb: 2,
                fontFamily: 'Playfair Display, serif'
              }}>
                1. Location and Accessibility
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Consider the villa's proximity to attractions, restaurants, and essential services. 
                While seclusion offers privacy, easy access to amenities enhances convenience. 
                Balance between tranquility and accessibility based on your travel style.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, bgcolor: 'var(--background-light)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                color: 'var(--primary-dark)',
                mb: 2,
                fontFamily: 'Playfair Display, serif'
              }}>
                2. Villa Size and Layout
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Ensure the villa comfortably accommodates your group. Consider bedroom configurations, 
                common areas, and outdoor spaces. A well-designed layout enhances the overall experience 
                and ensures everyone has their own space.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, bgcolor: 'var(--background-light)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                color: 'var(--primary-dark)',
                mb: 2,
                fontFamily: 'Playfair Display, serif'
              }}>
                3. Amenities and Services
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Prioritize amenities that align with your interests and needs. Whether it's a private pool, 
                gourmet kitchen, spa facilities, or concierge services, these features significantly 
                impact your staycation experience.
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Research and Reviews
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Thorough research is crucial when selecting a luxury villa. Read guest reviews, examine photos, 
            and verify the property's authenticity. Look for consistent positive feedback about cleanliness, 
            service quality, and overall experience.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Booking Tips
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Book well in advance, especially for peak seasons. Understand the cancellation policy and 
            payment terms. Consider travel insurance for added protection. Communicate directly with 
            the property manager to clarify any questions or special requests.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Conclusion
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Choosing the perfect luxury villa requires careful consideration of multiple factors. 
            By understanding your needs, conducting thorough research, and following these expert tips, 
            you can ensure a memorable and luxurious staycation experience that exceeds your expectations.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ 
            color: 'var(--primary-dark)',
            mb: 2,
            fontFamily: 'Playfair Display, serif'
          }}>
            Start Your Villa Search
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Browse our curated collection of luxury villas and find the perfect match for your next staycation.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/villas')}
            sx={{
              bgcolor: 'var(--secondary-dark)',
              color: 'white',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'var(--primary-dark)'
              }
            }}
          >
            Browse Villas
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

