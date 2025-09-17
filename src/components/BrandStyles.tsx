import { SxProps, Theme } from '@mui/material';

// Brand Colors
export const brandColors = {
  primary: '#322a2b',
  primaryDark: '#1A1A1A',
  primaryLight: '#4A3735',
  secondary: '#151515',
  secondaryDark: '#704F49',
  background: '#f7ede1',
  backgroundLight: '#E8E2D9',
  accent: '#B8A195',
  accentDark: '#4A4A4A',
  white: '#ffffff',
  black: '#000000'
};

// Typography Styles
export const typographyStyles = {
  h1: {
    fontFamily: 'Playfair Display, serif',
    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem', lg: '5rem' },
    fontWeight: 400,
    lineHeight: 1.2,
    color: brandColors.primaryDark
  },
  h2: {
    fontFamily: 'Playfair Display, serif',
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
    fontWeight: 400,
    lineHeight: 1.3,
    color: brandColors.primaryDark
  },
  h3: {
    fontFamily: 'Playfair Display, serif',
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    fontWeight: 400,
    lineHeight: 1.3,
    color: brandColors.primaryDark
  },
  h4: {
    fontFamily: 'Playfair Display, serif',
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
    fontWeight: 400,
    lineHeight: 1.3,
    color: brandColors.primaryDark
  },
  h5: {
    fontFamily: 'Playfair Display, serif',
    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
    fontWeight: 400,
    lineHeight: 1.4,
    color: brandColors.primaryDark
  },
  h6: {
    fontFamily: 'Playfair Display, serif',
    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' },
    fontWeight: 400,
    lineHeight: 1.4,
    color: brandColors.primaryDark
  },
  body1: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: brandColors.primary
  },
  body2: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: brandColors.primary
  },
  button: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
    textTransform: 'none'
  }
};

// Button Styles
export const buttonStyles = {
  primary: {
    bgcolor: brandColors.primaryDark,
    color: brandColors.white,
    fontFamily: 'Nunito, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 500,
    px: 3,
    py: 1.5,
    borderRadius: 1,
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: brandColors.primaryLight,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }
  },
  secondary: {
    bgcolor: brandColors.secondaryDark,
    color: brandColors.white,
    fontFamily: 'Nunito, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 500,
    px: 3,
    py: 1.5,
    borderRadius: 1,
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: brandColors.primaryLight,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }
  },
  outline: {
    border: `2px solid ${brandColors.secondaryDark}`,
    color: brandColors.secondaryDark,
    bgcolor: 'transparent',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 500,
    px: 3,
    py: 1.5,
    borderRadius: 1,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: brandColors.secondaryDark,
      color: brandColors.white,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
    }
  },
  text: {
    color: brandColors.secondaryDark,
    fontFamily: 'Nunito, sans-serif',
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'rgba(112, 79, 73, 0.1)',
      transform: 'translateY(-1px)'
    }
  }
};

// Card Styles
export const cardStyles = {
  primary: {
    bgcolor: brandColors.white,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: `1px solid ${brandColors.backgroundLight}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }
  },
  elevated: {
    bgcolor: brandColors.white,
    borderRadius: 2,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    border: `1px solid ${brandColors.backgroundLight}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
    }
  },
  glass: {
    bgcolor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: 2,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
};

// Form Styles
export const formStyles = {
  textField: {
    '& .MuiOutlinedInput-root': {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '1rem',
      borderRadius: 1,
      '& fieldset': {
        borderColor: brandColors.accent,
        borderWidth: 2
      },
      '&:hover fieldset': {
        borderColor: brandColors.secondaryDark
      },
      '&.Mui-focused fieldset': {
        borderColor: brandColors.secondaryDark
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Nunito, sans-serif',
      color: brandColors.primary,
      '&.Mui-focused': {
        color: brandColors.secondaryDark
      }
    }
  },
  select: {
    '& .MuiOutlinedInput-root': {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '1rem',
      borderRadius: 1,
      '& fieldset': {
        borderColor: brandColors.accent,
        borderWidth: 2
      },
      '&:hover fieldset': {
        borderColor: brandColors.secondaryDark
      },
      '&.Mui-focused fieldset': {
        borderColor: brandColors.secondaryDark
      }
    },
    '& .MuiSelect-select': {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '1rem'
    }
  }
};

// Icon Styles
export const iconStyles = {
  primary: {
    color: brandColors.secondaryDark
  },
  secondary: {
    color: brandColors.accent
  },
  accent: {
    color: brandColors.accentDark
  },
  white: {
    color: brandColors.white
  }
};

// Background Styles
export const backgroundStyles = {
  primary: {
    bgcolor: brandColors.background
  },
  secondary: {
    bgcolor: brandColors.backgroundLight
  },
  dark: {
    bgcolor: brandColors.primaryDark
  },
  gradient: {
    background: `linear-gradient(135deg, ${brandColors.primaryDark} 0%, ${brandColors.secondaryDark} 100%)`
  },
  overlay: {
    background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)`
  }
};

// Spacing and Layout
export const layoutStyles = {
  container: {
    maxWidth: 'lg',
    mx: 'auto',
    px: { xs: 2, sm: 3, md: 4 }
  },
  section: {
    py: { xs: 4, sm: 6, md: 8 }
  },
  card: {
    p: 3
  }
};

// Animation Styles
export const animationStyles = {
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out'
  },
  slideUp: {
    animation: 'slideUp 0.5s ease-out'
  },
  scaleIn: {
    animation: 'scaleIn 0.3s ease-out'
  }
};

// Utility Functions
export const getBrandColor = (color: keyof typeof brandColors) => brandColors[color];
export const getTypographyStyle = (variant: keyof typeof typographyStyles) => typographyStyles[variant];
export const getButtonStyle = (variant: keyof typeof buttonStyles) => buttonStyles[variant];
export const getCardStyle = (variant: keyof typeof cardStyles) => cardStyles[variant];
export const getIconStyle = (variant: keyof typeof iconStyles) => iconStyles[variant];
export const getBackgroundStyle = (variant: keyof typeof backgroundStyles) => backgroundStyles[variant];

// Common Component Styles
export const commonStyles = {
  pageContainer: {
    minHeight: '100vh',
    bgcolor: brandColors.background
  },
  sectionHeader: {
    textAlign: 'center',
    mb: 6
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

