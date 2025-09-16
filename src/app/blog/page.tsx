"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button
} from '@mui/material';
import { useRouter } from 'next/navigation';

const blogPosts = [
  {
    id: 'luxury-villa-amenities',
    title: 'Must-Have Amenities in Luxury Villas for the Perfect Staycation',
    excerpt: 'From private pools to gourmet kitchens, discover the essential amenities that make your villa stay truly luxurious.',
    author: 'Sarah Williams',
    date: '11/5/2025',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    category: 'Luxury Living'
  },
  {
    id: 'perfect-villa-booking',
    title: 'How to Choose the Perfect Luxury Villa for Your Staycation',
    excerpt: 'Expert tips on selecting the ideal villa that matches your luxury preferences and travel style.',
    author: 'Michael Chen',
    date: '11/5/2025',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    category: 'Travel Guide'
  },
  {
    id: 'family-villa-getaways',
    title: 'Family-Friendly Luxury Villas: Creating Unforgettable Memories',
    excerpt: 'Discover spacious villas perfect for family gatherings, with amenities that cater to all age groups.',
    author: 'Priya Sharma',
    date: '11/5/2025',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    category: 'Family Travel'
  }
];

export default function BlogPage() {
  const router = useRouter();

  return (
    <Box sx={{ py: 8, bgcolor: 'var(--background)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'var(--primary-dark)',
            mb: 4
          }}>
            The Ultimate Villa Experience
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            Discover luxury staycations, exclusive villa insights, and premium travel experiences
          </Typography>
        </Box>

        {/* Blog Posts Grid */}
        <Grid container spacing={4}>
          {blogPosts.map((post) => (
            <Grid item xs={12} md={4} key={post.id}>
              <Card sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => router.push(`/blog/${post.id}`)}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={post.image}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      By {post.author}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {post.date}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    lineHeight: 1.3,
                    color: 'var(--primary-dark)'
                  }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                    {post.excerpt}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/blog/${post.id}`);
                    }}
                    sx={{
                      borderColor: 'var(--secondary-dark)',
                      color: 'var(--secondary-dark)',
                      '&:hover': {
                        borderColor: 'var(--primary-dark)',
                        color: 'var(--primary-dark)'
                      }
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Coming Soon Message */}
        <Box sx={{ textAlign: 'center', mt: 8, p: 4, bgcolor: 'var(--background-light)', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            More Villa Stories Coming Soon!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            We're working on more exclusive content about luxury villa experiences, travel tips, and insider guides.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{
              bgcolor: 'var(--secondary-dark)',
              color: 'white',
              '&:hover': {
                bgcolor: 'var(--primary-dark)'
              }
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

