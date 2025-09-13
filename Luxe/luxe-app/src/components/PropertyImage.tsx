'use client';

import React, { useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

interface PropertyImageProps {
  src: string;
  alt: string;
  height?: number | string;
  width?: number | string;
  fallbackSrc?: string;
  style?: React.CSSProperties;
}

export default function PropertyImage({ 
  src, 
  alt, 
  height = 250, 
  width = '100%',
  fallbackSrc = '',
  style = {}
}: PropertyImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    console.log(`PropertyImage: Successfully loaded image: ${imageSrc}`);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.error(`PropertyImage: Image failed to load: ${src}`);
    console.warn('This might be due to:');
    console.warn('1. Google Photos URL (not accessible for embedding)');
    console.warn('2. Private/restricted image URL');
    console.warn('3. Invalid image URL');
    console.warn('Please use a publicly accessible image URL');
    setIsLoading(false);
    setHasError(true);
  };

  // If no src provided, show nothing
  if (!src || src.trim() === '') {
    return (
      <Box sx={{ 
        position: 'relative', 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        border: '2px dashed #ccc'
      }}>
        <Typography variant="body2" color="text.secondary">
          No Image Uploaded
        </Typography>
      </Box>
    );
  }

  // Show error state if image failed to load
  if (hasError) {
    return (
      <Box sx={{ 
        position: 'relative', 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#fff3cd',
        border: '2px dashed #ffc107'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
            Image Failed to Load
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Check image URL
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height, width }}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isLoading ? 'none' : 'block',
          ...style
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </Box>
  );
}
