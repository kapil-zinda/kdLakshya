/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Enable server actions
  },
  images: {
    // Restricted to the actual CDN the backend serves org/branding/gallery
    // images from (see kdLakshya-backend's s3_event_processor.py). The
    // previous `hostname: '**'` on both http and https let Next's image
    // optimizer fetch and resize literally any URL — a documented SSRF
    // pattern.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
