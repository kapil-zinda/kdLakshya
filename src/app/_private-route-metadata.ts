import type { Metadata } from 'next';

/**
 * Shared by every private, authenticated route segment (admin-portal,
 * teacher-dashboard, student-dashboard, dashboard, student, teacher, login,
 * student-login) - keeps them out of search results as defense in depth
 * alongside the Disallow rules in robots.ts. There's no per-user content
 * here a search engine could usefully index anyway; it's all gated behind
 * a real login.
 */
export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
