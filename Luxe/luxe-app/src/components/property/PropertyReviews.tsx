'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Chip,
  Button,
  Grid,
  Divider,
  Collapse
} from '@mui/material';
import {
  Verified,
  ExpandMore,
  ExpandLess,
  Star
} from '@mui/icons-material';

interface PropertyReviewsProps {
  propertyReviews?: {
    id: string;
    guestName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }[];
  overallRating: number;
  totalReviews: number;
}

export default function PropertyReviews({
  propertyReviews = [],
  overallRating,
  totalReviews
}: PropertyReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const displayedReviews = showAllReviews ? propertyReviews : propertyReviews.slice(0, 3);

  if (propertyReviews.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Guest Reviews
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Star sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No reviews yet. Be the first to review this property!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Guest Reviews
        </Typography>

        {/* Overall Rating Summary */}
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(90, 61, 53, 0.05)', borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {overallRating.toFixed(1)}
                </Typography>
                <Rating value={overallRating} precision={0.1} readOnly size="large" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Based on {totalReviews} review{totalReviews > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = propertyReviews.filter(review => Math.round(review.rating) === star).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 20 }}>
                        {star}
                      </Typography>
                      <Star sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box sx={{ flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            backgroundColor: 'primary.main',
                            width: `${percentage}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Individual Reviews */}
        <Box>
          {displayedReviews.map((review, index) => (
            <Box key={review.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'primary.main' }}>
                  {getInitials(review.guestName)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.guestName}
                    </Typography>
                    {review.verified && (
                      <Chip
                        icon={<Verified />}
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={review.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(review.date)}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      display: review.comment.length > 200 && expandedReview !== review.id ? '-webkit-box' : 'block',
                      WebkitLineClamp: review.comment.length > 200 && expandedReview !== review.id ? 3 : 'unset',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {review.comment}
                  </Typography>
                  
                  {review.comment.length > 200 && (
                    <Button
                      size="small"
                      onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                      sx={{ mt: 1, p: 0, minWidth: 'auto' }}
                    >
                      {expandedReview === review.id ? (
                        <>
                          Show less <ExpandLess />
                        </>
                      ) : (
                        <>
                          Show more <ExpandMore />
                        </>
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
              
              {index < displayedReviews.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        {/* Show More/Less Button */}
        {propertyReviews.length > 3 && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllReviews(!showAllReviews)}
              endIcon={showAllReviews ? <ExpandLess /> : <ExpandMore />}
            >
              {showAllReviews ? 'Show Less' : `Show All ${propertyReviews.length} Reviews`}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
