"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  IconButton, 
  Tabs, 
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  Email, 
  Phone, 
  LocationOn,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp,
  AdminPanelSettings,
  Business
} from '@mui/icons-material';
import { contactManager, ContactInfo } from '@/lib/contactManager';

export default function Footer() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedCity, setExpandedCity] = useState<string | null>('Lonavala');
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const toggleCity = (city: string) => {
    setExpandedCity(expandedCity === city ? null : city);
  };

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

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%)',
        color: 'white',
        mt: 'auto'
      }}
    >
      {/* Main Navigation Bar */}
      <Box sx={{ 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        py: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {['Villas', 'Homestays', 'Cottages', 'Luxury Villas', 'Pool Villas', 'Bungalows'].map((item) => (
              <Link key={item} href={item === 'Villas' ? '/villas' : `/villas?type=${item.toLowerCase().replace(' ', '-')}`} style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    '&:hover': { 
                      color: 'var(--accent)',
                      transition: 'color 0.2s ease'
                    }
                  }}
                >
                  {item}
                </Typography>
              </Link>
            ))}
            <Link href="/villas" style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--accent)',
                  fontWeight: 600,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                Destinations
              </Typography>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Destinations Sub-Navigation */}
      <Box sx={{ 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        py: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {['Maharashtra', 'Goa', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand'].map((state) => (
              <Link key={state} href={`/villas?state=${state.toLowerCase().replace(' ', '-')}`} style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 400,
                    '&:hover': { 
                      color: 'var(--accent)',
                      transition: 'color 0.2s ease'
                    }
                  }}
                >
                  {state}
                </Typography>
              </Link>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                mb: 2
              }}>
                Luxe Staycations
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                mb: 3
              }}>
                Experience luxury redefined with our premium collection of handpicked villas and exclusive accommodations across India's most beautiful destinations.
              </Typography>
            </Box>
            
            {/* Contact Info */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  {contactInfo?.phone || '+91 98765 43210'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  {contactInfo?.email || 'info@luxestaycations.com'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">
                  {contactInfo?.address || 'Mumbai, Maharashtra, India'}
                </Typography>
              </Box>
            </Box>

            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'var(--accent)' } }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'var(--accent)' } }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'var(--accent)' } }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'var(--accent)' } }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link href="/about-us" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  About Us
                </Typography>
              </Link>
              <Link href="/villas" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Our Villas
                </Typography>
              </Link>
              <Link href="/blog" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Blog
                </Typography>
              </Link>
              <Link href="/contact-us" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Contact Us
                </Typography>
              </Link>
              <Link href="/partner-with-us" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Partner With Us
                </Typography>
              </Link>
            </Box>
          </Grid>

          {/* Popular Destinations */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Popular Destinations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link href="/villas?destination=lonavala" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Lonavala, Maharashtra
                </Typography>
              </Link>
              <Link href="/villas?destination=mumbai" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Mumbai, Maharashtra
                </Typography>
              </Link>
              <Link href="/villas?destination=pune" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Pune, Maharashtra
                </Typography>
              </Link>
              <Link href="/villas?destination=goa" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Goa, India
                </Typography>
              </Link>
              <Link href="/villas?destination=kerala" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Kerala, India
                </Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Box sx={{ 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        py: 3
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2025 Luxe Staycations. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {/* Host Login Button */}
              <Link href="/host/login" style={{ textDecoration: 'none' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'var(--accent)'
                  }
                }}>
                  <Business sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    '&:hover': { color: 'var(--accent)' }
                  }}>
                    Host Login
                  </Typography>
                </Box>
              </Link>

              {/* Admin Login Button */}
              <Link href="/admin/login" style={{ textDecoration: 'none' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'var(--accent)'
                  }
                }}>
                  <AdminPanelSettings sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    '&:hover': { color: 'var(--accent)' }
                  }}>
                    Admin
                  </Typography>
                </Box>
              </Link>

              {/* Separator */}
              <Box sx={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.3)' }} />

              {/* Policy Links */}
              <Link href="/privacy-policy" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Privacy Policy
                </Typography>
              </Link>
              <Link href="/terms-of-service" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Terms of Service
                </Typography>
              </Link>
              <Link href="/refund-policy" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'var(--accent)' }
                }}>
                  Refund Policy
                </Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

