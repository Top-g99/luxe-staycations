"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ContentCopy,
  Info,
  LocalOffer,
  CreditCard,
  Star,
  AccessTime
} from '@mui/icons-material';
import { dealManager, offersBannerManager, DealBanner, OffersBanner } from '@/lib/dataManager';

// Extended interface for deals with coupon functionality
interface DealWithCoupon extends DealBanner {
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  coupon_code?: string;
  min_amount?: number;
  max_uses?: number;
  used_count?: number;
  valid_from?: string;
  valid_until?: string;
  category?: 'bank_offer' | 'stayvista_offer' | 'seasonal' | 'general';
  terms_conditions?: string;
}

interface DealsSectionProps {
  maxDeals?: number;
  showAllButton?: boolean;
}

export default function DealsSection({ maxDeals = 4, showAllButton = true }: DealsSectionProps) {
  const [deals, setDeals] = useState<DealWithCoupon[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealWithCoupon[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'bank_offer' | 'stayvista_offer' | 'seasonal'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealWithCoupon | null>(null);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('https://assets.kerzner.com/api/public/content/ccec91384b584e5ca08be219f819bdfc?v=38fe3de6&t=w2880');

  // Load deals from dealManager and offersBannerManager
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load deals from dealManager
        await dealManager.initialize();
        const dealsData = dealManager.getAll();
        // Filter only active deals (relaxed date filtering for debugging)
        const activeDeals = dealsData.filter((deal: DealBanner) => {
          console.log('Checking deal:', deal.title, 'isActive:', deal.isActive);
          if (!deal.isActive) return false;
          
          // If no dates set, consider it valid
          if (!deal.startDate && !deal.endDate) {
            console.log('Deal has no dates, considering valid:', deal.title);
            return true;
          }
          
          const now = new Date();
          const validFrom = new Date(deal.startDate || new Date(0)); // Use epoch if no start date
          const validUntil = new Date(deal.endDate || new Date(9999, 11, 31)); // Use far future if no end date
          
          const isValid = now >= validFrom && now <= validUntil;
          console.log('Deal date check:', deal.title, 'validFrom:', validFrom, 'validUntil:', validUntil, 'isValid:', isValid);
          return isValid;
        });

        // Load offers banners from offersBannerManager
        await offersBannerManager.initialize();
        const offersBanners = offersBannerManager.getAll();
        const activeOffersBanners = offersBanners.filter((banner: OffersBanner) => {
          console.log('Checking offers banner:', banner.title, 'isActive:', banner.isActive);
          if (!banner.isActive) return false;
          
          // If no dates set, consider it valid
          if (!banner.startDate && !banner.endDate) {
            console.log('Offers banner has no dates, considering valid:', banner.title);
            return true;
          }
          
          const now = new Date();
          const validFrom = new Date(banner.startDate || new Date(0)); // Use epoch if no start date
          const validUntil = new Date(banner.endDate || new Date(9999, 11, 31)); // Use far future if no end date
          
          const isValid = now >= validFrom && now <= validUntil;
          console.log('Offers banner date check:', banner.title, 'validFrom:', validFrom, 'validUntil:', validUntil, 'isValid:', isValid);
          return isValid;
        });

        // Convert offers banners to deal format
        const convertedOffersBanners = activeOffersBanners.map((banner: OffersBanner) => {
          // Map offers banner categories to deal categories
          const mapCategory = (category?: string): 'general' | 'seasonal' | 'bank_offer' | 'stayvista_offer' => {
            switch (category) {
              case 'partnership':
              case 'promotion':
                return 'stayvista_offer';
              case 'seasonal':
                return 'seasonal';
              case 'general':
              default:
                return 'general';
            }
          };

          return {
            id: banner.id,
            title: banner.title,
            subtitle: banner.subtitle || '',
            description: banner.description || '',
            buttonText: banner.buttonText,
            buttonLink: banner.buttonLink,
            fallbackImageUrl: banner.backgroundImageUrl || '',
            isActive: banner.isActive,
            startDate: banner.startDate || new Date().toISOString(),
            endDate: banner.endDate || new Date().toISOString(),
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
            // Coupon properties from offers banner
            discount_type: banner.discountType,
            discount_value: banner.discountValue,
            coupon_code: banner.couponCode,
            min_amount: banner.minOrderAmount,
            max_uses: banner.maxUses,
            used_count: banner.usedCount,
            valid_from: banner.startDate || new Date().toISOString(),
            valid_until: banner.endDate || new Date().toISOString(),
            category: mapCategory(banner.category) as 'general' | 'seasonal' | 'bank_offer' | 'stayvista_offer',
            terms_conditions: banner.termsAndConditions
          } as DealWithCoupon;
        });

        // Combine deals and offers banners
        const allDeals = [...activeDeals, ...convertedOffersBanners];
        
        // Debug logging
        console.log('DealsSection Debug:');
        console.log('- Total deals from dealManager:', dealsData.length);
        console.log('- Active deals from dealManager:', activeDeals.length);
        console.log('- Total offers banners:', offersBanners.length);
        console.log('- Active offers banners:', activeOffersBanners.length);
        console.log('- Converted offers banners:', convertedOffersBanners.length);
        console.log('- Combined all deals:', allDeals.length);
        console.log('- All deals data:', allDeals);
        
        // Always use real data, no fallback to sample data
        setDeals(allDeals);
        console.log('DealsSection: Set deals to:', allDeals.length);

        // Set background image from the highest priority active banner
        const activeBanner = activeOffersBanners
          .sort((a: OffersBanner, b: OffersBanner) => (b.priority || 1) - (a.priority || 1))[0];
        
        if (activeBanner && activeBanner.backgroundImageUrl) {
          setBackgroundImage(activeBanner.backgroundImageUrl);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty array if no data is available
        setDeals([]);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribeDeals = dealManager.subscribe(() => {
      loadData(); // Reload all data when deals change
    });

    const unsubscribeBanners = offersBannerManager.subscribe(() => {
      loadData(); // Reload all data when offers banners change
    });

    return () => {
      unsubscribeDeals();
      unsubscribeBanners();
    };
  }, []);

  // Filter deals based on current filter
  useEffect(() => {
    if (currentFilter === 'all') {
      setFilteredDeals(deals);
    } else {
      setFilteredDeals(deals.filter(deal => deal.category === currentFilter));
    }
    setCurrentIndex(0);
  }, [deals, currentFilter]);

  const getSampleDeals = (): DealWithCoupon[] => [
    {
      id: '1',
      title: 'LUXE Premium Experience',
      subtitle: 'Premium Luxury Villas',
      description: 'Enjoy FLAT 50% OFF on 2nd night when you book our premium luxury villas for your next holiday adventure.',
      buttonText: 'Book Now',
      buttonLink: '/villas',
      fallbackImageUrl: '', // No image for auto-generated cards
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Coupon properties
      discount_type: 'percentage',
      discount_value: 50,
      coupon_code: 'LUXEPREMIUM',
      min_amount: 3000,
      max_uses: 500,
      used_count: 89,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'stayvista_offer',
      terms_conditions: 'Valid on 2nd night booking only. Minimum booking amount of ₹3000. Valid till 31 Oct 2026.'
    },
    {
      id: '2',
      title: 'WELCOME2025 New Year Special',
      subtitle: 'New Year Celebration',
      description: 'Welcoming 2025 with an exclusive offer! Enjoy up to 10% off on your next escape.',
      buttonText: 'Book Now',
      buttonLink: '/villas',
      fallbackImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Coupon properties
      discount_type: 'percentage',
      discount_value: 10,
      coupon_code: 'WELCOME2025',
      min_amount: 2000,
      max_uses: 2000,
      used_count: 567,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'seasonal',
      terms_conditions: 'Valid on all bookings. Minimum booking amount of ₹2000. Valid till 30 Oct 2026.'
    },
    {
      id: '3',
      title: 'LUXE Staycations',
      subtitle: 'Premium Properties',
      description: 'Save on your nights, and your stay! Get exclusive discounts on premium luxury properties.',
      buttonText: 'Book Now',
      buttonLink: '/villas',
      fallbackImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Coupon properties
      discount_type: 'fixed',
      discount_value: 2000,
      coupon_code: 'LUXESTAY',
      min_amount: 8000,
      max_uses: 300,
      used_count: 123,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'stayvista_offer',
      terms_conditions: 'Valid on premium properties only. Minimum booking amount of ₹8000. Valid till 20 Oct 2026.'
    },
    {
      id: '4',
      title: 'LUXE Early Bird',
      subtitle: 'Advance Booking',
      description: 'Book early and save more! Get 15% off on advance bookings for your perfect luxury getaway.',
      buttonText: 'Book Now',
      buttonLink: '/villas',
      fallbackImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Coupon properties
      discount_type: 'percentage',
      discount_value: 15,
      coupon_code: 'LUXEEARLY',
      min_amount: 5000,
      max_uses: 1000,
      used_count: 245,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'seasonal',
      terms_conditions: 'Valid on advance bookings only. Minimum booking amount of ₹5000. Valid till 31 Oct 2026.'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bank_offer':
        return <CreditCard />;
      case 'stayvista_offer':
        return <Star />;
      case 'seasonal':
        return <LocalOffer />;
      default:
        return <LocalOffer />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bank_offer':
        return 'primary';
      case 'stayvista_offer':
        return 'secondary';
      case 'seasonal':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bank_offer':
        return 'Bank Offer';
      case 'stayvista_offer':
        return 'Luxe Offer';
      case 'seasonal':
        return 'Seasonal';
      default:
        return 'General';
    }
  };

  const formatValidUntil = (validUntil: string) => {
    const date = new Date(validUntil);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const copyToClipboard = async (code: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Show user feedback even if copy fails
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(filteredDeals.length - maxDeals, prev + 1));
  };

  const handleTermsClick = (deal: DealWithCoupon) => {
    setSelectedDeal(deal);
    setTermsDialogOpen(true);
  };

  const visibleDeals = filteredDeals.slice(currentIndex, currentIndex + maxDeals);

  if (deals.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      position: 'relative',
      py: 0.5,
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 0 }}>
          <Typography variant="h3" sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'white',
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            fontWeight: 600
          }}>
            Offers for You
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            Exclusive deals and discounts for your perfect getaway
          </Typography>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0, gap: 1 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'stayvista_offer', label: 'Luxe Offers' },
            { key: 'seasonal', label: 'Seasonal' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={currentFilter === filter.key ? 'contained' : 'outlined'}
              onClick={() => setCurrentFilter(filter.key as any)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                py: 1,
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
                background: currentFilter === filter.key 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : 'rgba(255, 255, 255, 0.2)',
                color: currentFilter === filter.key ? 'white' : 'white',
                borderColor: currentFilter === filter.key ? 'transparent' : 'rgba(255, 215, 0, 0.5)',
                borderWidth: 2,
                backdropFilter: 'blur(10px)',
                boxShadow: currentFilter === filter.key 
                  ? '0 4px 15px rgba(255, 215, 0, 0.4)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  background: currentFilter === filter.key 
                    ? 'linear-gradient(135deg, #FFA500, #FF8C00)' 
                    : 'rgba(255, 215, 0, 0.3)',
                  color: 'white',
                  borderColor: 'rgba(255, 215, 0, 0.8)',
                  transform: 'translateY(-2px)',
                  boxShadow: currentFilter === filter.key 
                    ? '0 6px 20px rgba(255, 215, 0, 0.5)' 
                    : '0 4px 15px rgba(255, 215, 0, 0.3)',
                  '&::before': {
                    left: '100%'
                  }
                }
              }}
            >
              {filter.label}
            </Button>
          ))}
        </Box>

        {/* Deals Carousel */}
        <Box sx={{ position: 'relative' }}>
          {/* Navigation Arrows */}
          {filteredDeals.length > maxDeals && (
            <>
              <IconButton
                onClick={handlePrev}
                disabled={currentIndex === 0}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.6)'
                  },
                  '&:disabled': { 
                    opacity: 0.3,
                    background: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={handleNext}
                disabled={currentIndex >= filteredDeals.length - maxDeals}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.6)'
                  },
                  '&:disabled': { 
                    opacity: 0.3,
                    background: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}

          {/* Deals Grid */}
          <Grid container spacing={3}>
            {visibleDeals.map((deal) => (
              <Grid item xs={12} sm={6} md={3} key={deal.id}>
                <div 
                  data-testid="deal-card"
                  className="deal-card-no-shadow"
                  style={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                    border: '2px solid transparent',
                    backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'content-box, border-box',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'none',
                    filter: 'none'
                  }}
                >
                  {/* Golden Accent Elements */}
                  <Box 
                    className="golden-accent"
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      borderRadius: '50%',
                      opacity: 0.7,
                      transition: 'all 0.3s ease',
                      zIndex: 2
                    }}
                  />
                  <Box 
                    className="golden-accent"
                    sx={{
                      position: 'absolute',
                      bottom: -1,
                      left: -1,
                      width: 15,
                      height: 15,
                      background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                      borderRadius: '50%',
                      opacity: 0.5,
                      transition: 'all 0.3s ease',
                      zIndex: 2
                    }}
                  />


                  {/* Deal Header */}
                  <Box sx={{ p: 2, pb: 1, position: 'relative', zIndex: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          p: 0.5,
                          borderRadius: 1,
                          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
                          border: '1px solid rgba(255, 215, 0, 0.3)'
                        }}>
                          {getCategoryIcon(deal.category || 'general')}
                        </Box>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '0.9rem'
                        }}>
                          {deal.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={getCategoryLabel(deal.category || 'general')}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Valid Till: {formatValidUntil(deal.valid_until || deal.endDate || new Date().toISOString())}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Deal Content */}
                  <Box sx={{ flexGrow: 1, pt: 0, pb: 2, px: 2, boxShadow: 'none !important' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                      {deal.description}
                    </Typography>

                    {/* Terms & Conditions */}
                    {deal.terms_conditions && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          size="small"
                          startIcon={<Info />}
                          onClick={() => handleTermsClick(deal)}
                          sx={{ 
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            '&:hover': { backgroundColor: 'transparent' }
                          }}
                        >
                          T&C's apply
                        </Button>
                      </Box>
                    )}

                    {/* Coupon Code */}
                    {deal.coupon_code && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TextField
                          value={deal.coupon_code}
                          size="small"
                          InputProps={{
                            readOnly: true,
                            sx: {
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              borderStyle: 'dashed',
                              borderWidth: 2,
                              borderColor: '#FFD700',
                              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 165, 0, 0.05))',
                              color: '#B8860B',
                              '&:focus': {
                                borderColor: '#FFA500',
                                boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)'
                              }
                            }
                          }}
                          sx={{ flexGrow: 1 }}
                        />
                        <Tooltip title={copiedCode === deal.coupon_code ? 'Copied!' : 'Copy code'}>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(deal.coupon_code!)}
                            sx={{ 
                              border: '2px solid #FFD700',
                              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                              color: 'white',
                              '&:hover': { 
                                background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                                transform: 'scale(1.1)',
                                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    {/* Usage Stats and Discount Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <Box sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          boxShadow: '0 0 4px rgba(255, 215, 0, 0.5)'
                        }} />
                        {deal.used_count || 0} used
                      </Typography>
                      
                      {/* Discount Badge - Replacing the "items left" badge */}
                      {deal.discount_value ? (
                        <Box sx={{
                          background: 'linear-gradient(135deg, #DAA520, #B8860B)',
                          borderRadius: '50%',
                          width: 50,
                          height: 50,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(218, 165, 32, 0.4)',
                          border: '2px solid rgba(255, 255, 255, 0.9)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -1,
                            left: -1,
                            right: -1,
                            bottom: -1,
                            background: 'linear-gradient(135deg, #DAA520, #B8860B)',
                            borderRadius: '50%',
                            zIndex: -1,
                            filter: 'blur(3px)',
                            opacity: 0.5
                          }
                        }}>
                          <Typography variant="h6" sx={{
                            fontWeight: 800,
                            color: 'white',
                            fontSize: '0.9rem',
                            lineHeight: 1,
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                          }}>
                            {deal.discount_value}
                            {deal.discount_type === 'percentage' ? '%' : '₹'}
                          </Typography>
                          <Typography variant="caption" sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.5rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                          }}>
                            OFF
                          </Typography>
                        </Box>
                      ) : (
                        <Badge
                          badgeContent={deal.max_uses ? `${deal.max_uses - (deal.used_count || 0)} left` : '∞'}
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              fontSize: '0.6rem',
                              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                              color: 'white',
                              fontWeight: 600,
                              boxShadow: '0 2px 6px rgba(255, 215, 0, 0.3)'
                            } 
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </div>
              </Grid>
            ))}
          </Grid>

          {/* Scroll Indicator */}
          {filteredDeals.length > maxDeals && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Box sx={{ 
                width: 200, 
                height: 6, 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))', 
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{
                  position: 'absolute',
                  left: `${(currentIndex / (filteredDeals.length - maxDeals)) * 100}%`,
                  width: `${(maxDeals / filteredDeals.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  borderRadius: 3,
                  transition: 'left 0.3s ease-in-out',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    borderRadius: 3
                  }
                }} />
              </Box>
            </Box>
          )}
        </Box>

        {/* View All Button */}
        {showAllButton && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid #FFD700',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
                color: '#B8860B',
                backdropFilter: 'blur(10px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)',
                  transition: 'left 0.6s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: 'white',
                  borderColor: '#FFD700',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                  '&::before': {
                    left: '100%'
                  }
                }
              }}
            >
              View All Offers
            </Button>
          </Box>
        )}
      </Container>

      {/* Terms & Conditions Dialog */}
      <Dialog
        open={termsDialogOpen}
        onClose={() => setTermsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Terms & Conditions - {selectedDeal?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {selectedDeal?.terms_conditions}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copiedCode !== null}
        autoHideDuration={2000}
        onClose={() => setCopiedCode(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCopiedCode(null)}>
          Coupon code "{copiedCode}" copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
