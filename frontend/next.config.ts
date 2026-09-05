import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/cats/:slug',
        destination: '/animals/cats/:slug',
        permanent: true,
      },
      {
        source: '/sell',
        destination: '/contact',
        permanent: false,
      },
      {
        source: '/buy',
        destination: '/animals',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
