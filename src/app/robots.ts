import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kd-lakshya.vercel.app';

/**
 * Everything under the disallowed prefixes is a private, authenticated app
 * view (admin/teacher/student dashboards, login flows, API routes) - there's
 * nothing there for a search engine to usefully index, and every one of
 * those route segments also sets `robots: noindex` itself (see their
 * layout.tsx files) as defense in depth, in case a crawler ignores this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin-portal',
        '/teacher-dashboard',
        '/student-dashboard',
        '/dashboard',
        '/student',
        '/teacher',
        '/login',
        '/student-login',
        '/api',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
