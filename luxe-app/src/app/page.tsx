"use client";

import React, { useState, useEffect, Suspense } from 'react';
import WhatsAppButton from '@/components/WhatsAppButton';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { callbackManager } from '@/lib/callbackManager';
import { propertyManager, destinationManager, heroBackgroundManager } from '@/lib/dataManager';
import HeroSlider from '@/components/HeroSlider';
import DealsSection from '@/components/DealsSection';
import Footer from '@/components/Footer';



function HomePageContent() {
  console.log('Homepage: Component rendering');
  
  const router = useRouter();
  const searchParams = useSearchParams();
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


  // State for featured properties and all properties
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);

  // Debug logging after state is initialized
  console.log('Homepage: featuredProperties state:', featuredProperties.length);
  console.log('Homepage: allProperties state:', allProperties.length);

  // Initialize search data from context
  useEffect(() => {
    if (searchFormData) {
      setSearchData(searchFormData);
    }
  }, [searchFormData]);

  // Handle destination URL parameter from destinations page
  useEffect(() => {
    const destinationParam = searchParams.get('destination');
    if (destinationParam) {
      console.log('Destination from URL:', destinationParam);
      setSearchData(prev => ({
        ...prev,
        destination: destinationParam
      }));
      // Also update the booking context
      setSearchFormData({
        destination: destinationParam,
        checkIn: '',
        checkOut: '',
        guests: '1'
      });
    }
  }, [searchParams, setSearchFormData]);

  // Load properties from propertyManager with real-time updates (restored from backup)
  
  useEffect(() => {
    const loadProperties = async () => {
      try {
        await propertyManager.initialize();
        const allData = propertyManager.getAll();
        const featuredData = propertyManager.getFeatured();
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
      const updatedAllData = propertyManager.getAll();
      const updatedFeaturedData = propertyManager.getFeatured();
      setAllProperties(updatedAllData);
      setFeaturedProperties(updatedFeaturedData);
      console.log('Homepage: Updated properties - All:', updatedAllData.length, 'Featured:', updatedFeaturedData.length);
    });

    // Listen for global data update events
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'properties') {
        console.log('Homepage: Global data update event received, refreshing properties...');
        loadProperties();
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);

    // Cleanup subscription and event listener
    return () => {
      unsubscribe();
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, []);

  // Load destinations from destinationManager with real-time updates (restored from backup)
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        await destinationManager.initialize();
        const destinationsData = destinationManager.getAll();
        const formattedDestinations = destinationsData.map((dest: any) => ({
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
      const updatedDestinationsData = destinationManager.getAll();
      const formattedDestinations = updatedDestinationsData.map((dest: any) => ({
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
      // Pass search data as URL parameters to villas page
      const searchParams = new URLSearchParams({
        destination: searchData.destination,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests
      });
      router.push(`/villas?${searchParams.toString()}`);
    }
  };

  const handleDestinationClick = (destination: string) => {
    // Always navigate to villas page with the selected destination
    const searchParams = new URLSearchParams({
      destination: encodeURIComponent(destination)
    });
    
    // Add check-in/check-out/guests if they exist
    if (searchData.checkIn) searchParams.append('checkIn', searchData.checkIn);
    if (searchData.checkOut) searchParams.append('checkOut', searchData.checkOut);
    if (searchData.guests) searchParams.append('guests', searchData.guests);
    
    router.push(`/villas?${searchParams.toString()}`);
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



      {/* Why Choose Us Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            The Luxe Staycations Difference
          </Typography>
        </Box>

        <Grid container spacing={4}>
            {/* Card 1: Curated Excellence */}
            <Grid item xs={12} md={4}>
            <Box sx={{ 
              textAlign: 'center',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                fontSize: '2rem'
              }}>
                🏠
              </Box>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'var(--primary-dark)',
                fontWeight: 'bold',
                mb: 2
              }}>
                Curated Excellence
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Every villa undergoes a rigorous 50-point verification process for quality and authenticity.
              </Typography>
            </Box>
          </Grid>

          {/* Card 2: Concierge Magic */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              textAlign: 'center',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                fontSize: '2rem'
              }}>
                ✨
              </Box>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'var(--primary-dark)',
                fontWeight: 'bold',
                mb: 2
              }}>
                Concierge Magic
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                From private chefs to yacht rentals, we orchestrate every detail of your escape.
              </Typography>
            </Box>
          </Grid>

          {/* Card 3: Hassle-Free Experience */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              textAlign: 'center',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                fontSize: '2rem'
              }}>
                🔒
              </Box>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                color: 'var(--primary-dark)',
                fontWeight: 'bold',
                mb: 2
              }}>
                Hassle-Free Experience
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Secure payments, transparent pricing, and 24/7 support ensure complete peace of mind.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Explore Top Properties Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            Featured Luxe Retreats
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
                      fontFamily: 'Playfair Display, serif',
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
              fontFamily: 'Playfair Display, serif',
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
                      fontFamily: 'Playfair Display, serif',
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

      {/* Deals Section */}
      <DealsSection />

      {/* Luxe Jewels Loyalty Program Section */}
      <Box sx={{ 
        position: 'relative',
        py: 6,
        borderTop: '1px solid #F0F0F0',
        borderBottom: '1px solid #F0F0F0',
        backgroundImage: 'url("https://scdn.aro.ie/Sites/50/imperialhotels2022/uploads/images/FullLengthImages/Large/SB12129735_Bedford_Hotel_Interior__Reception._4500x3000.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 5,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            p: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h4" sx={{ 
              fontFamily: 'Playfair Display, serif',
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
                    fontFamily: 'Playfair Display, serif',
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
                    fontFamily: 'Playfair Display, serif',
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
            fontFamily: 'Playfair Display, serif',
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
                fontFamily: 'Playfair Display, serif',
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
            fontFamily: 'Playfair Display, serif',
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
                image="https://visitmaldives.s3.amazonaws.com/go0mRMwZ/c/kxhw2dyl-shareable_image.jpg"
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
                image="https://www.travelanddestinations.com/wp-content/uploads/2019/05/Beautiful-places-in-Italy-Burano.jpg"
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





      {/* The LUXE Villa Experience Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Side - Image */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <img
                src="https://media.vrbo.com/lodging/84000000/83390000/83381400/83381369/c2e741a3.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill"
                alt="Luxury Villa Experience"
                style={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
              />
            </Box>
          </Grid>

          {/* Right Side - Features Grid */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { xs: 0, md: 4 } }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  color: 'var(--primary-dark)',
                  mb: 3,
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  ml: { xs: -1, md: -2 }
                }}
              >
                The LUXE Villa Experience
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.6,
                  textAlign: 'left'
                }}
              >
                Every villa in our collection is personally curated and verified through our rigorous 50-point Luxe Certification process. We don't just offer accommodations—we deliver transformative experiences where every detail is crafted for your absolute comfort and luxury.
              </Typography>

              <Grid container spacing={2}>
                {[
                  'Infinity Pools',
                  'Private Chef',
                  'Dedicated Butler',
                  'Entertainment Hub',
                  'Luxe Certified',
                  'Bespoke Celebrations',
                  'Designer Interiors',
                  'Daily Housekeeping'
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      bgcolor: 'var(--primary-light)',
                      borderRadius: 2,
                      mb: 1
                    }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'var(--secondary-dark)', 
                        mr: 2 
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                        {feature}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Need Help Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Playfair Display, serif',
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
          fontFamily: 'Playfair Display, serif',
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
            onClick={() => handleCallbackSubmit()}
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




    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Typography>Loading...</Typography>
      </Box>
    }>
      <HomePageContent />
      <WhatsAppButton
        phoneNumber="+91-8828279739"
        message="Hello! I'm interested in your luxury villas. Can you help me find the perfect staycation experience?"
        variant="floating"
        size="large"
        position={{ bottom: 20, right: 20 }}
      />
    </Suspense>
  );
}
