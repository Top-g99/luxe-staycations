
"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business,
  Handshake,
  TrendingUp,
  Support,
  CheckCircle,
  Star,
  LocationOn,
  Phone,
  Email,
  Description,
  Category,
  MonetizationOn,
  People,
  Security,
  Speed,
  Analytics,
  Dashboard,
  VerifiedUser,
  AccessTime,
  Group,
  Hotel,
  Villa,
  Apartment,
  BeachAccess,
  Pool,
  Wifi,
  Restaurant,
  DirectionsCar,
  Event,
  CameraAlt,
  Payment,
  TrendingDown,
  Rocket,
  HeadsetMic,
  Language,
  Public,
  BusinessCenter
} from '@mui/icons-material';
import { callbackManager } from '@/lib/dataManager';
import { emailService } from '@/lib/emailService';
import { emailTriggerManager } from '@/lib/emailTriggers';
import ImageUpload from '@/components/ImageUpload';
import ConsultationForm from '@/components/ConsultationForm';
import { contactManager, ContactInfo } from '@/lib/contactManager';

interface PartnerApplication {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  description: string;
  website: string;
  socialMedia: string;
  experience: string;
  partnershipGoals: string;
  expectedRevenue: string;
  marketingBudget: string;
  targetAudience: string;
  competitiveAdvantage: string;
  propertyImages: string[];
  propertyDetails: {
    propertyName: string;
    propertyType: string;
    numberOfRooms: string;
    amenities: string[];
    propertyDescription: string;
    propertyLocation: string;
    propertyPrice: string;
  };
}

