import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // output: 'export',
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Prevent CloudFront from caching dynamic HTML pages
        source: '/status',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        // Health API must always be fresh
        source: '/api/status/health',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
