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
  ListItemText
} from '@mui/material';
import { 
  Security, 
  CheckCircle,
  DataUsage,
  Cookie,
  Shield
} from '@mui/icons-material';

export default function PrivacyPolicy() {
  const lastUpdated = "March 15, 2024";

  const dataWeCollect = [
    "Personal information (name, email, phone number)",
    "Payment information (processed securely through third-party providers)",
    "Booking and travel preferences",
    "Device and browser information",
    "Usage data and analytics",
    "Communication records with our support team"
  ];

  const howWeUseData = [
    "Process and manage your bookings",
    "Provide customer support and assistance",
    "Send booking confirmations and updates",
    "Improve our services and user experience",
    "Send marketing communications (with your consent)",
    "Comply with legal obligations"
  ];

  const dataProtection = [
    "Encryption of sensitive data",
    "Secure payment processing",
    "Regular security audits",
    "Limited access to personal information",
    "Data retention policies",
    "Employee training on data protection"
  ];

  const yourRights = [
    "Access your personal data",
    "Correct inaccurate information",
    "Request deletion of your data",
    "Withdraw consent for marketing",
    "Data portability",
    "Lodge complaints with authorities"
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
              Privacy Policy
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
              We are committed to protecting your privacy and ensuring the security 
              of your personal information.
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
        {/* Introduction */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Introduction
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              At Luxe Staycations, we respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use 
              our website and services.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              By using our services, you agree to the collection and use of information in accordance with 
              this policy. We will not use or share your information with anyone except as described in 
              this privacy policy.
            </Typography>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DataUsage sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Information We Collect
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We collect several different types of information for various purposes to provide and improve 
              our service to you:
            </Typography>
            <List>
              {dataWeCollect.map((item, index) => (
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

        {/* How We Use Your Information */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Cookie sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                How We Use Your Information
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We use the collected data for various purposes:
            </Typography>
            <List>
              {howWeUseData.map((item, index) => (
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

        {/* Data Protection */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Shield sx={{ fontSize: 40, color: '#d97706', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                Data Protection
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We implement appropriate security measures to protect your personal information:
            </Typography>
            <List>
              {dataProtection.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Security sx={{ color: '#d97706', fontSize: 20 }} />
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

        {/* Your Rights */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Your Rights
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              You have the following rights regarding your personal data:
            </Typography>
            <List>
              {yourRights.map((item, index) => (
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

        {/* Third-Party Services */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Third-Party Services
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We may employ third-party companies and individuals to facilitate our service, provide service 
              on our behalf, perform service-related services, or assist us in analyzing how our service 
              is used.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              These third parties have access to your personal data only to perform these tasks on our 
              behalf and are obligated not to disclose or use it for any other purpose.
            </Typography>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Cookies
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We use cookies and similar tracking technologies to track the activity on our service and 
              hold certain information. Cookies are files with a small amount of data which may include 
              an anonymous unique identifier.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being 
              sent. However, if you do not accept cookies, you may not be able to use some portions of 
              our service.
            </Typography>
          </CardContent>
        </Card>

        {/* Changes to This Policy */}
        <Card sx={{ mb: 6, p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Changes to This Privacy Policy
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              We may update our privacy policy from time to time. We will notify you of any changes by 
              posting the new privacy policy on this page and updating the "Last updated" date.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151' }}>
              You are advised to review this privacy policy periodically for any changes. Changes to this 
              privacy policy are effective when they are posted on this page.
            </Typography>
          </CardContent>
        </Card>

        {/* Contact Us */}
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#374151' }}>
              If you have any questions about this privacy policy, please contact us:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                <strong>Email:</strong> privacy@luxestaycations.com
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

