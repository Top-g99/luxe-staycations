"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn, 
  AccessTime,
  Send,
  WhatsApp,
  Facebook,
  Instagram,
  LinkedIn
} from '@mui/icons-material';
import { contactManager, ContactInfo } from '@/lib/contactManager';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    // Initialize contact manager and load contact info
    if (typeof window !== 'undefined') {
      contactManager.initialize();
      setContactInfo(contactManager.getContactInfo());
      
      // Subscribe to contact info changes
      const unsubscribe = contactManager.subscribe((newContactInfo) => {
        setContactInfo(newContactInfo);
      });
      
      return unsubscribe;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Thank you for your message! We will get back to you soon.',
          severity: 'success'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to send message. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    }
  };

  const getContactInfoArray = () => {
    if (!contactInfo) return [];
    
    return [
      {
        icon: <Email sx={{ fontSize: 40, color: '#d97706' }} />,
        title: "Email Us",
        details: contactInfo.email,
        subtitle: "We'll respond within 24 hours"
      },
      {
        icon: <Phone sx={{ fontSize: 40, color: '#d97706' }} />,
        title: "Call Us",
        details: contactInfo.phone,
        subtitle: "Available 24/7 for urgent queries"
      },
      {
        icon: <LocationOn sx={{ fontSize: 40, color: '#d97706' }} />,
        title: "Visit Us",
        details: contactInfo.address,
        subtitle: "Head office location"
      },
      {
        icon: <AccessTime sx={{ fontSize: 40, color: '#d97706' }} />,
        title: "Business Hours",
        details: contactInfo.businessHours,
        subtitle: "Weekend support available"
      }
    ];
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'url("https://luxgroup.vn/wp-content/uploads/2023/08/luxurytravel-vn-dulichsangtrong1-840x473.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("https://luxgroup.vn/wp-content/uploads/2023/08/luxurytravel-vn-dulichsangtrong1-840x473.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            zIndex: -1
          }
        }}
      >
        {/* Dark overlay for better text readability */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(45deg, #d97706, #fbbf24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Get In Touch
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
              Have questions about our luxury accommodations? We're here to help you 
              plan your perfect staycation experience.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={8}>
          {/* Contact Form */}
          <Grid item xs={12} lg={7}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontFamily: 'Playfair Display, serif',
                mb: 4,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                color: '#2d1b1b'
              }}
            >
              Send Us a Message
            </Typography>
            
            <Card sx={{ p: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      sx={{
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      sx={{
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      sx={{
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Subject</InputLabel>
                      <Select
                        name="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        label="Subject"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#d97706',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                        }}
                      >
                        <MenuItem value="general">General Inquiry</MenuItem>
                        <MenuItem value="booking">Booking Question</MenuItem>
                        <MenuItem value="support">Customer Support</MenuItem>
                        <MenuItem value="partnership">Partnership</MenuItem>
                        <MenuItem value="feedback">Feedback</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      sx={{
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
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{
                        background: 'linear-gradient(45deg, #5a3d35, #d97706)',
                        color: 'white',
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #4a332c, #b45309)',
                        }
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} lg={5}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontFamily: 'Playfair Display, serif',
                mb: 4,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                color: '#2d1b1b'
              }}
            >
              Contact Information
            </Typography>

            <Grid container spacing={3}>
              {getContactInfoArray().map((info, index) => (
                <Grid item xs={12} sm={6} lg={12} key={index}>
                  <Card 
                    sx={{ 
                      p: 3,
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {info.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2d1b1b' }}>
                        {info.title}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, color: '#5a3d35', fontWeight: 500 }}>
                        {info.details}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {info.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Social Media */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d1b1b' }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Facebook />}
                  sx={{
                    borderColor: '#d97706',
                    color: '#d97706',
                    '&:hover': {
                      borderColor: '#b45309',
                      backgroundColor: 'rgba(217, 119, 6, 0.1)'
                    }
                  }}
                >
                  Facebook
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Instagram />}
                  sx={{
                    borderColor: '#d97706',
                    color: '#d97706',
                    '&:hover': {
                      borderColor: '#b45309',
                      backgroundColor: 'rgba(217, 119, 6, 0.1)'
                    }
                  }}
                >
                  Instagram
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkedIn />}
                  sx={{
                    borderColor: '#d97706',
                    color: '#d97706',
                    '&:hover': {
                      borderColor: '#b45309',
                      backgroundColor: 'rgba(217, 119, 6, 0.1)'
                    }
                  }}
                >
                  LinkedIn
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Map Section */}
        <Box sx={{ mt: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: 'Playfair Display, serif',
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600,
              color: '#2d1b1b'
            }}
          >
            Find Us
          </Typography>
          <Card sx={{ overflow: 'hidden', borderRadius: 3 }}>
            <Box
              sx={{
                height: 400,
                background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Box sx={{ textAlign: 'center', color: '#6b7280' }}>
                <LocationOn sx={{ fontSize: 80, color: '#d97706', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 1, color: '#2d1b1b' }}>
                  Mumbai, Maharashtra, India
                </Typography>
                <Typography variant="body1">
                  Interactive map will be integrated here
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

