"use client";

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Card,
  CardMedia,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AddPhotoAlternate,
  Image
} from '@mui/icons-material';
import { typographyStyles, buttonStyles, cardStyles } from './BrandStyles';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
  description?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  title = "Property Images",
  description = "Upload high-quality images of your property"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files');
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB');
          continue;
        }

        // Convert to base64 for storage
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      setError('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ ...typographyStyles.h6, mb: 2 }}>
        {title}
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {description} (Max {maxImages} images)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <Box sx={{ mb: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            onClick={handleUploadClick}
            disabled={uploading}
            sx={{
              ...buttonStyles.outline,
              borderStyle: 'dashed',
              borderWidth: 2,
              minHeight: 120,
              width: '100%',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <AddPhotoAlternate sx={{ fontSize: 40, opacity: 0.7 }} />
            <Typography variant="body1">
              {uploading ? 'Uploading...' : 'Click to upload images'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              PNG, JPG, JPEG up to 5MB each
            </Typography>
          </Button>
        </Box>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ ...cardStyles.primary, position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={image}
                  alt={`Property image ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                
                {/* Remove Button */}
                <IconButton
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.8)'
                    }
                  }}
                >
                  <Delete />
                </IconButton>

                {/* Image Number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}
                >
                  {index + 1}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Processing images...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

