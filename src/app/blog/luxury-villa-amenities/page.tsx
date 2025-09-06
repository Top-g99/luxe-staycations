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

export default function LuxuryVillaAmenitiesPage() {
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
            Must-Have Amenities in Luxury Villas for the Perfect Staycation
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              By Sarah Williams
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
              8 min read
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ 
            color: 'text.secondary',
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            From private pools to gourmet kitchens, discover the essential amenities that make your villa stay truly luxurious.
          </Typography>
        </Box>

        {/* Featured Image */}
        <Box sx={{ mb: 6 }}>
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
            alt="Luxury villa amenities"
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
            Introduction
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            When it comes to luxury villa stays, the difference between a good experience and an extraordinary one often lies in the amenities. 
            Modern travelers expect more than just a comfortable bed and a clean bathroom. They seek experiences that elevate their staycation 
            to new heights of luxury and convenience.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Essential Luxury Amenities
          </Typography>

          <Card sx={{ mb: 4, bgcolor: 'var(--background-light)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                color: 'var(--primary-dark)',
                mb: 2,
                fontFamily: 'Playfair Display, serif'
              }}>
                1. Private Swimming Pool
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                A private swimming pool is perhaps the most coveted luxury villa amenity. Whether it's an infinity pool with stunning views, 
                a heated pool for year-round enjoyment, or a pool with integrated spa features, this amenity transforms a villa stay into 
                a resort-like experience.
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
                2. Gourmet Kitchen
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                A fully equipped gourmet kitchen with high-end appliances, professional cookware, and a well-stocked pantry allows guests 
                to create restaurant-quality meals. This amenity is especially appreciated by food enthusiasts and families who enjoy 
                cooking together.
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
                3. Smart Home Technology
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                From automated lighting and climate control to smart entertainment systems and security features, modern technology 
                enhances both convenience and luxury. Voice-controlled systems and mobile app integration provide seamless control 
                over the villa environment.
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Wellness and Relaxation
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Luxury villas are increasingly incorporating wellness amenities that promote relaxation and rejuvenation. Private spa rooms, 
            meditation gardens, yoga studios, and massage rooms are becoming standard features in high-end properties.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Conclusion
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            The perfect luxury villa combines thoughtful design with exceptional amenities that cater to every aspect of the guest experience. 
            From entertainment and relaxation to convenience and comfort, these amenities ensure that every moment of your staycation 
            is nothing short of extraordinary.
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
            Ready to Experience Luxury?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Explore our collection of luxury villas with these premium amenities and start planning your perfect staycation.
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
            Explore Villas
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

