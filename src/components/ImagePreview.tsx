'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Image,
  Close,
  ZoomIn,
  CheckCircle,
  Error
} from '@mui/icons-material';
import PropertyImage from './PropertyImage';

interface ImagePreviewProps {
  property: any;
  onClose?: () => void;
}

export default function ImagePreview({ property, onClose }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const allImages = [
    { url: property.image, type: 'Main Image', priority: 1 },
    ...(property.images || []).map((url: string, index: number) => ({
      url,
      type: `Additional Image ${index + 1}`,
      priority: index + 2
    }))
  ].filter(img => img.url && img.url.trim() !== '');

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🖼️ Image Preview - {property.name}
          </Typography>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          )}
        </Box>

        {allImages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Error sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Images Uploaded
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This property has no images set. Please add images in the property editor.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Uploaded Images ({allImages.length} total):
            </Typography>
            
            <Grid container spacing={2}>
              {allImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                    onClick={() => handleImageClick(image.url)}
                  >
                    <Box sx={{ position: 'relative', mb: 1 }}>
                      <PropertyImage
                        src={image.url}
                        alt={`${image.type} for ${property.name}`}
                        height={150}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        #{image.priority}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {image.type}
                      </Typography>
                      <Chip
                        label={`Priority ${image.priority}`}
                        size="small"
                        color={image.priority === 1 ? 'primary' : 'default'}
                        icon={image.priority === 1 ? <CheckCircle /> : <Image />}
                      />
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        fontFamily: 'monospace', 
                        fontSize: '0.6rem',
                        wordBreak: 'break-all',
                        color: 'text.secondary'
                      }}
                    >
                      {image.url.length > 50 ? `${image.url.substring(0, 50)}...` : image.url}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Display Priority:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                1. <strong>Main Image</strong> - Used as primary image on all pages
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                2. <strong>Additional Images</strong> - Used as fallbacks or in galleries
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                3. <strong>Default Fallback</strong> - Used if no images are available
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Image Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Image Preview
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <PropertyImage
                src={selectedImage}
                alt="Full size preview"
                height={400}
              />
              <Typography variant="body2" sx={{ mt: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {selectedImage}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
