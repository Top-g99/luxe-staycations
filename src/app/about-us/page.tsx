"use client";

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Star, LocationOn, Hotel, Security, Support } from '@mui/icons-material';

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Priya Sharma",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80",
      description: "Former hospitality executive with 15+ years experience in luxury accommodations."
    },
    {
      name: "Rajesh Kumar",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      description: "Expert in property management and guest experience optimization."
    },
    {
      name: "Anjali Patel",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
      description: "Digital marketing specialist focused on luxury travel experiences."
    }
  ];

  const values = [
    {
      icon: <Star sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Excellence",
      description: "We maintain the highest standards in every aspect of our service."
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Trust",
      description: "Building lasting relationships through transparency and reliability."
    },
    {
      icon: <Support sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Service",
      description: "Dedicated to providing exceptional guest experiences."
    },
    {
      icon: <Hotel sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Luxury",
      description: "Curating the finest accommodations for discerning travelers."
    }
  ];

  return (
    <Box sx={{ pt: 16, pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2d1b1b 0%, #1a1a1a 50%, #0f0f0f 100%)',
          color: 'white',
          py: 12,
          mb: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(45deg, #d97706, #fbbf24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              About Luxe Staycations
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#d1d5db',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Your gateway to luxury accommodations in India. We curate exceptional experiences 
              that combine comfort, elegance, and authentic local charm.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Mission Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600,
              color: '#2d1b1b'
            }}
          >
            Our Mission
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 3, color: '#5a3d35', fontWeight: 600 }}>
                Redefining Luxury Travel
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
                At Luxe Staycations, we believe that luxury travel should be accessible, authentic, 
                and unforgettable. Our mission is to connect discerning travelers with the most 
                exceptional accommodations across India's most beautiful destinations.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
                We carefully select each property in our portfolio, ensuring they meet our 
                rigorous standards for quality, comfort, and unique character. From heritage 
                palaces to modern villas, every accommodation tells a story.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"
                alt="Luxury Villa"
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 3,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600,
              color: '#2d1b1b'
            }}
          >
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d1b1b' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600,
              color: '#2d1b1b'
            }}
          >
            Meet Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent>
                    <Avatar
                      src={member.image}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 3,
                        border: '4px solid #d97706'
                      }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2d1b1b' }}>
                      {member.name}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 2, 
                        color: '#d97706',
                        fontWeight: 500
                      }}
                    >
                      {member.role}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #2d1b1b 0%, #1a1a1a 50%, #0f0f0f 100%)',
            color: 'white',
            py: 8,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#d97706', mb: 1 }}>
                500+
              </Typography>
              <Typography variant="body1" sx={{ color: '#d1d5db' }}>
                Happy Guests
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#d97706', mb: 1 }}>
                50+
              </Typography>
              <Typography variant="body1" sx={{ color: '#d1d5db' }}>
                Luxury Properties
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#d97706', mb: 1 }}>
                15+
              </Typography>
              <Typography variant="body1" sx={{ color: '#d1d5db' }}>
                Destinations
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#d97706', mb: 1 }}>
                24/7
              </Typography>
              <Typography variant="body1" sx={{ color: '#d1d5db' }}>
                Support
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

