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

export default function FamilyVillaGetawaysPage() {
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
            Family-Friendly Luxury Villas: Creating Unforgettable Memories
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              By Priya Sharma
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
              7 min read
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ 
            color: 'text.secondary',
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            Discover spacious villas perfect for family gatherings, with amenities that cater to all age groups.
          </Typography>
        </Box>

        {/* Featured Image */}
        <Box sx={{ mb: 6 }}>
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            alt="Family villa getaways"
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
            The Perfect Family Escape
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Family vacations are about creating lasting memories and strengthening bonds. 
            Luxury villas offer the perfect setting for these precious moments, providing 
            both comfort and adventure for every family member, regardless of age.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Family-Centric Amenities
          </Typography>

          <Card sx={{ mb: 4, bgcolor: 'var(--background-light)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                color: 'var(--primary-dark)',
                mb: 2,
                fontFamily: 'Playfair Display, serif'
              }}>
                1. Kid-Friendly Pools and Play Areas
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Family villas often feature shallow pools with safety features, dedicated play areas, 
                and outdoor games. These spaces allow children to have fun while parents can relax 
                nearby, ensuring everyone enjoys their time together.
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
                2. Spacious Common Areas
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                Large living rooms, dining areas, and outdoor spaces accommodate family gatherings 
                and activities. These areas become the heart of family bonding, where everyone 
                can come together for meals, games, and conversations.
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
                3. Entertainment for All Ages
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                From gaming consoles and board games for kids to home theaters and wine cellars 
                for adults, family villas offer entertainment options that cater to different 
                interests and age groups.
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Safety and Convenience
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Family-friendly villas prioritize safety with features like child-proofing, 
            secure outdoor areas, and emergency contact information. They also offer conveniences 
            like high chairs, cribs, and kitchen facilities for preparing family meals.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Creating Lasting Memories
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            The spacious and comfortable environment of family villas encourages quality time together. 
            Whether it's cooking meals as a family, playing games in the garden, or simply relaxing 
            in the living room, these moments become cherished memories that last a lifetime.
          </Typography>

          <Typography variant="h4" sx={{ 
            color: 'var(--primary-dark)',
            mb: 3,
            fontFamily: 'Playfair Display, serif'
          }}>
            Conclusion
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.primary' }}>
            Family-friendly luxury villas provide the perfect backdrop for creating unforgettable 
            family memories. With amenities that cater to all ages and spaces that bring families 
            together, these properties ensure that every family member has an enjoyable and 
            memorable staycation experience.
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
            Plan Your Family Getaway
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Discover our collection of family-friendly luxury villas and start planning your next 
            unforgettable family vacation.
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
            Find Family Villas
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

