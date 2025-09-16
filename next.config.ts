import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['supabase.co', 'supabase.in'],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  // Ensure proper static generation
  trailingSlash: false,
  // Optimize for Vercel
  compress: true,
  poweredByHeader: false,
  // Handle API routes properly
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
 