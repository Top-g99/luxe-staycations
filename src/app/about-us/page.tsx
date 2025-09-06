"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import {
  Home,
  AutoAwesome,
  Security,
  LocationOn,
  Star,
  Handshake
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AboutUsPage() {
  const router = useRouter();

  const handleExploreVillas = () => {
    router.push('/villas');
  };

  const handlePartnerWithUs = () => {
    router.push('/partner-with-us');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box sx={{ 
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'url("https://theluxurytravelbook.com/wp-content/uploads/2023/10/luxury-villa-tuscany-italy-villa-porto-ercole-18.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'white',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
              }}
            >
              Where Your Journey Begins, and Ordinary Ends
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 300,
                maxWidth: '800px',
                mx: 'auto',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
              }}
            >
              We don't just find you a place to stay; we curate the backdrop for your most unforgettable moments.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Company Story */}
        <Grid container spacing={6} sx={{ mb: 8, alignItems: 'flex-start' }}>
          <Grid item xs={12}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'var(--primary-dark)',
                mb: 4,
                fontWeight: 'bold'
              }}
            >
              About Us: Luxe Staycations
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
              At Luxe Staycations, we believe travel should be effortless, immersive, and extraordinary. 
              We saw a world of generic bookings and impersonal stays, and we knew there was a better way. 
              Founded in 2024, we set out to redefine luxury travel by connecting discerning guests with 
              the world's most exquisite private villas and bespoke experiences.
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
              Our journey began with a simple question: What does a perfect escape truly look like? 
              The answer wasn't just in thread counts and infinity pools—though we have those in abundance. 
              It was in the details: the scent of frangipani in a private garden, the taste of a perfectly 
              crafted meal by a private chef, the serene silence of a sunrise over a misty mountain range.
            </Typography>
          </Grid>


        </Grid>

        {/* Our Promise Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
                              fontFamily: 'Playfair Display, serif',
              color: 'var(--primary-dark)',
              mb: 4,
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Our Promise: The Luxe Standard
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8, textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            Every villa in our collection is more than just a property; it is a promise. A promise upheld by our rigorous 50-point "Luxe Certification" process, where we personally vet each home for:
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <Home sx={{ fontSize: '2.5rem', color: 'var(--primary-dark)' }} />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    color: 'var(--primary-dark)',
                    mb: 2,
                    fontWeight: 'bold'
                  }}>
                    The Luxe Certification
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Every property personally vetted through our rigorous 50-point quality assurance process.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <AutoAwesome sx={{ fontSize: '2.5rem', color: 'var(--primary-dark)' }} />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    color: 'var(--primary-dark)',
                    mb: 2,
                    fontWeight: 'bold'
                  }}>
                    Bespoke Concierge
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Your wishes, orchestrated. From private chefs to yacht charters, we handle every detail.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <Security sx={{ fontSize: '2.5rem', color: 'var(--primary-dark)' }} />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    color: 'var(--primary-dark)',
                    mb: 2,
                    fontWeight: 'bold'
                  }}>
                    Book with Confidence
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Secure payments and 24/7 support ensure complete peace of mind throughout your journey.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Service Details */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
            But our role doesn't end at booking. Our dedicated concierge team is your silent partner in crafting perfection. 
            Whether it's arranging a yacht charter for a special celebration, a guided spice plantation tour, or simply 
            ensuring your favorite champagne is chilled on arrival—we handle the details so you can fully immerse yourself 
            in the joy of connection.
          </Typography>
        </Box>

        {/* Our Story */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
                              fontFamily: 'Playfair Display, serif',
              color: 'var(--primary-dark)',
              mb: 4,
              fontWeight: 'bold'
            }}
          >
            Our Story
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
            Luxe Staycations was born from a passion for discovery and a deep appreciation for the art of hospitality. 
            We are a team of travelers, designers, and storytellers, united by a common goal: to open the doors to 
            hidden sanctuaries and unparalleled experiences that we would want for our own families and friends.
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
            We invite you to move beyond the ordinary. To explore our curated collection and begin crafting your next narrative.
          </Typography>

          <Typography variant="h5" sx={{ 
                            fontFamily: 'Playfair Display, serif',
            color: 'var(--primary-dark)',
            fontStyle: 'italic',
            textAlign: 'center',
            mt: 4
          }}>
            Your escape awaits.
          </Typography>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
                              fontFamily: 'Playfair Display, serif',
              color: 'var(--primary-dark)',
              mb: 4,
              fontWeight: 'bold'
            }}
          >
            Ready to Begin Your Journey?
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                size="large"
                onClick={handleExploreVillas}
                startIcon={<LocationOn />}
                sx={{
                  bgcolor: 'var(--secondary-dark)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'var(--primary-dark)'
                  }
                }}
              >
                Explore Our Villas
              </Button>
            </Grid>
            
            <Grid item>
              <Button
                variant="outlined"
                size="large"
                onClick={handlePartnerWithUs}
                startIcon={<Handshake />}
                sx={{
                  borderColor: 'var(--primary-dark)',
                  color: 'var(--primary-dark)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'var(--secondary-dark)',
                    color: 'var(--secondary-dark)'
                  }
                }}
              >
                Partner with Us
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

