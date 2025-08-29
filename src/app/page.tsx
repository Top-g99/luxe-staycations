"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  Search,
  LocationOn,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Phone
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { callbackManager } from '@/lib/callbackManager';
import { propertyManager } from '@/lib/propertyManager';
import { destinationManager } from '@/lib/destinationManager';
import { dealBannerManager } from '@/lib/dealBannerManager';
import HeroSlider from '@/components/HeroSlider';

// Deal Banner Section Component
function DealBannerSection() {
  const [dealBanner, setDealBanner] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadDealBanner = () => {
      const data = dealBannerManager.getDealBanner();
      setDealBanner(data);
    };

    loadDealBanner();

    // Subscribe to changes
    const unsubscribe = dealBannerManager.subscribe(() => {
      loadDealBanner();
    });

    return unsubscribe;
  }, []);

  // Don't render if no deal banner or not active
  if (!dealBanner || !dealBanner.isActive) {
    return null;
  }

  return (
    <Box sx={{
      position: 'relative',
      height: '500px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mt: 8
    }}>
      {/* Video Background */}
      {dealBanner.videoUrl && dealBanner.videoUrl.trim() !== '' ? (
        <Box
          component="video"
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
        >
          <source src={dealBanner.videoUrl} type="video/mp4" />
          {/* Fallback image if video doesn't load */}
          {dealBanner.fallbackImageUrl && dealBanner.fallbackImageUrl.trim() !== '' && (
            <Box
              component="img"
              src={dealBanner.fallbackImageUrl}
              alt="Luxury Villa"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
        </Box>
      ) : (
        /* Fallback image when no video is available */
        dealBanner.fallbackImageUrl && dealBanner.fallbackImageUrl.trim() !== '' ? (
          <Box
            component="img"
            src={dealBanner.fallbackImageUrl}
            alt="Luxury Villa"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        ) : (
          /* Default background when no image is available */
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%)',
              zIndex: 1
            }}
          />
        )
      )}
      
      {/* Light Overlay for Text Readability - Removed for better video visibility */}
      {/* <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 2
      }} /> */}
      
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        <Box sx={{
          textAlign: 'center',
          color: 'white',
          maxWidth: 600,
          mx: 'auto'
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontFamily: 'Gilda Display, serif',
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {dealBanner.title}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              mb: 4,
              textShadow: '0 1px 8px rgba(0,0,0,0.6)',
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
            }}
          >
            {dealBanner.subtitle}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push(dealBanner.buttonLink)}
            sx={{
              bgcolor: 'var(--secondary-dark)',
              color: 'white',
              px: 6,
              py: 2,
              borderRadius: 3,
              fontSize: '1.2rem',
              fontWeight: 600,
              fontFamily: 'Nunito, sans-serif',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'var(--secondary-dark)',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {dealBanner.buttonText}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { searchFormData, setSearchFormData } = useBookingContext();
  
  // Initialize search data from context or default
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  // State for callback request form
  const [callbackFormOpen, setCallbackFormOpen] = useState(false);
  const [callbackFormData, setCallbackFormData] = useState({
    name: '',
    phone: '',
    email: '',
    numberOfGuests: '',
    preferredTime: '',
    message: ''
  });

  // State for no villas popup
  const [noVillasPopup, setNoVillasPopup] = useState({
    open: false,
    destination: ''
  });

  // State for featured properties and all properties
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);

  // Initialize search data from context
  useEffect(() => {
    if (searchFormData) {
      setSearchData(searchFormData);
    }
  }, [searchFormData]);

  // Load properties from propertyManager with real-time updates
  useEffect(() => {
    const loadProperties = () => {
      try {
        const allData = propertyManager.getAllProperties();
        const featuredData = propertyManager.getFeaturedProperties();
        setAllProperties(allData);
        setFeaturedProperties(featuredData);
        console.log('Homepage: Loaded properties - All:', allData.length, 'Featured:', featuredData.length);
      } catch (error) {
        console.error('Error loading properties:', error);
      }
    };

    // Initial load
    loadProperties();

    // Subscribe to real-time updates
    const unsubscribe = propertyManager.subscribe(() => {
      const updatedAllData = propertyManager.getAllProperties();
      const updatedFeaturedData = propertyManager.getFeaturedProperties();
      setAllProperties(updatedAllData);
      setFeaturedProperties(updatedFeaturedData);
      console.log('Homepage: Updated properties - All:', updatedAllData.length, 'Featured:', updatedFeaturedData.length);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Load destinations from destinationManager with real-time updates
  useEffect(() => {
    const loadDestinations = () => {
      try {
        const destinationsData = destinationManager.getAllDestinations();
        const formattedDestinations = destinationsData.map(dest => ({
          name: dest.name,
          image: dest.image
        }));
        setDestinations(formattedDestinations);
        console.log('Homepage: Loaded destinations:', formattedDestinations.length);
      } catch (error) {
        console.error('Error loading destinations:', error);
      }
    };

    // Initial load
    loadDestinations();

    // Subscribe to real-time updates
    const unsubscribe = destinationManager.subscribe(() => {
      const updatedDestinationsData = destinationManager.getAllDestinations();
      const formattedDestinations = updatedDestinationsData.map(dest => ({
        name: dest.name,
        image: dest.image
      }));
      setDestinations(formattedDestinations);
      console.log('Homepage: Updated destinations:', formattedDestinations.length);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const handleSearchChange = (field: string, value: string) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isSearchFormValid = searchData.destination && searchData.checkIn && searchData.checkOut;

  const handleSearchSubmit = () => {
    if (isSearchFormValid) {
      setSearchFormData(searchData);
      router.push('/villas');
    }
  };

  const handleDestinationClick = (destination: string) => {
    const availableVillas = allProperties.filter(property => {
      const locationMatch = property.location.toLowerCase().includes(destination.toLowerCase());
      const nameMatch = property.name.toLowerCase().includes(destination.toLowerCase());
      const descriptionMatch = property.description.toLowerCase().includes(destination.toLowerCase());
      
      let specialMatch = false;
      if (destination.toLowerCase().includes('lonavala')) {
        specialMatch = property.location.toLowerCase().includes('lonavala') || 
                      property.location.toLowerCase().includes('khandala') ||
                      property.location.toLowerCase().includes('karla') ||
                      property.name.toLowerCase().includes('casa alphonso');
      }
      
      return locationMatch || nameMatch || descriptionMatch || specialMatch;
    });

    if (availableVillas.length > 0) {
      router.push(`/villas?destination=${encodeURIComponent(destination)}`);
    } else {
      setNoVillasPopup({
        open: true,
        destination: destination
      });
    }
  };

  const handleCallbackSubmit = () => {
    try {
      const newCallback = callbackManager.addCallback(callbackFormData);
      console.log('Callback request submitted:', newCallback);
      alert('Thank you! We will call you back soon. Your request has been submitted.');
      setCallbackFormOpen(false);
      setCallbackFormData({
        name: '',
        phone: '',
        email: '',
        numberOfGuests: '',
        preferredTime: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting callback request:', error);
      alert('Sorry, there was an error submitting your request. Please try again.');
    }
  };

  const handleCallbackFormChange = (field: string, value: string) => {
    setCallbackFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      {/* Hero Section */}
      <HeroSlider
        searchData={searchData}
        handleSearchChange={handleSearchChange}
        handleSearch={handleSearchSubmit}
        setCallbackFormOpen={setCallbackFormOpen}
      />

      {/* Deal Banner Section */}
      <DealBannerSection />

      {/* Explore Top Properties Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Gilda Display, serif',
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            Explore Top Properties
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Discover our most popular and highly-rated villas
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {featuredProperties.map((property) => (
            <Grid item xs={12} md={4} key={property.id}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 4
                }
              }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={property.image}
                  alt={property.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Gilda Display, serif',
                      color: 'var(--primary-dark)',
                      fontWeight: 'bold'
                    }}>
                      {property.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {property.location}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {property.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                      ₹{property.price.toLocaleString()}/night
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => router.push(`/villas?property=${property.id}`)}
                      sx={{
                        borderColor: 'var(--secondary-dark)',
                        color: 'var(--secondary-dark)',
                        '&:hover': {
                          borderColor: 'var(--primary-dark)',
                          color: 'var(--primary-dark)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Destinations Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ 
              fontFamily: 'Gilda Display, serif',
              color: 'var(--primary-dark)',
              mb: 2
            }}>
              Popular Destinations
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Explore our most sought-after locations
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {destinations.map((destination, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleDestinationClick(destination.name)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={destination.image}
                    alt={destination.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Gilda Display, serif',
                      color: 'var(--primary-dark)',
                      fontWeight: 'bold'
                    }}>
                      {destination.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Luxe Jewels Loyalty Program Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)', 
        py: 6,
        borderTop: '1px solid #F0F0F0',
        borderBottom: '1px solid #F0F0F0'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" sx={{ 
              fontFamily: 'Gilda Display, serif',
              color: '#3E2723',
              mb: 2,
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              Luxe Jewels Loyalty Program
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#5D4037',
              mb: 3,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: '1rem'
            }}>
              Earn exclusive jewels with every stay and unlock premium benefits
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',
                color: 'white',
                height: '100%',
                boxShadow: '0 6px 24px rgba(62, 39, 35, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 36px rgba(62, 39, 35, 0.3)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 300 }}>J</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    fontFamily: 'Gilda Display, serif',
                    letterSpacing: '0.5px'
                  }}>
                    Earn Jewels
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    mb: 3,
                    opacity: 0.9,
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.5
                  }}>
                    Collect 1 jewel for every ₹100 spent on your luxury villa bookings
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/loyalty')}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#3E2723',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontFamily: 'Nunito, sans-serif',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    View Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
                color: 'white',
                height: '100%',
                boxShadow: '0 6px 24px rgba(93, 64, 55, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 36px rgba(93, 64, 55, 0.3)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 300 }}>R</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    fontFamily: 'Gilda Display, serif',
                    letterSpacing: '0.5px'
                  }}>
                    Redeem Rewards
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    mb: 3,
                    opacity: 0.9,
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.5
                  }}>
                    Transform your jewels into exclusive discounts and premium upgrades
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/loyalty')}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#5D4037',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontFamily: 'Nunito, sans-serif',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Redeem Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partner With Us Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Gilda Display, serif',
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            🤝 Partner With Us
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
            Join our network and grow your business with Luxe Staycations
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Gilda Display, serif',
                color: 'var(--primary-dark)',
                mb: 3
              }}>
                Why Partner With Us?
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'var(--primary-light)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      📈
                    </Box>
                    <Typography variant="h6">Revenue Growth</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Increase your bookings and revenue with our premium clientele
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'var(--primary-light)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      🛡️
                    </Box>
                    <Typography variant="h6">Secure Payments</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Safe and reliable payment processing with Razorpay
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'var(--primary-light)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      📊
                    </Box>
                    <Typography variant="h6">Analytics Dashboard</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Detailed insights into your performance and bookings
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'var(--primary-light)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      ⚡
                    </Box>
                    <Typography variant="h6">Quick Onboarding</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Get started in minutes with our streamlined process
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 100%)',
              color: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Ready to Partner?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  Join our exclusive network of luxury property partners
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/partner-with-us')}
                  sx={{
                    bgcolor: 'white',
                    color: 'var(--primary-dark)',
                    fontWeight: 600,
                    px: 4,
                    '&:hover': {
                      bgcolor: '#f0f0f0'
                    }
                  }}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Blog Section */}
      <Container maxWidth="lg" sx={{ py: 16 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary', 
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 500
          }}>
            Our Blog
          </Typography>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Gilda Display, serif',
            color: 'var(--primary-dark)',
            mb: 4
          }}>
            The Ultimate Villa Experience
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Discover luxury staycations, exclusive villa insights, and premium travel experiences
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Blog Post 1 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => router.push('/blog/luxury-villa-amenities')}
            >
              <CardMedia
                component="img"
                height="240"
                image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                alt="Luxury villa amenities"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    By Sarah Williams
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    11/5/2025
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  lineHeight: 1.3,
                  color: 'var(--primary-dark)'
                }}>
                  Must-Have Amenities in Luxury Villas for the Perfect Staycation
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  From private pools to gourmet kitchens, discover the essential amenities that make your villa stay truly luxurious.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Blog Post 2 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => router.push('/blog/perfect-villa-booking')}
            >
              <CardMedia
                component="img"
                height="240"
                image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
                alt="Villa booking guide"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    By Michael Chen
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    11/5/2025
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  lineHeight: 1.3,
                  color: 'var(--primary-dark)'
                }}>
                  How to Choose the Perfect Luxury Villa for Your Staycation
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Expert tips on selecting the ideal villa that matches your luxury preferences and travel style.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Blog Post 3 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => router.push('/blog/family-villa-getaways')}
            >
              <CardMedia
                component="img"
                height="240"
                image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
                alt="Family villa getaways"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    By Priya Sharma
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    11/5/2025
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  lineHeight: 1.3,
                  color: 'var(--primary-dark)'
                }}>
                  Family-Friendly Luxury Villas: Creating Unforgettable Memories
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Discover spacious villas perfect for family gatherings, with amenities that cater to all age groups.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* View All Blog Posts Button */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/blog')}
            sx={{
              borderColor: 'var(--secondary-dark)',
              color: 'var(--secondary-dark)',
              px: 6,
              py: 2,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              fontFamily: 'Nunito, sans-serif',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'var(--secondary-dark)',
                bgcolor: 'var(--secondary-dark)',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Explore More Villa Stories
          </Button>
        </Box>
      </Container>



      {/* Callback Request Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Gilda Display, serif',
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            Need Help?
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Let us call you back and help you find the perfect villa
          </Typography>
        </Box>

        <Box sx={{ 
          bgcolor: 'var(--primary-light)', 
          borderRadius: 2, 
          p: 4,
          textAlign: 'center'
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setCallbackFormOpen(true)}
            startIcon={<Phone />}
            sx={{
              bgcolor: 'var(--secondary-dark)',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'var(--primary-dark)'
              }
            }}
          >
            Request Callback
          </Button>
        </Box>
      </Container>

      {/* Callback Form Dialog */}
      <Dialog 
        open={callbackFormOpen} 
        onClose={() => setCallbackFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Gilda Display, serif',
          color: 'var(--primary-dark)'
        }}>
          Request Callback
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={callbackFormData.name}
                onChange={(e) => handleCallbackFormChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={callbackFormData.phone}
                onChange={(e) => handleCallbackFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={callbackFormData.email}
                onChange={(e) => handleCallbackFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                value={callbackFormData.numberOfGuests}
                onChange={(e) => handleCallbackFormChange('numberOfGuests', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Time"
                value={callbackFormData.preferredTime}
                onChange={(e) => handleCallbackFormChange('preferredTime', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={callbackFormData.message}
                onChange={(e) => handleCallbackFormChange('message', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCallbackFormOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCallbackSubmit}
            variant="contained"
            sx={{
              bgcolor: 'var(--secondary-dark)',
              color: 'white',
              '&:hover': {
                bgcolor: 'var(--primary-dark)'
              }
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* No Villas Popup */}
      <Dialog 
        open={noVillasPopup.open} 
        onClose={() => setNoVillasPopup({ open: false, destination: '' })}
      >
        <DialogTitle>No Villas Available</DialogTitle>
        <DialogContent>
          <Typography>
            Sorry, we don't have any villas available in {noVillasPopup.destination} at the moment. 
            Please try searching for a different destination or contact us for assistance.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoVillasPopup({ open: false, destination: '' })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </div>
  );
}
