'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Fade,
  Slide
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { dealBannerManager } from '@/lib/dataManager';
import type { DealBanner } from '@/lib/dataManager';

export default function DealBanner() {
  const [dealBanner, setDealBanner] = useState<DealBanner | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadDealBanner = async () => {
      try {
        await dealBannerManager.initialize();
        // Use getActive() method and get the first active banner
        const data = await dealBannerManager.getAll();
        const activeBanner = Array.isArray(data) ? data[0] : data;
        
        console.log('DealBanner: Loading deal banner data:', {
          activeBanner,
          isActive: activeBanner?.isActive,
          hasVideo: !!activeBanner?.videoUrl,
          videoUrl: activeBanner?.videoUrl,
          hasImage: !!activeBanner?.fallbackImageUrl,
          imageUrl: activeBanner?.fallbackImageUrl
        });
        
        if (activeBanner && activeBanner.isActive) {
          setDealBanner(activeBanner);
          // Show banner with animation after a short delay
          setTimeout(() => setIsVisible(true), 500);
        }
      } catch (error) {
        console.error('Error loading deal banner:', error);
        setHasError(true);
      }
    };

    loadDealBanner();
  }, []);

  // Error boundary - prevent crashes
  if (hasError) {
    console.log('DealBanner: Error state, not rendering');
    return null;
  }

  if (!dealBanner || !dealBanner.isActive) {
    return null;
  }

  return (
    <Fade in={isVisible} timeout={1000}>
              <Box
          sx={{
            background: 'linear-gradient(135deg, #8B4513 0%, #000000 100%)',
            color: 'white',
            py: 6,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1
            }
          }}
        >
        {/* Background Video or Image */}
        {dealBanner.videoUrl && dealBanner.videoUrl.trim() !== '' && !videoError && (
          <Box sx={{ position: 'relative', zIndex: 0 }}>
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                bgcolor: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                p: 1, 
                borderRadius: 1, 
                fontSize: '12px',
                zIndex: 10
              }}>
                Video URL: {dealBanner.videoUrl}
              </Box>
            )}
            
            <Box
              component="video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              crossOrigin="anonymous"
              onLoadStart={() => {
                console.log('Video loading started:', dealBanner.videoUrl);
                console.log('Video element:', document.querySelector('video'));
              }}
              onCanPlay={() => console.log('Video can play:', dealBanner.videoUrl)}
              onError={(e) => {
                const videoElement = e.target as HTMLVideoElement;
                
                // Only log in development mode to avoid console spam
                if (process.env.NODE_ENV === 'development') {
                  console.log('Video failed to load, falling back to image:', {
                    videoUrl: dealBanner.videoUrl,
                    errorCode: videoElement?.error?.code,
                    errorMessage: videoElement?.error?.message
                  });
                }
                
                // Force fallback to image if video fails
                setVideoError(true);
              }}
              onPlay={() => console.log('Video started playing')}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
                opacity: 0.5
              }}
            >
              <source src={dealBanner.videoUrl} type="video/mp4" />
              <source src={dealBanner.videoUrl} type="video/webm" />
              <source src={dealBanner.videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </Box>
          </Box>
        )}
        
        {/* Fallback Image - shown when no video or if video fails */}
        {((!dealBanner.videoUrl || !dealBanner.videoUrl.trim() || videoError) && dealBanner.fallbackImageUrl) && (
          <Box
            component="img"
            src={dealBanner.fallbackImageUrl}
            alt="Deal Banner Background"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              opacity: 0.5
            }}
          />
        )}

        {/* Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Slide direction="up" in={isVisible} timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '3px 3px 6px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)',
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                  color: 'white'
                }}
              >
                {dealBanner.title}
              </Typography>
              
              {dealBanner.subtitle && (
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 1,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    color: 'white'
                  }}
                >
                  {dealBanner.subtitle}
                </Typography>
              )}

              {dealBanner.buttonLink && dealBanner.buttonLink.trim() !== '' && (
                <Box sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: 2, 
                  p: 2, 
                  display: 'inline-block',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    href={dealBanner.buttonLink}
                    startIcon={<PlayArrow />}
                    sx={{
                      bgcolor: 'white',
                      color: '#8B4513',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {dealBanner.buttonText}
                  </Button>
                </Box>
              )}
            </Box>
          </Slide>
        </Container>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(139, 69, 19, 0.1) 0%, transparent 70%)',
            zIndex: 0
          }}
        />
      </Box>
    </Fade>
  );
}
