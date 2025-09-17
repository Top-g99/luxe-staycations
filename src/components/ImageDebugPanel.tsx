'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Image,
  Refresh,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { propertyManager } from '@/lib/dataManager';

export default function ImageDebugPanel() {
  const [properties, setProperties] = useState<any[]>([]);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      const allProperties = await propertyManager.getAll();
      setProperties(allProperties);
    };

    // Initial load
    loadProperties();

    // Subscribe to updates
    const unsubscribe = propertyManager.subscribe(() => {
      loadProperties();
    });

    return unsubscribe;
  }, []);

  const testImageUrl = (url: string) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ url, status: 'success' });
      img.onerror = () => resolve({ url, status: 'error' });
      img.src = url;
    });
  };

  const handleTestImages = async (property: any) => {
    const imageUrls = [
      property.image,
      ...(property.images || [])
    ].filter(Boolean);

    const results = await Promise.all(
      imageUrls.map(url => testImageUrl(url))
    );

    console.log(`Image test results for ${property.name}:`, results);
    return results;
  };

  const getImageStatus = (property: any) => {
    const hasMainImage = !!property.image;
    const hasAdditionalImages = property.images && property.images.length > 0;
    const totalImages = (property.images || []).length + (hasMainImage ? 1 : 0);
    
    if (totalImages === 0) return { status: 'error', text: 'No images' };
    if (hasMainImage && hasAdditionalImages) return { status: 'success', text: `${totalImages} images` };
    if (hasMainImage) return { status: 'warning', text: 'Main image only' };
    return { status: 'warning', text: 'Additional images only' };
  };

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🖼️ Image Debug Panel
        </Typography>
        <Button
          size="small"
          startIcon={<Refresh />}
          onClick={async () => {
            const allProperties = await propertyManager.getAll();
            setProperties(allProperties);
          }}
        >
          Refresh
        </Button>
      </Box>

      {properties.length === 0 ? (
        <Alert severity="info">
          No properties found. Add a property first to debug images.
        </Alert>
      ) : (
        <List dense>
          {properties.map((property, index) => {
            const imageStatus = getImageStatus(property);
            const isExpanded = expandedProperty === property.id;
            
            return (
              <React.Fragment key={property.id}>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {property.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={imageStatus.text}
                          color={imageStatus.status as any}
                          size="small"
                          icon={imageStatus.status === 'success' ? <CheckCircle /> : <Warning />}
                        />
                        <Button
                          size="small"
                          onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                        >
                          {isExpanded ? 'Hide' : 'Show'} Details
                        </Button>
                      </Box>
                    </Box>
                    
                    {isExpanded && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Image URLs:
                        </Typography>
                        
                        {/* Main Image */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Main Image:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                            {property.image || 'Not set'}
                          </Typography>
                        </Box>
                        
                        {/* Additional Images */}
                        {property.images && property.images.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              Additional Images ({property.images.length}):
                            </Typography>
                            {property.images.map((url: string, imgIndex: number) => (
                              <Typography key={imgIndex} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', mb: 0.5 }}>
                                {imgIndex + 1}. {url}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        
                        {/* Image Priority */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Display Priority:
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            1. Main Image: {property.image ? '✓ Used' : '✗ Not set'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            2. First Additional Image: {property.images?.[0] ? '✓ Fallback' : '✗ Not available'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            3. Default Fallback: ✓ Always available
                          </Typography>
                        </Box>
                        
                        {/* Test Button */}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Image />}
                          onClick={() => handleTestImages(property)}
                        >
                          Test All Images
                        </Button>
                      </Box>
                    )}
                  </Box>
                </ListItem>
                {index < properties.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
}
