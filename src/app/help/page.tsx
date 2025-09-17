"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip
} from '@mui/material';
import { 
  Search, 
  ExpandMore, 
  Help, 
  BookOnline, 
  Payment, 
  Security,
  Support,
  Phone,
  Email,
  Chat
} from '@mui/icons-material';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      icon: <BookOnline sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Booking & Reservations",
      description: "Everything you need to know about making and managing your bookings.",
      articles: 12
    },
    {
      icon: <Payment sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Payments & Pricing",
      description: "Information about payment methods, pricing, and refunds.",
      articles: 8
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Safety & Security",
      description: "Learn about our safety measures and security protocols.",
      articles: 6
    },
    {
      icon: <Support sx={{ fontSize: 40, color: '#d97706' }} />,
      title: "Customer Support",
      description: "How to get help and contact our support team.",
      articles: 10
    }
  ];

  const faqs = [
    {
      category: "Booking",
      question: "How do I make a reservation?",
      answer: "You can make a reservation through our website by selecting your desired dates, choosing a property, and completing the booking process. You can also call our customer service team for assistance."
    },
    {
      category: "Booking",
      question: "Can I modify or cancel my booking?",
      answer: "Yes, you can modify or cancel your booking up to 48 hours before your check-in date. Please refer to our cancellation policy for specific terms and conditions."
    },
    {
      category: "Payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our trusted payment partners."
    },
    {
      category: "Payment",
      question: "When will I be charged for my booking?",
      answer: "A 20% deposit is charged at the time of booking to confirm your reservation. The remaining balance is charged 7 days before your check-in date."
    },
    {
      category: "Safety",
      question: "What safety measures are in place?",
      answer: "All our properties undergo regular safety inspections. We have 24/7 security, CCTV surveillance, and emergency contact numbers available. Properties are also sanitized between guests."
    },
    {
      category: "Support",
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team 24/7 through phone, email, or live chat. We also have a dedicated WhatsApp support line for immediate assistance."
    }
  ];

  const contactMethods = [
    {
      icon: <Phone sx={{ fontSize: 30, color: '#d97706' }} />,
      title: "Call Us",
      details: "+91 98765 43210",
      subtitle: "24/7 Customer Support",
      action: "Call Now"
    },
    {
      icon: <Email sx={{ fontSize: 30, color: '#d97706' }} />,
      title: "Email Us",
      details: "support@luxestaycations.com",
      subtitle: "Response within 2 hours",
      action: "Send Email"
    },
    {
      icon: <Chat sx={{ fontSize: 30, color: '#d97706' }} />,
      title: "Live Chat",
      details: "Available 24/7",
      subtitle: "Instant support",
      action: "Start Chat"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Help Center
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#d1d5db',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 4
              }}
            >
              Find answers to your questions and get the support you need for your 
              luxury staycation experience.
            </Typography>
            
            {/* Search Bar */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Search for help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#d97706' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#d97706',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#d97706',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Help Categories */}
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
            How Can We Help?
          </Typography>
          <Grid container spacing={4}>
            {helpCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d1b1b' }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: '#6b7280', lineHeight: 1.6 }}>
                      {category.description}
                    </Typography>
                    <Chip 
                      label={`${category.articles} articles`} 
                      size="small"
                      sx={{ 
                        backgroundColor: '#d97706', 
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
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
            Frequently Asked Questions
          </Typography>
          
          {filteredFaqs.length > 0 ? (
            <Box>
              {filteredFaqs.map((faq, index) => (
                <Accordion 
                  key={index}
                  sx={{
                    mb: 2,
                    '&:before': {
                      display: 'none',
                    },
                    '& .MuiAccordionSummary-root': {
                      backgroundColor: '#f9fafb',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                    },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      color: '#d97706',
                    },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={faq.category} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#d97706', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d1b1b' }}>
                        {faq.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Help sx={{ fontSize: 80, color: '#d97706', mb: 3 }} />
              <Typography variant="h5" sx={{ mb: 2, color: '#2d1b1b' }}>
                No results found
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Try searching with different keywords or browse our help categories above.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Contact Support */}
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
            Still Need Help?
          </Typography>
          <Grid container spacing={4}>
            {contactMethods.map((method, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      {method.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d1b1b' }}>
                      {method.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: '#5a3d35', fontWeight: 500 }}>
                      {method.details}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                      {method.subtitle}
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: '#d97706',
                        color: '#d97706',
                        '&:hover': {
                          borderColor: '#b45309',
                          backgroundColor: 'rgba(217, 119, 6, 0.1)'
                        }
                      }}
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Additional Resources */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #2d1b1b 0%, #1a1a1a 50%, #0f0f0f 100%)',
            color: 'white',
            py: 8,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 4,
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              fontWeight: 600,
              background: 'linear-gradient(45deg, #d97706, #fbbf24)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Additional Resources
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                📖 User Guide
              </Typography>
              <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2 }}>
                Complete guide to using our platform and services.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#d97706',
                  color: '#d97706',
                  '&:hover': {
                    borderColor: '#b45309',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)'
                  }
                }}
              >
                Download Guide
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                📋 Terms & Conditions
              </Typography>
              <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2 }}>
                Read our terms of service and booking policies.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#d97706',
                  color: '#d97706',
                  '&:hover': {
                    borderColor: '#b45309',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)'
                  }
                }}
              >
                View Terms
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                🔒 Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2 }}>
                Learn how we protect your personal information.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#d97706',
                  color: '#d97706',
                  '&:hover': {
                    borderColor: '#b45309',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)'
                  }
                }}
              >
                View Policy
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

