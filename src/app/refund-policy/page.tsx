"use client";

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { 
  Refresh, 
  CheckCircle,
  Warning,
  Schedule,
  Payment,
  Info,
  Done,
  Error
} from '@mui/icons-material';

export default function RefundPolicy() {
  const lastUpdated = "March 15, 2024";

  const refundEligibility = [
    {
      scenario: "Cancellation within free period",
      eligibility: "100% refund",
      description: "Full refund for cancellations made 7+ days before check-in",
      icon: <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
    },
    {
      scenario: "Property not as described",
      eligibility: "100% refund",
      description: "Full refund if property significantly differs from listing",
      icon: <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
    },
    {
      scenario: "Force majeure events",
      eligibility: "100% refund",
      description: "Full refund for events beyond our control",
      icon: <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
    },
    {
      scenario: "Late cancellation",
      eligibility: "Partial refund",
      description: "Refund based on cancellation timing",
      icon: <Warning sx={{ color: '#f59e0b', fontSize: 24 }} />
    }
  ];

  const refundTimeline = [
    {
      step: "Cancellation Request",
      description: "Submit cancellation through our platform",
      duration: "Immediate",
      icon: <Done sx={{ color: '#d97706' }} />
    },
    {
      step: "Review Process",
      description: "Our team reviews the request",
      duration: "24 hours",
      icon: <Schedule sx={{ color: '#d97706' }} />
    },
    {
      step: "Approval",
      description: "Cancellation approved and refund initiated",
      duration: "1-2 hours",
      icon: <CheckCircle sx={{ color: '#d97706' }} />
    },
    {
      step: "Processing",
      description: "Refund processed by payment provider",
      duration: "3-5 business days",
      icon: <Payment sx={{ color: '#d97706' }} />
    },
    {
      step: "Credit to Account",
      description: "Refund appears in your account",
      duration: "5-7 business days",
      icon: <Refresh sx={{ color: '#d97706' }} />
    }
  ];

  const nonRefundableScenarios = [
    "No-show without prior cancellation",
    "Violation of property rules",
    "Damage to property during stay",
    "Early check-out without notice",
    "Booking modifications after check-in"
  ];

  const refundMethods = [
    {
      method: "Original Payment Method",
      description: "Refunds are processed back to the original payment method used for booking",
      timeframe: "5-7 business days"
    },
    {
      method: "Credit to Account",
      description: "Option to receive credit for future bookings",
      timeframe: "Immediate"
    },
    {
      method: "Bank Transfer",
      description: "Direct bank transfer for large amounts",
      timeframe: "7-10 business days"
    }
  ];

  return (
    <Box sx={{ pt: 16, pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2d1b1b 0%, #1a1a1a 50%, #0f0f0f 100%)',
          color: 'white',
          py: 12,
          mb: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(45deg, #d97706, #fbbf24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Refund Policy
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#d1d5db',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Understanding our refund process and eligibility criteria to ensure fair and transparent 
              refunds for all our guests.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#9ca3af',
                mt: 2
              }}
            >
              Last updated: {lastUpdated}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Important Notice */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 6,
            '& .MuiAlert-icon': {
              color: '#d97706'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: '#1e40af' }}>
            Important Information
          </Typography>
          <Typography variant="body1" sx={{ color: '#1e40af' }}>
            Refund policies may vary by property and booking type. Please review the specific terms 
            for your chosen property during the booking process.
          </Typography>
        </Alert>

        {/* Refund Eligibility */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600,
              color: '#2d1b1b'
            }}
          >
            Refund Eligibility
          </Typography>
          <Grid container spacing={4}>
            {refundEligibility.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ p: 4, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      {item.icon}
                      <Box sx={{ ml: 3, flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d1b1b', mb: 1 }}>
                          {item.scenario}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#d97706', fontWeight: 600, mb: 1 }}>
                          {item.eligibility}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Refund Timeline */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600,
              color: '#2d1b1b'
            }}
          >
            Refund Timeline
          </Typography>
          <Timeline position="alternate">
            {refundTimeline.map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot sx={{ backgroundColor: '#d97706' }}>
                    {item.icon}
                  </TimelineDot>
                  {index < refundTimeline.length - 1 && (
                    <TimelineConnector sx={{ backgroundColor: '#d97706' }} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Card sx={{ p: 3, maxWidth: 300 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d1b1b', mb: 1 }}>
                        {item.step}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        {item.description}
                      </Typography>
                      <Chip 
                        label={item.duration} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#d97706', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>

        {/* Non-Refundable Scenarios */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Error sx={{ fontSize: 40, color: '#ef4444', mr: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Non-Refundable Scenarios
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              The following scenarios are not eligible for refunds:
            </Typography>
            <List>
              {nonRefundableScenarios.map((scenario, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Error sx={{ color: '#ef4444', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={scenario} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#374151',
                        fontSize: '1rem'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Refund Methods */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Payment sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Refund Methods
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We offer multiple refund methods to accommodate your preferences:
            </Typography>
            <List>
              {refundMethods.map((method, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                          {method.method}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                          {method.description}
                        </Typography>
                        <Chip 
                          label={method.timeframe} 
                          size="small"
                          sx={{ 
                            backgroundColor: '#d97706', 
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, color: '#2d1b1b' }}>
              Dispute Resolution
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              If you disagree with a refund decision:
            </Typography>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Contact our customer service team within 30 days" 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      color: '#374151',
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Provide supporting documentation and evidence" 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      color: '#374151',
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Our team will review and respond within 5 business days" 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      color: '#374151',
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, color: '#2d1b1b' }}>
              Need Help with Refunds?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              If you have questions about our refund policy or need assistance with a refund request, 
              please contact us:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                <strong>Phone:</strong> +91 98765 43210 (24/7)
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                <strong>Email:</strong> refunds@luxestaycations.com
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                <strong>Live Chat:</strong> Available on our website 24/7
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
