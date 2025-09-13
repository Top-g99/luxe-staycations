import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  // Force cache invalidation for Netlify
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Optimize for Netlify deployment
  output: 'standalone',
  trailingSlash: false,
  distDir: '.next',
  // CRITICAL: Override Netlify plugin trailing slash behavior completely
  async redirects() {
    return [
      // Force admin route to work without trailing slash
      {
        source: '/admin/',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
  // Force rewrite to handle admin routes properly
  async rewrites() {
    return [
      {
        source: '/admin/',
        destination: '/admin',
      },
    ];
  },
  // Enable image optimization
  images: {
    domains: ['supabase.co', 'supabase.in'],
  },
  // Fix domain content mismatch - ensure relative paths
  basePath: '',
  assetPrefix: '',
  // Add headers for better caching control
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Webpack configuration for Netlify
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