export default function PartnerWithUs() {
  const [activeStep, setActiveStep] = useState(0);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [formData, setFormData] = useState<PartnerApplication>({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    location: '',
    description: '',
    website: '',
    socialMedia: '',
    experience: '',
    partnershipGoals: '',
    expectedRevenue: '',
    marketingBudget: '',
    targetAudience: '',
    competitiveAdvantage: '',
    propertyImages: [],
    propertyDetails: {
      propertyName: '',
      propertyType: '',
      numberOfRooms: '',
      amenities: [],
      propertyDescription: '',
      propertyLocation: '',
      propertyPrice: ''
    }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
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

  const steps = [
    {
      label: 'Business Information',
      description: 'Tell us about your business'
    },
    {
      label: 'Partnership Details',
      description: 'What type of partnership are you looking for?'
    },
    {
      label: 'Property Information',
      description: 'Tell us about your property (if applicable)'
    },
    {
      label: 'Financial Information',
      description: 'Revenue expectations and budget'
    },
    {
      label: 'Review & Submit',
      description: 'Review your application and submit'
    }
  ];

  const businessTypes = [
    'Property Owner',
    'Travel Agency',
    'Tour Operator',
    'Hotel Chain',
    'Restaurant',
    'Activity Provider',
    'Transportation Service',
    'Event Planner',
    'Photography Service',
    'Other'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Save to Supabase using callbackManager
      await callbackManager.initialize();
      await callbackManager.create({
        id: Date.now().toString(),
        name: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        message: `Partner Application: ${formData.businessName}\n\nBusiness Type: ${formData.businessType}\nLocation: ${formData.location}\nExperience: ${formData.experience}\nDescription: ${formData.description}\nWebsite: ${formData.website}\nSocial Media: ${formData.socialMedia}\nPartnership Goals: ${formData.partnershipGoals}\nExpected Revenue: ${formData.expectedRevenue}\nMarketing Budget: ${formData.marketingBudget}\nTarget Audience: ${formData.targetAudience}\nCompetitive Advantage: ${formData.competitiveAdvantage}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Send confirmation email using trigger manager
      const partnerData = {
        businessName: formData.businessName,
        contactName: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        propertyType: formData.businessType,
        location: formData.location,
        experience: formData.experience,
        message: formData.description,
        requestId: 'PR-' + Date.now()
      };
      
      try {
        // Send email directly using email service
        // Use delivery tracking service for better monitoring
        const { emailDeliveryService } = await import('@/lib/emailDeliveryService');
        const emailResult = await emailDeliveryService.sendPartnerRequestWithTracking(partnerData);
        if (emailResult.success) {
          setSnackbar({ open: true, message: 'Application submitted successfully! Confirmation email sent.', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Application submitted successfully! (Email notification failed)', severity: 'warning' });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        setSnackbar({ open: true, message: 'Application submitted successfully! (Email notification failed)', severity: 'warning' });
      }
      
      // Reset form
      setFormData({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        businessType: '',
        location: '',
        description: '',
        website: '',
        socialMedia: '',
        experience: '',
        partnershipGoals: '',
        expectedRevenue: '',
        marketingBudget: '',
        targetAudience: '',
        competitiveAdvantage: '',
        propertyImages: [],
        propertyDetails: {
          propertyName: '',
          propertyType: '',
          numberOfRooms: '',
          amenities: [],
          propertyDescription: '',
          propertyLocation: '',
          propertyPrice: ''
        }
      });
      setActiveStep(0);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error submitting application. Please try again.', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const updateFormData = (field: keyof PartnerApplication, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.businessName && formData.contactPerson && formData.email && formData.phone && formData.businessType && formData.location;
      case 1:
        return formData.description && formData.partnershipGoals && formData.experience;
      case 2:
        return true; // Property information is optional
      case 3:
        return formData.expectedRevenue && formData.marketingBudget && formData.targetAudience;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section with Professional Business Background */}
              <Box sx={{
          background: 'url("https://www.saivionindia.com/assets/images/Partner-with-Us.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: 'white',
          py: 12,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("https://www.saivionindia.com/assets/images/Partner-with-Us.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }
        }}>
        {/* Subtle overlay for better text readability */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h1" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              Partner With Luxe Staycations
            </Typography>
            <Typography variant="h4" sx={{ 
              mb: 4, 
              fontWeight: 300,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}>
              Join India's Premier Luxury Villa Network
            </Typography>
            <Typography variant="h6" sx={{ 
              mb: 6, 
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              Unlock unprecedented growth with our exclusive partnership program
            </Typography>
            
            {/* CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  bgcolor: 'white',
                  color: 'var(--primary-dark)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Start Application
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.open('/host/login', '_blank')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Host Login Portal
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowConsultationForm(true)}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Free Consultation
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  color: 'var(--primary-dark)', 
                  fontWeight: 700, 
                  mb: 1 
                }}>
                  500+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Luxury Properties
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  color: 'var(--primary-dark)', 
                  fontWeight: 700, 
                  mb: 1 
                }}>
                  50+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Partner Cities
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  color: 'var(--primary-dark)', 
                  fontWeight: 700, 
                  mb: 1 
                }}>
                  10K+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Happy Guests
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  color: 'var(--primary-dark)', 
                  fontWeight: 700, 
                  mb: 1 
                }}>
                  95%
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Partner Satisfaction
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Partner Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              mb: 2
            }}>
              Why Choose Luxe Staycations?
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              We're not just another booking platform. We're your growth partner.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3, transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 3 
                }}>
                  <Dashboard sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'var(--primary-dark)' 
                }}>
                  Dedicated Host Portal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Access your exclusive dashboard with real-time analytics, booking management, and revenue tracking. Our separate Host login portal gives you complete control.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3, transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 3 
                }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'var(--primary-dark)' 
                }}>
                  Premium Clientele
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Connect with high-value guests who appreciate luxury and are willing to pay premium rates for exceptional experiences.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3, transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 3 
                }}>
                  <Support sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'var(--primary-dark)' 
                }}>
                  24/7 Partner Support
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Round-the-clock dedicated support team for partners. We handle guest inquiries, resolve issues, and ensure smooth operations.
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Consultation CTA Section */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Card sx={{ p: 4, bgcolor: 'var(--primary-light)', color: 'white', maxWidth: 600, mx: 'auto' }}>
              <Typography variant="h4" sx={{ 
                fontFamily: 'Playfair Display, serif',
                mb: 2, 
                fontWeight: 600 
              }}>
                Not Sure Where to Start?
              </Typography>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Playfair Display, serif',
                mb: 3, 
                opacity: 0.9 
              }}>
                Get personalized guidance from our partnership experts
              </Typography>
                                <Button
                    variant="contained"
                    size="large"
                    onClick={() => setShowConsultationForm(true)}
                    sx={{
                      bgcolor: 'white',
                      color: 'var(--primary-dark)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Schedule Free Consultation
                  </Button>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Partnership Types Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              mb: 2
            }}>
              Partnership Opportunities
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Multiple ways to grow with us
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4, border: '2px solid', borderColor: 'var(--primary-light)', position: 'relative' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  left: 20, 
                  bgcolor: 'var(--primary-dark)', 
                  color: 'white', 
                  px: 3, 
                  py: 1, 
                  borderRadius: 2 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Most Popular</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Villa sx={{ fontSize: 60, color: 'var(--primary-light)', mb: 2 }} />
                  <Typography variant="h4" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    mb: 2, 
                    fontWeight: 600, 
                    color: 'var(--primary-dark)' 
                  }}>
                    Property Owners
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    List your luxury villas, apartments, or resorts and earn premium rates with our exclusive clientele.
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircle sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Dedicated Host Dashboard" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircle sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Professional Photography" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircle sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Revenue Analytics" />
                    </ListItem>
                  </List>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ p: 3, height: '100%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'var(--primary-light)', color: 'white' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Restaurant sx={{ fontSize: 40, color: 'var(--primary-light)', mr: 2 }} />
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 600 
                      }}>Restaurants & Dining</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Partner with us to offer exclusive dining experiences to our luxury guests.
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ p: 3, height: '100%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'var(--primary-light)', color: 'white' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DirectionsCar sx={{ fontSize: 40, color: 'var(--primary-light)', mr: 2 }} />
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 600 
                      }}>Transportation</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Provide premium transportation services for airport transfers and local tours.
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ p: 3, height: '100%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'var(--primary-light)', color: 'white' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Event sx={{ fontSize: 40, color: 'var(--primary-light)', mr: 2 }} />
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 600 
                      }}>Activities & Events</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Offer unique experiences, tours, and event planning services to our guests.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Success Stories Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              mb: 2
            }}>
              Success Stories
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Hear from our successful partners
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 4, textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'var(--primary-light)' }}>
                  <Business sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  mb: 2, 
                  fontWeight: 600 
                }}>
                  Casa Alphonso - Malpe
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  "Since partnering with Luxe Staycations, our occupancy rate increased by 40% and we're earning premium rates for our beachfront villa."
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} sx={{ color: 'gold', fontSize: 20 }} />
                  ))}
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 4, textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'var(--primary-light)' }}>
                  <Hotel sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  mb: 2, 
                  fontWeight: 600 
                }}>
                  Mountain View Resort
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  "The dedicated host portal gives us complete control over our bookings and the analytics help us optimize our pricing strategy."
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} sx={{ color: 'gold', fontSize: 20 }} />
                  ))}
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 4, textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'var(--primary-light)' }}>
                  <Restaurant sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  mb: 2, 
                  fontWeight: 600 
                }}>
                  Coastal Cuisine
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  "Partnering with Luxe has brought us high-end customers who appreciate fine dining and are willing to pay premium prices."
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} sx={{ color: 'gold', fontSize: 20 }} />
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Application Form Section */}
      <Box id="application-form" sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              mb: 2
            }}>
              Ready to Partner?
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Join our exclusive network and start growing your business today
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Benefits Sidebar */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card sx={{ p: 3, bgcolor: 'var(--primary-light)', color: 'white' }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    mb: 2, 
                    fontWeight: 600 
                  }}>
                    🚀 Quick Onboarding
                  </Typography>
                  <Typography variant="body2">
                    Get started in under 24 hours with our streamlined partnership process.
                  </Typography>
                </Card>

                <Card sx={{ p: 3, border: '2px solid', borderColor: 'var(--primary-light)' }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    mb: 2, 
                    fontWeight: 600, 
                    color: 'var(--primary-dark)' 
                  }}>
                    💰 Revenue Growth
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average 35% increase in revenue for our partners within 6 months.
                  </Typography>
                </Card>

                <Card sx={{ p: 3, border: '2px solid', borderColor: 'var(--primary-light)' }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    mb: 2, 
                    fontWeight: 600, 
                    color: 'var(--primary-dark)' 
                  }}>
                    🎯 Premium Clientele
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access to high-value guests who appreciate luxury experiences.
                  </Typography>
                </Card>

                <Card sx={{ p: 3, border: '2px solid', borderColor: 'var(--primary-light)' }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    mb: 2, 
                    fontWeight: 600, 
                    color: 'var(--primary-dark)' 
                  }}>
                    🔒 Secure Payments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Safe and reliable payment processing with 24/7 support.
                  </Typography>
                </Card>

                {/* Contact Information */}
                <Card sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    mb: 3, 
                    fontWeight: 600, 
                    color: 'var(--primary-dark)' 
                  }}>
                    Get in Touch
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ color: 'var(--primary-light)', mr: 2 }} />
                      <Typography variant="body2">{contactInfo?.email || 'partnerships@luxestaycations.com'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ color: 'var(--primary-light)', mr: 2 }} />
                      <Typography variant="body2">{contactInfo?.phone || '+91 98765 43210'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ color: 'var(--primary-light)', mr: 2 }} />
                      <Typography variant="body2">{contactInfo?.address || 'Mumbai, Maharashtra, India'}</Typography>
                    </Box>
                  </Stack>
                  
                  {/* Consultation CTA */}
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.300' }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Playfair Display, serif',
                      mb: 2, 
                      fontWeight: 600, 
                      color: 'var(--primary-dark)' 
                    }}>
                      Need Help Deciding?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Schedule a free consultation with our partnership team to discuss your specific needs and opportunities.
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setShowConsultationForm(true)}
                      sx={{
                        bgcolor: 'var(--primary-dark)',
                        '&:hover': { bgcolor: 'var(--primary-light)' }
                      }}
                    >
                      Schedule Free Consultation
                    </Button>
                  </Box>
                </Card>
              </Stack>
            </Grid>

            {/* Application Form */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h4" sx={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: 'var(--primary-dark)',
                  mb: 4
                }}>
                  Partnership Application
                </Typography>

                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel>
                        <Typography variant="h6" sx={{ fontFamily: 'Playfair Display, serif' }}>{step.label}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {step.description}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          {index === 0 && (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Business Name"
                                  value={formData.businessName}
                                  onChange={(e) => updateFormData('businessName', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Contact Person"
                                  value={formData.contactPerson}
                                  onChange={(e) => updateFormData('contactPerson', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => updateFormData('email', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Phone"
                                  value={formData.phone}
                                  onChange={(e) => updateFormData('phone', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                  <InputLabel>Business Type</InputLabel>
                                  <Select
                                    value={formData.businessType}
                                    label="Business Type"
                                    onChange={(e) => updateFormData('businessType', e.target.value)}
                                  >
                                    {businessTypes.map((type) => (
                                      <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Location"
                                  value={formData.location}
                                  onChange={(e) => updateFormData('location', e.target.value)}
                                  required
                                />
                              </Grid>
                            </Grid>
                          )}

                          {index === 1 && (
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Business Description"
                                  multiline
                                  rows={4}
                                  value={formData.description}
                                  onChange={(e) => updateFormData('description', e.target.value)}
                                  required
                                  helperText="Tell us about your business, services, and unique offerings"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Website (Optional)"
                                  value={formData.website}
                                  onChange={(e) => updateFormData('website', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Social Media (Optional)"
                                  value={formData.socialMedia}
                                  onChange={(e) => updateFormData('socialMedia', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Years of Experience"
                                  value={formData.experience}
                                  onChange={(e) => updateFormData('experience', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Partnership Goals"
                                  multiline
                                  rows={3}
                                  value={formData.partnershipGoals}
                                  onChange={(e) => updateFormData('partnershipGoals', e.target.value)}
                                  required
                                  helperText="What do you hope to achieve through this partnership?"
                                />
                              </Grid>
                            </Grid>
                          )}

                          {index === 2 && (
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, color: 'var(--primary-dark)' }}>
                                  Property Details
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Property Name"
                                  value={formData.propertyDetails.propertyName}
                                  onChange={(e) => updateFormData('propertyDetails', {
                                    ...formData.propertyDetails,
                                    propertyName: e.target.value
                                  })}
                                  helperText="Name of your property"
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Property Type"
                                  value={formData.propertyDetails.propertyType}
                                  onChange={(e) => updateFormData('propertyDetails', {
                                    ...formData.propertyDetails,
                                    propertyType: e.target.value
                                  })}
                                  helperText="Villa, Apartment, Resort, etc."
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Number of Rooms"
                                  value={formData.propertyDetails.numberOfRooms}
                                  onChange={(e) => updateFormData('propertyDetails', {
                                    ...formData.propertyDetails,
                                    numberOfRooms: e.target.value
                                  })}
                                  helperText="Total number of rooms/units"
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Property Location"
                                  value={formData.propertyDetails.propertyLocation}
                                  onChange={(e) => updateFormData('propertyDetails', {
                                    ...formData.propertyDetails,
                                    propertyLocation: e.target.value
                                  })}
                                  helperText="City, State, Country"
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Property Price Range"
                                  value={formData.propertyDetails.propertyPrice}
                                  onChange={(e) => updateFormData('propertyDetails', {
                                    ...formData.propertyDetails,
                                    propertyPrice: e.target.value
                                  })}
                                  helperText="Price per night (e.g., ₹5,000 - ₹15,000)"
                                />
                              </Grid>
                              
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Property Description"
                                  multiline
                                  rows={4}
                                  value={formData.propertyDetails.propertyDescription}
                                  onChange={(e) => updateFormData('propertyDetails', {
                                    ...formData.propertyDetails,
                                    propertyDescription: e.target.value
                                  })}
                                  helperText="Describe your property, amenities, and unique features"
                                />
                              </Grid>
                              
                              <Grid item xs={12}>
                                <ImageUpload
                                  images={formData.propertyImages}
                                  onImagesChange={(images) => updateFormData('propertyImages', images)}
                                  maxImages={5}
                                  title="Property Images"
                                  description="Upload high-quality images of your property"
                                />
                              </Grid>
                            </Grid>
                          )}

                          {index === 3 && (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Expected Monthly Revenue"
                                  value={formData.expectedRevenue}
                                  onChange={(e) => updateFormData('expectedRevenue', e.target.value)}
                                  required
                                  helperText="Estimated revenue from partnership"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Marketing Budget"
                                  value={formData.marketingBudget}
                                  onChange={(e) => updateFormData('marketingBudget', e.target.value)}
                                  required
                                  helperText="Monthly marketing budget allocation"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Target Audience"
                                  value={formData.targetAudience}
                                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                                  required
                                  helperText="Describe your ideal customer base"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Competitive Advantage"
                                  multiline
                                  rows={3}
                                  value={formData.competitiveAdvantage}
                                  onChange={(e) => updateFormData('competitiveAdvantage', e.target.value)}
                                  required
                                  helperText="What makes your business unique?"
                                />
                              </Grid>
                            </Grid>
                          )}

                          {index === 4 && (
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontFamily: 'Playfair Display, serif',
                                mb: 2 
                              }}>Review Your Application</Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Business Name</Typography>
                                  <Typography>{formData.businessName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                                  <Typography>{formData.contactPerson}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                  <Typography>{formData.email}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                  <Typography>{formData.phone}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Business Type</Typography>
                                  <Chip label={formData.businessType} color="primary" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                  <Typography>{formData.location}</Typography>
                                </Grid>
                                
                                {/* Property Information */}
                                {formData.propertyDetails.propertyName && (
                                  <>
                                    <Grid item xs={12}>
                                      <Typography variant="h6" sx={{ 
                                        fontFamily: 'Playfair Display, serif',
                                        mt: 3, 
                                        mb: 2, 
                                        color: 'var(--primary-dark)' 
                                      }}>
                                        Property Information
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="subtitle2" color="text.secondary">Property Name</Typography>
                                      <Typography>{formData.propertyDetails.propertyName}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="subtitle2" color="text.secondary">Property Type</Typography>
                                      <Typography>{formData.propertyDetails.propertyType}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="subtitle2" color="text.secondary">Number of Rooms</Typography>
                                      <Typography>{formData.propertyDetails.numberOfRooms}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="subtitle2" color="text.secondary">Property Location</Typography>
                                      <Typography>{formData.propertyDetails.propertyLocation}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="subtitle2" color="text.secondary">Price Range</Typography>
                                      <Typography>{formData.propertyDetails.propertyPrice}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="subtitle2" color="text.secondary">Images Uploaded</Typography>
                                      <Typography>{formData.propertyImages.length} images</Typography>
                                    </Grid>
                                  </>
                                )}
                              </Grid>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <div>
                            <Button
                              variant="contained"
                              onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                              disabled={!isStepValid(index)}
                              sx={{
                                mr: 1,
                                background: 'var(--primary-dark)',
                                '&:hover': { background: 'var(--primary-light)' }
                              }}
                            >
                              {index === steps.length - 1 ? 'Submit Application' : 'Continue'}
                            </Button>
                            <Button
                              disabled={index === 0}
                              onClick={handleBack}
                              sx={{ mr: 1 }}
                            >
                              Back
                            </Button>
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'var(--primary-dark)', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              mb: 3
            }}>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Join hundreds of successful partners who trust Luxe Staycations
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  bgcolor: 'white',
                  color: 'var(--primary-dark)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Apply Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.open('/host/login', '_blank')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Access Host Portal
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowConsultationForm(true)}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Free Consultation
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Consultation Form */}
      <ConsultationForm
        open={showConsultationForm}
        onClose={() => setShowConsultationForm(false)}
        source="partner-with-us-page"
      />
    </Box>
  );
}
