// Domain Configuration for Luxe Staycations
// This ensures consistent domain usage across all environments

export const getDomainConfig = () => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    return {
      baseUrl: window.location.origin,
      domain: window.location.hostname,
      protocol: window.location.protocol,
      isCustomDomain: !window.location.hostname.includes('netlify.app')
    };
  }
  
  // Server-side fallback
  const isProduction = process.env.NODE_ENV === 'production';
  const customDomain = process.env.CUSTOM_DOMAIN || 'luxestaycations.in';
  const netlifyDomain = process.env.NETLIFY_DOMAIN || 'luxestaycations.netlify.app';
  
  return {
    baseUrl: isProduction ? `https://${customDomain}` : `https://${netlifyDomain}`,
    domain: isProduction ? customDomain : netlifyDomain,
    protocol: 'https:',
    isCustomDomain: isProduction
  };
};

// Helper function to get the correct domain for links
export const getDomainUrl = (path: string = '') => {
  const config = getDomainConfig();
  return `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// Helper function to get the correct domain for emails
export const getEmailDomainUrl = (path: string = '') => {
  // For emails, always use the custom domain if available
  const customDomain = process.env.CUSTOM_DOMAIN || 'luxestaycations.in';
  return `https://${customDomain}${path.startsWith('/') ? path : `/${path}`}`;
};

export default getDomainConfig;
