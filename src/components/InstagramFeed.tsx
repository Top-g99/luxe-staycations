"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button
} from '@mui/material';
import {
  Instagram,
  Favorite,
  Comment,
  Share,
  Visibility,
  Refresh,
  OpenInNew,
  Tag
} from '@mui/icons-material';
import { instagramService, InstagramPost } from '@/lib/instagramService';

interface InstagramFeedProps {
  limit?: number;
  showHeader?: boolean;
  onPostClick?: (post: InstagramPost) => void;
}

export default function InstagramFeed({ 
  limit = 6, 
  showHeader = true,
  onPostClick 
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [limit]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await instagramService.initialize();
      setIsConfigured(true);

      // Mock Instagram posts for now
      const mockPosts: InstagramPost[] = [
        {
          id: '1',
          caption: 'Luxury villa with stunning ocean views 🌊 #LuxeStaycations #LuxuryTravel',
          media_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
          media_type: 'IMAGE',
          timestamp: new Date().toISOString(),
          permalink: 'https://instagram.com/p/mock1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          caption: 'Perfect sunset from our premium villa terrace ✨ #Sunset #LuxuryVilla',
          media_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
          media_type: 'IMAGE',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          permalink: 'https://instagram.com/p/mock2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setPosts(mockPosts.slice(0, limit));
    } catch (err) {
      console.error('Error loading Instagram posts:', err);
      setError('Failed to load Instagram posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: InstagramPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      setSelectedPost(post);
    }
  };

  const handleCloseDialog = () => {
    setSelectedPost(null);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="warning" 
        action={
          <IconButton color="inherit" size="small" onClick={loadPosts}>
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Instagram sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Instagram Posts Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your Instagram account to see your latest posts here.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {showHeader && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Instagram sx={{ fontSize: 32, color: '#E4405F', mr: 2 }} />
          <Box>
            <Typography variant="h5" gutterBottom>
              Instagram Feed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest posts from @luxestaycations
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={loadPosts} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      )}

      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => handlePostClick(post)}
            >
              <Box sx={{ position: 'relative' }}>
                <img
                  src={post.media_url}
                  alt={post.caption.substring(0, 50)}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
                {post.media_type === 'VIDEO' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: '50%',
                      p: 0.5
                    }}
                  >
                    <Visibility sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              </Box>
              
              <CardContent>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {post.caption}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    icon={<Favorite />}
                    label={formatNumber(1250)}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Comment />}
                    label={formatNumber(89)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.timestamp)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Post Detail Dialog */}
      <Dialog 
        open={!!selectedPost} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPost && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#E4405F' }}>
                  <Instagram />
                </Avatar>
                <Box>
                  <Typography variant="h6">@luxestaycations</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(selectedPost.timestamp)}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Tooltip title="View on Instagram">
                    <IconButton 
                      onClick={() => window.open(selectedPost.permalink, '_blank')}
                    >
                      <OpenInNew />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <img
                  src={selectedPost.media_url}
                  alt={selectedPost.caption}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPost.caption}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  icon={<Favorite />}
                  label={`${formatNumber(1250)} likes`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<Comment />}
                  label={`${formatNumber(89)} comments`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<OpenInNew />}
                onClick={() => window.open(selectedPost.permalink, '_blank')}
                sx={{
                  background: 'linear-gradient(45deg, #E4405F, #C13584)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #d63384, #a02d6b)',
                  }
                }}
              >
                View on Instagram
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
