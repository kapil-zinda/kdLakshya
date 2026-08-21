import '../styles/globals.css';

import { Analytics } from '@vercel/analytics/react';

import 'react-toastify/dist/ReactToastify.css';

import type { Metadata } from 'next';

import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog';
import { ThemedToastContainer } from '@/components/ui/ThemedToastContainer';
import { ReduxProvider } from '@/store/ReduxProvider';

import { Providers } from './providers';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kd-lakshya.vercel.app';
const SITE_NAME = 'kdLakshya';
const SITE_DESCRIPTION =
  'kdLakshya is a school management platform for students, teachers, and administrators — attendance, exams, fees, admissions, and school announcements in one place.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — School Management Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'school management software',
    'school management system',
    'student attendance system',
    'online exam management',
    'school fee management software',
    'student information system',
    'school ERP',
    'teacher dashboard',
    'student portal',
    'admin portal for schools',
    'kdLakshya',
  ],
  authors: [
    { name: 'ansh chaudhary' },
    {
      name: 'kapil chaudhary',
    },
    {
      name: 'rishabh gaud',
    },
  ],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'education',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — School Management Platform`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — School Management Platform`,
    description: SITE_DESCRIPTION,
    images: ['/icons/icon-512x512.png'],
  },
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
    { rel: 'icon', url: '/icons/icon-192x192.png' },
    { rel: 'favicon', url: '/icons/favicon.ico' },
  ],
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512x512.png`,
  description: SITE_DESCRIPTION,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Loaded as a stylesheet rather than via next/font on purpose. The
          org-configurable font (ThemeApplier, and the picker in
          admin-portal/school-settings) is applied by its real family name -
          `font-family: 'Poppins', sans-serif` - and next/font deliberately
          exposes only a hashed family plus a CSS variable, so a by-name lookup
          finds nothing and every org silently falls back to sans-serif. This
          also keeps the production build from having to reach
          fonts.gstatic.com, which times out in CI.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Press+Start+2P&family=Pacifico&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <ReduxProvider>
          <Providers>
            <ConfirmDialogProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </ConfirmDialogProvider>
          </Providers>
        </ReduxProvider>
        <Analytics />
        <ThemedToastContainer />
      </body>
    </html>
  );
}
