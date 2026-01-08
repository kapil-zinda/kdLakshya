/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Enable server actions
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
