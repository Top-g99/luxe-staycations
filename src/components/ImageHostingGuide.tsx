'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle,
  Error,
  ExpandMore,
  Link,
  CloudUpload,
  Image
} from '@mui/icons-material';

export default function ImageHostingGuide() {
  const goodImageHosts = [
    {
      name: 'Unsplash',
      url: 'https://unsplash.com',
      description: 'Free stock photos with direct image URLs',
      example: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
    },
    {
      name: 'Pexels',
      url: 'https://pexels.com',
      description: 'Free stock photos with direct image URLs',
      example: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    },
    {
      name: 'Pixabay',
      url: 'https://pixabay.com',
      description: 'Free stock photos with direct image URLs',
      example: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/house-1835923_1280.jpg'
    },
    {
      name: 'Your Own Server',
      url: '',
      description: 'Upload images to your own web server',
      example: 'https://yoursite.com/images/property1.jpg'
    },
    {
      name: 'AWS S3',
      url: 'https://aws.amazon.com/s3/',
      description: 'Cloud storage with public URLs',
      example: 'https://your-bucket.s3.amazonaws.com/property1.jpg'
    }
  ];

  const badImageHosts = [
    {
      name: 'Google Photos',
      reason: 'URLs are restricted and not accessible for embedding',
      example: 'https://lh3.googleusercontent.com/...'
    },
    {
      name: 'Facebook',
      reason: 'Images are not publicly accessible via direct URLs',
      example: 'https://scontent.xx.fbcdn.net/...'
    },
    {
      name: 'Instagram',
      reason: 'Images are not publicly accessible via direct URLs',
      example: 'https://scontent.cdninstagram.com/...'
    },
    {
      name: 'Private URLs',
      reason: 'Any URL that requires authentication or is private',
      example: 'https://private-server.com/images/...'
    }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Image />
        <Typography variant="h6">
          Image Hosting Guide
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Use publicly accessible image URLs that can be embedded in web applications. 
          Google Photos, Facebook, and other social media URLs won't work.
        </Typography>
      </Alert>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ✅ Recommended Image Hosting Services
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {goodImageHosts.map((host, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {host.name}
                      </Typography>
                      {host.url && (
                        <Button
                          size="small"
                          startIcon={<Link />}
                          href={host.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit
                        </Button>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {host.description}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        Example: {host.example}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ❌ Avoid These Image Sources
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {badImageHosts.map((host, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Error color="error" />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {host.name}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {host.reason}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        Example: {host.example}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Quick Fix for Your Current Issue:
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Replace your Google Photos URL with a publicly accessible image URL from one of the recommended services above.
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Free Images from Unsplash
        </Button>
      </Box>
    </Paper>
  );
}
