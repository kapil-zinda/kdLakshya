/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Enable server actions
  },
  compiler: {
    // Strip console.* from production builds, keeping console.error.
    //
    // There are ~450 console calls across src/, several of which logged whole
    // user objects and response bodies. The worst offenders were in the API
    // layers, which printed `config.headers` on every request - and that header
    // map carries the Authorization value: a live Auth0 bearer token for staff,
    // base64(username:date-of-birth) for students. Those specific logs are gone
    // (see utils/ApiRequest.tsx), but this makes the whole category a non-issue
    // in production rather than relying on nobody adding another one.
    //
    // Development keeps every call, so this costs no debuggability. `error` is
    // excluded so real failures still surface in production; the remaining
    // console.error sites are written not to carry credentials or PII.
    removeConsole: { exclude: ['error'] },
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
