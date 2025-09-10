"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
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
  Phone
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { callbackManager } from '@/lib/callbackManager';
import { propertyManager, destinationManager, dealBannerManager, heroBackgroundManager } from '@/lib/dataManager';
import { typographyStyles, buttonStyles, formStyles, iconStyles, backgroundStyles } from './BrandStyles';
import DatePickerWithAvailability from './DatePickerWithAvailability';

interface HeroSliderProps {
  searchData?: any;
  handleSearchChange?: (field: string, value: string) => void;
  handleSearch?: () => void;
  setCallbackFormOpen?: (open: boolean) => void;
}

export default function HeroSlider({
  searchData = {},
  handleSearchChange = () => {},
  handleSearch = () => {},
  setCallbackFormOpen = () => {}
}: HeroSliderProps) {
  const [currentBackground, setCurrentBackground] = useState<any>(null);
  const [activeBackgrounds, setActiveBackgrounds] = useState<any[]>([]);
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        await heroBackgroundManager.initialize();
        const backgrounds = heroBackgroundManager.getActive();
        setActiveBackgrounds(backgrounds);
        
        if (backgrounds.length > 0) {
          setCurrentBackground(backgrounds[currentIndex % backgrounds.length]);
        }
      } catch (error) {
        console.error('Error loading hero backgrounds:', error);
      }
    };

    loadBackgrounds();

    // Subscribe to changes
    const unsubscribe = heroBackgroundManager.subscribe(() => {
      loadBackgrounds();
    });

    return unsubscribe;
  }, [currentIndex]);

  // Update current background when index changes
  useEffect(() => {
    if (activeBackgrounds.length > 0) {
      setCurrentBackground(activeBackgrounds[currentIndex % activeBackgrounds.length]);
    }
  }, [currentIndex, activeBackgrounds]);

  // Auto-scroll through backgrounds
  useEffect(() => {
    if (activeBackgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBackgrounds.length);
      }, 5000); // Change background every 5 seconds

      return () => clearInterval(interval);
    }
  }, [activeBackgrounds.length]);

  // Fallback background if none are loaded
  const fallbackBackground = {
    title: "Experience Luxury Redefined",
    subtitle: "Discover our handpicked collection of premium villas and exceptional service",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
    link: "",
    link_text: ""
  };

  const displayBackground = currentBackground || fallbackBackground;

  return (
    <Box sx={{
      position: 'relative',
      color: 'white',
      py: 16,
      textAlign: 'center',
      minHeight: '100vh',
      width: '100%',
      height: '100vh',
      marginTop: '-64px',
      paddingTop: '300px',
      overflow: 'hidden'
    }}>
      {/* Background Images with Smooth Transitions */}
      {activeBackgrounds.length > 0 ? (
        activeBackgrounds.map((bg, index) => (
          <Box
            key={bg.id || index}
            onClick={() => {
              if (bg.link) {
                router.push(bg.link);
              }
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `url("${bg.image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 1,
              cursor: bg.link ? 'pointer' : 'default'
            }}
          />
        ))
      ) : (
        <Box
          onClick={() => {
            if (displayBackground.link) {
              router.push(displayBackground.link);
            }
          }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `url("${displayBackground.image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
            cursor: displayBackground.link ? 'pointer' : 'default'
          }}
        />
      )}

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
          zIndex: 2
        }}
      />

      {/* Navigation Arrows */}
      {activeBackgrounds.length > 1 && (
        <>
          <IconButton
            onClick={() => setCurrentIndex((prevIndex) => 
              prevIndex === 0 ? activeBackgrounds.length - 1 : prevIndex - 1
            )}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 4,
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)'
              }
            }}
          >
            ←
          </IconButton>
          <IconButton
            onClick={() => setCurrentIndex((prevIndex) => 
              (prevIndex + 1) % activeBackgrounds.length
            )}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 4,
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)'
              }
            }}
          >
            →
          </IconButton>
        </>
      )}

      {/* Content with Smooth Transitions */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        <Box
          key={currentIndex}
          sx={{
            animation: 'fadeIn 0.8s ease-in-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              ...typographyStyles.h1,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              mb: 3
            }}
          >
            {displayBackground.title}
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              ...typographyStyles.h5,
              color: 'white',
              mb: displayBackground.link ? 3 : 6,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {displayBackground.subtitle}
          </Typography>
        </Box>
        
                {/* Link Button with Smooth Transitions */}
        {displayBackground.link && displayBackground.link_text && (
          <Box 
            key={`button-${currentIndex}`}
            sx={{ 
              mb: 6, 
              textAlign: 'center',
              animation: 'fadeInUp 0.8s ease-in-out 0.2s both',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push(displayBackground.link)}
              sx={{
                color: 'white',
                borderColor: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {displayBackground.link_text}
            </Button>
          </Box>
        )}
        
        {/* Search Form */}
        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          bgcolor: 'rgba(0, 0, 0, 0.7)', 
          backdropFilter: 'blur(15px)',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1.5fr 1fr' },
            gap: 2.5,
            alignItems: 'end',
            minHeight: '60px'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="body2" sx={{ 
                color: 'white', 
                mb: 1, 
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Destination
              </Typography>
              <FormControl fullWidth sx={{ flex: 1 }}>
                <Select
                  value={searchData.destination}
                  onChange={(e) => handleSearchChange('destination', e.target.value as string)}
                  startAdornment={<LocationOn sx={{ ...iconStyles.primary, mr: 1.5 }} />}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    height: '44px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '& .MuiSelect-select': {
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)'
                    }
                  }}
                >
                  <MenuItem value="" disabled>Select a destination</MenuItem>
                  {/* Alphabetically Sorted Destinations */}
                  {[
                    // Maharashtra Destinations (Alphabetically Sorted)
                    "Ajanta, Maharashtra",
                    "Akola, Maharashtra", 
                    "Alibaug, Maharashtra",
                    "Amboli, Maharashtra",
                    "Amravati, Maharashtra",
                    "Aurangabad, Maharashtra",
                    "Beed, Maharashtra",
                    "Bhandara, Maharashtra",
                    "Bhandardara, Maharashtra",
                    "Buldhana, Maharashtra",
                    "Chandrapur, Maharashtra",
                    "Chikhaldara, Maharashtra",
                    "Dhule, Maharashtra",
                    "Ellora, Maharashtra",
                    "Gadchiroli, Maharashtra",
                    "Ganpatipule, Maharashtra",
                    "Gondia, Maharashtra",
                    "Hingoli, Maharashtra",
                    "Igatpuri, Maharashtra",
                    "Jalgaon, Maharashtra",
                    "Jalna, Maharashtra",
                    "Khandala, Maharashtra",
                    "Kolhapur, Maharashtra",
                    "Latur, Maharashtra",
                    "Lonavala, Maharashtra",
                    "Mahabaleshwar, Maharashtra",
                    "Malvan, Maharashtra",
                    "Matheran, Maharashtra",
                    "Melghat, Maharashtra",
                    "Mumbai, Maharashtra",
                    "Murud, Maharashtra",
                    "Nagpur, Maharashtra",
                    "Nanded, Maharashtra",
                    "Nandurbar, Maharashtra",
                    "Nashik, Maharashtra",
                    "Osmanabad, Maharashtra",
                    "Palghar, Maharashtra",
                    "Panchgani, Maharashtra",
                    "Parbhani, Maharashtra",
                    "Pench, Maharashtra",
                    "Pune, Maharashtra",
                    "Raigad, Maharashtra",
                    "Ratnagiri, Maharashtra",
                    "Sangli, Maharashtra",
                    "Saputara, Maharashtra",
                    "Satara, Maharashtra",
                    "Shirdi, Maharashtra",
                    "Sindhudurg, Maharashtra",
                    "Solapur, Maharashtra",
                    "Tadoba, Maharashtra",
                    "Tarkarli, Maharashtra",
                    "Thane, Maharashtra",
                    "Trimbakeshwar, Maharashtra",
                    "Wardha, Maharashtra",
                    "Washim, Maharashtra",
                    "Yavatmal, Maharashtra",
                    // Other Popular Destinations (Alphabetically Sorted)
                    "Goa, India",
                    "Karnataka, India",
                    "Kerala, India",
                    "Tamil Nadu, India"
                  ].map((destination) => (
                    <MenuItem key={destination} value={destination}>
                      {destination}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="body2" sx={{ 
                color: 'white', 
                mb: 1, 
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Check In & Check Out
              </Typography>
              <Box sx={{ flex: 1 }}>
                <DatePickerWithAvailability
                  value={{
                    checkIn: searchData.checkIn ? new Date(searchData.checkIn) : null,
                    checkOut: searchData.checkOut ? new Date(searchData.checkOut) : null
                  }}
                  onChange={(dates) => {
                    handleSearchChange('checkIn', dates.checkIn ? dates.checkIn.toISOString().split('T')[0] : '');
                    handleSearchChange('checkOut', dates.checkOut ? dates.checkOut.toISOString().split('T')[0] : '');
                  }}
                  label=""
                  placeholder="Select check-in and check-out dates"
                  showAvailability={false}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      borderRadius: 2,
                      height: '44px',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.95)'
                      }
                    },
                    '& .MuiInputBase-input': {
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="body2" sx={{ 
                color: 'white', 
                mb: 1, 
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Guests
              </Typography>
              <FormControl fullWidth sx={{ flex: 1 }}>
                <Select
                  value={searchData.guests}
                  onChange={(e) => handleSearchChange('guests', e.target.value as string)}
                  startAdornment={<Search sx={{ ...iconStyles.primary, mr: 1.5 }} />}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    height: '44px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '& .MuiSelect-select': {
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)'
                    }
                  }}
                >
                  <MenuItem value="" disabled>Select guests</MenuItem>
                  <MenuItem value="1">1 Guest</MenuItem>
                  <MenuItem value="2">2 Guests</MenuItem>
                  <MenuItem value="3">3 Guests</MenuItem>
                  <MenuItem value="4">4 Guests</MenuItem>
                  <MenuItem value="5">5 Guests</MenuItem>
                  <MenuItem value="6+">6+ Guests</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-end',
              height: '100%',
              pt: 2.5
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                startIcon={<Search sx={{ fontSize: '1rem' }} />}
                sx={{
                  bgcolor: '#8B4513',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  height: '44px',
                  minWidth: '160px',
                  width: '100%',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 6px 15px rgba(139, 69, 19, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#A0522D',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(139, 69, 19, 0.4)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  }
                }}
              >
                Explore Villas
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Background Indicators */}
      {activeBackgrounds.length > 1 && (
        <Box sx={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
          display: 'flex',
          gap: 1
        }}>
          {activeBackgrounds.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.8)'
                }
              }}
            />
          ))}
        </Box>
      )}

    </Box>
  );
}
