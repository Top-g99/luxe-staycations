'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import {
  ZoomIn,
  Close,
  ArrowBack,
  ArrowForward,
  PlayArrow,
  Map
} from '@mui/icons-material';

interface PropertyImageGalleryProps {
  images?: string[];
  mainImage: string;
  virtualTour?: string;
  floorPlan?: string;
  propertyName: string;
}

export default function PropertyImageGallery({
  images = [],
  mainImage,
  virtualTour,
  floorPlan,
  propertyName
}: PropertyImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine all images: main image + additional images
  const allImages = [mainImage, ...images].filter(Boolean);
  const displayImages = allImages.slice(0, 5); // Show max 5 images

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleVirtualTour = () => {
    if (virtualTour) {
      window.open(virtualTour, '_blank');
    }
  };

  return (
    <Box>
      {/* Main Image Display */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box
          sx={{
            position: 'relative',
            height: 400,
            borderRadius: 3,
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover .image-overlay': {
              opacity: 1
            }
          }}
          onClick={() => handleImageClick(0)}
        >
          <img
            src={displayImages[0] || mainImage}
            alt={propertyName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          {/* Image Overlay */}
          <Box
            className="image-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <IconButton
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <ZoomIn />
            </IconButton>
          </Box>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <Chip
              label={`1 of ${allImages.length}`}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white'
              }}
            />
          )}

          {/* Virtual Tour Button */}
          {virtualTour && (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleVirtualTour}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
              }}
            >
              Virtual Tour
            </Button>
          )}
        </Box>
      </Box>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {displayImages.slice(1).map((image, index) => (
            <Box
              key={index}
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedImage === index + 1 ? '2px solid #5a3d35' : '2px solid transparent',
                transition: 'border-color 0.3s ease'
              }}
              onClick={() => {
                setSelectedImage(index + 1);
                handleImageClick(index + 1);
              }}
            >
              <img
                src={image}
                alt={`${propertyName} ${index + 2}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
          
          {/* Show more indicator */}
          {allImages.length > 5 && (
            <Box
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleImageClick(0)}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                +{allImages.length - 5} more
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Floor Plan */}
      {floorPlan && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Map />
            Floor Plan
          </Typography>
          <Box
            sx={{
              height: 200,
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid #e0e0e0'
            }}
            onClick={() => handleImageClick(allImages.length)}
          >
            <img
              src={floorPlan}
              alt={`${propertyName} Floor Plan`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#f5f5f5'
              }}
            />
          </Box>
        </Box>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            color: 'white'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>

          {allImages.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1
                }}
              >
                <ArrowBack />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1
                }}
              >
                <ArrowForward />
              </IconButton>
            </>
          )}

          <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={allImages[currentImageIndex] || floorPlan}
              alt={`${propertyName} ${currentImageIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: 1
            }}
          >
            {currentImageIndex + 1} of {allImages.length + (floorPlan ? 1 : 0)}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
