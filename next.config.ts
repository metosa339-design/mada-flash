import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Madagascar news sources
      {
        protocol: 'https',
        hostname: 'midi-madagasikara.mg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.midi-madagasikara.mg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.24hmada.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.24hmada.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'newsmada.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.newsmada.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'newsmada.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.lagazette-dgi.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lagazette-dgi.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lexpress.mg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.lexpress.mg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'actu.orange.mg',
        port: '',
        pathname: '/**',
      },
      // Allow all .mg domains for Madagascar sources
      {
        protocol: 'https',
        hostname: '**.mg',
        port: '',
        pathname: '/**',
      },
      // Gemini generated images (for future integration)
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Wikipedia/Wikimedia for real photos
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wikipedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      // Allow any external image sources for flexibility
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
