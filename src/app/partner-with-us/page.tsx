"use client";

import React, { useState } from 'react';
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
  Divider
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
  Analytics
} from '@mui/icons-material';
import { partnerManager } from '@/lib/partnerManager';
import ImageUpload from '@/components/ImageUpload';

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
      await partnerManager.addPartnerApplication(formData);
      setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' });
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
    <Box sx={{
      background: 'linear-gradient(135deg, #f7ede1 0%, #E8E2D9 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{
            fontFamily: 'Gilda Display, serif',
            fontWeight: 700,
            color: 'var(--primary-dark)',
            mb: 2
          }}>
            Partner With Us
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
            Join the Luxe Staycations family and grow your business with us
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Benefits Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content', mb: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{
                  fontFamily: 'Gilda Display, serif',
                  fontWeight: 600,
                  color: 'var(--primary-dark)',
                  mb: 3
                }}>
                  Why Partner With Us?
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Revenue Growth"
                      secondary="Increase your bookings and revenue with our premium clientele"
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Support sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="24/7 Support"
                      secondary="Round-the-clock support for you and your guests"
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Analytics sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Analytics Dashboard"
                      secondary="Detailed insights into your performance and bookings"
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Security sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Secure Payments"
                      secondary="Safe and reliable payment processing"
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Speed sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Quick Onboarding"
                      secondary="Get started in minutes with our streamlined process"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{
                  fontFamily: 'Gilda Display, serif',
                  fontWeight: 600,
                  color: 'var(--primary-dark)',
                  mb: 2
                }}>
                  Get in Touch
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ color: 'var(--primary-light)', mr: 2 }} />
                  <Typography>partnerships@luxestaycations.com</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ color: 'var(--primary-light)', mr: 2 }} />
                  <Typography>+91 98765 43210</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ color: 'var(--primary-light)', mr: 2 }} />
                  <Typography>Mumbai, Maharashtra, India</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Application Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{
                  fontFamily: 'Gilda Display, serif',
                  fontWeight: 600,
                  color: 'var(--primary-dark)',
                  mb: 3
                }}>
                  Partnership Application
                </Typography>

                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel>
                        <Typography variant="h6">{step.label}</Typography>
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
                              <Typography variant="h6" sx={{ mb: 2 }}>Review Your Application</Typography>
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
                                      <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'var(--primary-dark)' }}>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
