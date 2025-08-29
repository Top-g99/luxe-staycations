"use client";

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import { 
  Gavel, 
  CheckCircle,
  Warning,
  Security,
  Business
} from '@mui/icons-material';

export default function TermsOfService() {
  const lastUpdated = "March 15, 2024";

  const userResponsibilities = [
    "Provide accurate and complete information during booking",
    "Respect the property and its amenities",
    "Follow house rules and local regulations",
    "Pay all applicable fees and charges",
    "Report any issues or damages immediately",
    "Maintain appropriate behavior during your stay"
  ];

  const prohibitedActivities = [
    "Smoking in non-smoking areas",
    "Bringing unauthorized pets",
    "Exceeding maximum occupancy limits",
    "Hosting parties without permission",
    "Damaging property or amenities",
    "Violating local laws or regulations"
  ];

  const cancellationPolicy = [
    "Free cancellation up to 7 days before check-in",
    "50% refund for cancellations 3-7 days before check-in",
    "No refund for cancellations within 48 hours of check-in",
    "Force majeure events may qualify for full refund",
    "Processing fees are non-refundable",
    "Refunds processed within 5-7 business days"
  ];

  const paymentTerms = [
    "20% deposit required at time of booking",
    "Remaining balance due 7 days before check-in",
    "Accepted payment methods: Credit/Debit cards, UPI, Net Banking",
    "All prices include applicable taxes",
    "Additional charges may apply for extra services",
    "Payment processing fees are non-refundable"
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
              Terms of Service
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
              Please read these terms and conditions carefully before using our services.
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
          severity="warning" 
          sx={{ 
            mb: 6,
            '& .MuiAlert-icon': {
              color: '#d97706'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: '#92400e' }}>
            Important Notice
          </Typography>
          <Typography variant="body1" sx={{ color: '#92400e' }}>
            By using our website and services, you agree to be bound by these terms and conditions. 
            If you do not agree with any part of these terms, please do not use our services.
          </Typography>
        </Alert>

        {/* Acceptance of Terms */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Gavel sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Acceptance of Terms
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              These Terms of Service ("Terms") govern your use of the Luxe Staycations website and services. 
              By accessing or using our services, you agree to be bound by these Terms and all applicable 
              laws and regulations.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting on our website. Your continued use of our services after any changes constitutes 
              acceptance of the new Terms.
            </Typography>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              User Responsibilities
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              As a user of our services, you agree to:
            </Typography>
            <List>
              {userResponsibilities.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
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

        {/* Prohibited Activities */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Warning sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Prohibited Activities
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              The following activities are strictly prohibited and may result in immediate termination 
              of your booking and account:
            </Typography>
            <List>
              {prohibitedActivities.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Warning sx={{ color: '#d97706', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
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

        {/* Cancellation Policy */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Cancellation Policy
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              Our cancellation policy is designed to be fair to both guests and property owners:
            </Typography>
            <List>
              {cancellationPolicy.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
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

        {/* Payment Terms */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Business sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Payment Terms
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              Payment terms and conditions for our services:
            </Typography>
            <List>
              {paymentTerms.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircle sx={{ color: '#d97706', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
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

        {/* Liability and Disclaimers */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Liability and Disclaimers
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              Luxe Staycations acts as an intermediary between guests and property owners. We are not 
              responsible for:
            </Typography>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Warning sx={{ color: '#d97706', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Property conditions or amenities not as described" 
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
                  <Warning sx={{ color: '#d97706', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Disputes between guests and property owners" 
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
                  <Warning sx={{ color: '#d97706', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Force majeure events affecting your stay" 
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

        {/* Intellectual Property */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Intellectual Property
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              All content on this website, including text, graphics, logos, images, and software, is 
              the property of Luxe Staycations and is protected by copyright laws. You may not reproduce, 
              distribute, or create derivative works without our express written consent.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              Property images and descriptions are provided by property owners and are their responsibility 
              to maintain accuracy and legality.
            </Typography>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Governing Law
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising from these Terms or your use of our services shall be subject to 
              the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              We encourage resolution of disputes through mediation before pursuing legal action.
            </Typography>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Contact Information
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              If you have any questions about these Terms of Service, please contact us:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                <strong>Email:</strong> legal@luxestaycations.com
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                <strong>Phone:</strong> +91 98765 43210
              </Typography>
              <Typography variant="body1" sx={{ color: '#374151' }}>
                <strong>Address:</strong> Mumbai, Maharashtra, India
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

