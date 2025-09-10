"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Search, 
  ExpandMore, 
  Help,
  BookOnline,
  Payment,
  Security,
  Support,
  LocalHotel
} from '@mui/icons-material';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Booking & Reservations",
      icon: <BookOnline sx={{ fontSize: 30, color: '#d97706' }} />,
      questions: [
        {
          question: "How do I make a reservation?",
          answer: "You can make a reservation through our website by selecting your desired dates, choosing a property, and completing the booking process. You can also call our customer service team for assistance."
        },
        {
          question: "Can I modify or cancel my booking?",
          answer: "Yes, you can modify or cancel your booking up to 48 hours before your check-in date. Please refer to our cancellation policy for specific terms and conditions."
        },
        {
          question: "What is the minimum stay requirement?",
          answer: "Most properties have a minimum stay requirement of 2 nights. Some premium properties may require 3-7 nights during peak seasons."
        },
        {
          question: "Do I need to provide identification?",
          answer: "Yes, you will need to provide a valid government-issued ID (passport, driver's license, or Aadhaar card) during the booking process and at check-in."
        }
      ]
    },
    {
      title: "Payment & Pricing",
      icon: <Payment sx={{ fontSize: 30, color: '#d97706' }} />,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our trusted payment partners."
        },
        {
          question: "When will I be charged for my booking?",
          answer: "A 20% deposit is charged at the time of booking to confirm your reservation. The remaining balance is charged 7 days before your check-in date."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees. All applicable taxes and service charges are clearly displayed during the booking process. Additional charges may apply for extra services requested during your stay."
        },
        {
          question: "Can I pay in installments?",
          answer: "We offer flexible payment options. You can pay the deposit at booking and the remaining amount closer to your check-in date."
        }
      ]
    },
    {
      title: "Property & Amenities",
      icon: <LocalHotel sx={{ fontSize: 30, color: '#d97706' }} />,
      questions: [
        {
          question: "What amenities are included?",
          answer: "All properties include basic amenities like WiFi, air conditioning, kitchen facilities, and linens. Premium properties may include additional amenities like private pools, gym access, and concierge services."
        },
        {
          question: "Are the properties cleaned between guests?",
          answer: "Yes, all properties undergo thorough cleaning and sanitization between guests. We follow strict hygiene protocols to ensure your safety."
        },
        {
          question: "Can I bring pets?",
          answer: "Pet policies vary by property. Some properties are pet-friendly, while others are not. Please check the property details or contact us for specific information."
        },
        {
          question: "Is parking available?",
          answer: "Most properties offer parking facilities. Please check the property details for specific parking information and any associated costs."
        }
      ]
    },
    {
      title: "Safety & Security",
      icon: <Security sx={{ fontSize: 30, color: '#d97706' }} />,
      questions: [
        {
          question: "What safety measures are in place?",
          answer: "All our properties undergo regular safety inspections. We have 24/7 security, CCTV surveillance, and emergency contact numbers available. Properties are also sanitized between guests."
        },
        {
          question: "Are the properties insured?",
          answer: "Yes, all properties in our network are insured. We also recommend guests purchase travel insurance for additional protection."
        },
        {
          question: "What if there's an emergency during my stay?",
          answer: "We provide 24/7 emergency support. You'll receive emergency contact numbers upon booking confirmation, and our team is always available to assist."
        },
        {
          question: "Are the properties child-safe?",
          answer: "Many properties are child-friendly with safety features. Please check property details for specific child safety amenities and any age restrictions."
        }
      ]
    },
    {
      title: "Customer Support",
      icon: <Support sx={{ fontSize: 30, color: '#d97706' }} />,
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach our customer support team 24/7 through phone, email, or live chat. We also have a dedicated WhatsApp support line for immediate assistance."
        },
        {
          question: "What are your support hours?",
          answer: "Our customer support team is available 24/7. For urgent matters, you can call our emergency hotline at any time."
        },
        {
          question: "How quickly do you respond to inquiries?",
          answer: "We typically respond to email inquiries within 2 hours during business hours. Phone and chat support provide immediate assistance."
        },
        {
          question: "Can I get help with local recommendations?",
          answer: "Yes, our concierge service can provide recommendations for restaurants, activities, transportation, and local attractions in your destination."
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap(category => 
    category.questions.map(q => ({
      ...q,
      category: category.title
    }))
  );

  const filteredQuestions = allQuestions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
              Frequently Asked Questions
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
              Find answers to the most common questions about our luxury staycation services.
            </Typography>
            
            {/* Search Bar */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Search for questions..."
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
        {/* Search Results Summary */}
        {searchTerm && (
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
              {filteredQuestions.length} results found for "{searchTerm}"
            </Typography>
            <Chip 
              label="Clear Search" 
              onClick={() => setSearchTerm('')}
              sx={{ 
                backgroundColor: '#d97706', 
                color: 'white',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#b45309'
                }
              }} 
            />
          </Box>
        )}

        {/* FAQ Categories */}
        {filteredCategories.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {category.icon}
              <Typography 
                variant="h3" 
                sx={{ 
                  ml: 2,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 600,
                  color: '#2d1b1b'
                }}
              >
                {category.title}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {category.questions.map((faq, questionIndex) => (
                <Grid item xs={12} key={questionIndex}>
                  <Accordion 
                    sx={{
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
                          label={category.title} 
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
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {/* No Results */}
        {searchTerm && filteredQuestions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Help sx={{ fontSize: 80, color: '#d97706', mb: 3 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#2d1b1b' }}>
              No results found
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
              Try searching with different keywords or browse our FAQ categories above.
            </Typography>
            <Chip 
              label="Clear Search" 
              onClick={() => setSearchTerm('')}
              sx={{ 
                backgroundColor: '#d97706', 
                color: 'white',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#b45309'
                }
              }} 
            />
          </Box>
        )}

        {/* Still Need Help */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #2d1b1b 0%, #1a1a1a 50%, #0f0f0f 100%)',
            color: 'white',
            py: 8,
            borderRadius: 3,
            textAlign: 'center',
            mt: 8
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
            Still Need Help?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#d1d5db', maxWidth: 600, mx: 'auto' }}>
            Can't find the answer you're looking for? Our customer support team is here to help you 
            24/7 with any questions or concerns.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body1" sx={{ color: '#d1d5db' }}>
              📞 Call us: +91 98765 43210
            </Typography>
            <Typography variant="body1" sx={{ color: '#d1d5db' }}>
              ✉️ Email: support@luxestaycations.com
            </Typography>
            <Typography variant="body1" sx={{ color: '#d1d5db' }}>
              💬 Live Chat: Available 24/7
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

