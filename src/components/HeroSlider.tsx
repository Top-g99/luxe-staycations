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
  ChevronLeft,
  ChevronRight,
  Phone,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBookingContext } from '@/contexts/BookingContext';
import { callbackManager } from '@/lib/callbackManager';
import { propertyManager } from '@/lib/propertyManager';
import { destinationManager } from '@/lib/destinationManager';
import { dealBannerManager } from '@/lib/dealBannerManager';
import { heroBackgroundManager } from '@/lib/heroBackgroundManager';
import { typographyStyles, buttonStyles, formStyles, iconStyles, backgroundStyles } from './BrandStyles';

interface HeroSliderProps {
  searchData: any;
  handleSearchChange: (field: string, value: string) => void;
  handleSearch: () => void;
  setCallbackFormOpen: (open: boolean) => void;
}

export default function HeroSlider({
  searchData,
  handleSearchChange,
  handleSearch,
  setCallbackFormOpen
}: HeroSliderProps) {
  const [currentBackground, setCurrentBackground] = useState<any>(null);
  const [activeBackgrounds, setActiveBackgrounds] = useState<any[]>([]);
  const [sliderInfo, setSliderInfo] = useState({ currentIndex: 0, totalSlides: 0 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadBackgrounds = () => {
      const backgrounds = heroBackgroundManager.getActiveBackgrounds();
      const current = heroBackgroundManager.getCurrentBackground();
      const info = heroBackgroundManager.getSliderInfo();
      
      setActiveBackgrounds(backgrounds);
      setCurrentBackground(current);
      setSliderInfo(info);
    };

    loadBackgrounds();

    // Subscribe to changes
    const unsubscribe = heroBackgroundManager.subscribe(() => {
      loadBackgrounds();
    });

    return unsubscribe;
  }, []);

  const handleNextSlide = () => {
    heroBackgroundManager.nextSlide();
  };

  const handlePreviousSlide = () => {
    heroBackgroundManager.previousSlide();
  };

  const handleGoToSlide = (index: number) => {
    heroBackgroundManager.goToSlide(index);
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      heroBackgroundManager.stopAutoSlide();
      setIsAutoPlaying(false);
    } else {
      heroBackgroundManager.startAutoSlide(5000);
      setIsAutoPlaying(true);
    }
  };

  if (!currentBackground) {
    return null;
  }

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
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url("${currentBackground.imageUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'opacity 0.5s ease-in-out',
          zIndex: 1
        }}
      />

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

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        <Typography 
          variant="h1" 
          sx={{ 
            ...typographyStyles.h1,
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            mb: 3
          }}
        >
          {currentBackground.title}
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            ...typographyStyles.h5,
            color: 'white',
            mb: 6,
            maxWidth: '800px',
            mx: 'auto',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {currentBackground.subtitle}
        </Typography>
        
        {/* Search Form */}
        <Box sx={{ 
          maxWidth: 1000, 
          mx: 'auto', 
          bgcolor: 'rgba(0, 0, 0, 0.7)', 
          backdropFilter: 'blur(15px)',
          borderRadius: 3,
          p: 4,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
            alignItems: 'end'
          }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Destination
              </Typography>
              <FormControl fullWidth>
                                  <Select
                    value={searchData.destination}
                    onChange={(e) => handleSearchChange('destination', e.target.value as string)}
                    startAdornment={<LocationOn sx={{ ...iconStyles.primary, mr: 1 }} />}
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '& .MuiSelect-select': {
                        py: 1.5
                      }
                    }}
                  >
                  <MenuItem value="" disabled>Select a destination</MenuItem>
                  <MenuItem value="Lonavala, Maharashtra">Lonavala, Maharashtra</MenuItem>
                  <MenuItem value="Mumbai, Maharashtra">Mumbai, Maharashtra</MenuItem>
                  <MenuItem value="Pune, Maharashtra">Pune, Maharashtra</MenuItem>
                  <MenuItem value="Goa, India">Goa, India</MenuItem>
                  <MenuItem value="Kerala, India">Kerala, India</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Check In
              </Typography>
                                <TextField
                    fullWidth
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => handleSearchChange('checkIn', e.target.value)}
                    placeholder="dd/mm/yyyy"
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ ...iconStyles.primary, mr: 1 }} />
                    }}
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none'
                        },
                        '&:hover fieldset': {
                          border: 'none'
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none'
                        }
                      },
                      '& .MuiInputBase-input': {
                        py: 1.5
                      }
                    }}
                  />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Check Out
              </Typography>
                                <TextField
                    fullWidth
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => handleSearchChange('checkOut', e.target.value)}
                    placeholder="dd/mm/yyyy"
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ ...iconStyles.primary, mr: 1 }} />
                    }}
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none'
                        },
                        '&:hover fieldset': {
                          border: 'none'
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none'
                        }
                      },
                      '& .MuiInputBase-input': {
                        py: 1.5
                      }
                    }}
                  />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
                Guests
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={searchData.guests}
                  onChange={(e) => handleSearchChange('guests', e.target.value as string)}
                  startAdornment={<Search sx={{ ...iconStyles.primary, mr: 1 }} />}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '& .MuiSelect-select': {
                      py: 1.5
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
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              startIcon={<Search />}
              sx={{
                ...buttonStyles.secondary,
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Search Villas
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Navigation Arrows */}
      {activeBackgrounds.length > 1 && (
        <>
          <IconButton
            onClick={handlePreviousSlide}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 4,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <IconButton
            onClick={handleNextSlide}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 4,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <ChevronRight />
          </IconButton>
        </>
      )}

      {/* Slide Indicators */}
      {activeBackgrounds.length > 1 && (
        <Box sx={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 4
        }}>
          {activeBackgrounds.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleGoToSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: index === sliderInfo.currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: index === sliderInfo.currentIndex ? 'white' : 'rgba(255,255,255,0.7)'
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Auto-play Toggle */}
      {activeBackgrounds.length > 1 && (
        <IconButton
          onClick={toggleAutoPlay}
          sx={{
            position: 'absolute',
            top: 30,
            right: 30,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            zIndex: 4,
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          {isAutoPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      )}

      {/* Slide Counter */}
      {activeBackgrounds.length > 1 && (
        <Box sx={{
          position: 'absolute',
          top: 30,
          left: 30,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: '0.9rem',
          zIndex: 4
        }}>
          {sliderInfo.currentIndex + 1} / {sliderInfo.totalSlides}
        </Box>
      )}
    </Box>
  );
}
