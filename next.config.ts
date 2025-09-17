import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['supabase.co', 'supabase.in'],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  // Ensure proper static generation
  trailingSlash: false,
  // Optimize for Cloudflare Pages
  compress: true,
  poweredByHeader: false,
      // Completely disable webpack cache for Cloudflare Pages
      webpack: (config, { isServer, dev }) => {
        // Disable all caching completely
        config.cache = false;
        
        // Disable persistent caching
        config.snapshot = {
          managedPaths: [],
          immutablePaths: [],
          buildDependencies: {
            hash: false,
            timestamp: false
          },
          module: {
            hash: false,
            timestamp: false
          },
          resolve: {
            hash: false,
            timestamp: false
          },
          resolveBuildDependencies: {
            hash: false,
            timestamp: false
          }
        };
        
        // Disable optimization caching
        if (config.optimization) {
          config.optimization.splitChunks = false;
          config.optimization.moduleIds = 'named';
          config.optimization.chunkIds = 'named';
        }
        
        // Disable all loaders that might cache
        if (config.module && config.module.rules) {
          config.module.rules.forEach((rule: any) => {
            if (rule.use) {
              rule.use.forEach((use: any) => {
                if (use.loader && use.loader.includes('cache-loader')) {
                  use.loader = false;
                }
                if (use.options && use.options.cache) {
                  use.options.cache = false;
                }
              });
            }
          });
        }
        
        return config;
      },
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
 